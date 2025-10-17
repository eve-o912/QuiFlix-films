"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignMessage = exports.getUserViews = exports.getUserPurchases = exports.getUserNFTs = exports.becomeProducer = exports.updateUserProfile = exports.getUserProfile = exports.authenticateUser = void 0;
const blockchainService_1 = __importDefault(require("../services/blockchainService"));
const auth_1 = require("../middleware/auth");
const users = new Map();
const authenticateUser = async (req, res) => {
    try {
        const { walletAddress, signature, message } = req.body;
        if (!walletAddress || !signature || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const isValid = await blockchainService_1.default.verifySignature(message, signature, walletAddress);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid signature' });
        }
        let user = users.get(walletAddress);
        if (!user) {
            user = {
                id: Date.now().toString(),
                email: '',
                walletAddress,
                isProducer: false,
                createdAt: new Date().toISOString()
            };
            users.set(walletAddress, user);
        }
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        const token = (0, auth_1.generateToken)(user.id, walletAddress, user.email);
        res.json({
            success: true,
            user: {
                id: user.id,
                walletAddress: user.walletAddress,
                username: user.username,
                email: user.email,
                isProducer: user.isProducer,
                profileImage: user.profileImage
            },
            token
        });
        return;
    }
    catch (error) {
        console.error('Error authenticating user:', error);
        res.status(500).json({ error: 'Failed to authenticate user' });
        return;
    }
};
exports.authenticateUser = authenticateUser;
const getUserProfile = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            user: {
                id: user.id,
                walletAddress: user.walletAddress,
                username: user.username,
                email: user.email,
                isProducer: user.isProducer,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            }
        });
    }
    catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (req, res) => {
    try {
        const { username, email, profileImage } = req.body;
        const user = req.user;
        if (username && username !== user.username) {
            const existingUser = Array.from(users.values()).find(u => u.username === username);
            if (existingUser) {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }
        const updatedUser = {
            ...user,
            username: username || user.username,
            email: email || user.email,
            profileImage: profileImage || user.profileImage
        };
        if (user.walletAddress) {
            users.set(user.walletAddress, updatedUser);
        }
        res.json({
            success: true,
            user: {
                id: updatedUser.id,
                walletAddress: updatedUser.walletAddress,
                username: updatedUser.username,
                email: updatedUser.email,
                isProducer: updatedUser.isProducer,
                profileImage: updatedUser.profileImage
            }
        });
        return;
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Failed to update user profile' });
        return;
    }
};
exports.updateUserProfile = updateUserProfile;
const becomeProducer = async (req, res) => {
    try {
        const user = req.user;
        if (user.isProducer) {
            return res.status(400).json({ error: 'User is already a producer' });
        }
        const updatedUser = { ...user, isProducer: true };
        if (user.walletAddress) {
            users.set(user.walletAddress, updatedUser);
        }
        res.json({
            success: true,
            message: 'Successfully became a producer',
            user: {
                id: updatedUser.id,
                walletAddress: updatedUser.walletAddress,
                username: updatedUser.username,
                isProducer: true
            }
        });
        return;
    }
    catch (error) {
        console.error('Error becoming producer:', error);
        res.status(500).json({ error: 'Failed to become producer' });
        return;
    }
};
exports.becomeProducer = becomeProducer;
const getUserNFTs = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            nfts: [],
            message: 'NFT querying not implemented yet'
        });
    }
    catch (error) {
        console.error('Error getting user NFTs:', error);
        res.status(500).json({ error: 'Failed to get user NFTs' });
    }
};
exports.getUserNFTs = getUserNFTs;
const getUserPurchases = async (req, res) => {
    try {
        const user = req.user;
        const { page = 1, limit = 10 } = req.query;
        res.json({
            success: true,
            purchases: [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            },
            message: 'Purchase history will be available once Firebase integration is complete'
        });
        return;
    }
    catch (error) {
        console.error('Error getting user purchases:', error);
        res.status(500).json({ error: 'Failed to get user purchases' });
    }
};
exports.getUserPurchases = getUserPurchases;
const getUserViews = async (req, res) => {
    try {
        const user = req.user;
        const { page = 1, limit = 10 } = req.query;
        res.json({
            success: true,
            views: [],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit)
            },
            message: 'View history will be available once Firebase integration is complete'
        });
        return;
    }
    catch (error) {
        console.error('Error getting user views:', error);
        res.status(500).json({ error: 'Failed to get user views' });
    }
};
exports.getUserViews = getUserViews;
const getSignMessage = async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }
        const message = (0, auth_1.generateSignMessage)(walletAddress);
        res.json({
            success: true,
            message,
            timestamp: Date.now()
        });
        return;
    }
    catch (error) {
        console.error('Error generating sign message:', error);
        res.status(500).json({ error: 'Failed to generate sign message' });
        return;
    }
};
exports.getSignMessage = getSignMessage;
//# sourceMappingURL=userController.js.map