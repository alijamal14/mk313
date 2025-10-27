pipeline {
    agent any

    options { disableConcurrentBuilds() }

    parameters {
        string(
            name: 'IIS_DEST_PATH',
            defaultValue: 'C:\\inetpub\\wwwroot\\mk313',
            description: 'Local IIS physical path (leave empty to deploy over Web Deploy).'
        )
        string(
            name: 'IIS_SITE_NAME',
            defaultValue: 'mk313',
            description: 'IIS site name when using remote Web Deploy.'
        )
        string(
            name: 'IIS_WEB_DEPLOY_URL',
            defaultValue: '',
            description: 'Web Deploy endpoint (e.g. https://mk313.com:8172/MsDeploy.axd?site=mk313).'
        )
    }

    environment {
        IIS_DEST_PATH = "${params.IIS_DEST_PATH}"
        IIS_SITE_NAME = "${params.IIS_SITE_NAME}"
        IIS_WEB_DEPLOY_URL = "${params.IIS_WEB_DEPLOY_URL}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Web Deploy') {
            steps {
                powershell '''
                    $msdeploy = Get-Command msdeploy.exe -ErrorAction SilentlyContinue
                    if (-not $msdeploy) {
                        $candidates = @(
                            "${env:ProgramFiles}\\IIS\\Microsoft Web Deploy V3\\msdeploy.exe",
                            "${env:ProgramFiles(x86)}\\IIS\\Microsoft Web Deploy V3\\msdeploy.exe"
                        )
                        foreach ($path in $candidates) {
                            if (Test-Path $path) {
                                $msdeploy = Get-Item $path
                                break
                            }
                        }
                    }

                    if (-not $msdeploy) {
                        throw "msdeploy.exe not found on this agent. Install Microsoft Web Deploy V3."
                    }

                    $resolved = if ($msdeploy -is [System.Management.Automation.ApplicationInfo]) { $msdeploy.Source } else { $msdeploy.FullName }
                    Write-Host "Web Deploy located at $resolved"
                '''
            }
        }

        stage('Prepare Artifacts') {
            steps {
                script {
                    env.PUBLISH_DIR = powershell(returnStdout: true, script: '''
                        $publishDir = Join-Path $env:TEMP "mk313_publish"
                        if (Test-Path $publishDir) {
                            Remove-Item $publishDir -Recurse -Force
                        }
                        New-Item -ItemType Directory -Path $publishDir | Out-Null

                        $exclude = @(
                            '.git', '.github', '.gitignore', '.gitattributes',
                            'Jenkinsfile', 'scripts'
                        )

                        Get-ChildItem -Force | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
                            Copy-Item $_.FullName -Destination $publishDir -Recurse -Force
                        }

                        Write-Output $publishDir
                    ''').trim()
                }
                echo "Publish directory: ${env.PUBLISH_DIR}"
            }
        }

        stage('Deploy to IIS') {
            steps {
                script {
                    def deployScript = '''
                        if (-not $env:IIS_SITE_NAME -and -not $env:IIS_DEST_PATH) {
                            throw "Set IIS_SITE_NAME for remote deployment or IIS_DEST_PATH for file copy deployment."
                        }

                        $msdeployCommand = Get-Command msdeploy.exe -ErrorAction SilentlyContinue
                        if (-not $msdeployCommand) {
                            $candidatePaths = @(
                                "${env:ProgramFiles}\\IIS\\Microsoft Web Deploy V3\\msdeploy.exe",
                                "${env:ProgramFiles(x86)}\\IIS\\Microsoft Web Deploy V3\\msdeploy.exe"
                            )
                            foreach ($candidate in $candidatePaths) {
                                if (Test-Path $candidate) {
                                    $msdeployCommand = Get-Item $candidate
                                    break
                                }
                            }
                        }

                        if (-not $msdeployCommand) {
                            throw "msdeploy.exe not found. Install Web Deploy on this agent."
                        }

                        $msdeployPath = if ($msdeployCommand -is [System.Management.Automation.ApplicationInfo]) {
                            $msdeployCommand.Source
                        } else {
                            $msdeployCommand.FullName
                        }

                        if ($env:IIS_DEST_PATH) {
                            Write-Host "Deploying via file system path: $env:IIS_DEST_PATH"
                            $destArgs = "contentPath=$env:IIS_DEST_PATH"
                        } else {
                            foreach ($name in @('IIS_WEB_DEPLOY_URL','WEB_DEPLOY_USER','WEB_DEPLOY_PASSWORD')) {
                                if (-not (Get-Item -Path \"env:$name\" -ErrorAction SilentlyContinue)) {
                                    throw \"Missing environment variable $name required for remote deployment.\"
                                }
                            }
                            $destArgs = \"contentPath=$env:IIS_SITE_NAME,ComputerName=$env:IIS_WEB_DEPLOY_URL,UserName=$env:WEB_DEPLOY_USER,Password=$env:WEB_DEPLOY_PASSWORD,AuthType=Basic,IncludeAcls=False\"
                        }

                        $arguments = @(
                            "-verb:sync",
                            "-source:contentPath=$env:PUBLISH_DIR",
                            "-dest:$destArgs",
                            "-allowUntrusted",
                            "-enableRule:DoNotDeleteRule",
                            "-skip:directory=App_Data"
                        )

                        & "$msdeployPath" @arguments
                    '''

                    if (env.IIS_DEST_PATH) {
                        powershell deployScript
                    } else {
                        withCredentials([
                            usernamePassword(
                                credentialsId: 'mk313-webdeploy',
                                usernameVariable: 'WEB_DEPLOY_USER',
                                passwordVariable: 'WEB_DEPLOY_PASSWORD'
                            )
                        ]) {
                            powershell deployScript
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                if (env.PUBLISH_DIR && fileExists(env.PUBLISH_DIR)) {
                    powershell "Remove-Item -Path '${env.PUBLISH_DIR}' -Recurse -Force"
                }
            }
        }
    }
}
