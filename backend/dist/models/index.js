"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDatabase = exports.View = exports.Purchase = exports.Film = exports.User = void 0;
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Film_1 = __importDefault(require("./Film"));
exports.Film = Film_1.default;
const Purchase_1 = __importDefault(require("./Purchase"));
exports.Purchase = Purchase_1.default;
const View_1 = __importDefault(require("./View"));
exports.View = View_1.default;
const syncDatabase = async () => {
    try {
        await database_1.default.sync({ alter: true });
        console.log('Database synchronized successfully');
    }
    catch (error) {
        console.error('Error synchronizing database:', error);
        throw error;
    }
};
exports.syncDatabase = syncDatabase;
//# sourceMappingURL=index.js.map