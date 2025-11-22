// Utility functions for authentication and role checking

/**
 * Check if user has admin privileges (admin or super_admin)
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user is admin or super_admin
 */
export const isAdmin = (user) => {
  return user?.role === 'admin' || user?.role === 'super_admin';
};

/**
 * Check if user has super admin privileges
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user is super_admin
 */
export const isSuperAdmin = (user) => {
  return user?.role === 'super_admin';
};

/**
 * Check if user has learner role
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user is learner
 */
export const isLearner = (user) => {
  return user?.role === 'learner';
};

/**
 * Check if user has mentor role
 * @param {Object} user - User object with role property
 * @returns {boolean} - True if user is mentor
 */
export const isMentor = (user) => {
  return user?.role === 'mentor';
};

/**
 * Check if user has any of the specified roles
 * @param {Object} user - User object with role property
 * @param {string[]} roles - Array of allowed roles
 * @returns {boolean} - True if user has one of the specified roles
 */
export const hasRole = (user, roles) => {
  if (!user || !roles || !Array.isArray(roles)) return false;
  return roles.includes(user.role);
};

