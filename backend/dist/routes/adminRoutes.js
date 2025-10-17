"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../middleware/adminAuth");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
router.use(adminAuth_1.requireAdmin);
router.get('/analytics', adminController_1.getAdminAnalytics);
router.get('/films', adminController_1.getAllFilmsAdmin);
router.delete('/films/:filmId', adminController_1.removeFilm);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map