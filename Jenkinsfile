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
        agent any
        stage('step2') {
            steps {
                sh 'echo étape deux'
            }
        }
        agent any
        stage('step3') {
            steps {
                sh 'echo étape trois'
            }
        }
    }
}