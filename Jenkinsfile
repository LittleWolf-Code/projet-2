pipeline {
    agent none
    stages {
        stage('build') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                    args '--network=host'
                }
            }
            steps {
                sh 'echo debut etape build'
                sh 'npm install'
                sh 'npm run build'
                sh 'echo fin etape build'
                stash includes: '**', name: 'workspace'
            }
        }
        stage('test unitaire'){
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                    args '--network=host'
                }
            }
            steps{
                unstash 'workspace'
                sh 'echo test unitaire'
                sh 'npm install -D jsdom'
                sh 'npm install -D @vitest/ui'
                sh 'npm run test'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: false,
                        keepAll: true,
                        reportDir: 'html',
                        reportFiles: 'index.html',
                        reportName: 'VitestReport',
                        reportTitles: '',
                        useWrapperFileDirectly: true
                    ])
                }
            }
        }
        stage('test UI'){
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                    args '--network=host'
                }
            }
            steps{
                unstash 'workspace'
                sh 'echo test UI'
                sh 'npx playwright install'
                sh 'npm run test:e2e'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: false,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'PlaywrightReport',
                        reportTitles: '',
                        useWrapperFileDirectly: true
                    ])
                }
            }
        }
        stage('deploy') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.58.0-noble'
                    args '--network=host'
                }
            }
            when { branch 'main' }
            environment {
                NETLIFY_AUTH_TOKEN = credentials('NETLIFY_TOKEN')
            }
            steps {
                unstash 'workspace'
                sh 'echo Déploiement sur Netlify'
                sh 'npx netlify-cli deploy --prod --dir=dist --site=chessnotalreadyexists.netlify.app --auth=$NETLIFY_AUTH_TOKEN'
            }
        }
        stage('docker') {
            agent { label 'built-in' }
            when { branch 'main' }
            environment {

                CI_REGISTRY = 'ghcr.io'

                CI_REGISTRY_USER = 'littlewolf-code'
                CI_REGISTRY_IMAGE = "${CI_REGISTRY}/${CI_REGISTRY_USER}/projet-2"
                CI_REGISTRY_PASSWORD = credentials('CI_REGISTRY_PASSWORD')
            }
            steps {
                unstash 'workspace'
                sh 'docker build -t $CI_REGISTRY_IMAGE --network=host .'
                sh 'docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY'
                sh 'docker push $CI_REGISTRY_IMAGE'
            }
        }
    }
}
