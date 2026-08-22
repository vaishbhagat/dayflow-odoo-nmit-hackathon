import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useMyLeaves() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['leaves', 'me', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', profile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
    staleTime: 30_000,
  });
}

export function useAllLeaves(statusFilter) {
  return useQuery({
    queryKey: ['leaves', 'all', statusFilter],
    queryFn: async () => {
      let q = supabase
        .from('leave_requests')
        .select('*, profiles(full_name, employee_id, department, designation, profile_picture_url)')
        .order('created_at', { ascending: false });
      if (statusFilter && statusFilter !== 'All') q = q.eq('status', statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useSubmitLeave() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ leave_type, start_date, end_date, remarks }) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert({ employee_id: profile.id, leave_type, start_date, end_date, remarks, status: 'Pending' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leaves', 'me'] });
      qc.invalidateQueries({ queryKey: ['leaves', 'all'] });
    },
  });
}

export function useUpdateLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, admin_comment }) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({ status, admin_comment })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leaves'] });
    },
  });
}
