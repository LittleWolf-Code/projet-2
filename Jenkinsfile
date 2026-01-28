pipeline {
    agent any
    stages {
        stage('build') {
            steps {
                sh 'echo debut etape build'
                sh 'npm install'
                sh 'npm run build'
                sh 'echo fin etape build'
            }
        }
        stage('step2') {
            steps {
                sh 'echo étape deux'
            }
        }
        stage('step3') {
            steps {
                sh 'echo étape trois'
            }
        }
    }
}