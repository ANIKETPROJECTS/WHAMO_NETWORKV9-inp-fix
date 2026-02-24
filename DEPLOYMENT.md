# Comprehensive Deployment Guide for WHAMO VPS

Follow these steps to deploy the application on your Ubuntu VPS with the domain `centralwatercommision.airavatatechnologies.com`.

## 1. Prerequisites on VPS
Ensure you have the following installed on your Ubuntu VPS:
- **Node.js 20+** and **npm**
- **Wine 10.0** (`sudo apt install wine` or follow WineHQ instructions)
- **PM2** (`sudo npm install -g pm2`)
- **Nginx** (`sudo apt install nginx`)

## 2. Server Configuration
### Update PM2 Config
The application is configured to run on **port 3006** via `ecosystem.config.cjs`:
```javascript
module.exports = {
  apps: [{
    name: "whamo-designer",
    script: "./dist/index.cjs",
    env: {
      NODE_ENV: "production",
      PORT: 3006
    }
  }]
};
```

## 3. Nginx Reverse Proxy Setup
This step connects your domain to the application running on port 3006.

1. Create the configuration file:
   ```bash
   sudo nano /etc/nginx/sites-available/whamo
   ```
2. Paste the following configuration:
   ```nginx
   server {
       listen 80;
       server_name centralwatercommision.airavatatechnologies.com;

       location / {
           proxy_pass http://localhost:3006;
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
3. Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/whamo /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 4. Deployment Commands
Run these commands in your project folder on the VPS:

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Sync Database (if using local Postgres)
# Make sure DATABASE_URL is set in your environment
npm run db:push

# 4. Start with PM2
pm2 start ecosystem.config.cjs

# 5. Ensure it starts on reboot
pm2 save
pm2 startup
```

## 5. Verification
- Run `wine --version` to confirm `wine-10.0`.
- Visit `http://centralwatercommision.airavatatechnologies.com/` in your browser.
- Check logs if needed: `pm2 logs whamo-designer`.
