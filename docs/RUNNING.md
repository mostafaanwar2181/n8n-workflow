# Running the Agentic Patient Lifecycle AI System

## Project Type

This repository is an **n8n workflow collection** — a production-grade Agentic Healthcare AI System
built entirely on [n8n](https://n8n.io/). There is no Node.js application to `npm install` or
compile. The runnable artifact is the single workflow file
`n8n-workflows/patient-lifecycle-workflow.json`, which is imported into a running n8n instance.

---

## Quick-start comparison

| Method | Best for | Time to first run |
|---|---|---|
| [npx (local)](#option-a-local-development-with-npx) | Developers, contributors | ~2 min |
| [Docker (local)](#option-b-docker) | Reproducible local environment | ~3 min |
| [GitHub Codespaces](#option-c-github-codespaces) | Zero-install browser-based demo | ~4 min |

---

## Option A — Local development with npx

### Prerequisites

| Requirement | Minimum version | Verify |
|---|---|---|
| Node.js | 18 LTS or later | `node --version` |
| npm | 8 or later (bundled with Node.js) | `npm --version` |
| Groq API key | — | [console.groq.com](https://console.groq.com/) |

Install Node.js from <https://nodejs.org/> if it is not already installed.

### 1. Clone the repository

```bash
git clone https://github.com/mostafaanwar2181/n8n-workflow.git
cd n8n-workflow
```

### 2. Start n8n

```bash
npx n8n start
```

> On the first run `npx` downloads n8n (~500 MB). Subsequent starts are instant.

n8n opens at **<http://localhost:5678>**.

### 3. Log in

| Field | Value |
|---|---|
| Email | `owner@solverai.local` |
| Password | `SolverAI@2024` |

### 4. Import the workflow

1. In n8n, click **Workflows** in the left sidebar.
2. Click **Import from File** (top-right menu or `⋮` button).
3. Select **`n8n-workflows/patient-lifecycle-workflow.json`**.
4. The workflow loads with all 5 agents (41 nodes).

### 5. Configure the Groq API key

The workflow calls the Groq API for NLP classification. The Bearer token lives inside the
`Authorization` header of two HTTP Request nodes:

- `🟢 Post-Visit: Send to Red-Flag NLP`
- `🔴 Triage: Send to LLM Classifier`

To use your own key:

1. Search the workflow JSON for `"Authorization"`.
2. Replace the existing Bearer token value with `Bearer <YOUR_GROQ_API_KEY>`.
3. Save and re-import the file, **or** edit the nodes directly in the n8n UI.

> Model: `llama-3.3-70b-versatile` | Temperature: `0.1` | Max tokens: `1024`

### 6. Activate the workflow

Toggle the workflow status to **Active** (top-right switch in the workflow editor).

### 7. Test the agents

**Browser forms** (patient-facing UI):

| Agent | URL |
|---|---|
| Pre-Visit Intake | <http://localhost:5678/form/form-pre-visit-intake> |
| Post-Visit Check-In | <http://localhost:5678/form/form-post-visit-checkin> |
| Billing Inquiry | <http://localhost:5678/form/form-billing-inquiry> |
| Retention Scan | <http://localhost:5678/form/form-retention-scan> |
| Clinical Triage | <http://localhost:5678/form/form-clinical-triage> |

**Automated test suite** (runs all 25 scenarios against the live n8n instance):

```bash
node run-all-tests.js
```

Expected output: `✅ PASS` lines for all 25 scenarios with a summary at the end.

### 8. Open the dashboard mockup

```bash
open dashboard/dashboard-mockup.html   # macOS
xdg-open dashboard/dashboard-mockup.html  # Linux
start dashboard/dashboard-mockup.html  # Windows
```

Or simply drag the file into any web browser.

---

## Option B — Docker

No `Dockerfile` is included in this repository; use the official n8n Docker image instead.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine on Linux)

### 1. Clone the repository

```bash
git clone https://github.com/mostafaanwar2181/n8n-workflow.git
cd n8n-workflow
```

### 2. Start n8n in Docker

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v "$(pwd)/n8n-workflows:/home/node/.n8n/workflows" \
  docker.n8n.io/n8nio/n8n
```

> On Windows (PowerShell), replace `$(pwd)` with `${PWD}`.

n8n opens at **<http://localhost:5678>**.

### 3. Persist data between container restarts (optional)

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  -v "$(pwd)/n8n-workflows:/home/node/.n8n/workflows" \
  docker.n8n.io/n8nio/n8n
```

### 4. Follow steps 3–8 from the [local development guide](#option-a-local-development-with-npx)

Log in, import the workflow, configure the Groq key, activate, and test exactly as described
above. The `node run-all-tests.js` command runs on your **host machine** (not inside Docker) once
Node.js is installed.

---

## Option C — GitHub Codespaces

GitHub Codespaces gives you a full VS Code environment in the browser — no local installation
required.

### 1. Open a Codespace

1. Go to <https://github.com/mostafaanwar2181/n8n-workflow>.
2. Click **Code** → **Codespaces** tab → **Create codespace on main**.
3. Wait ~60 seconds for the environment to start.

### 2. Start n8n in the Codespace terminal

```bash
npx n8n start
```

### 3. Open n8n in the browser

When n8n starts, VS Code shows a **"Open in Browser"** notification for port `5678`.
Click it, or go to the **Ports** tab and open the forwarded URL for port `5678`.

### 4. Follow steps 3–8 from the [local development guide](#option-a-local-development-with-npx)

Log in, import the workflow, configure the Groq key, activate, and test exactly as described
above. The terminal in Codespaces has Node.js pre-installed, so `node run-all-tests.js` works
without any extra setup.

> **Tip:** Codespaces are free for GitHub Pro users up to a generous monthly compute quota.

---

## Webhook API reference

Once the workflow is active, these REST endpoints accept POST requests:

| Agent | Endpoint |
|---|---|
| Pre-Visit | `POST http://localhost:5678/webhook/pre-visit-intake` |
| Post-Visit | `POST http://localhost:5678/webhook/post-visit-checkin` |
| Billing | `POST http://localhost:5678/webhook/billing-inquiry` |
| Retention | `POST http://localhost:5678/webhook/retention-scan` |
| Clinical Triage | `POST http://localhost:5678/webhook/clinical-triage` |

See the main [README.md](../README.md#step-4-activate-and-test) for full `curl` examples.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Port 5678 already in use | Another n8n instance is running | `npx n8n start --port 5679` |
| `Error: Cannot find module` | Node.js not installed | Install Node.js 18+ from nodejs.org |
| LLM calls return 401 | Groq API key missing or expired | Replace the Bearer token (Step 5 above) |
| Workflow not found after import | File path wrong | Confirm you selected `n8n-workflows/patient-lifecycle-workflow.json` |
| `run-all-tests.js` fails immediately | n8n not running or wrong port | Start n8n first; check it responds at `http://localhost:5678` |
| Docker volume permission error | SELinux / AppArmor on Linux | Add `:z` flag to the `-v` mount, e.g. `$(pwd)/n8n-workflows:/home/node/.n8n/workflows:z` |
