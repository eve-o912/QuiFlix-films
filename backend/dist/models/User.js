"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    walletAddress: {
        type: sequelize_1.DataTypes.STRING(42),
        allowNull: false,
        unique: true,
        validate: {
            is: /^0x[a-fA-F0-9]{40}$/
        }
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    username: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    profileImage: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    isProducer: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    tableName: 'users',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['walletAddress']
        },
        {
            fields: ['isProducer']
        }
    ]
});
exports.default = User;
//# sourceMappingURL=User.js.map