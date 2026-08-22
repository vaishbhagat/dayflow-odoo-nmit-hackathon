import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useMyPayroll(month, year) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['payroll', 'me', profile?.id, month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll')
        .select('*')
        .eq('employee_id', profile.id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
    staleTime: 60_000,
  });
}

export function useEmployeePayroll(employeeId, month, year) {
  return useQuery({
    queryKey: ['payroll', employeeId, month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
    staleTime: 60_000,
  });
}

export function useAllPayroll(month, year) {
  return useQuery({
    queryKey: ['payroll', 'all', month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll')
        .select('*, profiles(full_name, employee_id, department, designation)')
        .eq('month', month)
        .eq('year', year)
        .order('net_salary', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useUpsertPayroll() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ employee_id, month, year, basic_salary, hra, allowances, deductions }) => {
      const { data, error } = await supabase
        .from('payroll')
        .upsert({
          employee_id,
          month,
          year,
          basic_salary: parseFloat(basic_salary) || 0,
          hra: parseFloat(hra) || 0,
          allowances: parseFloat(allowances) || 0,
          deductions: parseFloat(deductions) || 0,
          updated_by: profile?.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'employee_id,month,year' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payroll'] });
    },
  });
}
