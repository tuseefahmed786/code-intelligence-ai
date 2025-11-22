# 🤖 Code Intelligence AI - PR Review Service

**Automatically review GitHub Pull Requests with AI** - Just like CodeRabbit, but open-source!

---

## 🎯 What This Does

- ✅ Automatically analyzes GitHub Pull Requests
- ✅ Posts AI review comments on PRs
- ✅ Detects security issues, code smells, and best practices
- ✅ Provides quality scores and improvement suggestions

---

## 🚀 Quick Deploy

### Deploy to Railway (Easiest)

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub**
4. **Select this repository**
5. **Add environment variables**:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `GITHUB_TOKEN` - Your GitHub token (optional)
6. **Done!** Get your URL: `https://your-project.railway.app`

### Your Webhook URL

After deployment, share this with users:
```
https://your-service-url.com/api/webhooks/github
```

---

## 📝 How Users Connect

Users add your webhook URL to their GitHub repos:

1. Go to repo → **Settings** → **Webhooks**
2. Add webhook: `https://your-service-url.com/api/webhooks/github`
3. Select **"Pull requests"** events
4. **Done!** Every PR gets automatic AI review

**Full guide**: See [USER_WEBHOOK_SETUP.md](./USER_WEBHOOK_SETUP.md)

---

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Full deployment instructions
- **[USER_WEBHOOK_SETUP.md](./USER_WEBHOOK_SETUP.md)** - How users connect to your service

---

## 💰 Cost

- **OpenAI API**: ~$0.001 per PR
- **Hosting**: Free (Railway) or $5-7/month

**Very affordable!**

---

## 🔧 Tech Stack

- **Node.js** + **TypeScript**
- **Express** - Web framework
- **OpenAI API** - AI analysis
- **GitHub API** - PR data
- **Docker** - Containerization

---

## 📦 Project Structure

```
code-intelligence-ai/
├── backend/          # Backend service (PR review)
│   ├── src/
│   │   ├── routes/   # API routes
│   │   └── services/ # GitHub & OpenAI services
│   └── package.json
├── Dockerfile        # Docker configuration
├── docker-compose.yml
└── railway.json      # Railway config
```

---

## ✅ Features

- 🔍 **Code Analysis** - Security, performance, best practices
- 📊 **Quality Scores** - Overall and per-file scores
- 💬 **PR Comments** - Automatic review comments
- 🔄 **Real-time** - Analyzes PRs as they're created
- 🌍 **Global** - Available worldwide via webhook

---

## 🎉 Ready to Deploy!

1. **Push to GitHub**
2. **Deploy on Railway** (or Heroku/DigitalOcean)
3. **Share webhook URL** with users
4. **Done!** Users get automatic PR reviews

---

**Made with ❤️ for developers**
# code-intelligence-ai
