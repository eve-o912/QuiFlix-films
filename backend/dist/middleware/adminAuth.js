"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const firebase_1 = __importDefault(require("../config/firebase"));
const ADMIN_WALLET_ADDRESS = process.env.ADMIN_ADDRESS || '';
const requireAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const idToken = authHeader.substring(7);
        const decodedToken = await firebase_1.default.auth().verifyIdToken(idToken);
        if (!decodedToken) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        const walletAddress = decodedToken.walletAddress ||
            decodedToken.wallet ||
            decodedToken.ethAddress ||
            decodedToken.ethereumAddress;
        if (!walletAddress || String(walletAddress).toLowerCase() !== ADMIN_WALLET_ADDRESS.toLowerCase()) {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        const { uid, ...otherClaims } = decodedToken;
        req.user = {
            uid,
            walletAddress: String(walletAddress),
            ...otherClaims
        };
        return next();
    }
    catch (error) {
        console.error('Admin auth error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=adminAuth.js.map