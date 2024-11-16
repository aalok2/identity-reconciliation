import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import { Config } from "../config";
import { fileURLToPath, pathToFileURL } from "url";


// Define __filename and __dirname in a CommonJS-compatible way
const __filename = path.resolve(process.argv[1]);
const __dirname = path.dirname(__filename);


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

    const modelFiles = fs.readdirSync(__dirname).filter((file) => {
      return (
        file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".ts"
      );
    });

    for (const file of modelFiles) {
      const modelPath = pathToFileURL(path.join(__dirname, file)).href;
      const modelModule = await import(modelPath);
      const model = modelModule.default(sequelize, DataTypes);
      db[model.name] = model;
    }

    Object.keys(db).forEach((modelName) => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

initializeDatabase();

export default db;
