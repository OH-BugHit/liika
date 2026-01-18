trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '14.x'
    displayName: 'Install Node.js'

  - script: |
      npm install
    displayName: 'Install dependencies'

  - script: |
      npm run dev
      sleep 5 
    displayName: 'Start server'

  - script: |
      curl -X POST -H "Content-Type: application/json" -d '{"email": "Liika2025@outlook.com"}' http://localhost:3003/api/login/sendEmail
    displayName: 'Run email.rest'