"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSignMessage = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const generateToken = (userId, walletAddress, email) => {
    return jsonwebtoken_1.default.sign({ userId, walletAddress, email }, JWT_SECRET, { expiresIn: '7d' });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
const generateSignMessage = (walletAddress) => {
    const timestamp = Date.now();
    return `Sign this message to authenticate with QuiFlix: ${walletAddress} at ${timestamp}`;
};
exports.generateSignMessage = generateSignMessage;
//# sourceMappingURL=auth.js.map