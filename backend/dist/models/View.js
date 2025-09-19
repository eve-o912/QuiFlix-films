"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
const Film_1 = __importDefault(require("./Film"));
class View extends sequelize_1.Model {
}
View.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    viewerId: {
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
    duration: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    completed: {
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
    tableName: 'views',
    timestamps: true,
    indexes: [
        {
            fields: ['viewerId']
        },
        {
            fields: ['filmId']
        },
        {
            fields: ['completed']
        },
        {
            fields: ['createdAt']
        }
    ]
});
View.belongsTo(User_1.default, { foreignKey: 'viewerId', as: 'viewer' });
View.belongsTo(Film_1.default, { foreignKey: 'filmId', as: 'film' });
User_1.default.hasMany(View, { foreignKey: 'viewerId', as: 'views' });
Film_1.default.hasMany(View, { foreignKey: 'filmId', as: 'views' });
exports.default = View;
//# sourceMappingURL=View.js.map