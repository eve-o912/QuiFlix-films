import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Film from './Film';

interface PurchaseAttributes {
  id: number;
  buyerId: number;
  filmId: number;
  tokenId: number;
  transactionHash: string;
  price: string; // in wei as string
  gasUsed: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PurchaseCreationAttributes extends Optional<PurchaseAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Purchase extends Model<PurchaseAttributes, PurchaseCreationAttributes> implements PurchaseAttributes {
  public id!: number;
  public buyerId!: number;
  public filmId!: number;
  public tokenId!: number;
  public transactionHash!: string;
  public price!: string;
  public gasUsed!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public buyer?: User;
  public film?: Film;
}

Purchase.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    filmId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Film,
        key: 'id'
      }
    },
    tokenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    transactionHash: {
      type: DataTypes.STRING(66),
      allowNull: false,
      validate: {
        is: /^0x[a-fA-F0-9]{64}$/
      }
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gasUsed: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
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
  }
);

// Define associations
Purchase.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Purchase.belongsTo(Film, { foreignKey: 'filmId', as: 'film' });
User.hasMany(Purchase, { foreignKey: 'buyerId', as: 'purchases' });
Film.hasMany(Purchase, { foreignKey: 'filmId', as: 'purchases' });

export default Purchase;
