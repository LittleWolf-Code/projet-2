pipeline {
    agent none
    stages {
        stage('build') {
            agent{ docker{
                image 'mcr.microsoft.com/playwright:v1.57.0-noble'
                args '--network=host'
            }}
            steps {
                sh 'echo debut etape build'
                sh 'npm install'
                sh 'npm run build'
                sh 'echo fin etape build'
            }
        }

    }
}