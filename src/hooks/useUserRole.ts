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
        const { data: { user: authUser }, error } = await supabase.auth.getUser()
        
        if (error) throw error;
        
        const userRoles = authUser?.app_metadata?.roles as UserRole[] || ['admin'];
        setRoles(userRoles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles(['admin']);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
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
