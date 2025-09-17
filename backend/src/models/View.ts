import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Film from './Film';

interface ViewAttributes {
  id: number;
  viewerId: number;
  filmId: number;
  duration: number; // viewing duration in seconds
  completed: boolean; // whether the film was watched completely
  createdAt: Date;
  updatedAt: Date;
}

interface ViewCreationAttributes extends Optional<ViewAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class View extends Model<ViewAttributes, ViewCreationAttributes> implements ViewAttributes {
  public id!: number;
  public viewerId!: number;
  public filmId!: number;
  public duration!: number;
  public completed!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public viewer?: User;
  public film?: Film;
}

View.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    viewerId: {
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
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
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
  }
);

// Define associations
View.belongsTo(User, { foreignKey: 'viewerId', as: 'viewer' });
View.belongsTo(Film, { foreignKey: 'filmId', as: 'film' });
User.hasMany(View, { foreignKey: 'viewerId', as: 'views' });
Film.hasMany(View, { foreignKey: 'filmId', as: 'views' });

export default View;
