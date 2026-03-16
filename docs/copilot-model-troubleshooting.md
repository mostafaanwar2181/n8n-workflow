# GitHub Copilot — Model Availability Troubleshooting

> **Context:** This guide explains why a model such as **Claude Opus 4.6** may appear in
> [GitHub Copilot Chat on github.com](https://github.com/copilot) (the web UI) but is
> **not visible** in the GitHub Copilot Chat panel inside **VS Code** for the same
> Copilot Pro account.

---

## Why Model Availability Can Differ Between Platforms

Having a Copilot Pro plan does **not** guarantee that every model is available in every
surface at the same time. Availability is controlled by several independent factors:

| Factor | Description |
|---|---|
| **Staged rollout** | GitHub rolls out new models gradually. The web UI and VS Code extension can be on different rollout tracks, so a model may appear on one surface days or weeks before another. |
| **Feature flags** | Individual accounts or groups can have feature flags toggled that expose (or hide) specific models, independent of plan tier. |
| **Regional availability** | Some models are restricted to specific geographic regions during early access. |
| **Enterprise / org policy** | If the GitHub account is managed by an organisation, an admin can restrict which Copilot models members may use. This can suppress models that would otherwise be available on a personal Pro plan. |
| **Account mismatch** | VS Code may be signed into a different GitHub account than the one shown on the web — or it may be picking up an organisation identity rather than the personal Pro plan. |
| **Extension version** | Older versions of the **GitHub Copilot** or **GitHub Copilot Chat** VS Code extensions may not yet expose a model picker or the specific model. |
| **Copilot Chat not enabled** | The model picker is only visible when Copilot Chat is fully enabled and the chat panel is open. If Copilot Chat is disabled or the panel has not been initialised, no model list is shown. |
| **Surface differences (github.dev)** | `github.dev` is a lightweight, browser-based editor. It may expose fewer Copilot features than a full Codespace or local VS Code installation. |

> **Important:** Model availability varies and can change at any time. No specific model
> is guaranteed to be available in every environment simultaneously.

---

## Reference: Web UI Showing Claude Opus 4.6

The screenshot below (from **GitHub Copilot Chat on github.com**) shows the model
selector with Claude Opus 4.6 listed. This is the **web** surface — the model may not
yet be rolled out to the VS Code extension for all accounts.

> *Screenshot: GitHub Copilot Chat web UI model selector — Claude Opus 4.6 visible.*
>
> *(Insert screenshot here — the web UI model picker at github.com/copilot showing
> "Claude Opus 4.6" in the drop-down list.)*

---

## Step-by-Step Troubleshooting Checklist

Work through these steps in order until the model appears in VS Code.

### Step 1 — Verify you are signed into the correct GitHub account in VS Code

1. In VS Code, open the **Accounts** menu (bottom-left avatar icon, or
   **File → Preferences → Accounts**).
2. Confirm the signed-in account is the **same GitHub account** that has Copilot Pro
   on github.com (check at [github.com/settings/copilot](https://github.com/settings/copilot)).
3. If a different account or an organisation identity is shown, **Sign out** and sign
   back in with the personal account that holds the Pro plan.
4. After signing back in, run **"GitHub Copilot: Sign in to GitHub"** from the Command
   Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) to re-authorise the extension.

### Step 2 — Update VS Code and both Copilot extensions

Outdated extensions are the most common reason a model picker or a specific model is
missing.

1. Update **VS Code** to the latest stable release:
   - **Help → Check for Updates** (Windows/Linux)
   - **Code → Check for Updates** (macOS)
2. In the **Extensions** panel (`Ctrl+Shift+X`), search for each of the following and
   click **Update** if available:
   - **GitHub Copilot**
   - **GitHub Copilot Chat**
3. **Reload VS Code** after updating (`Developer: Reload Window` from the Command
   Palette, or close and reopen).

### Step 3 — Confirm Copilot Chat is enabled and the model picker is visible

1. Open the **Copilot Chat** panel:
   - Click the **Copilot icon** in the Activity Bar (left sidebar), **or**
   - Run **"GitHub Copilot Chat: Focus on GitHub Copilot Chat View"** from the Command
     Palette.
2. Look for a **model selector drop-down** near the top or bottom of the chat input
   area (its exact position varies by extension version).
3. If the model picker is not visible at all:
   - Ensure you are on a **recent** version of Copilot Chat (see Step 2).
   - Check VS Code settings: search for `github.copilot.chat.model` and ensure it is
     not hard-coded to a single model that hides the picker.

### Step 4 — Try in GitHub Codespaces vs local VS Code

If the model is still missing locally, test whether it appears in **Codespaces**:

1. On github.com, open the repository → **Code** → **Codespaces** →
   **Create codespace on main**.
2. In the Codespace (full VS Code in the browser), open the Extensions panel and
   ensure **GitHub Copilot** and **GitHub Copilot Chat** are installed and enabled.
3. Open Copilot Chat and check the model picker.

> **github.dev limitation:** The lightweight `github.dev` editor (`github.com` URL
> changed to `github.dev`) does **not** provide the same full Copilot Chat experience
> as a Codespace or local VS Code. If you have only been testing in `github.dev`,
> switch to Codespaces or local VS Code for the full model picker.

### Step 5 — Check organisation policy (managed accounts only)

If your GitHub account is managed by a company or school organisation:

1. Ask an **organisation owner** to check **Settings → Copilot → Policies** for the
   org.
2. Verify that the policy for **"Allow Copilot to use models from third-party
   providers"** (or the specific Claude / Anthropic model policy) is set to
   **Allowed** (not **Blocked** or **No policy**).
3. Reference: [Managing policies for Copilot in your organisation](https://docs.github.com/en/copilot/managing-copilot/managing-policies-for-copilot-in-your-organization)

### Step 6 — Collect diagnostics and where to find them

If none of the above steps resolve the issue, collect the following before contacting
GitHub Support:

| Diagnostic | How to collect |
|---|---|
| **Copilot extension logs** | In VS Code: **Output** panel (`Ctrl+Shift+U`) → select **"GitHub Copilot"** or **"GitHub Copilot Chat"** from the drop-down. Copy the full log. |
| **VS Code version** | **Help → About** |
| **Extension versions** | Extensions panel → click the gear icon next to each extension → **Extension Settings** shows version, or right-click → **Copy Extension ID/Version**. |
| **Account info** | Confirm your account at [github.com/settings/copilot](https://github.com/settings/copilot) — shows plan, seat, and active features. |
| **Region / locale** | Settings on github.com → **Profile** may affect feature availability. |

Submit diagnostics at: [github.com/support](https://support.github.com) or via the
**GitHub Copilot feedback** link inside VS Code (Help → Report Issue).

---

## Additional Resources

- [GitHub Copilot — Asking GitHub Copilot questions in your IDE](https://docs.github.com/en/copilot/using-github-copilot/asking-github-copilot-questions-in-your-ide)
- [Changing the AI model for Copilot Chat](https://docs.github.com/en/copilot/using-github-copilot/ai-models/changing-the-ai-model-for-copilot-chat)
- [Managing Copilot policies in an organisation](https://docs.github.com/en/copilot/managing-copilot/managing-policies-for-copilot-in-your-organization)
- [GitHub Copilot supported models](https://docs.github.com/en/copilot/using-github-copilot/ai-models/github-copilot-models)
- [GitHub Copilot Changelog](https://github.blog/changelog/label/copilot/)
- [GitHub Support](https://support.github.com)

---

*Last updated: 2026-03-16*
