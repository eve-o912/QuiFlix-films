import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface FilmAttributes {
  id: number;
  title: string;
  description: string;
  genre: string;
  duration: number; // in seconds
  releaseDate: Date;
  producerId: number;
  ipfsHash: string;
  price: string; // in wei as string
  tokenId?: number; // NFT token ID
  contractAddress?: string;
  isActive: boolean;
  totalViews: number;
  totalRevenue: string; // in wei as string
  thumbnailUrl?: string;
  trailerUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FilmCreationAttributes extends Optional<FilmAttributes, 'id' | 'tokenId' | 'contractAddress' | 'isActive' | 'totalViews' | 'totalRevenue' | 'createdAt' | 'updatedAt'> {}

class Film extends Model<FilmAttributes, FilmCreationAttributes> implements FilmAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public genre!: string;
  public duration!: number;
  public releaseDate!: Date;
  public producerId!: number;
  public ipfsHash!: string;
  public price!: string;
  public tokenId?: number;
  public contractAddress?: string;
  public isActive!: boolean;
  public totalViews!: number;
  public totalRevenue!: string;
  public thumbnailUrl?: string;
  public trailerUrl?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public producer?: User;
}

Film.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    genre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    producerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    ipfsHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tokenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true
    },
    contractAddress: {
      type: DataTypes.STRING(42),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    totalViews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    totalRevenue: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0'
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    trailerUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
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
  }
);

// Define associations
Film.belongsTo(User, { foreignKey: 'producerId', as: 'producer' });
User.hasMany(Film, { foreignKey: 'producerId', as: 'films' });

export default Film;
