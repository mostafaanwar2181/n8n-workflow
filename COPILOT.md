# Using GitHub Copilot & Editing This Repository

> A step-by-step guide for using **GitHub Copilot** with this project and editing the code in different environments.

---

## Table of Contents

1. [Editing the Code](#editing-the-code)
2. [Using GitHub Copilot](#using-github-copilot)
3. [Troubleshooting: Copilot Models Not Showing in VS Code](#troubleshooting-copilot-models-not-showing-in-vs-code)

---

## Editing the Code

You have four ways to edit files in this repository, from simplest to most powerful:

### Option 1 — Edit directly on GitHub.com (quickest for small changes)

1. Open the file you want to edit on [github.com/mostafaanwar2181/n8n-workflow](https://github.com/mostafaanwar2181/n8n-workflow).
2. Click the **pencil icon** (✏️) in the top-right of the file view.
3. Make your changes in the editor.
4. Scroll down, write a commit message, and click **Commit changes**.

Best for: single-file edits, README updates, fixing typos.

---

### Option 2 — Use github.dev (VS Code-like editor in the browser)

1. Open the repository on GitHub.
2. Press the `.` (dot) key — or change the URL from `github.com` to `github.dev`.
3. The VS Code-like editor opens in your browser.
4. Use the **Source Control** panel (left sidebar) to commit and push changes.

Best for: multi-file edits without needing to run the project.

> **Limitation:** You cannot run or test the project (no terminal) in github.dev.

---

### Option 3 — Use GitHub Codespaces (full VS Code in the browser with a terminal)

1. Open the repository on GitHub.
2. Click **Code** → **Codespaces** tab → **Create codespace on main**.
3. A full VS Code environment opens in the browser with a terminal.
4. Edit files, run `node run-all-tests.js`, and commit/push from inside the Codespace.

Best for: editing, running tests, and using the full GitHub Copilot experience in the browser.

---

### Option 4 — Clone locally and use VS Code on your computer

```bash
git clone https://github.com/mostafaanwar2181/n8n-workflow.git
cd n8n-workflow
code .
```

Then edit files in VS Code, commit, and push your changes.

Best for: full development workflow with all Copilot features.

---

## Using GitHub Copilot

GitHub Copilot provides AI-powered code completions and a chat assistant. The experience differs by environment:

### In GitHub Codespaces (recommended for browser users)

1. Open a Codespace (see Option 3 above).
2. Open the **Extensions** panel (left sidebar).
3. Search for **GitHub Copilot** and click **Install** / **Enable**.
4. If prompted, sign in to your GitHub account and authorize Copilot.
5. Start typing in any file — Copilot suggestions appear inline (grey text). Press `Tab` to accept.
6. Open **Copilot Chat** from the sidebar or with `Ctrl+Shift+I` to ask questions about the code.

### In Local VS Code

1. Install [Visual Studio Code](https://code.visualstudio.com/).
2. Open the Extensions view (`Ctrl+Shift+X`).
3. Search for **GitHub Copilot** and install it.
4. Also install **GitHub Copilot Chat** if it is listed separately.
5. Sign in to GitHub when prompted and authorize Copilot.
6. Update both extensions and VS Code to the latest version to access all models.

### In github.dev

Copilot support in github.dev is limited. If you need the full Copilot experience (including model selection) in the browser, use **Codespaces** instead.

---

## Troubleshooting: Copilot Models Not Showing in VS Code

You may see certain Copilot Chat models (such as **Claude Opus 4.6**, **Claude Sonnet**, **GPT-4o**, etc.) available on [github.com/copilot](https://github.com/copilot) but **not** in VS Code. This is a common issue. Here is how to fix it:

### Step 1 — Update VS Code and extensions

Many newer models require the latest versions.

1. In VS Code: **Help → Check for Updates** → restart VS Code.
2. Open the Extensions view (`Ctrl+Shift+X`).
3. Click the **⋯ menu → Show Outdated** and update:
   - **GitHub Copilot**
   - **GitHub Copilot Chat**
4. Reload VS Code after updating.

### Step 2 — Confirm you are signed into the correct GitHub account

Your browser and VS Code may be authenticated with different GitHub accounts.

1. In VS Code, open the **Accounts** menu (bottom-left profile icon).
2. Make sure you are signed in as the same GitHub account that shows **Copilot Pro** on [github.com/settings/copilot](https://github.com/settings/copilot).
3. If you see a different account, sign out and sign back in with the correct one.

### Step 3 — Check for the model picker in Copilot Chat

The model dropdown only appears in the **Copilot Chat** panel, not in inline suggestions.

1. Open Copilot Chat: click the Copilot icon in the sidebar, or press `Ctrl+Shift+I`.
2. Look for a **model selector** dropdown at the top or bottom of the chat input.
3. If there is no dropdown, your extension is likely outdated (repeat Step 1).

### Step 4 — Check organization / managed account restrictions

If you use a **work or school GitHub account**, your organization may restrict which Copilot models are available — even if your personal plan includes them.

- Sign into VS Code with your **personal GitHub account** (the one with Copilot Pro) instead of a work/org account.

### Step 5 — Wait for model rollout

GitHub sometimes enables new models (like Claude Opus 4.6) on the web before they appear in VS Code. If you have done Steps 1–4 and still do not see the model, it may not yet be available in the VS Code client for your region or plan tier. Check [GitHub Changelog](https://github.blog/changelog/) for updates.

### Quick checklist

| Check | What to do |
|---|---|
| VS Code is latest version | Help → Check for Updates |
| Copilot & Copilot Chat extensions updated | Extensions view → update both |
| Signed in with correct account | Accounts menu (bottom-left) |
| Using Copilot Chat (not just inline) | Open Copilot Chat panel |
| No org policy blocking models | Try personal account |
| Model not yet rolled out to VS Code | Check GitHub Changelog |

---

## Still need help?

- [GitHub Copilot documentation](https://docs.github.com/en/copilot)
- [Supported Copilot models](https://docs.github.com/en/copilot/using-github-copilot/ai-models/changing-the-ai-model-for-copilot-chat)
- [GitHub Copilot troubleshooting](https://docs.github.com/en/copilot/troubleshooting-github-copilot)
