# 🤖 Code Intelligence AI - PR Review Service

**Automatically review GitHub Pull Requests with AI** - Just like CodeRabbit, but open-source!

---

## 🎯 What This Does

- ✅ Automatically analyzes GitHub Pull Requests
- ✅ Posts AI review comments on PRs
- ✅ Detects security issues, code smells, and best practices
- ✅ Provides quality scores and improvement suggestions

---

### Your Webhook URL

Add this link to your project repo
```
https://code-intelligence-ai-production.up.railway.app/api/webhooks/github
```

---

## 📝 How Users Connect

Users add your webhook URL to their GitHub repos:

1. Go to repo → **Settings** → **Webhooks**
2. Add webhook: `https://your-service-url.com/api/webhooks/github`
3. Select **"Pull requests"** events
4. **Done!** Every PR gets automatic AI review


## ✅ Features

- 🔍 **Code Analysis** - Security, performance, best practices
- 📊 **Quality Scores** - Overall and per-file scores
- 💬 **PR Comments** - Automatic review comments
- 🔄 **Real-time** - Analyzes PRs as they're created
- 🌍 **Global** - Available worldwide via webhook

