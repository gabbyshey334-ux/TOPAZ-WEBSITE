# TOPAZ 2.0 Website

This repo contains the TOPAZ 2.0 dance competition website.

**Vercel (default):** The repo root has a `vercel.json` that builds from the **`app/`** folder and serves **`app/dist`**. You do **not** need to set Root Directory in the dashboard — just connect this repo and deploy.

### Deploy now (manual – get the site live in a few minutes)

1. Install Vercel CLI (one time):  
   `npm i -g vercel`
2. From the repo root:  
   `cd app`
3. Log in (one time):  
   `vercel login`
4. Link to your Vercel project (one time):  
   `vercel link`  
   Choose your account/team, pick **existing** project (e.g. topapz-website) or create one.
5. Deploy to production:  
   `npm run deploy`  
   Or: `vite build && vercel --prod`

Your site will be live at the URL Vercel prints (e.g. `topapz-website.vercel.app`).

---

### Option A: Auto-deploy from GitHub (recommended)

1. In [Vercel Dashboard](https://vercel.com/dashboard), open your project (or create one).
2. Go to **Settings → Git**.
3. If **Connected Git Repository** is empty or wrong, disconnect and re-import:
   - **Add New → Project** → **Import** your repo `gabbyshey334-ux/TOPAZ-WEBSITE`.
   - Set **Root Directory** to **`app`**, then Deploy.
4. In **Settings → General**, set **Root Directory** to **`app`** and save.
5. Every push to `main` will trigger a new deployment.

### Option B: Auto-deploy via GitHub Actions

If the dashboard Git connection doesn’t trigger deploys, this workflow deploys on every push to `main` **only if** you add these secrets in GitHub (repo **Settings → Secrets and variables → Actions**):

- `VERCEL_TOKEN` – [Create token](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` – from Vercel project **Settings → General**, or run `cd app && vercel link` and read `.vercel/project.json`
- `VERCEL_PROJECT_ID` – same place as Org ID

Without these three secrets, the GitHub Action runs but cannot deploy.

Build command: `npm run build`  
Output directory: `dist`
