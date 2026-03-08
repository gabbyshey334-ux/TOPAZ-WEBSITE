# TOPAZ 2.0 Website

This repo contains the TOPAZ 2.0 dance competition website.

## Vercel deployment

The app lives in the **`app/`** folder.

### Option A: Auto-deploy from GitHub (recommended)

1. In [Vercel Dashboard](https://vercel.com/dashboard), open your project (or create one).
2. Go to **Settings → Git**.
3. If **Connected Git Repository** is empty or wrong, disconnect and re-import:
   - **Add New → Project** → **Import** your repo `gabbyshey334-ux/TOPAZ-WEBSITE`.
   - Set **Root Directory** to **`app`**, then Deploy.
4. In **Settings → General**, set **Root Directory** to **`app`** and save.
5. Every push to `main` will trigger a new deployment.

### Option B: Auto-deploy via GitHub Actions

If the dashboard Git connection doesn’t trigger deploys, this workflow deploys on every push to `main` using secrets.

1. In Vercel: **Project Settings → General** → copy **Project ID** and **Org ID** (or get them from `.vercel/project.json` after running `vercel link` locally).
2. Create a [Vercel token](https://vercel.com/account/tokens) (read + deploy).
3. In GitHub: repo **Settings → Secrets and variables → Actions** → add:
   - `VERCEL_TOKEN` = your Vercel token  
   - `VERCEL_ORG_ID` = your team/org ID  
   - `VERCEL_PROJECT_ID` = your project ID  
4. Push to `main`; the **Deploy to Vercel** workflow will run and deploy.

Build command: `npm run build`  
Output directory: `dist`
