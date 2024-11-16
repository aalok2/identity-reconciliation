import { Router } from "express";
import contact from "./contacts/routes";

const router = Router();

router.use("/contacts", contact);

export default router;
