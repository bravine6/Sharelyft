pipeline {
    agent {
        docker {
            image 'ropbravine/sharelyft-build:latest'
            args '-u root -v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    tools {
        nodejs 'NodeJS-16'
    }

    environment {
        TESTING_ENVIRONMENT = "DOCKER"
        PRODUCTION_ENVIRONMENT = "AWS-EC2"
        SONAR_TOKEN = credentials('sonar-token')
        SONAR_HOST_URL = 'https://sonarcloud.io' 
        NVD_API_KEY = credentials('nvd-api-key')
        DOCKER_CREDENTIALS = credentials('docker-credentials')
        AWS_CREDENTIALS = credentials('aws-credentials')
        APP_NAME = "sharelyft"
        BASE_URL = 'http://localhost:3000'
    }

    stages {
        stage('Clone Repo') {
            steps {
                git url: 'https://github.com/bravine6/Sharelyft.git', branch: 'main'
            }
        }

        stage('Build') {
            steps {
                echo "Building ShareLyft Node.js application"
                sh '''
                    npm ci
                    npm run build
                    docker build -t ropbravine/${APP_NAME}:${BUILD_NUMBER} .
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
            steps {
                echo "Running ShareLyft automated tests"
                sh '''
                    # Start app in the background
                    npm run start &

                    # Wait for the app to be ready
                    npx wait-on http://localhost:3000


                    npm run test:unit
                    npm run test:integration
                    # npm run test:e2e
                '''
            }
            post {
                success {
                    junit '**/test-results/*.xml'
                    mail to: "mickybravine@gmail.com",
                         subject: "✅ ShareLyft Tests Passed: ${currentBuild.fullDisplayName}",
                         body: "All ShareLyft tests passed successfully in build ${BUILD_NUMBER}."
                }
                failure {
                    mail to: "mickybravine@gmail.com",
                         subject: "❌ ShareLyft Tests Failed: ${currentBuild.fullDisplayName}",
                         body: "Tests failed in build ${BUILD_NUMBER}. Please check Jenkins for details."
                }
            }
        }

        stage('Code Quality') {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli:latest'
                    args  '-u root'          // gives root so the scanner can write cache
                    reuseNode true  
                }
            }
            steps {
                echo "Running ShareLyft code quality analysis"
                withSonarQubeEnv('SonarCloud') {
                    sh '''
                        sonar-scanner \
                        -Dsonar.token=\$SONAR_TOKEN \
                        -Dsonar.host.url=\$SONAR_HOST_URL \
                        -Dsonar.organization=bravine6 \
                        -Dsonar.projectKey=sharelyft \
                        -Dsonar.projectName=\"ShareLyft\" \
                        -Dsonar.sources=src \
                        -Dsonar.tests=src/__tests__ \
                        -Dsonar.exclusions=src/**/__tests__/**/* \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    '''
                }
            }
            post {
                success {
                    echo "Code quality checks passed"
                }
                failure {
                    mail to: "mickybravine@gmail.com",
                         subject: "❌ Code Quality Issues: ${currentBuild.fullDisplayName}",
                         body: "Issues found in build ${BUILD_NUMBER}. Check SonarQube for details."
                }
            }
        }

        stage('Security') {
            steps {
                echo "Running security analysis"
                sh '''

                    # make sure the reports folder exists and is writable
                    mkdir -p "$WORKSPACE/reports"

                    docker run --rm \
                        --user 0 \
                        -e NVD_API_KEY="$NVD_API_KEY" \
                        -v "$WORKSPACE":/src \
                        -v "$HOME/odc-data":/usr/share/dependency-check/data \
                        owasp/dependency-check:latest dependency-check.sh \
                        --project "${APP_NAME}" \
                        --scan    /src \
                        -f HTML -f JSON \
                        --out     /src/reports
                        --nvdApiKey "$NVD_API_KEY"

                    npm audit --audit-level=high
                    npm run test:security
                '''
            }
            post {
                success {
                    echo "Security checks passed"
                }
                failure {
                    mail to: "mickybravine@gmail.com",
                         subject: "❌ Security Issues: ${currentBuild.fullDisplayName}",
                         body: "Critical security issues found. Immediate attention required."
                }
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying ShareLyft to ${TESTING_ENVIRONMENT}"
                sh '''
                    printf %s "$DOCKER_CREDENTIALS_PSW" | docker login -u "$DOCKER_CREDENTIALS_USR" --password-stdin
                    docker push ropbravine/${APP_NAME}:${BUILD_NUMBER}
                    docker compose -f docker-compose.test.yml up -d
                '''
            }
            post {
                success {
                    // Wait until service responds, then run smoke tests
                    withEnv(["BASE_URL=http://localhost:3000"]) {
                    sh '''
                        for i in {1..30}; do
                        curl -sf http://localhost:3000/ && break
                        sleep 2
                        done
                        npm run test:smoke
                    '''
                    }            
                }
                always {
                    sh '''
                        # Bring the stack down incase
                        docker-compose -f docker-compose.test.yml down -v
                    '''
                }
            }
        }

        stage('Release') {
            steps {
                echo "Releasing to ${PRODUCTION_ENVIRONMENT}"
                withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
                    sh '''
                        docker tag ropbravine/${APP_NAME}:${BUILD_NUMBER} ${APP_NAME}:latest
                        docker push ${APP_NAME}:latest

                        apk add --no-cache curl unzip
                        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
                        unzip awscliv2.zip
                        ./aws/install

                        aws elasticbeanstalk create-application-version \
                          --application-name ${APP_NAME} \
                          --version-label v${BUILD_NUMBER} \
                          --source-bundle S3Bucket="sharelyft-deployments",S3Key="sharelyft-${BUILD_NUMBER}.zip"

                        aws elasticbeanstalk update-environment \
                          --environment-name sharelyft-production \
                          --version-label v${BUILD_NUMBER}
                    '''
                }
            }
            post {
                success {
                    mail to: "mickybravine@gmail.com",
                         subject: "✅ ShareLyft Released: ${currentBuild.fullDisplayName}",
                         body: "ShareLyft has been released to production."
                }
                failure {
                    withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
                        sh '''
                            aws elasticbeanstalk update-environment \
                              --environment-name sharelyft-production \
                              --version-label v${PREV_SUCCESSFUL_BUILD}
                        '''
                    }
                    mail to: "mickybravine@gmail.com",
                         subject: "❌ ShareLyft Release Failed: ${currentBuild.fullDisplayName}",
                         body: "Production release failed and has been rolled back."
                }
            }
        }

        stage('Monitoring') {
            steps {
                withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
                    sh '''
                        aws cloudwatch put-metric-alarm \
                          --alarm-name "ShareLyft-HighCPUUsage" \
                          --metric-name CPUUtilization \
                          --namespace AWS/EC2 \
                          --statistic Average \
                          --period 300 \
                          --threshold 70 \
                          --comparison-operator GreaterThanThreshold \
                          --dimensions Name=InstanceId,Value=i-12345678 \
                          --evaluation-periods 2 \
                          --alarm-actions arn:aws:sns:us-east-1:123456789012:sharelyft-alerts

                        aws ssm send-command \
                          --document-name "AWS-RunShellScript" \
                          --targets "Key=instanceids,Values=i-12345678" \
                          --parameters commands="curl -Ls https://download.newrelic.com/install/newrelic-cli/scripts/install.sh | bash && sudo NEW_RELIC_API_KEY=nr_api_key NEW_RELIC_ACCOUNT_ID=nr_account_id /usr/local/bin/newrelic install"

                        scp -i ~/.ssh/sharelyft-key.pem ./monitoring/metrics-agent.js ec2-user@sharelyft-server:/opt/sharelyft/
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "ShareLyft pipeline execution completed"
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
            junit testResults: '**/test-results/*.xml', allowEmptyResults: true
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'coverage/lcov-report',
                reportFiles: 'index.html',
                reportName: 'ShareLyft Code Coverage Report'
            ])
            cleanWs()
        }
        success {
            withCredentials([string(credentialsId: 'slack-webhook', variable: 'SLACK_WEBHOOK')]) {
                slackSend(
                    tokenCredentialId: 'slack-webhook',
                    channel: '#sharelyft-ci',
                    color: 'good',
                    message: "✅ *SUCCESS:* ${env.JOB_NAME} #${env.BUILD_NUMBER}\n<${env.BUILD_URL}|Click here to view the build details.>"
                )
            }
        }
        failure {
            withCredentials([string(credentialsId: 'slack-webhook', variable: 'SLACK_WEBHOOK')]) {
                slackSend(
                    tokenCredentialId: 'slack-webhook',
                    channel: '#sharelyft-ci',
                    color: 'danger',
                    message: "❌ *FAILURE:* ${env.JOB_NAME} #${env.BUILD_NUMBER}\n<${env.BUILD_URL}|Click here to view the build logs.>"
                )
            }
            mail to: "mickybravine@gmail.com",
                subject: "❌ Pipeline Failed: ${currentBuild.fullDisplayName}",
                body: "Pipeline failed. Check the Jenkins console output: ${env.BUILD_URL}"
        }
    }
}
