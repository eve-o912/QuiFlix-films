import sequelize from '../config/database';
import User from './User';
import Film from './Film';
import Purchase from './Purchase';
import View from './View';

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

export { User, Film, Purchase, View, syncDatabase };
