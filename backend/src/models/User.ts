import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: number;
  walletAddress: string;
  email?: string;
  username?: string;
  profileImage?: string;
  isProducer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public walletAddress!: string;
  public email?: string;
  public username?: string;
  public profileImage?: string;
  public isProducer!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods
  public getPurchases!: (options?: any) => Promise<any[]>;
  public getViews!: (options?: any) => Promise<any[]>;
  public getFilms!: (options?: any) => Promise<any[]>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    walletAddress: {
      type: DataTypes.STRING(42),
      allowNull: false,
      unique: true,
      validate: {
        is: /^0x[a-fA-F0-9]{40}$/
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isProducer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
  }
);

export default User;
