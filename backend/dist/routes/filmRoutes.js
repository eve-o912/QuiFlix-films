"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const filmController_1 = require("../controllers/filmController");
const router = (0, express_1.Router)();
router.get('/', filmController_1.getAllFilms);
router.get('/:id', filmController_1.getFilmById);
router.post('/upload', filmController_1.uploadMiddleware, filmController_1.uploadFilm);
router.post('/approve', filmController_1.approveFilm);
router.post('/purchase', filmController_1.purchaseFilm);
router.get('/stream/:tokenId', filmController_1.streamFilm);
router.post('/resell', filmController_1.resellNFT);
router.get('/analytics/:filmId', filmController_1.getFilmAnalytics);
router.get('/producer/revenue/:walletAddress', filmController_1.getProducerRevenue);
exports.default = router;
//# sourceMappingURL=filmRoutes.js.map