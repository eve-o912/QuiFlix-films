"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.get('/profile/:walletAddress', userController_1.getUserProfile);
router.put('/profile/:walletAddress', userController_1.updateUserProfile);
router.post('/become-producer/:walletAddress', userController_1.becomeProducer);
router.get('/nfts/:walletAddress', userController_1.getUserNFTs);
router.get('/purchases/:walletAddress', userController_1.getUserPurchases);
router.get('/views/:walletAddress', userController_1.getUserViews);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map