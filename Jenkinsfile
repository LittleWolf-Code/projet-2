pipeline {
    agent{ 
        docker{
            image 'mcr.microsoft.com/playwright:v1.58.0-noble'
            args '--network=host'
        }
    }
    stages {
        stage('build') {
            steps {
                sh 'echo debut etape build'
                sh 'npm install'
                sh 'npm run build'
                sh 'echo fin etape build'
            }
        }
        stage('test unitaire'){
            steps{
                sh 'echo test unitaire'
                sh 'npm install -D jsdom'
                sh 'npm run test'
            }
            
        }
        stage('test UI'){
            steps{
                sh 'echo test UI'
                sh 'npx playwright install --with-deps'
                sh 'npm run test:e2e'
            }


        }

    }
}