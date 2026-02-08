# 🚀 Deploying AmityConnect

The easiest way to host your Next.js application for free is using **Vercel** (the creators of Next.js) or **Netlify**.

## Option 1: Vercel (Recommended)
Vercel is optimized for Next.js and requires zero configuration.

1.  **Run the deploy command:**
    ```bash
    npx vercel
    ```
2.  **Follow the prompts:**
    *   Log in to Vercel (it will open your browser).
    *   Set up and deploy? **Yes**
    *   Which scope? (Select your name/team)
    *   Link to existing project? **No**
    *   Project Name: `amity-connect` (or press Enter)
    *   Directory: `./` (press Enter)
    *   Want to modify settings? **No**
3.  **Wait for deployment!** You will get a live URL (e.g., `https://amity-connect.vercel.app`).

---

## Option 2: Netlify
If you prefer Netlify:

1.  **Run the deploy command:**
    ```bash
    npx netlify-cli deploy
    ```
2.  **Follow the prompts:**
    *   Log in via browser.
    *   Create & configure a new site? **Yes**
    *   Site name: (Optional, press Enter)
    *   Publish directory: `.next` (BUT wait, for Next.js it's often better to connect Git).
    
    *Note: The CLI deployment for Next.js on Netlify can sometimes be tricky with server-side rendering. Connecting your GitHub repository to Netlify's dashboard is often more reliable.*

---

## Option 3: Connect via GitHub (Best for long-term)
Since you have initialized a Git repository:

1.  Push your code to GitHub (as described in the previous step).
2.  Go to [Vercel.com](https://vercel.com) or [Netlify.com](https://netlify.com).
3.  Click "Add New Project" / "Import from Git".
4.  Select your `amity-connect` repository.
5.  Click **Deploy**.
    *   It will automatically detect Next.js.
    *   **Environment Variables**: Remember to add your Firebase keys in the project settings on the Vercel/Netlify dashboard!

### 🔑 Don't Forget Environment Variables!
When you deploy, you MUST add these variables in your hosting dashboard (Project Settings > Environment Variables):
*   `NEXT_PUBLIC_FIREBASE_API_KEY`
*   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
*   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
*   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
*   `NEXT_PUBLIC_FIREBASE_APP_ID`
