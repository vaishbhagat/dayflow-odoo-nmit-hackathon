import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useMyAttendance(month, year) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['attendance', 'me', month, year],
    queryFn: async () => {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate   = new Date(year, month, 0).toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', profile.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
    staleTime: 30_000,
  });
}

export function useTodayAttendance() {
  const { profile } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: ['attendance', 'today', profile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', profile.id)
        .eq('date', today)
        .maybeSingle();
      return data;
    },
    enabled: !!profile?.id,
    refetchInterval: 30_000,
  });
}

export function useAllAttendance(filters = {}) {
  return useQuery({
    queryKey: ['attendance', 'all', filters],
    queryFn: async () => {
      let q = supabase
        .from('attendance')
        .select('*, profiles(full_name, employee_id, department, designation)')
        .order('date', { ascending: false })
        .limit(500);

      if (filters.date) q = q.eq('date', filters.date);
      if (filters.employee_id) q = q.eq('employee_id', filters.employee_id);
      if (filters.status) q = q.eq('status', filters.status);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useCheckIn() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('attendance')
        .upsert({
          employee_id: profile.id,
          date: today,
          check_in: now,
          status: 'Present',
        }, { onConflict: 'employee_id,date' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance', 'today'] });
      qc.invalidateQueries({ queryKey: ['attendance', 'me'] });
      qc.invalidateQueries({ queryKey: ['attendance', 'all'] });
    },
  });
}

export function useCheckOut() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (attendanceId) => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('attendance')
        .update({ check_out: now })
        .eq('id', attendanceId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance', 'today'] });
      qc.invalidateQueries({ queryKey: ['attendance', 'me'] });
    },
  });
}

export function useUpdateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('attendance')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}
