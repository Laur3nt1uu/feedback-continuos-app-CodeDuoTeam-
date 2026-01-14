//  Config pentru DB — pun variabila de conexiune și inițializez Sequelize.
import "dotenv/config";
import { Sequelize } from 'sequelize';

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false 
      }
    }
  });
  console.log('📡 Using DATABASE_URL for connection');
} else {
  const dbName = process.env.DB_NAME && process.env.DB_NAME.trim();
  const dbUser = process.env.DB_USER && process.env.DB_USER.trim();
  const dbPassword = typeof process.env.DB_PASSWORD === 'string' ? process.env.DB_PASSWORD.trim() : process.env.DB_PASSWORD;

  if (!dbName || !dbUser || typeof dbPassword !== 'string' || dbPassword.length === 0) {
    console.error('❌ Missing or invalid DB env vars. Check DB_NAME, DB_USER and DB_PASSWORD in your .env');
  }

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    dialect: 'postgres',
    logging: false,
  });
  console.log('💻 Using local database configuration');
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectat la PostgreSQL (Sequelize).');
  } catch (error) {
    console.error('❌ Eroare la conectarea la DB (Sequelize):', error.message || error);
    throw error;
  }
};

export { connectDB, sequelize };
