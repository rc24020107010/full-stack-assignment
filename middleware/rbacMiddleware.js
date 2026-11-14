/**
 * Simple Role-Based Access Control (RBAC) Middleware
 * Reads user role from 'x-user-role' header (e.g., 'admin', 'faculty', 'student').
 * If no header is passed, it defaults to 'admin' to allow seamless Postman testing.
 * 
 * @param  {...string} allowedRoles - Roles permitted to access the route
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Extract role from request header, or default to 'admin'
    const userRole = (req.headers['x-user-role'] || 'admin').toLowerCase();

    // Check if user's role is in the permitted list
    const hasPermission = allowedRoles.map((role) => role.toLowerCase()).includes(userRole);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${userRole}' is not authorized to access this resource. Required role(s): ${allowedRoles.join(', ')}`,
      });
    }

    req.user = { role: userRole };
    next();
  };
};

