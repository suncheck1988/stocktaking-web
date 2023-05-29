pipeline {
    agent any
    options {
        timestamps()
    }
    environment {
        CI = 'true'
        REGISTRY = credentials('REGISTRY')
        IMAGE_TAG = sh(
            returnStdout: true,
            script: "echo '${env.BUILD_TAG}' | sed 's/%2F/-/g'"
        ).trim()
        GIT_DIFF_BASE_COMMIT = sh(
            returnStdout: true,
            script: "echo ${env.GIT_PREVIOUS_SUCCESSFUL_COMMIT ?: '`git rev-list HEAD | tail -n 1`'}"
        ).trim()
        GIT_DIFF = sh(
            returnStdout: true,
            script: "git diff --name-only ${env.GIT_DIFF_BASE_COMMIT} HEAD -- frontend || echo 'all'"
        ).trim()
        GIT_DIFF_ROOT = sh(
            returnStdout: true,
            script: "{ git diff --name-only ${env.GIT_DIFF_BASE_COMMIT} HEAD -- . || echo 'all'; } | { grep -v / - || true; }"
        ).trim()
    }
    stages {
        stage('Init') {
            steps {
                sh 'touch .docker-images-before'
                sh 'make init-ci'
                sh 'docker compose images > .docker-images-after'
                script {
                    DOCKER_DIFF = sh(
                        returnStdout: true,
                        script: 'diff .docker-images-before .docker-images-after || true'
                    ).trim()
                }
            }
        }
        stage('Down') {
            steps {
                sh 'make docker-down-clear'
            }
        }
        stage('Build') {
            steps {
                sh 'make build'
            }
        }
        stage('Push') {
            when {
                branch 'master'
            }
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'REGISTRY_AUTH',
                        usernameVariable: 'USER',
                        passwordVariable: 'PASSWORD'
                    )
                ]) {
                    sh 'docker login -u=$USER -p=$PASSWORD $REGISTRY'
                }
                sh 'make push'
            }
        }
        stage ('Prod') {
            when {
                branch 'master'
            }
            steps {
                withCredentials([
                    string(credentialsId: 'PRODUCTION_HOST', variable: 'HOST'),
                    string(credentialsId: 'PRODUCTION_PORT', variable: 'PORT'),
                    string(credentialsId: 'VUE_APP_API_URL', variable: 'VUE_APP_API_URL')
                ]) {
                    sshagent (credentials: ['PRODUCTION_AUTH']) {
                        sh 'make deploy'
                    }
                }
            }
        }
    }
    post {
        success {
            sh 'mv -f .docker-images-after .docker-images-before'
        }
        always {
            sh 'make docker-down-clear || true'
            sh 'make deploy-clean || true'
        }
        failure {
            emailext (
                subject: "FAIL Job ${env.JOB_NAME} ${env.BUILD_NUMBER}",
                body: "Check console output at: ${env.BUILD_URL}/console",
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
        }
    }
}
