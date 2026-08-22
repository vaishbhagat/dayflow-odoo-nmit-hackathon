# Dayflow HRMS

> "Every workday, perfectly aligned."

Dayflow is a premium, developer-grade Human Resource Management System (HRMS) built for the modern workforce. It features an ultra-clean "bento-grid" design, high information density, role-based access control, real-time updates, and an elegant PDF payslip generator.

Built with **React (Vite)**, **Tailwind CSS**, **shadcn/ui** (custom JS implementation), and **Supabase (PostgreSQL)**.

---

## Features

- **Role-Based Access Control (RBAC)**: Distinct interfaces and capabilities for `HR/Admin` vs `Employee`.
- **Live Attendance**: Interactive check-in/out console with monthly calendar and supervisor logs.
- **Leave Management**: Apply for leaves, view status, and HR approval queues with modal confirmation and optional remarks.
- **Automated Payroll**: Real-time net salary calculations, administrative controls, and client-side PDF payslip generation using `@react-pdf/renderer`.
- **Command Center Dashboard**: Real-time analytical charts using `Recharts` for attendance trends and department distribution.
- **Report Generation**: Export complete organizational summary reports to PDF using `html2canvas` and `jspdf`.
- **Secure by Default**: Supabase Row Level Security (RLS) policies enforce data isolation at the database level.

---

## Quick Start Setup (5 Minutes)

### 1. Supabase Project Setup
1. Create a free account and new project at [Supabase](https://supabase.com).
2. Go to **Project Settings -> API** and copy your **Project URL** and **anon public key**.
3. Create a `.env` file in the root of this project and paste your keys:
   ```env
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 2. Database Schema
1. Open the **SQL Editor** in your Supabase dashboard.
2. Open the file `supabase/schema.sql` located in this repository.
3. Paste the contents into the SQL Editor and click **Run**. This creates all tables, triggers, and RLS policies.

### 3. Create Authentication Users
*Supabase requires Auth Users to exist before we can insert their Profiles.*
1. Go to **Authentication -> Users** in your Supabase dashboard.
2. Click **Add User -> Create New User** and create these two accounts:
   - **Admin**: `admin@dayflow.com` (Password: `Admin@123`)
   - **Employee**: `aarav@dayflow.com` (Password: `Password@123`)
3. (Optional) Create the other 8 demo users listed at the top of `supabase/seed.sql`.

### 4. Seed Data
1. Copy the new UUIDs generated for the users you just created.
2. Open `supabase/seed.sql` and replace the placeholder UUID variables at the top of the script with your real ones.
3. Run the script in the Supabase SQL Editor to populate realistic dummy data for attendance, leaves, and payroll.

### 5. Run Application
```bash
npm install
npm run dev
```

---

## 5-Minute Demo Script

1. **Login as Aarav Sharma** (`aarav@dayflow.com` / `Password@123`).
2. Show the Employee Dashboard. Click **Check In**.
3. Go to **Leave Requests**, submit a Sick Leave request.
4. Go to **Payroll**, verify the breakdown, and click **Download Payslip** (generates PDF).
5. **Log out**, and log in as HR Officer **Priya Mehta** (`admin@dayflow.com` / `Admin@123`).
6. Review the Admin Dashboard metrics and charts.
7. Go to **Leave Approvals**, find Aarav's pending request, click **Approve**, type an admin comment, and submit.
8. Go to **Employee Directory**, search "Aarav", click into his profile. Modify his basic salary structure and save.
9. **Log out**, log back in as Aarav, and view the updated live payroll details and the instant notification alert for the leave approval.

---

## Tech Stack
- **Frontend**: React 18, Vite, React Router v6
- **Styling**: Tailwind CSS v3, Custom shadcn/ui components
- **State Management**: TanStack Query (React Query) v5
- **Forms & Validation**: React Hook Form, Zod
- **Backend / Database**: Supabase, PostgreSQL
- **Data Visualization**: Recharts
- **PDF Generation**: @react-pdf/renderer, html2canvas, jspdf
