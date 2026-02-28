# Contributing to Drop Along Logistics (DAL)

Welcome to the Drop Along Logistics repository! This document outlines our tech stack, project architecture, and the workflow we use to collaborate effectively.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Version 16+)
- **UI Library:** [React](https://react.dev/) (Version 19)
- **Language:** TypeScript
- **Backend/Auth/Database:** [Supabase](https://supabase.com/) (using `@supabase/ssr` for Server-Side Rendering)
- **Icons:** `lucide-react`
- **Styling:** CSS Modules (`.module.css`) and global CSS

---

## 🏗️ Project Architecture

Our codebase is entirely contained within the `src/` directory, following standard Next.js App Router conventions:

- **`src/app/`**: Contains all the routes, pages, and layouts. 
  - Subdirectories (e.g., `admin`, `community`, `auth`, `profile`, `suggest-route`) correspond to application routes.
- **`src/components/`**: Reusable React components. These are organized by feature or use-case:
  - `Admin/`: Administrator dashboard components.
  - `Alerts/`: UI for notifications and alerts.
  - `Navbar/`: Global navigation components.
  - `RouteResults/` & `RouteSearch/`: Components powering the core transport routing engine.
  - `UI/`: Generic, reusable structural components.
- **`src/utils/`**: Helper functions and shared logic.
  - `supabase/`: Contains `client.ts` and `server.ts` for safely initializing Supabase in browser and server environments.
  - `ai-learning.ts`: Logic connected to intelligent route handling.

---

## 🎨 Styling Guidelines

We use **Vanilla CSS** and **CSS Modules**. We **do not** use TailwindCSS. 

- **Global Styles:** Add global resets and variables to `src/app/globals.css`.
- **Component Styles:** Create a CSS Module alongside your component (e.g., `ComponentName.module.css`). Import it into your component and apply styles using the `styles` object (e.g., `className={styles.container}`).
- **Aesthetics:** Prioritize modern, premium, and highly responsive designs. Utilize smooth transitions, proper typography, and well-thought-out color palettes.

---

## 🔐 Supabase Integration

All interactions with Supabase must go through our standardized utility functions to ensure secure sessions across server and client boundaries.

- **Client Components (Browser):** Use `import { createClient } from '@/utils/supabase/client'`
- **Server Components/Actions:** Use `import { createClient } from '@/utils/supabase/server'`

**Important:** Never expose the Supabase Service Role Key to the frontend. Only the anonymous public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) should be used in client code.

---

## 💻 Local Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dropalonglogistics-lab/DAL.git
   cd DAL
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root of the project and ensure you have the required keys provided by your team lead:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the app.

---

## 🌿 Git Workflow & Best Practices

To avoid conflicts and accidentally deploying broken code, we follow a strict branching model:

1. **Never commit directly to `main`**.
2. **Create a branch** for every feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-description
   ```
3. Write clean, self-documenting code and adhere to TypeScript strict typing.
4. **Commit your changes** with descriptive messages:
   ```bash
   git commit -m "Added the new user profile routing logic"
   ```
5. **Push your branch** to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a **Pull Request (PR)** on GitHub targeting the `main` branch. 
7. Utilize the **Vercel Preview URL** generated on the PR to test the changes in a live-like environment before merging. Wait for a code review before completing the merge.

---

*Thank you for contributing to Drop Along Logistics!*
