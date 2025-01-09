import dotenv from "dotenv";


dotenv.config();

export const Config = {
  dbConfig: {
    DATABASE: process.env.DB_DATABASE || "contact",
    USERNAME: process.env.DB_USERNAME || "postgres",
    PASSWORD: process.env.DB_PASSWORD || "12345",
    HOST: process.env.DB_HOST || "localhost:8080",
    PORT: Number(process.env.DB_PORT) || 5432,
  },
};
