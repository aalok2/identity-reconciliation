import { Router } from "express";
import ContactsController from "./controller";

const { identify } = new ContactsController();

const contactsRouter = Router();

contactsRouter.post("/identify", identify);

export default contactsRouter;
