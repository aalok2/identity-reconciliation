import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import { Config } from "../config";
import { fileURLToPath, pathToFileURL } from "url";

// Define __filename and __dirname in a CommonJS-compatible way

const basename = path.basename(__filename);
const db: { [key: string]: any } = {};
const { dbConfig } = Config;

const sequelize = new Sequelize(
  dbConfig.DATABASE,
  dbConfig.USERNAME,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: "postgres",
    port: dbConfig.PORT,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

fs.readdirSync(__dirname)
  .filter((file: string) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".ts"
    );
  })
  .forEach((file: string) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName: string) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
export default db;
initializeDatabase();
