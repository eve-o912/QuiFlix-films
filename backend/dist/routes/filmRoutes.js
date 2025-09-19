"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const filmController_1 = require("../controllers/filmController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', filmController_1.getAllFilms);
router.get('/:id', filmController_1.getFilmById);
router.post('/upload', auth_1.verifyToken, auth_1.requireProducer, filmController_1.uploadMiddleware, filmController_1.uploadFilm);
router.post('/purchase', auth_1.verifyToken, filmController_1.purchaseFilm);
router.get('/stream/:tokenId', auth_1.verifyToken, filmController_1.streamFilm);
router.post('/resell', auth_1.verifyToken, filmController_1.resellNFT);
router.get('/analytics/:filmId', auth_1.verifyToken, filmController_1.getFilmAnalytics);
router.get('/producer/revenue', auth_1.verifyToken, auth_1.requireProducer, filmController_1.getProducerRevenue);
exports.default = router;
//# sourceMappingURL=filmRoutes.js.map