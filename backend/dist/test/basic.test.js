"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'test'
    });
});
app.post('/api/users/sign-message', (req, res) => {
    const { walletAddress } = req.body;
    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
    }
    const timestamp = Date.now();
    const message = `QuiFlix Authentication\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;
    return res.json({
        success: true,
        message,
        timestamp
    });
});
describe('Basic API Tests', () => {
    describe('Health Check', () => {
        it('should return health status', async () => {
            const response = await (0, supertest_1.default)(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('OK');
            expect(response.body.timestamp).toBeDefined();
        });
    });
    describe('Authentication', () => {
        it('should get sign message', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/users/sign-message')
                .send({ walletAddress: '0x1234567890123456789012345678901234567890' });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBeDefined();
            expect(response.body.timestamp).toBeDefined();
        });
        it('should reject request without wallet address', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/users/sign-message')
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Wallet address is required');
        });
    });
});
//# sourceMappingURL=basic.test.js.map