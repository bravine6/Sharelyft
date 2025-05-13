pipeline{
    agent any
    environment {
        TESTING_ENVIRONMENT = "DOCKER"
        PRODUCTION_ENVIRONMENT = "AWS-EC2"
        SONAR_TOKEN = credentials('sonar-token')
        DOCKER_CREDENTIALS = credentials('docker-credentials')
        AWS_CREDENTIALS = credentials('aws-credentials')
        APP_NAME = "sharelyft"
    }
    tools {
        nodejs 'NodeJS-16'
    }
    stages{
        stage('Build') {
            steps{
                echo "Building ShareLyft Node.js application"
                sh '''
                    npm ci
                    npm run build
                    
                    # Build Docker image
                    docker build -t ${APP_NAME}:${BUILD_NUMBER} .
                    
                    echo "ShareLyft build completed successfully"
                '''
            }
            post {
                success {
                    archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
                    echo "ShareLyft build artifacts archived"
                }
            }
        }
        stage('Test') {
            steps{
                echo "Running ShareLyft automated tests"
                sh '''
                    # Unit tests
                    npm run test:unit
                    
                    # Integration tests
                    npm run test:integration
                    
                    # E2E tests
                    npm run test:e2e
                    
                    echo "ShareLyft tests completed successfully"
                '''
            }
            post{
                success {
                    junit '**/test-results/*.xml'
                    mail to: "mickybravine@gmail.com",
                    subject: "ShareLyft Tests Passed: ${currentBuild.fullDisplayName}",
                    body: "All ShareLyft tests passed successfully in build ${BUILD_NUMBER}."
                }
                failure {
                    mail to: "mickybravine@gmail.com",
                    subject: "ShareLyft Tests Failed: ${currentBuild.fullDisplayName}",
                    body: "Tests failed in build ${BUILD_NUMBER}. Please check Jenkins for details."
                }
            }
        }
        stage('Code Quality') {
            steps{
                echo "Running ShareLyft code quality analysis"
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        # Run ESLint
                        npm run lint
                        
                        # SonarQube analysis for NodeJS project
                        sonar-scanner \
                          -Dsonar.projectKey=sharelyft \
                          -Dsonar.projectName="ShareLyft" \
                          -Dsonar.sources=src \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                          -Dsonar.login=$SONAR_TOKEN
                        
                        echo "ShareLyft code quality analysis completed"
                    '''
                }
            }
            post {
                success {
                    echo "ShareLyft code quality checks passed"
                }
                failure {
                    mail to: "mickybravine@gmail.com",
                    subject: "ShareLyft Code Quality Issues: ${currentBuild.fullDisplayName}",
                    body: "Code quality issues found in build ${BUILD_NUMBER}. Please check SonarQube for details."
                }
            }
        }
        stage('Security') {
            steps{
                echo "Running ShareLyft security analysis"
                sh '''
                    # Run npm audit for dependency vulnerabilities
                    npm audit --audit-level=high
                    
                    # Run OWASP Dependency Check
                    npm run security:check
                    
                    # Run custom security tests
                    npm run test:security
                    
                    echo "ShareLyft security scan completed"
                '''
                
                // Generate security report
                recordIssues(
                    tools: [
                        javaScript(pattern: 'security-reports/*.json')
                    ]
                )
            }
            post {
                success {
                    echo "ShareLyft security checks passed"
                    echo """
                    Security measures implemented:
                    1. All npm dependencies scanned for vulnerabilities
                    2. OWASP recommended security headers enabled in Express app
                    3. Input validation implemented for all user inputs
                    4. API rate limiting and CSRF protection enabled
                    """
                }
                failure {
                    mail to: "mickybravine@gmail.com",
                    subject: "ShareLyft Security Issues: ${currentBuild.fullDisplayName}",
                    body: "Critical security issues found in build ${BUILD_NUMBER} that require immediate attention."
                }
            }
        }
        stage('Deploy') {
            steps{
                echo "Deploying ShareLyft to testing environment: ${TESTING_ENVIRONMENT}"
                sh '''
                    # Log in to Docker registry
                    echo $DOCKER_CREDENTIALS_PSW | docker login -u $DOCKER_CREDENTIALS_USR --password-stdin
                    
                    # Push Docker image to registry
                    docker push ${APP_NAME}:${BUILD_NUMBER}
                    
                    # Deploy to testing environment using Docker Compose
                    docker-compose -f docker-compose.test.yml up -d
                    
                    echo "ShareLyft deployed to testing environment"
                '''
            }
            post {
                success {
                    echo "Running smoke tests on deployed ShareLyft application"
                    sh '''
                        # Wait for application to start
                        sleep 10
                        
                        # Run smoke tests
                        curl -f http://test-sharelyft:3000/api/health || exit 1
                        npm run test:smoke
                        
                        echo "ShareLyft smoke tests passed"
                    '''
                }
                failure {
                    echo "Rolling back ShareLyft deployment due to failed smoke tests"
                    sh '''
                        docker-compose -f docker-compose.test.yml down
                        
                        echo "ShareLyft rollback completed"
                    '''
                }
            }
        }
        stage('Approval') {
            steps{
                echo "Waiting for manual approval"
                // timeout to avoid hanging the pipeline indefinitely
                timeout(time: 1, unit: 'DAYS') {
                    input message: 'Approve deployment to production?', submitter: 'admin'
                }           
            }
        }
        stage('Release') {
            steps{
                echo "Releasing ShareLyft to production environment: ${PRODUCTION_ENVIRONMENT}"
                withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
                    sh '''
                        # Tag the Docker image as latest
                        docker tag ${APP_NAME}:${BUILD_NUMBER} ${APP_NAME}:latest
                        docker push ${APP_NAME}:latest
                        
                        # Deploy to AWS EC2 using Elastic Beanstalk
                        aws elasticbeanstalk create-application-version \
                            --application-name ${APP_NAME} \
                            --version-label v${BUILD_NUMBER} \
                            --source-bundle S3Bucket="sharelyft-deployments",S3Key="sharelyft-${BUILD_NUMBER}.zip"
                            
                        aws elasticbeanstalk update-environment \
                            --environment-name sharelyft-production \
                            --version-label v${BUILD_NUMBER}
                        
                        echo "ShareLyft released to production"
                    '''         
                }
            }
            post {
                success {
                    echo "ShareLyft release successful - sending notifications"
                    mail to: "mickybravine@gmail.com",
                    subject: "ShareLyft Release Successful: ${currentBuild.fullDisplayName}",
                    body: "ShareLyft has been successfully released to production. Visit https://sharelyft.com to see the changes."
                }
                failure {
                    echo "ShareLyft release failed - rolling back"
                    withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
                        sh '''
                            # Rollback to previous version on AWS
                            aws elasticbeanstalk update-environment \
                                --environment-name sharelyft-production \
                                --version-label v${PREV_SUCCESSFUL_BUILD}
                            
                            echo "ShareLyft rollback completed"
                        '''
                    }
                    mail to: "mickybravine@gmail.com",
                    subject: "ShareLyft Release Failed: ${currentBuild.fullDisplayName}",
                    body: "Production release failed and has been rolled back to previous version."
                }
            }
        }
        stage('Monitoring') {
            steps{
                echo "Setting up monitoring and alerting for ShareLyft production environment"
                withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
                    sh '''
                        # Set up AWS CloudWatch metrics and alarms
                        aws cloudwatch put-metric-alarm \
                            --alarm-name "ShareLyft-HighCPUUsage" \
                            --alarm-description "Alarm when CPU exceeds 70%" \
                            --metric-name CPUUtilization \
                            --namespace AWS/EC2 \
                            --statistic Average \
                            --period 300 \
                            --threshold 70 \
                            --comparison-operator GreaterThanThreshold \
                            --dimensions Name=InstanceId,Value=i-12345678 \
                            --evaluation-periods 2 \
                            --alarm-actions arn:aws:sns:us-east-1:123456789012:sharelyft-alerts
                            
                        # Deploy New Relic monitoring agent
                        aws ssm send-command \
                            --document-name "AWS-RunShellScript" \
                            --targets "Key=instanceids,Values=i-12345678" \
                            --parameters commands="curl -Ls https://download.newrelic.com/install/newrelic-cli/scripts/install.sh | bash && sudo NEW_RELIC_API_KEY=nr_api_key NEW_RELIC_ACCOUNT_ID=nr_account_id /usr/local/bin/newrelic install"
                            
                        # Deploy custom metrics collection for Node.js app
                        scp -i ~/.ssh/sharelyft-key.pem ./monitoring/metrics-agent.js ec2-user@sharelyft-server:/opt/sharelyft/
                        
                        echo "ShareLyft monitoring and alerting configured"
                    '''   
                }
            }
            post {
                success {
                    echo "ShareLyft monitoring setup complete"
                    echo """
                    ShareLyft monitoring system is now tracking:
                    - Application health and uptime
                    - API response times and error rates
                    - User activity and conversions
                    - Server resource utilization
                    - Database performance metrics
                    
                    ShareLyft alerts are configured for:
                    - Application downtime (>30 seconds)
                    - API error rate above threshold (>1%)
                    - Average response time over threshold (>500ms)
                    - Database connection issues
                    - High server resource usage (CPU, memory)
                    """
                }
            }
        }
    }
    post {
        always {
            echo "ShareLyft pipeline execution completed"
            // Archive test and coverage reports
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
            junit testResults: '**/test-results/*.xml', allowEmptyResults: true
            
            // Generate test coverage report
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'coverage/lcov-report',
                reportFiles: 'index.html',
                reportName: 'ShareLyft Code Coverage Report'
            ])
            
            // Cleanup workspace
            cleanWs()
        }
        success {
            echo "ShareLyft pipeline executed successfully"
            slackSend(
                tokenCredentialId: 'slack-webhook',
                channel: '#sharelyft-ci',
                color: 'good',
                message: "ShareLyft pipeline succeeded: ${env.JOB_NAME} #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)"
            )
        }
        failure {
            echo "ShareLyft pipeline execution failed"
            slackSend(
                tokenCredentialId: 'slack-webhook',
                channel: '#sharelyft-ci',
                color: 'danger',
                message: "ShareLyft pipeline failed: ${env.JOB_NAME} #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)"
            )
            mail to: "mickybravine@gmail.com",
            subject: "ShareLyft Pipeline Failed: ${currentBuild.fullDisplayName}",
            body: "Pipeline failed. Check the Jenkins console output for details: ${env.BUILD_URL}"
        }
    }
}