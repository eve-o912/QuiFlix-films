"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
const Film_1 = __importDefault(require("./Film"));
class Purchase extends sequelize_1.Model {
}
Purchase.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    buyerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User_1.default,
            key: 'id'
        }
    },
    filmId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Film_1.default,
            key: 'id'
        }
    },
    tokenId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    transactionHash: {
        type: sequelize_1.DataTypes.STRING(66),
        allowNull: false,
        validate: {
            is: /^0x[a-fA-F0-9]{64}$/
        }
    },
    price: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    gasUsed: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: database_1.default,
    tableName: 'purchases',
    timestamps: true,
    indexes: [
        {
            fields: ['buyerId']
        },
        {
            fields: ['filmId']
        },
        {
            unique: true,
            fields: ['tokenId']
        },
        {
            fields: ['transactionHash']
        }
    ]
});
Purchase.belongsTo(User_1.default, { foreignKey: 'buyerId', as: 'buyer' });
Purchase.belongsTo(Film_1.default, { foreignKey: 'filmId', as: 'film' });
User_1.default.hasMany(Purchase, { foreignKey: 'buyerId', as: 'purchases' });
Film_1.default.hasMany(Purchase, { foreignKey: 'filmId', as: 'purchases' });
exports.default = Purchase;
//# sourceMappingURL=Purchase.js.map