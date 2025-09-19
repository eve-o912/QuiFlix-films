"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/sign-message', userController_1.getSignMessage);
router.post('/authenticate', userController_1.authenticateUser);
router.get('/profile', auth_1.verifyToken, userController_1.getUserProfile);
router.put('/profile', auth_1.verifyToken, userController_1.updateUserProfile);
router.post('/become-producer', auth_1.verifyToken, userController_1.becomeProducer);
router.get('/nfts', auth_1.verifyToken, userController_1.getUserNFTs);
router.get('/purchases', auth_1.verifyToken, userController_1.getUserPurchases);
router.get('/views', auth_1.verifyToken, userController_1.getUserViews);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map