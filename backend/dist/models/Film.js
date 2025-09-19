"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
class Film extends sequelize_1.Model {
}
Film.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    genre: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false
    },
    duration: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    releaseDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    producerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User_1.default,
            key: 'id'
        }
    },
    ipfsHash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    tokenId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        unique: true
    },
    contractAddress: {
        type: sequelize_1.DataTypes.STRING(42),
        allowNull: true
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    totalViews: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    totalRevenue: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: '0'
    },
    thumbnailUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    trailerUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
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
    tableName: 'films',
    timestamps: true,
    indexes: [
        {
            fields: ['producerId']
        },
        {
            fields: ['genre']
        },
        {
            fields: ['isActive']
        },
        {
            fields: ['releaseDate']
        },
        {
            unique: true,
            fields: ['tokenId']
        }
    ]
});
Film.belongsTo(User_1.default, { foreignKey: 'producerId', as: 'producer' });
User_1.default.hasMany(Film, { foreignKey: 'producerId', as: 'films' });
exports.default = Film;
//# sourceMappingURL=Film.js.map