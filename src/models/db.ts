import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import { Config } from "../config";
import { fileURLToPath, pathToFileURL } from "url";

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const db: any = {};
const { dbConfig } = Config;

// Initialize Sequelize with SSL support for PostgreSQL
const sequelize: Sequelize = new Sequelize(
  dbConfig.DATABASE,
  dbConfig.USERNAME,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: "postgres",
    port: dbConfig.PORT,
    logging: false, // Disable SQL logging
    dialectOptions: {
      ssl: {
        require: true, // Enforce SSL for secure connections
        rejectUnauthorized: false, // Accept self-signed certificates
      },
    },
  }
);

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

// Connect to the database
await connectDatabase();

// Dynamically import model files
const modelFiles = fs.readdirSync(__dirname).filter((file: string) => {
  return (
    file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".ts"
  );
});

for (const file of modelFiles) {
  const modelPath = pathToFileURL(path.join(__dirname, file)).href; // Convert to file:// URL
  const modelModule = await import(modelPath); // Use dynamic import
  const model = modelModule.default(sequelize, DataTypes);
  db[model.name] = model;
}

// Set up model associations
Object.keys(db).forEach((modelName: string) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export Sequelize instance and models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
