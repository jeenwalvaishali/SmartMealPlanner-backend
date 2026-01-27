const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        // 1. Check if the user object exists on the request
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // 2. Check if the user's role matches the required role
        if (!allowedRoles.includes(req.user.role)) {
            // Role does not match, reject access
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        // Role matches, allow access to the next middleware/route handler
        next();
    };
};

module.exports = roleMiddleware;
