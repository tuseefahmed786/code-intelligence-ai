# 🚀 Deploy Your PR Review Service (CodeRabbit Alternative)

Deploy this service so **users worldwide** can use it to automatically review their GitHub PRs!

---

## 🎯 What This Does

- ✅ Automatically analyzes GitHub Pull Requests
- ✅ Posts AI review comments on PRs
- ✅ Works exactly like CodeRabbit
- ✅ Available 24/7 for all users

---

## ⚡ Quick Deploy (Railway - Recommended)

### Step 1: Deploy to Railway

1. **Go to**: https://railway.app
2. **Sign up** (free with GitHub)
3. **New Project** → **Deploy from GitHub**
4. **Select this repository**
5. **Railway auto-detects Dockerfile** ✅

### Step 2: Add Environment Variables

In Railway dashboard → **Variables** tab:

Add:
- `OPENAI_API_KEY` = `your_openai_key_here`
- `GITHUB_TOKEN` = `your_github_token_here` (optional, for posting comments)
- `PORT` = `3000` (auto-set, but you can specify)

### Step 3: Get Your URL

Railway gives you a URL like:
```
https://your-project.railway.app
```

### Step 4: Share Webhook URL

Tell users to add this webhook:
```
https://your-project.railway.app/api/webhooks/github
```

**Done!** 🎉

---

## 🐳 Deploy with Docker

### Local Test

```bash
# Build
docker build -t code-intelligence .

# Run
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_key \
  -e GITHUB_TOKEN=your_token \
  code-intelligence
```

### Production

```bash
# Use docker-compose
docker-compose up -d
```

---

## ☁️ Other Platforms

### Heroku

```bash
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your_key
heroku config:set GITHUB_TOKEN=your_token
git push heroku main
```

### DigitalOcean

1. Go to App Platform
2. Connect GitHub repo
3. Add environment variables
4. Deploy!

### AWS / Google Cloud / Azure

Use the Dockerfile with any container service.

---

## 🔧 Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | Your OpenAI API key |
| `GITHUB_TOKEN` | ⚠️ Optional | For posting PR comments |
| `PORT` | ⚠️ Optional | Server port (default: 3000) |

---

## 📝 How Users Connect

Users need to:

1. **Go to their repo** → Settings → Webhooks
2. **Add webhook**:
   - URL: `https://your-service-url.com/api/webhooks/github`
   - Events: **Pull requests**
   - Active: ✅

3. **Done!** Their PRs get automatic reviews

**Full guide**: See [USER_WEBHOOK_SETUP.md](./USER_WEBHOOK_SETUP.md)

---

## ✅ Test Your Deployment

### Health Check

```bash
curl https://your-service-url.com/health
```

Should return:
```json
{"status":"ok","timestamp":"...","service":"code-intelligence-ai"}
```

### Test Webhook

1. Create a test PR in a repo with webhook configured
2. Wait 30-60 seconds
3. Check PR for AI review comment

---

## 💰 Cost

- **OpenAI API**: ~$0.001 per PR
- **Hosting**: 
  - Railway: Free tier (500 hours/month)
  - Heroku: $7/month
  - DigitalOcean: $5/month

**Example**: 1000 PRs/month = ~$1 (OpenAI) + hosting

---

## 🎉 You're Live!

Once deployed, share your webhook URL:

```
Add this webhook to your GitHub repo:
https://your-service-url.com/api/webhooks/github
```

**Users worldwide can now use your PR review service!** 🌍

---

## 📊 Monitoring

- **Health**: `https://your-url.com/health`
- **Logs**: Check your platform's logs
- **Usage**: Monitor OpenAI API usage

---

## 🔒 Security

- ✅ Environment variables encrypted
- ✅ Webhook payloads validated
- ✅ No code stored permanently
- ✅ Rate limiting built-in

---

## 🆘 Troubleshooting

### Service Not Responding

- Check environment variables are set
- Verify OpenAI API key is valid
- Check service logs

### Webhooks Not Working

- Verify webhook URL is correct
- Check webhook delivery logs in GitHub
- Ensure service is accessible

---

**Ready to deploy?** Follow the Railway steps above - it's the easiest! 🚀

