"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilmById = exports.getAllFilms = exports.getProducerRevenue = exports.getFilmAnalytics = exports.resellNFT = exports.streamFilm = exports.purchaseFilm = exports.uploadFilm = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const models_1 = require("../models");
const ipfsService_1 = __importDefault(require("../services/ipfsService"));
const blockchainService_1 = __importDefault(require("../services/blockchainService"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = process.env.UPLOAD_PATH || './uploads';
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600')
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only video and image files are allowed.'));
        }
    }
});
exports.uploadMiddleware = upload.fields([
    { name: 'filmFile', maxCount: 1 },
    { name: 'thumbnailFile', maxCount: 1 }
]);
const uploadFilm = async (req, res) => {
    try {
        const { title, description, genre, duration, releaseDate, price } = req.body;
        const files = req.files;
        if (!title || !description || !genre || !duration || !releaseDate || !price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (!files.filmFile || files.filmFile.length === 0) {
            return res.status(400).json({ error: 'Film file is required' });
        }
        const filmFile = files.filmFile[0];
        const thumbnailFile = files.thumbnailFile?.[0];
        const filmIpfsHash = await ipfsService_1.default.uploadFile(filmFile.path, filmFile.originalname);
        let thumbnailIpfsHash = null;
        if (thumbnailFile) {
            thumbnailIpfsHash = await ipfsService_1.default.uploadFile(thumbnailFile.path, thumbnailFile.originalname);
        }
        const metadata = {
            title,
            description,
            genre,
            duration: parseInt(duration),
            releaseDate: new Date(releaseDate),
            price: price.toString(),
            ipfsHash: filmIpfsHash,
            thumbnailIpfsHash,
            uploadedAt: new Date().toISOString(),
            uploadedBy: req.user?.walletAddress || req.walletAddress
        };
        const metadataIpfsHash = await ipfsService_1.default.uploadMetadata(metadata, `${title.replace(/\s+/g, '_')}_metadata.json`);
        const film = await models_1.Film.create({
            title,
            description,
            genre,
            duration: parseInt(duration),
            releaseDate: new Date(releaseDate),
            producerId: req.user.id,
            ipfsHash: filmIpfsHash,
            price: price.toString(),
            thumbnailUrl: thumbnailIpfsHash ? ipfsService_1.default.getGatewayUrl(thumbnailIpfsHash) : undefined,
            isActive: true,
            totalViews: 0,
            totalRevenue: '0'
        });
        const { contentId, txHash } = await blockchainService_1.default.createContent(title, filmIpfsHash);
        await film.update({
            contractAddress: blockchainService_1.default.getContractAddresses().contentContract
        });
        fs_1.default.unlinkSync(filmFile.path);
        if (thumbnailFile) {
            fs_1.default.unlinkSync(thumbnailFile.path);
        }
        res.status(201).json({
            success: true,
            film: {
                id: film.id,
                title: film.title,
                ipfsHash: filmIpfsHash,
                thumbnailUrl: film.thumbnailUrl,
                contentId,
                txHash,
                metadataIpfsHash
            }
        });
        return;
    }
    catch (error) {
        console.error('Error uploading film:', error);
        res.status(500).json({ error: 'Failed to upload film' });
        return;
    }
};
exports.uploadFilm = uploadFilm;
const purchaseFilm = async (req, res) => {
    try {
        const { filmId, price } = req.body;
        if (!filmId || !price) {
            return res.status(400).json({ error: 'Missing required fields: filmId, price' });
        }
        const film = await models_1.Film.findByPk(filmId, { include: [{ model: models_1.User, as: 'producer' }] });
        if (!film) {
            return res.status(404).json({ error: 'Film not found' });
        }
        if (!film.isActive) {
            return res.status(400).json({ error: 'Film is not available for purchase' });
        }
        const { tokenId, txHash } = await blockchainService_1.default.createFilm(film.title, film.description, film.genre, film.duration, Math.floor(film.releaseDate.getTime() / 1000), film.ipfsHash, price, `https://api.quiflix.com/metadata/${film.id}`);
        await film.update({
            tokenId,
            contractAddress: blockchainService_1.default.getContractAddresses().nftContract
        });
        const purchase = await models_1.Purchase.create({
            buyerId: req.user.id,
            filmId: film.id,
            tokenId,
            transactionHash: txHash,
            price: price.toString(),
            gasUsed: '0'
        });
        res.status(201).json({
            success: true,
            purchase: {
                id: purchase.id,
                tokenId,
                txHash,
                price: price.toString()
            }
        });
        return;
    }
    catch (error) {
        console.error('Error purchasing film:', error);
        res.status(500).json({ error: 'Failed to purchase film' });
        return;
    }
};
exports.purchaseFilm = purchaseFilm;
const streamFilm = async (req, res) => {
    try {
        const { tokenId } = req.params;
        const owner = await blockchainService_1.default.getNFTOwner(parseInt(tokenId));
        const userWalletAddress = req.user?.walletAddress || req.walletAddress;
        if (owner.toLowerCase() !== userWalletAddress?.toLowerCase()) {
            return res.status(403).json({ error: 'You do not own this NFT' });
        }
        const film = await models_1.Film.findOne({ where: { tokenId: parseInt(tokenId) } });
        if (!film) {
            return res.status(404).json({ error: 'Film not found' });
        }
        await models_1.View.create({
            viewerId: req.user.id,
            filmId: film.id,
            duration: 0,
            completed: false
        });
        await film.increment('totalViews');
        const streamUrl = ipfsService_1.default.getGatewayUrl(film.ipfsHash);
        res.json({
            success: true,
            streamUrl,
            film: {
                id: film.id,
                title: film.title,
                duration: film.duration,
                ipfsHash: film.ipfsHash
            }
        });
        return;
    }
    catch (error) {
        console.error('Error streaming film:', error);
        res.status(500).json({ error: 'Failed to stream film' });
        return;
    }
};
exports.streamFilm = streamFilm;
const resellNFT = async (req, res) => {
    try {
        const { tokenId, newPrice } = req.body;
        if (!tokenId || !newPrice) {
            return res.status(400).json({ error: 'Missing required fields: tokenId, newPrice' });
        }
        const owner = await blockchainService_1.default.getNFTOwner(tokenId);
        const userWalletAddress = req.user?.walletAddress || req.walletAddress;
        if (owner.toLowerCase() !== userWalletAddress?.toLowerCase()) {
            return res.status(403).json({ error: 'You do not own this NFT' });
        }
        const film = await models_1.Film.findOne({ where: { tokenId } });
        if (film) {
            await film.update({ price: newPrice.toString() });
        }
        res.json({
            success: true,
            message: 'NFT listed for resale',
            tokenId,
            newPrice: newPrice.toString()
        });
        return;
    }
    catch (error) {
        console.error('Error reselling NFT:', error);
        res.status(500).json({ error: 'Failed to resell NFT' });
        return;
    }
};
exports.resellNFT = resellNFT;
const getFilmAnalytics = async (req, res) => {
    try {
        const { filmId } = req.params;
        const film = await models_1.Film.findByPk(filmId, {
            include: [
                { model: models_1.User, as: 'producer' },
                { model: models_1.Purchase, as: 'purchases' },
                { model: models_1.View, as: 'views' }
            ]
        });
        if (!film) {
            return res.status(404).json({ error: 'Film not found' });
        }
        if (film.producerId !== req.user?.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const analytics = {
            film: {
                id: film.id,
                title: film.title,
                totalViews: film.totalViews,
                totalRevenue: film.totalRevenue
            },
            purchases: film.purchases?.length || 0,
            views: film.views?.length || 0,
            averageViewDuration: film.views?.reduce((sum, view) => sum + view.duration, 0) / (film.views?.length || 1),
            completionRate: film.views?.filter((view) => view.completed).length / (film.views?.length || 1)
        };
        res.json({
            success: true,
            analytics
        });
        return;
    }
    catch (error) {
        console.error('Error getting film analytics:', error);
        res.status(500).json({ error: 'Failed to get film analytics' });
        return;
    }
};
exports.getFilmAnalytics = getFilmAnalytics;
const getProducerRevenue = async (req, res) => {
    try {
        const producerId = req.user.id;
        const films = await models_1.Film.findAll({
            where: { producerId },
            include: [
                { model: models_1.Purchase, as: 'purchases' },
                { model: models_1.View, as: 'views' }
            ]
        });
        const totalRevenue = films.reduce((sum, film) => {
            return sum + BigInt(film.totalRevenue);
        }, BigInt(0));
        const totalViews = films.reduce((sum, film) => sum + film.totalViews, 0);
        const totalPurchases = films.reduce((sum, film) => sum + (film.purchases?.length || 0), 0);
        const revenueReport = {
            producer: {
                id: producerId,
                walletAddress: req.user.walletAddress
            },
            summary: {
                totalFilms: films.length,
                totalRevenue: totalRevenue.toString(),
                totalViews,
                totalPurchases
            },
            films: films.map(film => ({
                id: film.id,
                title: film.title,
                totalRevenue: film.totalRevenue,
                totalViews: film.totalViews,
                purchases: film.purchases?.length || 0
            }))
        };
        res.json({
            success: true,
            revenueReport
        });
    }
    catch (error) {
        console.error('Error getting producer revenue:', error);
        res.status(500).json({ error: 'Failed to get producer revenue' });
        return;
    }
};
exports.getProducerRevenue = getProducerRevenue;
const getAllFilms = async (req, res) => {
    try {
        const { page = 1, limit = 10, genre, producer } = req.query;
        const where = { isActive: true };
        if (genre)
            where.genre = genre;
        if (producer) {
            const producerUser = await models_1.User.findOne({ where: { walletAddress: producer } });
            if (producerUser)
                where.producerId = producerUser.id;
        }
        const films = await models_1.Film.findAndCountAll({
            where,
            include: [{ model: models_1.User, as: 'producer', attributes: ['walletAddress', 'username'] }],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['createdAt', 'DESC']]
        });
        res.json({
            success: true,
            films: films.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: films.count,
                pages: Math.ceil(films.count / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Error getting films:', error);
        res.status(500).json({ error: 'Failed to get films' });
    }
};
exports.getAllFilms = getAllFilms;
const getFilmById = async (req, res) => {
    try {
        const { id } = req.params;
        const film = await models_1.Film.findByPk(id, {
            include: [{ model: models_1.User, as: 'producer', attributes: ['walletAddress', 'username'] }]
        });
        if (!film) {
            return res.status(404).json({ error: 'Film not found' });
        }
        res.json({
            success: true,
            film
        });
        return;
    }
    catch (error) {
        console.error('Error getting film:', error);
        res.status(500).json({ error: 'Failed to get film' });
        return;
    }
};
exports.getFilmById = getFilmById;
//# sourceMappingURL=filmController.js.map