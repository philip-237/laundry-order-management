# Laundry Management System

## Working with the user

- Act as the user's senior software engineering partner. Explain the relevant code or behavior before editing.
- Work in small stages. Ask before major changes or deleting any existing file.
- Use clean, organized JavaScript and explain errors in plain language.
- After adding or changing a page, explain its purpose, the files involved, how user actions flow through the code, and what was tested.
- For commands the user should run, name the terminal and the folder, show what to paste, and explain what each command does and what output to expect. The user works in Windows PowerShell and VS Code.

## Current project

- App name is Laundry Management System. The approved folder is `C:\Users\USER\calson Labs\laundry-order-management`.
- Frontend uses React, Vite, React Router, and Atomic Design. Backend uses Node.js, Express MVC, Prisma ORM, and PostgreSQL. Employee sessions are stored in PostgreSQL and use an HttpOnly cookie.
- `/` is the public customer home page. It explains Wash only, Iron only, Wash and iron, and drop-off and pickup. It loads without an API session check. Employee sign-in links to `/login`. The public page is informational. Online booking was discussed but has not been approved.
- `/login` is employee sign-in. `/dashboard` is the protected employee home page for adding, viewing, searching, editing, updating, and deleting orders. Normal statuses are Received, Washing, Ready, and Collected. Customers have no accounts, and payment takes place at pickup.
- Display currency defaults to XAF. The public address, hours, and phone are optional frontend settings and are awaiting the real shop details.

## Run and verify

- The README is the source for local setup, database migration, employee seeding, page walkthroughs, and deployment steps. The local frontend usually runs at `http://127.0.0.1:5173/` and proxies API requests to port 3000. A temporary demo has been run before. Check local service availability before promising the URL works.
- The latest frontend build passed. A route render check confirmed that the public home shows all three services and the employee routes begin with a session check.
- Earlier verification passed the PostgreSQL migration, Prisma schema comparison, employee seed, and API workflow through Vite. A production-mode cookie check passed with simulated HTTPS forwarding.
- Browser click-through and mobile layout checks are pending. The project has Render and Vercel configuration, but live deployment and session checks through Vercel are pending.
