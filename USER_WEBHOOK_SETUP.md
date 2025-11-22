# 🔗 How Users Connect to Your PR Review Service

This guide is for **users** who want to use your deployed PR review service.

---

## 🎯 What They Get

- ✅ Automatic PR reviews (like CodeRabbit)
- ✅ AI-powered code analysis
- ✅ Quality scores and suggestions
- ✅ Comments posted automatically on PRs

---

## 📋 Setup Steps (For Users)

### Step 1: Get Your Service URL

You'll provide them with a webhook URL like:
```
https://your-service.railway.app/api/webhooks/github
```

### Step 2: Add Webhook to Their Repo

1. **Go to their GitHub repository**
2. Click **Settings** (top menu)
3. Click **Webhooks** (left sidebar)
4. Click **Add webhook**

### Step 3: Configure Webhook

Fill in the form:

- **Payload URL**: `https://your-service-url.com/api/webhooks/github`
- **Content type**: `application/json`
- **Secret**: (Leave empty or add for security)
- **Which events**: Select **"Pull requests"**
- **Active**: ✅ Checked

Click **Add webhook**

### Step 4: Test It!

1. **Create a Pull Request** in their repo
2. **Wait 30-60 seconds**
3. **Check the PR** - AI review comment should appear!

---

## 💬 What They'll See

A comment like this will appear on their PRs:

```
🤖 AI Code Analysis Results

Overall Quality Score: 85/100

Summary:
- Files Analyzed: 5
- Critical Issues: 2 🔴
- Warnings: 5 ⚠️

Files Analysis:
📝 src/index.ts
  ⚠️ WARNING: Consider using const instead of let
     💡 Use const for immutable variables
```

---

## ✅ That's It!

Once webhook is added, **every PR gets automatic AI review**!

---

## 🔧 Troubleshooting

### No Comments Appearing

- ✅ Check webhook is active (green dot)
- ✅ Verify webhook URL is correct
- ✅ Check webhook delivery logs in GitHub
- ✅ Ensure service is running

### Webhook Delivery Failed

- ✅ Check service health: `https://your-service-url.com/health`
- ✅ Verify service is accessible
- ✅ Check service logs

---

## 📊 Webhook Events

The service listens for:
- ✅ PR opened
- ✅ PR updated (new commits)
- ✅ PR reopened

---

## 🔒 Security

- Webhooks are validated
- No sensitive data stored
- Analysis happens in real-time
- Results posted as comments only

---

**Need help?** Contact the service owner!

