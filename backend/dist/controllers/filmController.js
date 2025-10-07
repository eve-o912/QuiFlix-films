"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilmById = exports.approveFilm = exports.getAllFilms = exports.getProducerRevenue = exports.getFilmAnalytics = exports.resellNFT = exports.streamFilm = exports.purchaseFilm = exports.uploadFilm = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ipfsService_1 = __importDefault(require("../services/ipfsService"));
const blockchainService_1 = __importDefault(require("../services/blockchainService"));
const films = new Map();
const purchases = new Map();
const views = new Map();
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
        const filmId = Date.now().toString();
        const film = {
            id: filmId,
            title,
            description,
            genre,
            duration: parseInt(duration),
            releaseDate: new Date(releaseDate).toISOString(),
            producerId: req.user.id,
            ipfsHash: filmIpfsHash,
            price: price.toString(),
            thumbnailUrl: thumbnailIpfsHash ? ipfsService_1.default.getGatewayUrl(thumbnailIpfsHash) : undefined,
            isActive: false,
            totalViews: 0,
            totalRevenue: '0',
            createdAt: new Date().toISOString()
        };
        films.set(filmId, film);
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
        const { filmId } = req.body;
        if (!filmId) {
            return res.status(400).json({ error: 'Missing required field: filmId' });
        }
        const film = films.get(filmId);
        if (!film) {
            return res.status(404).json({ error: 'Film not found' });
        }
        if (!film.isActive || !film.tokenId) {
            return res.status(400).json({ error: 'Film is not available for purchase' });
        }
        const txHash = await blockchainService_1.default.purchaseFilm(film.tokenId, film.price);
        const purchaseId = Date.now().toString();
        const purchase = {
            id: purchaseId,
            buyerId: req.user.id,
            filmId: film.id,
            tokenId: film.tokenId,
            transactionHash: txHash,
            price: film.price,
            gasUsed: '0',
            createdAt: new Date().toISOString()
        };
        purchases.set(purchaseId, purchase);
        const currentRevenue = BigInt(film.totalRevenue || '0');
        const newRevenue = currentRevenue + BigInt(film.price);
        film.totalRevenue = newRevenue.toString();
        films.set(film.id, film);
        res.status(201).json({
            success: true,
            purchase: {
                id: purchase.id,
                tokenId: film.tokenId,
                txHash,
                price: film.price
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
        const film = Array.from(films.values()).find(f => f.tokenId === parseInt(tokenId));
        if (!film) {
            return res.status(404).json({ error: 'Film not found' });
        }
        const viewId = Date.now().toString();
        const view = {
            id: viewId,
            viewerId: req.user.id,
            filmId: film.id,
            duration: 0,
            completed: false,
            createdAt: new Date().toISOString()
        };
        views.set(viewId, view);
        film.totalViews += 1;
        films.set(film.id, film);
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
        const film = Array.from(films.values()).find(f => f.tokenId === tokenId);
        if (film) {
            film.price = newPrice.toString();
            films.set(film.id, film);
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
        const film = films.get(filmId);
        if (!film) {
            return res.status(404).json({ error: 'Film not found' });
        }
        if (film.producerId !== req.user?.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const filmPurchases = Array.from(purchases.values()).filter(p => p.filmId === filmId);
        const filmViews = Array.from(views.values()).filter(v => v.filmId === filmId);
        const analytics = {
            film: {
                id: film.id,
                title: film.title,
                totalViews: film.totalViews,
                totalRevenue: film.totalRevenue
            },
            purchases: filmPurchases.length,
            views: filmViews.length,
            averageViewDuration: filmViews.reduce((sum, view) => sum + view.duration, 0) / (filmViews.length || 1),
            completionRate: filmViews.filter(view => view.completed).length / (filmViews.length || 1)
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
        const producerFilms = Array.from(films.values()).filter(f => f.producerId === producerId);
        const totalRevenue = producerFilms.reduce((sum, film) => {
            return sum + BigInt(film.totalRevenue);
        }, BigInt(0));
        const totalViews = producerFilms.reduce((sum, film) => sum + film.totalViews, 0);
        const totalPurchases = producerFilms.reduce((sum, film) => {
            return sum + Array.from(purchases.values()).filter(p => p.filmId === film.id).length;
        }, 0);
        const revenueReport = {
            producer: {
                id: producerId,
                walletAddress: req.user.walletAddress
            },
            summary: {
                totalFilms: producerFilms.length,
                totalRevenue: totalRevenue.toString(),
                totalViews,
                totalPurchases
            },
            films: producerFilms.map(film => ({
                id: film.id,
                title: film.title,
                totalRevenue: film.totalRevenue,
                totalViews: film.totalViews,
                purchases: Array.from(purchases.values()).filter(p => p.filmId === film.id).length
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
        let filteredFilms = Array.from(films.values()).filter(f => f.isActive);
        if (genre)
            filteredFilms = filteredFilms.filter(f => f.genre === genre);
        if (producer) {
            filteredFilms = filteredFilms.filter(f => f.producerId === producer);
        }
        const totalCount = filteredFilms.length;
        const paginatedFilms = filteredFilms
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice((parseInt(page) - 1) * parseInt(limit), (parseInt(page) - 1) * parseInt(limit) + parseInt(limit));
        const filmsResponse = paginatedFilms.map(film => ({
            id: film.id,
            title: film.title,
            description: film.description,
            genre: film.genre,
            duration: film.duration,
            releaseDate: film.releaseDate,
            producer: {
                walletAddress: film.producerId,
                username: ''
            },
            price: film.price,
            thumbnailUrl: film.thumbnailUrl,
            totalViews: film.totalViews,
            totalRevenue: film.totalRevenue,
            createdAt: film.createdAt
        }));
        res.json({
            success: true,
            films: filmsResponse,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Error getting films:', error);
        res.status(500).json({ error: 'Failed to get films' });
    }
};
exports.getAllFilms = getAllFilms;
const approveFilm = async (req, res) => {
    try {
        const { filmId } = req.body;
        if (!filmId) {
            return res.status(400).json({ error: 'Missing required field: filmId' });
        }
        const film = films.get(filmId);
        if (!film) {
            return res.status(404).json({ error: 'Film not found' });
        }
        if (!film.tokenId) {
            return res.status(400).json({ error: 'Film has no NFT token' });
        }
        const txHash = await blockchainService_1.default.approveFilm(film.tokenId);
        film.isActive = true;
        films.set(film.id, film);
        res.json({
            success: true,
            message: 'Film approved for sale',
            txHash
        });
        return;
    }
    catch (error) {
        console.error('Error approving film:', error);
        res.status(500).json({ error: 'Failed to approve film' });
        return;
    }
};
exports.approveFilm = approveFilm;
const getFilmById = async (req, res) => {
    try {
        const { id } = req.params;
        const film = films.get(id);
        if (!film) {
            return res.status(404).json({ error: 'Film not found' });
        }
        const filmResponse = {
            id: film.id,
            title: film.title,
            description: film.description,
            genre: film.genre,
            duration: film.duration,
            releaseDate: film.releaseDate,
            producer: {
                walletAddress: film.producerId,
                username: ''
            },
            price: film.price,
            thumbnailUrl: film.thumbnailUrl,
            totalViews: film.totalViews,
            totalRevenue: film.totalRevenue,
            createdAt: film.createdAt
        };
        res.json({
            success: true,
            film: filmResponse
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