# 🤖 Code Intelligence AI - PR Review Service

**Automatically review GitHub Pull Requests with AI**

---

## 🎯 What This Does

- ✅ Automatically analyzes GitHub Pull Requests
- ✅ Posts AI review comments on PRs
- ✅ Detects security issues, code smells, and best practices
- ✅ Provides quality scores and improvement suggestions

---
## GitHub Webhook Setup

To enable automatic AI-powered PR reviews for your repository, add a webhook to your GitHub repository. This will automatically analyze every Pull Request and post detailed code review comments with quality scores, security issues, and improvement suggestions.

### Step-by-Step Guide Install

1. **Navigate to your repository on GitHub**
   - Go to your repository's main page on GitHub

2. **Access Webhook Settings**
   - Click on **Settings** (located in the repository navigation bar)
   - In the left sidebar, click on **Webhooks**
   - Click the **Add webhook** button

4. **Configure the Webhook**
   - **Payload URL**: Enter the following URL:
     ```
     https://code-intelligence-ai-production.up.railway.app/api/webhooks/github
     ```
   - **Content type**: Select `application/json`
   - **Which events would you like to trigger this webhook?**: 
     - Choose **"Let me select individual events"** and select the events you want to trigger (e.g., `push`, `pull_request`, `issues`, etc.)
   - **Active**: Make sure the checkbox is checked

5. **Save the Webhook**
   - Click **Add webhook** to save your configuration

6. **Verify Setup**
   - **To verify the webhook is working properly**: Create a Pull Request (PR) in your repository
   - Once the PR is created, you will see comments from the webhook service on your PR, confirming that the webhook is active and functioning correctly

### Webhook URL

```
https://code-intelligence-ai-production.up.railway.app/api/webhooks/github
```

> **Note**: Make sure you have the necessary permissions to add webhooks to the repository. Repository admin access is typically required.


## ✅ Features

- 🔍 **Code Analysis** - Security, performance, best practices
- 📊 **Quality Scores** - Overall and per-file scores
- 💬 **PR Comments** - Automatic review comments
- 🔄 **Real-time** - Analyzes PRs as they're created
- 🌍 **Global** - Available worldwide via webhook

