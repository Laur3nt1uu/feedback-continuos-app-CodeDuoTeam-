import "dotenv/config";
import { Sequelize } from 'sequelize';


// Normalize and validate env vars
const dbName = process.env.DB_NAME && process.env.DB_NAME.trim();
const dbUser = process.env.DB_USER && process.env.DB_USER.trim();
const dbPassword = typeof process.env.DB_PASSWORD === 'string' ? process.env.DB_PASSWORD.trim() : process.env.DB_PASSWORD;

if (!dbName || !dbUser || typeof dbPassword !== 'string' || dbPassword.length === 0) {
  console.error('❌ Missing or invalid DB env vars. Check DB_NAME, DB_USER and DB_PASSWORD in your .env');
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  dialect: 'postgres',
  logging: false,
});

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
