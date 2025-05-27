// sonar.js
const { customScanner } = require('sonarqube-scanner');

customScanner(
  {
    serverUrl: process.env.SONAR_HOST_URL,
    token:    process.env.SONAR_TOKEN,
    options: {
      'sonar.projectKey':               'sharelyft',
      'sonar.projectName':              'ShareLyft',
      'sonar.sources':                  'src',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info'
    }
  },
  () => process.exit()
);
