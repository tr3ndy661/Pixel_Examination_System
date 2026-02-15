# Netlify Deployment Guide

## Prerequisites
- Netlify account (free tier works)
- PostgreSQL database (use Neon, Supabase, or Railway)
- GitHub repository

## Step 1: Prepare Database

### Option A: Neon (Recommended - Free PostgreSQL)
1. Go to https://neon.tech
2. Create free account
3. Create new project
4. Copy connection string (looks like: `postgresql://user:pass@host/db`)

### Option B: Supabase
1. Go to https://supabase.com
2. Create project
3. Get connection string from Settings > Database

### Option C: Railway
1. Go to https://railway.app
2. Create PostgreSQL database
3. Copy connection string

## Step 2: Deploy to Netlify

### Via Netlify Dashboard (Easiest)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Connect to Netlify:**
   - Go to https://app.netlify.com
   - Click "Add new site" > "Import an existing project"
   - Choose GitHub and select your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
     - Node version: `20`

3. **Add Environment Variables:**
   Go to Site settings > Environment variables and add:
   ```
   DATABASE_URI=postgresql://user:pass@host/db
   PAYLOAD_SECRET=your-super-secret-key-min-32-chars
   NODE_ENV=production
   NEXT_PUBLIC_SERVER_URL=https://your-site.netlify.app
   ```

4. **Deploy:**
   - Click "Deploy site"
   - Wait 3-5 minutes for build
   - Your site will be live at `https://your-site.netlify.app`

### Via Netlify CLI

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Login:**
```bash
netlify login
```

3. **Initialize:**
```bash
netlify init
```

4. **Set environment variables:**
```bash
netlify env:set DATABASE_URI "postgresql://user:pass@host/db"
netlify env:set PAYLOAD_SECRET "your-super-secret-key-min-32-chars"
netlify env:set NODE_ENV "production"
```

5. **Deploy:**
```bash
netlify deploy --prod
```

## Step 3: Configure Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Add custom domain
3. Update DNS records as instructed
4. Enable HTTPS (automatic)

## Step 4: Post-Deployment

1. **Create Admin User:**
   - Visit `https://your-site.netlify.app/admin`
   - Create first admin account

2. **Test Features:**
   - Login as admin
   - Create test users
   - Create sample tests
   - Test student login and test-taking

## Important Notes

### Database Connection
- Netlify functions have 10-second timeout on free tier
- Use connection pooling for better performance
- Consider upgrading to Pro for longer timeouts

### Function Size
- Keep serverless functions under 50MB
- Next.js API routes become Netlify functions

### Build Time
- Free tier: 300 build minutes/month
- Builds typically take 3-5 minutes

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
netlify build --clear-cache
```

### Database Connection Issues
- Verify DATABASE_URI is correct
- Check database allows external connections
- Ensure SSL is enabled if required

### Function Timeout
- Optimize database queries
- Add indexes to frequently queried fields
- Consider upgrading to Pro tier

## Environment Variables Reference

Required:
```
DATABASE_URI=postgresql://user:pass@host:port/database
PAYLOAD_SECRET=min-32-character-secret-key
NODE_ENV=production
NEXT_PUBLIC_SERVER_URL=https://your-site.netlify.app
```

Optional:
```
PAYLOAD_PUBLIC_SERVER_URL=https://your-site.netlify.app
```

## Monitoring

1. **Build Logs:**
   - View in Netlify dashboard
   - Check for build errors

2. **Function Logs:**
   - Real-time logs in dashboard
   - Monitor API performance

3. **Analytics:**
   - Enable Netlify Analytics
   - Track page views and performance

## Scaling

### Free Tier Limits:
- 100GB bandwidth/month
- 300 build minutes/month
- 125k function requests/month

### When to Upgrade:
- High traffic (>100k visitors/month)
- Need longer function timeouts
- Require priority support

## Backup Strategy

1. **Database Backups:**
   - Neon: Automatic daily backups
   - Supabase: Point-in-time recovery
   - Railway: Manual backups

2. **Code Backups:**
   - GitHub repository
   - Netlify keeps deployment history

## Performance Tips

1. **Enable Caching:**
   - Static assets cached automatically
   - Configure cache headers in netlify.toml

2. **Optimize Images:**
   - Use Next.js Image component
   - Netlify automatically optimizes images

3. **Database Optimization:**
   - Add indexes
   - Use connection pooling
   - Optimize queries

## Support

- Netlify Docs: https://docs.netlify.com
- Netlify Community: https://answers.netlify.com
- Check function logs for errors
- Verify environment variables are set

## Quick Commands

```bash
# View logs
netlify logs

# Open site
netlify open:site

# Open admin
netlify open:admin

# List environment variables
netlify env:list

# Redeploy
netlify deploy --prod
```

## Success Checklist

- ✅ Database created and accessible
- ✅ Environment variables set
- ✅ Site deployed successfully
- ✅ Admin panel accessible
- ✅ Can create admin user
- ✅ Students can login
- ✅ Tests can be taken
- ✅ Results display correctly
- ✅ Custom domain configured (optional)
- ✅ HTTPS enabled

Your exam system is now live on Netlify! 🎉
