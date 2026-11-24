# Laundry Management System

Customers can open the public home page to see laundry services and learn how to drop off and collect their clothes. Employees sign in to record and track orders. The shared order list supports searching by customer name or phone and filtering by status. Prices are entered manually and payment takes place at pickup.

## Project structure

| Folder | Purpose |
| --- | --- |
| `backend/prisma` | PostgreSQL schema, migration, and employee seed script |
| `backend/src/routes` | Maps HTTP methods and URLs to controllers |
| `backend/src/controllers` | Validates requests, calls models, and returns JSON |
| `backend/src/models` | Queries PostgreSQL through Prisma |
| `backend/src/middleware` | Reads and protects sessions and formats API errors |
| `frontend/src/api` | Sends same-origin JSON requests |
| `frontend/src/components` | Atoms, molecules, organisms, and page templates |
| `frontend/src/pages` | Public home, login, and dashboard screens |

React is the view in this project. For example, the order form calls `POST /api/orders`. Express runs session middleware before dispatching to the order controller. The controller checks the form fields and asks the order model to save the record through Prisma. React receives the new data through JSON and refreshes the order list. Prices travel through the API as decimal strings, such as `"1500.50"`. PostgreSQL stores them as exact decimals.

## Set up locally on Windows

Install **Node.js 24 LTS** from the [official Node.js download page](https://nodejs.org/en/download). Open a new PowerShell terminal in VS Code using **Terminal → New Terminal**, or open the standalone PowerShell app. Paste each command and press Enter. These examples use `npm.cmd` so they work even if PowerShell blocks the npm PowerShell script.

```powershell
node --version
npm.cmd --version
```

The first command should print a version starting with `v24.`. The second should print an npm version. If either command is missing, reopen PowerShell after installing Node.js.

### Terminal 1 · Database and backend

1. Create a Prisma Postgres database, select **Connect to your database**, and generate its connection strings. Copy the **pooled PostgreSQL TCP URL** for `DATABASE_URL` and the **direct PostgreSQL TCP URL** for `DIRECT_DATABASE_URL`. The URLs start with `postgres://` or `postgresql://`. Keep them private. [Prisma Console](https://console.prisma.io/) · [Connection documentation](https://www.prisma.io/docs/postgres/database/connecting-to-your-database)
2. Move into the backend folder, install dependencies, copy the configuration template, and generate a session secret.

```powershell
Set-Location 'C:\Users\USER\calson Labs\laundry-order-management\backend'
npm.cmd install
Copy-Item -LiteralPath .env.example -Destination .env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

The copy command is for first-time setup. If you already have a `.env`, open it directly to preserve your settings. In VS Code, open **backend/.env**. Paste the connection URLs after their variable names and the generated value after `SESSION_SECRET=`. Choose your employee name, email, and a private password with at least eight characters and no more than 72 bytes. If the password contains `#` or surrounding spaces, quote the whole value. The `.env` file is ignored by Git.

3. Run the following in the **same backend terminal**.

```powershell
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run dev
```

`db:generate` creates the Prisma database client. `db:migrate` applies the committed migration to create the schema. `db:seed` creates the employee or updates the employee with that email, including resetting their password to the configured value. It hashes the password before saving. `dev` starts Express and reloads it when source files change. Expect `Laundry API listening on port 3000`. Leave this terminal open. You can visit `http://localhost:3000/api/health` and expect `{"status":"ok"}`.

An existing local PostgreSQL database works too. Use its usual `postgresql://` connection string with its credentials and leave `DIRECT_DATABASE_URL` empty.

### Terminal 2 · Frontend

Open a **second** PowerShell terminal so the backend keeps running.

```powershell
Set-Location 'C:\Users\USER\calson Labs\laundry-order-management\frontend'
npm.cmd install
npm.cmd run dev
```

Open the Local URL that Vite prints, usually `http://localhost:5173`. This opens the public home page. Click **Employee sign-in** and use the email and password from **backend/.env**. Vite sends requests beginning with `/api` to the backend. If you change the backend port, copy **frontend/.env.example** to **frontend/.env**, set `API_PROXY_TARGET` to the new URL, and restart Vite. The default display currency is **XAF**. Set `VITE_SHOP_CURRENCY` in the frontend configuration to change the label. Use `Ctrl+C` in each terminal to stop the corresponding server.

To show shop details on the public page, set `VITE_SHOP_ADDRESS`, `VITE_SHOP_HOURS`, and `VITE_SHOP_PHONE` in **frontend/.env**. The visit section displays the details you fill in. Restart Vite after editing these settings, or rebuild if you are serving the production build.

Run `npm.cmd run build` from the frontend folder to produce the production files in `frontend/dist`.

## Page-by-page code walkthrough

### Customer home page · `/`

- `App.jsx` renders `HomePage.jsx` at the root URL before any employee session check. Customers can read the page even if the API is unavailable.
- `HomePage.jsx` uses the same service labels as the order form. **Explore services** jumps to the service list, and **Employee sign-in** opens `/login`.
- `HomePage.css` gives the service cards three columns on wide screens and stacks them on phones.

### Login page · `/login`

- `LoginPage.jsx` places `LoginForm.jsx` inside `AuthLayout.jsx`. The layout centers the login panel, while the form owns the email and password inputs and the feedback.
- When you click **Sign in**, `LoginForm` reads the fields with `FormData`. It disables the button while `App.jsx` sends the credentials to Express.
- The backend normalizes the email and compares the password with the stored hash. On success, it saves a new session in PostgreSQL and sends an HttpOnly cookie. The frontend receives the public employee profile and navigates to the dashboard.
- On refresh, `App.jsx` checks `GET /api/auth/me`. The browser sends the cookie automatically. A valid session returns the employee's profile. A 401 response takes the user to login.

### Dashboard page · `/dashboard`

- `DashboardPage.jsx` owns the orders, current filters, loading state, and open dialog. `DashboardLayout.jsx` supplies the header with the employee's name and logout button.
- `OrderFilters.jsx` passes the current search and status to the page. The dashboard includes both in one API request. When you type again, the previous request is canceled to prevent older results from replacing newer ones.
- `OrderList.jsx` displays loading, empty, error, and result states. `OrderRow.jsx` renders each order as a table row on desktop. CSS presents each row as a card on narrow screens.
- `OrderForm.jsx` serves both **Add order** and **Edit order**. In edit mode it prefills the saved fields. Price goes to the API as text, and invalid inputs get messages next to the affected fields.
- `OrderDetails.jsx` shows the saved notes and offers actions. A successful status change reloads the active filter. **Delete order** first opens a confirmation with the order ID and customer name. Cancel goes back to the details. A failed delete stays open with an error and leaves the order in the list.
- **Log out** calls the API to destroy the PostgreSQL session. React then clears the employee profile and redirects to login.

## API summary

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Sign in and set session cookie |
| GET | `/api/auth/me` | Return the signed-in employee's public profile |
| POST | `/api/auth/logout` | End the session and clear the cookie |
| GET | `/api/orders` | List orders, optionally with `search` and `status` |
| GET | `/api/orders/:id` | Read a single order |
| POST | `/api/orders` | Create an order with status `RECEIVED` |
| PATCH | `/api/orders/:id` | Update fields or status |
| DELETE | `/api/orders/:id` | Delete an order |

Create and update requests send `totalPrice` as a string when present. API errors have a `message` and may include a `fields` object keyed by form field.

## Deploy to Render and Vercel

1. Push the source to a repository accessible from Render and Vercel. Keep both real `.env` files private.
2. Create a Render Node web service with **Root Directory** `backend`, **Build Command** `npm ci --include=dev && npm run db:generate`, **Start Command** `npm start`, and **Health Check Path** `/api/health`. The root `render.yaml` contains equivalent Blueprint settings. Add `NODE_ENV=production`, the pooled `DATABASE_URL`, and a random `SESSION_SECRET` in Render. Render supplies `PORT`. [Render Express deployment documentation](https://render.com/docs/deploy-node-express-app)
3. Before the first service start, apply the migration and seed from your local backend terminal using the production database URLs and seed variables in your private backend environment. Run `npm.cmd run db:migrate` and `npm.cmd run db:seed`. Apply future migrations before starting the corresponding release. A Render service with pre-deploy commands can apply migrations there using `npm run db:migrate` and the direct database URL. Keep the seed password out of recurring deployments.
4. In `frontend/vercel.json`, replace `your-backend.onrender.com` with the actual Render host. In Vercel, import the project with **Root Directory** `frontend`, framework preset **Vite**, build command `npm run build`, and output directory `dist`. Set `VITE_SHOP_CURRENCY` there if needed. The first rewrite proxies `/api` to Render. The other rewrites serve the React app for direct visits to `/login` and `/dashboard`. [Vercel rewrite documentation](https://vercel.com/docs/routing/rewrites)
5. Open the Vercel URL. Confirm that login sets an HttpOnly, Secure cookie for the frontend origin. Refresh `/dashboard` and check that the employee stays signed in. Log out, then visit `/dashboard` and confirm it returns to login. Repeat the demo below through the Vercel URL.

## Class demo

For the automated API check, keep the backend running against a development database. In a new PowerShell terminal, go to the **backend** folder and run `node --test`. It uses the seed credentials from `backend/.env`, creates its own test order, and removes that order when it finishes. If the backend uses a custom port, set `$env:TEST_API_URL` to the local backend URL before running the test.

1. Visit `/dashboard` signed out and confirm that login appears. Open `/api/orders` on the frontend origin and confirm it returns a 401 response.
2. Sign in, refresh, and confirm your name remains in the dashboard header.
3. Add a **Wash and iron** order with a phone number starting with zero and a note. Check that the price and the Received badge appear.
4. Search by customer name, then phone. Open the order and change its price. Try a negative or three-decimal price first and confirm the form shows a message.
5. Filter by Received, then change the order to Washing. Close details and confirm the order disappears from the Received results. Find it under Washing, then move it to Ready and Collected.
6. Open the delete confirmation and cancel. Confirm the order is still present. Then confirm deletion and check that the order disappears.
7. Log out, then visit `/api/orders` again and confirm the response is 401.
