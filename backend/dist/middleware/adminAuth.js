"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const auth_1 = require("./auth");
const ADMIN_EMAIL = 'stephenkaruru05@gmail.com';
const requireAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.substring(7);
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        const email = decoded.email;
        if (!email) {
            return res.status(401).json({ error: 'No email found in token. Please update your profile with your email.' });
        }
        if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        req.user = {
            id: decoded.userId,
            walletAddress: decoded.walletAddress,
            email: decoded.email
        };
        return next();
    }
    catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=adminAuth.js.map