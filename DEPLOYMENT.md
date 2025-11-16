# Deployment Guide

This guide covers different deployment options for VibeCoding.

## Table of Contents
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Cloud Platforms](#cloud-platforms)
- [Docker Deployment](#docker-deployment)
- [Security Considerations](#security-considerations)

## Local Development

### Prerequisites
- Node.js 18+ installed
- Snowflake account with Cortex enabled
- Modern web browser

### Steps

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Start development server:
```bash
npm start
```

4. Access at `http://localhost:3000`

### HTTPS for Local Development

Microphone access requires HTTPS. Use [mkcert](https://github.com/FiloSottile/mkcert):

```bash
# Install mkcert
brew install mkcert  # macOS
# or download from GitHub for other OS

# Generate certificates
mkcert -install
mkcert localhost 127.0.0.1 ::1

# Update server.js to use HTTPS
```

## Production Deployment

### Environment Setup

1. **Set environment variables** (never commit sensitive data):
```bash
export SNOWFLAKE_ACCOUNT="your-account.snowflakecomputing.com"
export SNOWFLAKE_USERNAME="your-username"
export SNOWFLAKE_PASSWORD="your-password"
export NODE_ENV="production"
export PORT="3000"
```

2. **Install production dependencies**:
```bash
npm install --production
```

3. **Use a process manager** (PM2 recommended):
```bash
npm install -g pm2
pm2 start server.js --name vibecoding
pm2 save
pm2 startup
```

### Reverse Proxy (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Cloud Platforms

### Heroku

1. **Create Heroku app**:
```bash
heroku create your-app-name
```

2. **Set environment variables**:
```bash
heroku config:set SNOWFLAKE_ACCOUNT="your-account"
heroku config:set SNOWFLAKE_USERNAME="your-username"
heroku config:set SNOWFLAKE_PASSWORD="your-password"
```

3. **Deploy**:
```bash
git push heroku main
```

4. **Create Procfile**:
```
web: node server.js
```

### AWS (EC2)

1. **Launch EC2 instance** (Ubuntu 22.04 recommended)

2. **Install Node.js**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Clone and setup**:
```bash
git clone https://github.com/anuragag/VibeCoding.git
cd VibeCoding
npm install --production
```

4. **Configure security group** to allow ports 80 and 443

5. **Setup systemd service**:
```bash
sudo nano /etc/systemd/system/vibecoding.service
```

```ini
[Unit]
Description=VibeCoding Voice Agent
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/VibeCoding
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

6. **Enable and start**:
```bash
sudo systemctl enable vibecoding
sudo systemctl start vibecoding
```

### Google Cloud Platform (Cloud Run)

1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

2. **Build and deploy**:
```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/vibecoding
gcloud run deploy vibecoding --image gcr.io/PROJECT-ID/vibecoding --platform managed
```

### Vercel

1. **Create `vercel.json`**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

2. **Deploy**:
```bash
npm install -g vercel
vercel
```

## Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app files
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start app
CMD ["node", "server.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  vibecoding:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SNOWFLAKE_ACCOUNT=${SNOWFLAKE_ACCOUNT}
      - SNOWFLAKE_USERNAME=${SNOWFLAKE_USERNAME}
      - SNOWFLAKE_PASSWORD=${SNOWFLAKE_PASSWORD}
      - SNOWFLAKE_WAREHOUSE=${SNOWFLAKE_WAREHOUSE}
      - SNOWFLAKE_DATABASE=${SNOWFLAKE_DATABASE}
      - SNOWFLAKE_SCHEMA=${SNOWFLAKE_SCHEMA}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

### Build and Run

```bash
# Build image
docker build -t vibecoding .

# Run container
docker run -d -p 3000:3000 --env-file .env vibecoding

# Or use docker-compose
docker-compose up -d
```

## Security Considerations

### Production Checklist

- [ ] Use HTTPS/SSL certificates
- [ ] Set strong environment variables
- [ ] Enable rate limiting
- [ ] Implement authentication/authorization
- [ ] Use secrets management (AWS Secrets Manager, Vault, etc.)
- [ ] Enable CORS only for trusted origins
- [ ] Set security headers
- [ ] Regular dependency updates
- [ ] Monitor logs and metrics
- [ ] Implement request validation
- [ ] Use WAF (Web Application Firewall)
- [ ] Regular security audits

### Rate Limiting

Add to `server.js`:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Helmet.js (Security Headers)

```javascript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### Environment Variables Management

**Never commit sensitive data!**

Use secrets management:
- AWS Secrets Manager
- Google Cloud Secret Manager
- Azure Key Vault
- HashiCorp Vault
- Docker secrets

## Monitoring and Logging

### PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Application Monitoring

Consider using:
- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure and application monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay and monitoring

### Health Checks

Implement comprehensive health checks:

```javascript
app.get('/api/health', async (req, res) => {
  const checks = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    database: await checkSnowflakeConnection(),
    memory: process.memoryUsage(),
  };

  const status = checks.database ? 200 : 503;
  res.status(status).json(checks);
});
```

## Scaling

### Horizontal Scaling

Use a load balancer (Nginx, HAProxy, or cloud provider):

```nginx
upstream vibecoding {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    location / {
        proxy_pass http://vibecoding;
    }
}
```

### Vertical Scaling

- Increase instance size
- Optimize Node.js with clustering
- Use worker threads for CPU-intensive tasks

## Backup and Recovery

### Database Backups
- Regular Snowflake backups
- Export conversation data periodically

### Application Backups
- Version control (Git)
- Container registry backups
- Configuration backups

## Performance Optimization

1. **Enable compression**:
```javascript
import compression from 'compression';
app.use(compression());
```

2. **Caching**:
```javascript
import redis from 'redis';
const cache = redis.createClient();
```

3. **CDN** for static assets

4. **Database connection pooling**

## Troubleshooting

### Common Issues

**Port already in use**:
```bash
lsof -ti:3000 | xargs kill
```

**Permission denied**:
```bash
sudo setcap 'cap_net_bind_service=+ep' $(which node)
```

**Out of memory**:
```bash
node --max-old-space-size=4096 server.js
```

## Support

For deployment issues:
- Check application logs
- Review Snowflake connectivity
- Verify environment variables
- Check firewall/security groups
- Review SSL certificate validity
