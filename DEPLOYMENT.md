# Production Deployment Guide

## Prerequisites
- Node.js 18.20.2+ or 20.9.0+
- PostgreSQL database
- Domain name (optional)

## Environment Variables

Create a `.env.production` file with:

```env
# Database
DATABASE_URI=postgresql://user:password@host:port/database

# Security
PAYLOAD_SECRET=your-super-secret-key-min-32-chars
NODE_ENV=production

# URLs
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
PAYLOAD_PUBLIC_SERVER_URL=https://yourdomain.com

# Optional: Email (for notifications)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

## Build Steps

1. **Install dependencies:**
```bash
npm install
```

2. **Generate types:**
```bash
npm run generate:types
```

3. **Build for production:**
```bash
npm run build
```

4. **Start production server:**
```bash
npm start
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard
4. Connect PostgreSQL database (Vercel Postgres or external)

### Option 2: Docker

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t exam-system .
docker run -p 3000:3000 --env-file .env.production exam-system
```

### Option 3: VPS (DigitalOcean, AWS, etc.)

1. SSH into server
2. Install Node.js and PostgreSQL
3. Clone repository
4. Install dependencies: `npm install`
5. Build: `npm run build`
6. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start npm --name "exam-system" -- start
pm2 save
pm2 startup
```

## Database Setup

1. Create PostgreSQL database
2. Run migrations (Payload handles this automatically on first start)
3. Create admin user via `/admin` on first access

## Security Checklist

- ✅ Strong PAYLOAD_SECRET (32+ characters)
- ✅ Secure DATABASE_URI with strong password
- ✅ Enable HTTPS (use Cloudflare or Let's Encrypt)
- ✅ Set proper CORS headers
- ✅ Rate limiting on API routes
- ✅ Regular database backups
- ✅ Update dependencies regularly

## Performance Optimization

1. **Enable caching:**
   - Add Redis for session storage
   - Enable Next.js image optimization

2. **Database optimization:**
   - Add indexes on frequently queried fields
   - Enable connection pooling

3. **CDN:**
   - Use Cloudflare or Vercel Edge Network
   - Cache static assets

## Monitoring

1. **Error tracking:**
   - Sentry integration
   - Log aggregation (Datadog, LogRocket)

2. **Performance:**
   - Vercel Analytics
   - Google Analytics

3. **Uptime:**
   - UptimeRobot
   - Pingdom

## Backup Strategy

1. **Database backups:**
   - Daily automated backups
   - Store in S3 or similar

2. **File backups:**
   - Backup uploaded files
   - Version control for code

## Post-Deployment

1. Test all features:
   - Login/Authentication
   - Test taking
   - Results viewing
   - Admin panel

2. Create initial data:
   - Admin user
   - Sample tests
   - Student accounts

3. Monitor logs for errors

## Scaling

For high traffic:
- Use load balancer
- Multiple server instances
- Database read replicas
- CDN for static assets
- Redis for caching

## Support

- Check logs: `pm2 logs` or Vercel logs
- Database connection issues: Verify DATABASE_URI
- Build errors: Clear `.next` folder and rebuild
