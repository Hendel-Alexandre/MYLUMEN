import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'project_manager' | 'developer' | 'designer' | 'team_member';

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;
        
        setRoles(data?.map(r => r.role as UserRole) || []);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();

    // Subscribe to role changes
    const subscription = supabase
      .channel('user_roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchRoles();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isProjectManager = (): boolean => hasRole('project_manager');
  const isDeveloper = (): boolean => hasRole('developer');
  const isDesigner = (): boolean => hasRole('designer');
  const isTeamMember = (): boolean => hasRole('team_member');

  return {
    roles,
    loading,
    hasRole,
    isAdmin,
    isProjectManager,
    isDeveloper,
    isDesigner,
    isTeamMember,
  };
}
