-- ============================================================
-- DAYFLOW HRMS — Seed Data
-- ============================================================
-- IMPORTANT: Run this AFTER:
-- 1. Running schema.sql
-- 2. Creating auth users in Supabase Auth Dashboard
--    (or via Auth > Users > "Add User" for each email below)
--
-- Auth Users to Create First (email / password):
--   admin@dayflow.com        / Admin@123
--   aarav@dayflow.com        / Password@123
--   priya@dayflow.com        / Password@123
--   rohan@dayflow.com        / Password@123
--   ananya@dayflow.com       / Password@123
--   rahul@dayflow.com        / Password@123
--   sneha@dayflow.com        / Password@123
--   aditya@dayflow.com       / Password@123
--   neha@dayflow.com         / Password@123
--   vikram@dayflow.com       / Password@123
--   kavya@dayflow.com        / Password@123
--
-- After creating users, copy their UUIDs from Auth > Users and
-- replace the placeholder UUIDs below. Then run this script.
-- ============================================================

-- Use DO block to handle UUID references cleanly
DO $$
DECLARE
  -- Replace these with actual UUIDs from your Supabase Auth > Users dashboard
  v_admin   UUID := '3ccf9e83-f290-4ec0-a68a-2ed8d4245ece';
  v_aarav   UUID := 'a2742dfa-3359-45f1-94c3-74786c6fa98f';
  v_priya   UUID := 'ac25d4e5-c29e-42b1-8b5a-8f7eebef9b7e';
  v_rohan   UUID := '626db760-b48b-47b8-b7d5-9cfa695b7316';
  v_ananya  UUID := 'a53cadde-c6a9-4248-b4ae-ee7ac41c8155';
  v_rahul   UUID := '917870b6-522c-4d36-b156-b081b7e1f7d7';
  v_sneha   UUID := '597cf5eb-8a97-4330-87f0-308ae5ab4522';
  v_aditya  UUID := '7575f9d7-4294-4331-8165-06d21741575b';
  v_neha    UUID := '5c3aae10-d274-481b-8999-c9d3e08f4ad9';
  v_vikram  UUID := '5a87fb8d-f544-4095-9d43-07f1a7dd4ae6';
  v_kavya   UUID := 'ee251efb-733d-4117-b8e4-e9be272bab4b';
BEGIN

-- ─── PROFILES ──────────────────────────────────────────────
INSERT INTO public.profiles (id, employee_id, full_name, email, phone, address, role, department, designation, joining_date, employment_status) VALUES
  (v_admin,  'EMP-001', 'Priya Mehta',       'admin@dayflow.com',   '+91 98765 43210', '14, MG Road, Bengaluru 560001', 'HR/Admin',  'HR',          'HR Officer',         '2022-01-15', 'Active'),
  (v_aarav,  'EMP-002', 'Aarav Sharma',      'aarav@dayflow.com',   '+91 98765 11111', '22, Koramangala 4th Block, Bengaluru', 'Employee', 'Engineering', 'Senior Software Engineer', '2022-03-01', 'Active'),
  (v_rohan,  'EMP-003', 'Rohan Kulkarni',    'rohan@dayflow.com',   '+91 98765 22222', '8, Whitefield Road, Bengaluru', 'Employee', 'Engineering', 'Software Engineer',  '2022-06-15', 'Active'),
  (v_ananya, 'EMP-004', 'Ananya Deshmukh',   'ananya@dayflow.com',  '+91 98765 33333', '45, HSR Layout, Bengaluru', 'Employee',    'Marketing',   'Marketing Manager',  '2021-11-01', 'Active'),
  (v_rahul,  'EMP-005', 'Rahul Verma',       'rahul@dayflow.com',   '+91 98765 44444', '7, Indiranagar, Bengaluru', 'Employee',    'Finance',     'Finance Analyst',    '2023-01-10', 'Active'),
  (v_sneha,  'EMP-006', 'Sneha Patil',       'sneha@dayflow.com',   '+91 98765 55555', '31, JP Nagar, Bengaluru', 'Employee',      'Sales',       'Sales Executive',    '2022-08-20', 'Active'),
  (v_aditya, 'EMP-007', 'Aditya Joshi',      'aditya@dayflow.com',  '+91 98765 66666', '12, Bellandur, Bengaluru', 'Employee',    'Engineering', 'DevOps Engineer',    '2023-03-05', 'Active'),
  (v_neha,   'EMP-008', 'Neha Kapoor',       'neha@dayflow.com',    '+91 98765 77777', '5, Banashankari, Bengaluru', 'Employee',  'Marketing',   'Content Strategist', '2022-05-22', 'Active'),
  (v_vikram, 'EMP-009', 'Vikram Shah',       'vikram@dayflow.com',  '+91 98765 88888', '19, Malleshwaram, Bengaluru', 'Employee', 'Finance',     'CFO',                '2021-07-01', 'Active'),
  (v_kavya,  'EMP-010', 'Kavya Nair',        'kavya@dayflow.com',   '+91 98765 99999', '88, Electronic City, Bengaluru', 'Employee', 'Engineering', 'QA Engineer',     '2023-05-15', 'Active')
ON CONFLICT (id) DO NOTHING;

-- ─── PAYROLL (current month + 2 past months) ───────────────
-- June 2025
INSERT INTO public.payroll (employee_id, month, year, basic_salary, hra, allowances, deductions, updated_by) VALUES
  (v_aarav,  6, 2025, 85000, 34000, 12000, 8500,  v_admin),
  (v_rohan,  6, 2025, 65000, 26000, 8000,  6500,  v_admin),
  (v_ananya, 6, 2025, 72000, 28800, 10000, 7200,  v_admin),
  (v_rahul,  6, 2025, 60000, 24000, 7500,  6000,  v_admin),
  (v_sneha,  6, 2025, 55000, 22000, 6500,  5500,  v_admin),
  (v_aditya, 6, 2025, 70000, 28000, 9000,  7000,  v_admin),
  (v_neha,   6, 2025, 58000, 23200, 7000,  5800,  v_admin),
  (v_vikram, 6, 2025, 120000,48000,18000, 12000,  v_admin),
  (v_kavya,  6, 2025, 52000, 20800, 6000,  5200,  v_admin),
  (v_admin,  6, 2025, 75000, 30000, 10000, 7500,  v_admin)
ON CONFLICT (employee_id, month, year) DO NOTHING;

-- July 2025
INSERT INTO public.payroll (employee_id, month, year, basic_salary, hra, allowances, deductions, updated_by) VALUES
  (v_aarav,  7, 2025, 85000, 34000, 12000, 8500,  v_admin),
  (v_rohan,  7, 2025, 65000, 26000, 8000,  6500,  v_admin),
  (v_ananya, 7, 2025, 72000, 28800, 10000, 7200,  v_admin),
  (v_rahul,  7, 2025, 60000, 24000, 7500,  6000,  v_admin),
  (v_sneha,  7, 2025, 55000, 22000, 6500,  5500,  v_admin),
  (v_aditya, 7, 2025, 70000, 28000, 9000,  7000,  v_admin),
  (v_neha,   7, 2025, 58000, 23200, 7000,  5800,  v_admin),
  (v_vikram, 7, 2025, 120000,48000,18000, 12000,  v_admin),
  (v_kavya,  7, 2025, 52000, 20800, 6000,  5200,  v_admin),
  (v_admin,  7, 2025, 75000, 30000, 10000, 7500,  v_admin)
ON CONFLICT (employee_id, month, year) DO NOTHING;

-- August 2025
INSERT INTO public.payroll (employee_id, month, year, basic_salary, hra, allowances, deductions, updated_by) VALUES
  (v_aarav,  8, 2025, 90000, 36000, 13000, 9000,  v_admin),
  (v_rohan,  8, 2025, 65000, 26000, 8000,  6500,  v_admin),
  (v_ananya, 8, 2025, 72000, 28800, 10000, 7200,  v_admin),
  (v_rahul,  8, 2025, 60000, 24000, 7500,  6000,  v_admin),
  (v_sneha,  8, 2025, 55000, 22000, 6500,  5500,  v_admin),
  (v_aditya, 8, 2025, 70000, 28000, 9000,  7000,  v_admin),
  (v_neha,   8, 2025, 58000, 23200, 7000,  5800,  v_admin),
  (v_vikram, 8, 2025, 125000,50000,20000, 12500,  v_admin),
  (v_kavya,  8, 2025, 52000, 20800, 6000,  5200,  v_admin),
  (v_admin,  8, 2025, 75000, 30000, 10000, 7500,  v_admin)
ON CONFLICT (employee_id, month, year) DO NOTHING;

-- ─── ATTENDANCE — June 2025 (weekdays) ────────────────────
INSERT INTO public.attendance (employee_id, date, check_in, check_out, status) VALUES
  (v_aarav,  '2025-06-02', '2025-06-02 09:05:00+05:30', '2025-06-02 18:32:00+05:30', 'Present'),
  (v_aarav,  '2025-06-03', '2025-06-03 09:12:00+05:30', '2025-06-03 18:45:00+05:30', 'Present'),
  (v_aarav,  '2025-06-04', '2025-06-04 09:30:00+05:30', '2025-06-04 13:15:00+05:30', 'Half-day'),
  (v_aarav,  '2025-06-05', '2025-06-05 09:08:00+05:30', '2025-06-05 18:30:00+05:30', 'Present'),
  (v_aarav,  '2025-06-06', '2025-06-06 09:20:00+05:30', '2025-06-06 19:00:00+05:30', 'Present'),
  (v_aarav,  '2025-06-09', '2025-06-09 09:15:00+05:30', '2025-06-09 18:40:00+05:30', 'Present'),
  (v_aarav,  '2025-06-10', NULL, NULL, 'Absent'),
  (v_aarav,  '2025-06-11', '2025-06-11 09:02:00+05:30', '2025-06-11 18:35:00+05:30', 'Present'),
  (v_aarav,  '2025-06-12', '2025-06-12 09:25:00+05:30', '2025-06-12 18:20:00+05:30', 'Present'),
  (v_aarav,  '2025-06-13', '2025-06-13 09:10:00+05:30', '2025-06-13 18:50:00+05:30', 'Present'),
  (v_rohan,  '2025-06-02', '2025-06-02 09:30:00+05:30', '2025-06-02 18:00:00+05:30', 'Present'),
  (v_rohan,  '2025-06-03', '2025-06-03 09:45:00+05:30', '2025-06-03 18:15:00+05:30', 'Present'),
  (v_rohan,  '2025-06-04', '2025-06-04 09:20:00+05:30', '2025-06-04 18:10:00+05:30', 'Present'),
  (v_rohan,  '2025-06-05', NULL, NULL, 'Absent'),
  (v_ananya, '2025-06-02', '2025-06-02 08:55:00+05:30', '2025-06-02 17:55:00+05:30', 'Present'),
  (v_ananya, '2025-06-03', '2025-06-03 09:00:00+05:30', '2025-06-03 18:00:00+05:30', 'Present'),
  (v_rahul,  '2025-06-02', '2025-06-02 09:10:00+05:30', '2025-06-02 18:20:00+05:30', 'Present'),
  (v_vikram, '2025-06-02', '2025-06-02 08:30:00+05:30', '2025-06-02 20:00:00+05:30', 'Present'),
  (v_vikram, '2025-06-03', '2025-06-03 08:45:00+05:30', '2025-06-03 19:30:00+05:30', 'Present')
ON CONFLICT (employee_id, date) DO NOTHING;

-- ─── ATTENDANCE — July 2025 ────────────────────────────────
INSERT INTO public.attendance (employee_id, date, check_in, check_out, status) VALUES
  (v_aarav,  '2025-07-01', '2025-07-01 09:08:00+05:30', '2025-07-01 18:30:00+05:30', 'Present'),
  (v_aarav,  '2025-07-02', '2025-07-02 09:15:00+05:30', '2025-07-02 18:45:00+05:30', 'Present'),
  (v_aarav,  '2025-07-03', '2025-07-03 09:05:00+05:30', '2025-07-03 18:20:00+05:30', 'Present'),
  (v_aarav,  '2025-07-04', NULL, NULL, 'Leave'),
  (v_aarav,  '2025-07-07', '2025-07-07 09:20:00+05:30', '2025-07-07 18:55:00+05:30', 'Present'),
  (v_aarav,  '2025-07-08', '2025-07-08 09:10:00+05:30', '2025-07-08 18:30:00+05:30', 'Present'),
  (v_aarav,  '2025-07-09', '2025-07-09 09:25:00+05:30', '2025-07-09 18:40:00+05:30', 'Present'),
  (v_aarav,  '2025-07-10', '2025-07-10 09:12:00+05:30', '2025-07-10 18:35:00+05:30', 'Present'),
  (v_aarav,  '2025-07-11', NULL, NULL, 'Absent'),
  (v_aarav,  '2025-07-14', '2025-07-14 09:00:00+05:30', '2025-07-14 18:30:00+05:30', 'Present'),
  (v_rohan,  '2025-07-01', '2025-07-01 09:30:00+05:30', '2025-07-01 18:00:00+05:30', 'Present'),
  (v_rohan,  '2025-07-02', '2025-07-02 09:40:00+05:30', '2025-07-02 18:10:00+05:30', 'Present'),
  (v_ananya, '2025-07-01', '2025-07-01 08:55:00+05:30', '2025-07-01 17:55:00+05:30', 'Present'),
  (v_ananya, '2025-07-02', '2025-07-02 09:00:00+05:30', '2025-07-02 18:00:00+05:30', 'Present'),
  (v_sneha,  '2025-07-01', '2025-07-01 09:05:00+05:30', '2025-07-01 18:20:00+05:30', 'Present'),
  (v_sneha,  '2025-07-02', '2025-07-02 09:15:00+05:30', '2025-07-02 18:30:00+05:30', 'Present'),
  (v_vikram, '2025-07-01', '2025-07-01 08:30:00+05:30', '2025-07-01 19:45:00+05:30', 'Present')
ON CONFLICT (employee_id, date) DO NOTHING;

-- ─── ATTENDANCE — August 2025 ──────────────────────────────
INSERT INTO public.attendance (employee_id, date, check_in, check_out, status) VALUES
  (v_aarav,  '2025-08-01', '2025-08-01 09:10:00+05:30', '2025-08-01 18:30:00+05:30', 'Present'),
  (v_aarav,  '2025-08-04', '2025-08-04 09:05:00+05:30', '2025-08-04 18:45:00+05:30', 'Present'),
  (v_aarav,  '2025-08-05', '2025-08-05 09:20:00+05:30', '2025-08-05 18:35:00+05:30', 'Present'),
  (v_aarav,  '2025-08-06', '2025-08-06 09:15:00+05:30', '2025-08-06 18:40:00+05:30', 'Present'),
  (v_aarav,  '2025-08-07', '2025-08-07 09:08:00+05:30', '2025-08-07 18:30:00+05:30', 'Present'),
  (v_aarav,  '2025-08-08', '2025-08-08 09:22:00+05:30', '2025-08-08 18:50:00+05:30', 'Present'),
  (v_aarav,  '2025-08-11', '2025-08-11 09:10:00+05:30', '2025-08-11 18:35:00+05:30', 'Present'),
  (v_aarav,  '2025-08-12', '2025-08-12 09:05:00+05:30', '2025-08-12 18:30:00+05:30', 'Present'),
  (v_aarav,  '2025-08-13', '2025-08-13 09:18:00+05:30', '2025-08-13 18:45:00+05:30', 'Present'),
  (v_aarav,  '2025-08-14', '2025-08-14 09:12:00+05:30', '2025-08-14 18:40:00+05:30', 'Present'),
  (v_aarav,  '2025-08-18', '2025-08-18 09:08:00+05:30', '2025-08-18 18:30:00+05:30', 'Present'),
  (v_aarav,  '2025-08-19', '2025-08-19 09:15:00+05:30', '2025-08-19 18:35:00+05:30', 'Present'),
  (v_aarav,  '2025-08-20', '2025-08-20 09:10:00+05:30', '2025-08-20 18:40:00+05:30', 'Present'),
  (v_aarav,  '2025-08-21', '2025-08-21 09:05:00+05:30', '2025-08-21 18:30:00+05:30', 'Present'),
  (v_aarav,  '2025-08-22', '2025-08-22 09:30:00+05:30', NULL, 'Present'),
  (v_rohan,  '2025-08-01', '2025-08-01 09:35:00+05:30', '2025-08-01 18:05:00+05:30', 'Present'),
  (v_rohan,  '2025-08-04', '2025-08-04 09:40:00+05:30', '2025-08-04 18:10:00+05:30', 'Present'),
  (v_rohan,  '2025-08-05', '2025-08-05 09:30:00+05:30', '2025-08-05 18:00:00+05:30', 'Present'),
  (v_rohan,  '2025-08-06', NULL, NULL, 'Absent'),
  (v_ananya, '2025-08-01', '2025-08-01 08:55:00+05:30', '2025-08-01 17:55:00+05:30', 'Present'),
  (v_ananya, '2025-08-04', '2025-08-04 09:00:00+05:30', '2025-08-04 18:00:00+05:30', 'Present'),
  (v_ananya, '2025-08-05', '2025-08-05 09:05:00+05:30', '2025-08-05 18:10:00+05:30', 'Present'),
  (v_rahul,  '2025-08-01', '2025-08-01 09:10:00+05:30', '2025-08-01 18:20:00+05:30', 'Present'),
  (v_rahul,  '2025-08-04', '2025-08-04 09:15:00+05:30', '2025-08-04 18:25:00+05:30', 'Present'),
  (v_sneha,  '2025-08-01', '2025-08-01 09:00:00+05:30', '2025-08-01 18:15:00+05:30', 'Present'),
  (v_sneha,  '2025-08-04', '2025-08-04 09:10:00+05:30', '2025-08-04 18:20:00+05:30', 'Present'),
  (v_aditya, '2025-08-01', '2025-08-01 09:25:00+05:30', '2025-08-01 18:30:00+05:30', 'Present'),
  (v_aditya, '2025-08-04', '2025-08-04 09:20:00+05:30', '2025-08-04 18:35:00+05:30', 'Present'),
  (v_neha,   '2025-08-01', '2025-08-01 09:05:00+05:30', '2025-08-01 18:10:00+05:30', 'Present'),
  (v_neha,   '2025-08-04', NULL, NULL, 'Absent'),
  (v_vikram, '2025-08-01', '2025-08-01 08:30:00+05:30', '2025-08-01 20:00:00+05:30', 'Present'),
  (v_kavya,  '2025-08-01', '2025-08-01 09:15:00+05:30', '2025-08-01 18:25:00+05:30', 'Present')
ON CONFLICT (employee_id, date) DO NOTHING;

-- ─── LEAVE REQUESTS ────────────────────────────────────────
INSERT INTO public.leave_requests (employee_id, leave_type, start_date, end_date, remarks, status, admin_comment) VALUES
  (v_aarav,  'Paid',   '2025-07-04', '2025-07-04', 'Personal work, taking a day off', 'Approved', 'Approved, enjoy your day off'),
  (v_aarav,  'Sick',   '2025-06-10', '2025-06-10', 'Not feeling well, running fever', 'Approved', 'Get well soon!'),
  (v_rohan,  'Unpaid', '2025-06-05', '2025-06-05', 'Family emergency', 'Approved', 'Hope everything is okay'),
  (v_ananya, 'Paid',   '2025-08-25', '2025-08-27', 'Planned vacation to Goa', 'Pending', NULL),
  (v_rahul,  'Sick',   '2025-07-22', '2025-07-23', 'Dengue fever, doctor advised rest', 'Approved', 'Please take care and rest well'),
  (v_sneha,  'Paid',   '2025-08-15', '2025-08-15', 'Independence Day extended holiday', 'Approved', 'Approved'),
  (v_aditya, 'Unpaid', '2025-08-20', '2025-08-20', 'Home shifting', 'Rejected', 'Please resubmit with prior notice'),
  (v_neha,   'Paid',   '2025-08-04', '2025-08-04', 'Doctor appointment', 'Approved', 'Approved'),
  (v_kavya,  'Sick',   '2025-08-18', '2025-08-19', 'Viral infection', 'Pending', NULL)
ON CONFLICT DO NOTHING;

-- ─── NOTIFICATIONS ─────────────────────────────────────────
INSERT INTO public.notifications (recipient_id, title, message, type, is_read) VALUES
  (v_aarav,  'Leave Approved ✓',        'Your Paid Leave request for July 4 has been approved. Enjoy your day!', 'success', true),
  (v_aarav,  'Leave Approved ✓',        'Your Sick Leave request for June 10 has been approved. Get well soon!', 'success', true),
  (v_aarav,  'Payroll Updated',         'Your salary structure has been updated for August 2025. View your payslip.', 'info', false),
  (v_aarav,  'Attendance Reminder',     'You have not checked out yesterday. Please verify your attendance record.', 'warning', false),
  (v_rohan,  'Leave Approved ✓',        'Your Unpaid Leave for June 5 has been approved.', 'success', true),
  (v_ananya, 'Leave Pending Review',    'Your leave request for Aug 25-27 is under review by HR.', 'info', false),
  (v_rahul,  'Leave Approved ✓',        'Your Sick Leave for July 22-23 has been approved. Rest well!', 'success', true),
  (v_sneha,  'Leave Approved ✓',        'Your Paid Leave for August 15 has been approved.', 'success', true),
  (v_aditya, 'Leave Rejected',          'Your Unpaid Leave for Aug 20 was rejected. Please resubmit with prior notice.', 'error', false),
  (v_neha,   'Leave Approved ✓',        'Your Paid Leave for August 4 has been approved.', 'success', true),
  (v_kavya,  'Leave Pending Review',    'Your Sick Leave for Aug 18-19 is under review.', 'info', false),
  (v_admin,  'New Leave Request',       'Ananya Deshmukh has submitted a leave request for Aug 25-27. Action required.', 'info', false),
  (v_admin,  'New Leave Request',       'Kavya Nair has submitted a sick leave request for Aug 18-19. Action required.', 'info', false)
ON CONFLICT DO NOTHING;

END $$;
