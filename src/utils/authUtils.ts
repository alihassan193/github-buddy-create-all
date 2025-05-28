
// Helper function to validate user role
export const validateRole = (role: string | null): 'super_admin' | 'sub_admin' | 'manager' => {
  if (role === 'super_admin' || role === 'sub_admin' || role === 'manager') {
    return role;
  }
  // Default to 'sub_admin' if invalid role is found
  console.warn(`Invalid role found: ${role}. Defaulting to 'sub_admin'`);
  return 'sub_admin';
};
