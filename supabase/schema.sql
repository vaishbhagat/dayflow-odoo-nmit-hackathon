-- ============================================================
-- DAYFLOW HRMS — Supabase PostgreSQL Schema
-- Run this FIRST in your Supabase SQL Editor
-- ============================================================

-- ─── EXTENSIONS ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── HELPER FUNCTION ───────────────────────────────────────
-- Returns true if the currently authenticated user is HR/Admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'HR/Admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── TABLE: profiles ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id         TEXT UNIQUE NOT NULL,
  full_name           TEXT NOT NULL,
  email               TEXT UNIQUE NOT NULL,
  phone               TEXT,
  address             TEXT,
  profile_picture_url TEXT,
  role                TEXT NOT NULL DEFAULT 'Employee' CHECK (role IN ('Employee', 'HR/Admin')),
  department          TEXT NOT NULL DEFAULT 'Engineering',
  designation         TEXT NOT NULL DEFAULT 'Staff',
  joining_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  employment_status   TEXT NOT NULL DEFAULT 'Active' CHECK (employment_status IN ('Active', 'On Leave', 'Terminated')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLE: attendance ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attendance (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  check_in    TIMESTAMPTZ,
  check_out   TIMESTAMPTZ,
  status      TEXT NOT NULL DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Half-day', 'Leave')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, date)
);

-- ─── TABLE: leave_requests ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type    TEXT NOT NULL CHECK (leave_type IN ('Paid', 'Sick', 'Unpaid')),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  remarks       TEXT,
  status        TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  admin_comment TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TABLE: payroll ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payroll (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month        INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year         INTEGER NOT NULL CHECK (year > 2000),
  basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  hra          NUMERIC(12,2) NOT NULL DEFAULT 0,
  allowances   NUMERIC(12,2) NOT NULL DEFAULT 0,
  deductions   NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_salary   NUMERIC(12,2) GENERATED ALWAYS AS (basic_salary + hra + allowances - deductions) STORED,
  updated_by   UUID REFERENCES public.profiles(id),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, month, year)
);

-- ─── TABLE: notifications ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON public.attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON public.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON public.payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ─── TRIGGER: auto-update updated_at on profiles ──────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS payroll_updated_at ON public.payroll;
CREATE TRIGGER payroll_updated_at
  BEFORE UPDATE ON public.payroll
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications    ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe to re-run)
DROP POLICY IF EXISTS "profiles_select_own"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_admin"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin"  ON public.profiles;

DROP POLICY IF EXISTS "attendance_select_own"   ON public.attendance;
DROP POLICY IF EXISTS "attendance_select_admin" ON public.attendance;
DROP POLICY IF EXISTS "attendance_insert_own"   ON public.attendance;
DROP POLICY IF EXISTS "attendance_update_admin" ON public.attendance;

DROP POLICY IF EXISTS "leave_select_own"    ON public.leave_requests;
DROP POLICY IF EXISTS "leave_select_admin"  ON public.leave_requests;
DROP POLICY IF EXISTS "leave_insert_own"    ON public.leave_requests;
DROP POLICY IF EXISTS "leave_update_admin"  ON public.leave_requests;

DROP POLICY IF EXISTS "payroll_select_own"    ON public.payroll;
DROP POLICY IF EXISTS "payroll_select_admin"  ON public.payroll;
DROP POLICY IF EXISTS "payroll_update_admin"  ON public.payroll;
DROP POLICY IF EXISTS "payroll_insert_admin"  ON public.payroll;

DROP POLICY IF EXISTS "notif_select_own"    ON public.notifications;
DROP POLICY IF EXISTS "notif_insert_admin"  ON public.notifications;
DROP POLICY IF EXISTS "notif_update_own"    ON public.notifications;

-- ── PROFILES policies ──────────────────────────────────────
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "profiles_insert_admin"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Employee can update only phone, address, profile_picture_url
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── ATTENDANCE policies ────────────────────────────────────
CREATE POLICY "attendance_select_own"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (employee_id = (SELECT auth.uid()));

CREATE POLICY "attendance_select_admin"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "attendance_insert_own"
  ON public.attendance FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = (SELECT auth.uid()));

CREATE POLICY "attendance_update_admin"
  ON public.attendance FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── LEAVE REQUESTS policies ────────────────────────────────
CREATE POLICY "leave_select_own"
  ON public.leave_requests FOR SELECT
  TO authenticated
  USING (employee_id = (SELECT auth.uid()));

CREATE POLICY "leave_select_admin"
  ON public.leave_requests FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "leave_insert_own"
  ON public.leave_requests FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = (SELECT auth.uid()));

CREATE POLICY "leave_update_admin"
  ON public.leave_requests FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── PAYROLL policies ───────────────────────────────────────
CREATE POLICY "payroll_select_own"
  ON public.payroll FOR SELECT
  TO authenticated
  USING (employee_id = (SELECT auth.uid()));

CREATE POLICY "payroll_select_admin"
  ON public.payroll FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "payroll_insert_admin"
  ON public.payroll FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "payroll_update_admin"
  ON public.payroll FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── NOTIFICATIONS policies ─────────────────────────────────
CREATE POLICY "notif_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (recipient_id = (SELECT auth.uid()));

CREATE POLICY "notif_insert_admin"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR recipient_id = (SELECT auth.uid()));

CREATE POLICY "notif_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = (SELECT auth.uid()))
  WITH CHECK (recipient_id = (SELECT auth.uid()));
