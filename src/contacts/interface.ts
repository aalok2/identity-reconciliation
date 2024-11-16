import { Response, Request } from "express";
import { ContactType } from "./enum";
export interface IContactsController {
  identify(req: Request, res: Response): Promise<void>;
}
export interface IIdentifyBody {
  email?: string;
  phoneNumber?: number;
}
export interface IOrderDetails {
  id: number;
  email: string;
  phoneNumber: number;
  linkedId: number;
  linkPrecedence: ContactType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
