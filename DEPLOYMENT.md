# 🚀 Deployment Guide - Shinmen Takezo IDE

This guide covers various deployment options for Shinmen Takezo IDE.

## 📋 Prerequisites

- Node.js 18+ installed
- Git repository access
- CHUTS AI API key
- Domain name (for production)

## 🌐 Deployment Options

### 1. Vercel (Recommended)

Vercel provides the easiest deployment for Next.js applications.

#### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/shinmen-takezo-ide)

#### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_AI_API_KEY
   vercel env add NEXT_PUBLIC_AI_BASE_URL
   ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

#### Vercel Configuration
Create `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_AI_API_KEY": "@ai-api-key",
    "NEXT_PUBLIC_AI_BASE_URL": "@ai-base-url"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        }
      ]
    }
  ]
}
```

### 2. Netlify

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18

3. **Environment Variables**
   ```
   NEXT_PUBLIC_AI_API_KEY=your_api_key
   NEXT_PUBLIC_AI_BASE_URL=https://llm.chutes.ai/v1/
   ```

4. **Deploy**
   - Click "Deploy site"

### 3. Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  shinmen-ide:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_AI_API_KEY=${AI_API_KEY}
      - NEXT_PUBLIC_AI_BASE_URL=https://llm.chutes.ai/v1/
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - shinmen-ide
    restart: unless-stopped
```

#### Build and Run
```bash
# Build the image
docker build -t shinmen-takezo-ide .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_AI_API_KEY=your_api_key \
  -e NEXT_PUBLIC_AI_BASE_URL=https://llm.chutes.ai/v1/ \
  shinmen-takezo-ide

# Or use docker-compose
docker-compose up -d
```

### 4. AWS Deployment

#### Using AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Connect your Git repository

2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   - Add environment variables in Amplify console

#### Using EC2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.medium or larger
   - Security group with ports 22, 80, 443

2. **Setup Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Clone repository
   git clone https://github.com/your-username/shinmen-takezo-ide.git
   cd shinmen-takezo-ide

   # Install dependencies
   npm install

   # Build application
   npm run build

   # Start with PM2
   pm2 start npm --name "shinmen-ide" -- start
   pm2 startup
   pm2 save
   ```

3. **Setup Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### 5. Google Cloud Platform

#### Using Cloud Run

1. **Build Container**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/shinmen-ide
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy shinmen-ide \
     --image gcr.io/PROJECT_ID/shinmen-ide \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars NEXT_PUBLIC_AI_API_KEY=your_key
   ```

## 🔧 Environment Configuration

### Production Environment Variables
```bash
# Required
NEXT_PUBLIC_AI_API_KEY=your_chuts_ai_api_key
NEXT_PUBLIC_AI_BASE_URL=https://llm.chutes.ai/v1/

# Optional
NEXT_PUBLIC_APP_NAME="Shinmen Takezo IDE"
NEXT_PUBLIC_AI_AGENT_NAME="Shinmen"
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

## 🔒 Security Checklist

### Pre-Deployment
- [ ] Remove development API keys
- [ ] Set secure environment variables
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Set up error monitoring
- [ ] Configure rate limiting

### Post-Deployment
- [ ] Test all functionality
- [ ] Verify AI integration
- [ ] Check file system persistence
- [ ] Test terminal functionality
- [ ] Monitor performance
- [ ] Set up backups

## 📊 Monitoring

### Health Checks
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  })
}
```

### Performance Monitoring
- Use Vercel Analytics
- Set up Sentry for error tracking
- Monitor Core Web Vitals
- Track AI response times

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+)
   - Verify environment variables
   - Clear npm cache: `npm cache clean --force`

2. **AI Integration Issues**
   - Verify API key is correct
   - Check network connectivity
   - Monitor rate limits

3. **File System Issues**
   - Clear browser storage
   - Check IndexedDB support
   - Verify CORS headers

### Debug Commands
```bash
# Check build output
npm run build

# Analyze bundle
npm run analyze

# Check for security vulnerabilities
npm audit

# Test production build locally
npm run start
```

## 📞 Support

For deployment issues:
- Check the [troubleshooting guide](TROUBLESHOOTING.md)
- Open an issue on GitHub
- Contact support team

---

*"The warrior and the artist live by the same code of necessity, which dictates that the battle must be fought anew every day."* - Miyamoto Musashi
