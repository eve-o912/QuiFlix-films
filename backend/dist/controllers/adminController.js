"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFilmsAdmin = exports.removeFilm = exports.getAdminAnalytics = void 0;
const storage_1 = require("../storage");
const getAdminAnalytics = async (req, res) => {
    try {
        const allFilms = Array.from(storage_1.filmsStorage.values());
        const allPurchases = Array.from(storage_1.purchasesStorage.values());
        const allViews = Array.from(storage_1.viewsStorage.values());
        const totalFilms = allFilms.length;
        const activeFilms = allFilms.filter(f => f.isActive).length;
        const totalNFTsMinted = allFilms.filter(f => f.tokenId).length;
        const totalTransactions = allPurchases.length;
        const totalRevenue = allFilms.reduce((sum, film) => sum + BigInt(film.totalRevenue || '0'), BigInt(0));
        const totalViews = allFilms.reduce((sum, film) => sum + film.totalViews, 0);
        const revenueByGenre = allFilms.reduce((acc, film) => {
            if (!acc[film.genre])
                acc[film.genre] = BigInt(0);
            acc[film.genre] += BigInt(film.totalRevenue || '0');
            return acc;
        }, {});
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const filmsOverTime = allFilms
            .filter(film => new Date(film.createdAt) >= thirtyDaysAgo)
            .reduce((acc, film) => {
            const date = new Date(film.createdAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        const transactionsOverTime = allPurchases
            .filter(purchase => new Date(purchase.createdAt) >= thirtyDaysAgo)
            .reduce((acc, purchase) => {
            const date = new Date(purchase.createdAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        const topFilms = allFilms
            .sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue))
            .slice(0, 10)
            .map(film => ({
            id: film.id,
            title: film.title,
            totalRevenue: film.totalRevenue,
            totalViews: film.totalViews,
            purchases: allPurchases.filter(p => p.filmId === film.id).length
        }));
        const recentPurchases = allPurchases
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10)
            .map(purchase => ({
            id: purchase.id,
            filmTitle: allFilms.find(f => f.id === purchase.filmId)?.title || 'Unknown',
            buyerId: purchase.buyerId,
            price: purchase.price,
            createdAt: purchase.createdAt
        }));
        const analytics = {
            overview: {
                totalFilms,
                activeFilms,
                totalNFTsMinted,
                totalTransactions,
                totalRevenue: totalRevenue.toString(),
                totalViews
            },
            charts: {
                revenueByGenre: Object.entries(revenueByGenre).map(([genre, revenue]) => ({
                    genre,
                    revenue: revenue.toString()
                })),
                filmsOverTime: Object.entries(filmsOverTime).map(([date, count]) => ({
                    date,
                    count
                })),
                transactionsOverTime: Object.entries(transactionsOverTime).map(([date, count]) => ({
                    date,
                    count
                }))
            },
            topFilms,
            recentActivity: {
                purchases: recentPurchases
            }
        };
        res.json({
            success: true,
            analytics
        });
        return;
    }
    catch (error) {
        console.error('Error getting admin analytics:', error);
        res.status(500).json({ error: 'Failed to get admin analytics' });
        return;
    }
};
exports.getAdminAnalytics = getAdminAnalytics;
const removeFilm = async (req, res) => {
    try {
        const { filmId } = req.params;
        const { reason } = req.body;
        if (!filmId) {
            return res.status(400).json({ error: 'Film ID is required' });
        }
        const film = storage_1.filmsStorage.get(filmId);
        if (!film) {
            return res.status(404).json({ error: 'Film not found' });
        }
        storage_1.filmsStorage.delete(filmId);
        const filmPurchases = Array.from(storage_1.purchasesStorage.values()).filter(p => p.filmId === filmId);
        filmPurchases.forEach(purchase => storage_1.purchasesStorage.delete(purchase.id));
        const filmViews = Array.from(storage_1.viewsStorage.values()).filter(v => v.filmId === filmId);
        filmViews.forEach(view => storage_1.viewsStorage.delete(view.id));
        console.log(`Film removed by admin: ${film.title} (ID: ${filmId}), Reason: ${reason || 'No reason provided'}`);
        res.json({
            success: true,
            message: 'Film removed successfully',
            removedFilm: {
                id: film.id,
                title: film.title,
                reason: reason || 'No reason provided'
            }
        });
        return;
    }
    catch (error) {
        console.error('Error removing film:', error);
        res.status(500).json({ error: 'Failed to remove film' });
        return;
    }
};
exports.removeFilm = removeFilm;
const getAllFilmsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, genre } = req.query;
        let filteredFilms = Array.from(storage_1.filmsStorage.values());
        if (status === 'active') {
            filteredFilms = filteredFilms.filter(f => f.isActive);
        }
        else if (status === 'inactive') {
            filteredFilms = filteredFilms.filter(f => !f.isActive);
        }
        if (genre) {
            filteredFilms = filteredFilms.filter(f => f.genre === genre);
        }
        const totalCount = filteredFilms.length;
        const sortedFilms = filteredFilms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const paginatedFilms = sortedFilms.slice((parseInt(page) - 1) * parseInt(limit), (parseInt(page) - 1) * parseInt(limit) + parseInt(limit));
        const filmsResponse = paginatedFilms.map(film => ({
            id: film.id,
            title: film.title,
            description: film.description,
            genre: film.genre,
            duration: film.duration,
            releaseDate: film.releaseDate,
            producerId: film.producerId,
            price: film.price,
            thumbnailUrl: film.thumbnailUrl,
            isActive: film.isActive,
            totalViews: film.totalViews,
            totalRevenue: film.totalRevenue,
            tokenId: film.tokenId,
            createdAt: film.createdAt,
            purchases: Array.from(storage_1.purchasesStorage.values()).filter(p => p.filmId === film.id).length,
            views: Array.from(storage_1.viewsStorage.values()).filter(v => v.filmId === film.id).length
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
        return;
    }
    catch (error) {
        console.error('Error getting films for admin:', error);
        res.status(500).json({ error: 'Failed to get films' });
        return;
    }
};
exports.getAllFilmsAdmin = getAllFilmsAdmin;
//# sourceMappingURL=adminController.js.map