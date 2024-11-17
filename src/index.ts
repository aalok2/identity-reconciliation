import cors from "cors";
import express, { Request, Response } from "express";
import morgan from "morgan";
import helmet from "helmet";
import router from "./router";
import dbClient from "./db"
export const app: express.Application = express();

app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

