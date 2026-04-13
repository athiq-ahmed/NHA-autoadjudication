# Deployment Guide

## Overview

The NHA Claims Auto-Adjudication System is architected for cloud-native deployment with support for multiple platforms:
- **Containerized**: Docker & Docker Compose for local/on-premise
- **Serverless**: Azure App Service / AWS Lambda
- **Kubernetes-Ready**: Environment-based configuration, graceful shutdown, health checks
- **CI/CD Ready**: GitHub Actions, Azure DevOps, Jenkins compatible

## Local Development

### Option 1: Direct Python/Node.js

```bash
# Terminal 1: Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

### Option 2: Docker Compose (Recommended)

```bash
# One-command startup
docker-compose up --build

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Production Deployment

### Prerequisites
- Cloud provider account (Azure/AWS/GCP)
- Docker installed locally for building images
- Container registry access
- Domain name (optional, for HTTPS)

### Azure App Service

#### Backend Deployment

```bash
# 1. Create resource group
az group create --name nha-claims --location eastus

# 2. Create App Service Plan
az appservice plan create \
  --name nha-claims-plan \
  --resource-group nha-claims \
  --sku B2 \
  --is-linux

# 3. Create Web App for Python
az webapp create \
  --resource-group nha-claims \
  --plan nha-claims-plan \
  --name nha-claims-api \
  --runtime "PYTHON|3.11"

# 4. Configure environment variables
az webapp config appsettings set \
  --resource-group nha-claims \
  --name nha-claims-api \
  --settings \
    API_HOST=0.0.0.0 \
    API_PORT=8000 \
    ENV=production \
    CORS_ORIGINS=https://nha-claims-ui.azurewebsites.net

# 5. Deploy from GitHub (recommended)
# Connect GitHub → Azure DevOps pipeline (see CI/CD section)

# OR deploy from local
az webapp deployment source config-zip \
  --resource-group nha-claims \
  --name nha-claims-api \
  --src backend-dist.zip
```

#### Frontend Deployment (Static Web App)

```bash
# 1. Create Static Web App
az staticwebapp create \
  --name nha-claims-ui \
  --resource-group nha-claims \
  --source https://github.com/yourusername/nha-web-app \
  --branch main \
  --api-location backend \
  --api-language python \
  --app-location frontend \
  --api-build-command "pip install -r requirements.txt"

# 2. Configure environment
az staticwebapp appsettings set \
  --name nha-claims-ui \
  --setting-names \
    NEXT_PUBLIC_API_URL=https://nha-claims-api.azurewebsites.net/api
```

### AWS Elastic Beanstalk

#### Backend Deployment

```bash
# 1. Initialize EB application
eb init -p "Python 3.11" nha-claims-api

# 2. Create environment
eb create nha-claims-prod --instance-type t3.small

# 3. Configure environment variables
eb setenv \
  API_HOST=0.0.0.0 \
  API_PORT=8000 \
  ENV=production

# 4. Deploy
eb deploy

# 5. Monitor
eb status
eb logs -z
```

#### Frontend Deployment (CloudFront + S3)

```bash
# 1. Build Next.js
npm run build
npm run export  # For static export

# 2. Upload to S3
aws s3 sync ./out s3://nha-claims-ui/

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234ABCD \
  --paths "/*"
```

### Docker Image Registry

#### Push to Docker Hub

```bash
# 1. Build images
docker build -t yourusername/nha-claims-backend:latest ./backend
docker build -t yourusername/nha-claims-frontend:latest ./frontend

# 2. Login
docker login

# 3. Push
docker push yourusername/nha-claims-backend:latest
docker push yourusername/nha-claims-frontend:latest

# 4. Pull and run
docker pull yourusername/nha-claims-backend:latest
docker run -p 8000:8000 yourusername/nha-claims-backend:latest
```

#### Push to Azure Container Registry

```bash
# 1. Create registry
az acr create \
  --resource-group nha-claims \
  --name nhaclaimsregistry \
  --sku Basic

# 2. Login
az acr login --name nhaclaimsregistry

# 3. Get login server
az acr show --name nhaclaimsregistry --query loginServer

# 4. Tag and push
docker tag yourusername/nha-claims-backend:latest nhaclaimsregistry.azurecr.io/backend:latest
docker push nhaclaimsregistry.azurecr.io/backend:latest

# 5. Deploy to App Service
az webapp create \
  --resource-group nha-claims \
  --plan nha-claims-plan \
  --name nha-claims-api \
  --image nhaclaimsregistry.azurecr.io/backend:latest
```

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (AKS, EKS, GKE, or local)
- kubectl configured
- Helm (optional, recommended)

### Manual Deployment

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nha-claims-backend
  labels:
    app: nha-claims
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nha-claims-backend
  template:
    metadata:
      labels:
        app: nha-claims-backend
    spec:
      containers:
      - name: backend
        image: nhaclaimsregistry.azurecr.io/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: API_HOST
          value: "0.0.0.0"
        - name: API_PORT
          value: "8000"
        - name: ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 20
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: nha-claims-backend-svc
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8000
  selector:
    app: nha-claims-backend
```

```bash
# Deploy
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# Verify
kubectl get pods
kubectl get services
kubectl describe deployment nha-claims-backend
kubectl logs deployment/nha-claims-backend

# Scale
kubectl scale deployment nha-claims-backend --replicas=5

# Update image
kubectl set image deployment/nha-claims-backend \
  backend=nhaclaimsregistry.azurecr.io/backend:v2.0
```

### Helm Deployment

```bash
# Create Helm chart
helm create nha-claims

# Deploy
helm install nha-claims ./nha-claims \
  --set backend.image=yourusername/backend:latest \
  --set frontend.image=yourusername/frontend:latest

# Upgrade
helm upgrade nha-claims ./nha-claims

# Rollback
helm rollback nha-claims 1
```

## Environment Configuration

### Development (.env)
```
API_HOST=localhost
API_PORT=8000
DEBUG=True
ENV=development
CORS_ORIGINS=http://localhost:3000
MODE=mock
```

### Staging (.env.staging)
```
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
ENV=staging
CORS_ORIGINS=https://staging.nha-claims.example.com
MODE=mock
```

### Production (.env.prod)
```
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
ENV=production
CORS_ORIGINS=https://nha-claims.example.com
MODE=live
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Azure

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Test Backend
      run: |
        cd backend
        python -m pip install -r requirements.txt
        python -m pytest
    
    - name: Test Frontend
      run: |
        cd frontend
        npm install
        npm run lint
        npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Login to Azure
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Deploy Backend
      run: |
        az webapp deployment source config-zip \
          --resource-group nha-claims \
          --name nha-claims-api \
          --src backend.zip
    
    - name: Deploy Frontend
      run: |
        cd frontend
        npm run build
        az staticwebapp linked-backends link \
          --name nha-claims-ui \
          --backend-resource-id /subscriptions/.../nha-claims-api
```

### Azure DevOps

```yaml
# azure-pipelines.yml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

stages:
- stage: Test
  jobs:
  - job: TestBackend
    steps:
    - task: UsePythonVersion@0
      inputs:
        versionSpec: '3.11'
    - script: |
        pip install -r backend/requirements.txt
        pytest backend/tests
  
  - job: TestFrontend
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
    - script: |
        cd frontend
        npm install
        npm run build

- stage: Deploy
  condition: succeeded()
  jobs:
  - job: DeployProd
    steps:
    - task: AzureAppServiceDeploy@0
      inputs:
        azureSubscription: 'Azure Connection'
        appType: 'webAppLinux'
        appName: 'nha-claims-api'
        package: '$(Pipeline.BuildArtifactStagingDirectory)'
```

## Monitoring & Logging

### Azure Monitor

```bash
# Create Log Analytics workspace
az monitor log-analytics workspace create \
  --resource-group nha-claims \
  --workspace-name nha-claims-logs

# Enable diagnostics
az webapp diagnostic logs config \
  --resource-group nha-claims \
  --name nha-claims-api \
  --docker-container-logging filesystem

# View logs
az monitor activity-log list \
  --resource-group nha-claims \
  --max-events 50
```

### Application Insights

```bash
# Create
az monitor app-insights component create \
  --app nha-claims-insights \
  --location eastus \
  --resource-group nha-claims

# Query
az monitor app-insights metrics show \
  --app nha-claims-insights \
  --metric requests/count
```

### Frontend Monitoring (Sentry/LogRocket)

```typescript
// frontend/app/layout.tsx
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

## Scaling Strategy

### Horizontal Scaling
- **Backend**: Multiple FastAPI instances behind load balancer
- **Frontend**: CDN + multiple zones (Cloudflare, CloudFront)

### Vertical Scaling
- Increase instance size (App Service: S1 → S3)
- Increase memory/CPU (Kubernetes: increase resource limits)

### Database Scaling (Future)
- Add caching layer (Redis)
- Replicate across regions
- Implement database sharding

## Security Checklist

- [ ] Enable HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Configure authentication (Azure AD, OAuth)
- [ ] Enable audit logging
- [ ] Regular security scanning (Dependabot, Snyk)
- [ ] Encrypt sensitive data at rest
- [ ] Use managed identities (no hardcoded secrets)
- [ ] Regular backup/disaster recovery testing

## Rollback Procedure

### Azure App Service
```bash
# View deployment history
az webapp deployment slot list -g nha-claims -n nha-claims-api

# Swap slots
az webapp deployment slot swap \
  -g nha-claims \
  -n nha-claims-api \
  --slot staging
```

### Kubernetes
```bash
# View rollout history
kubectl rollout history deployment nha-claims-backend

# Rollback to previous version
kubectl rollout undo deployment nha-claims-backend

# Rollback to specific revision
kubectl rollout undo deployment nha-claims-backend --to-revision=2
```

## Cost Optimization

- Use reserved instances (save 30-40%)
- Auto-scale based on metrics
- Use spot instances for non-critical workloads
- Implement request throttling/rate limiting
- Regular cost analysis and tagging

## Support & Troubleshooting

### Common Issues

**Issue**: Pod CrashLoopBackOff
```bash
kubectl logs pod/nha-claims-backend-xyz
kubectl describe pod/nha-claims-backend-xyz
```

**Issue**: High memory usage
```bash
kubectl top nodes
kubectl top pod -n default
# Increase resource limits or scale
```

**Issue**: CORS errors
```bash
# Verify CORS_ORIGINS environment variable
az webapp show --resource-group nha-claims --name nha-claims-api
```

---

**Ready to deploy!** 🚀
