"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSignMessage = exports.generateToken = exports.requireProducer = exports.verifyNFTOwnership = exports.verifyWalletSignature = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const blockchainService_1 = __importDefault(require("../services/blockchainService"));
const User_1 = __importDefault(require("../models/User"));
const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.default.findByPk(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token. User not found.' });
        }
        req.user = user;
        req.walletAddress = decoded.walletAddress;
        next();
        return;
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
        return;
    }
};
exports.verifyToken = verifyToken;
const verifyWalletSignature = async (req, res, next) => {
    try {
        const { signature, message, walletAddress } = req.body;
        if (!signature || !message || !walletAddress) {
            return res.status(400).json({
                error: 'Missing required fields: signature, message, walletAddress'
            });
        }
        const isValid = await blockchainService_1.default.verifySignature(message, signature, walletAddress);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid wallet signature.' });
        }
        req.walletAddress = walletAddress;
        next();
        return;
    }
    catch (error) {
        res.status(401).json({ error: 'Failed to verify wallet signature.' });
        return;
    }
};
exports.verifyWalletSignature = verifyWalletSignature;
const verifyNFTOwnership = async (req, res, next) => {
    try {
        const { tokenId } = req.params;
        const walletAddress = req.walletAddress || req.user?.walletAddress;
        if (!walletAddress) {
            return res.status(401).json({ error: 'Wallet address required.' });
        }
        const owner = await blockchainService_1.default.getNFTOwner(parseInt(tokenId));
        if (owner.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(403).json({ error: 'You do not own this NFT.' });
        }
        next();
        return;
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to verify NFT ownership.' });
        return;
    }
};
exports.verifyNFTOwnership = verifyNFTOwnership;
const requireProducer = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        if (!req.user.isProducer) {
            return res.status(403).json({ error: 'Producer access required.' });
        }
        next();
        return;
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to verify producer status.' });
        return;
    }
};
exports.requireProducer = requireProducer;
const generateToken = (walletAddress, userId) => {
    return jsonwebtoken_1.default.sign({ walletAddress, userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};
exports.generateToken = generateToken;
const generateSignMessage = (walletAddress, timestamp) => {
    return `QuiFlix Authentication\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;
};
exports.generateSignMessage = generateSignMessage;
//# sourceMappingURL=auth.js.map