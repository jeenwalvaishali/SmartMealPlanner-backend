const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    //Read token from Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    //1. check for Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token missing or invalid' });
    }

    //2. Extract token (The token is the second part of the "Bearer <token>" string)
    const token = authHeader.split(' ')[1];

    try {
        //3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //4. Attach user info to request
        req.user = decoded;

        next();
    } catch (error) {
        // Reject requests with a 403 Forbidden status if the token is invalid or expired
        // 403 is often used for an invalid token, while 401 for a missing one
        return res.status(403).json({ message: 'Token is invalid or expired' });
    }

}

module.exports = authMiddleware;
