import { Response, Request } from "express";
import { IContactsController } from "./interface";
import ContactsService from "./service";
export default class ContactsController
  extends ContactsService
  implements IContactsController
{
  public identify = async (req: Request, res: Response): Promise<void> => {
    /*
     *
     * @param req
     * @param res
     */
    try {
      const response = await this.fetchContactDetails(req.body);
      res.status(200).send(response);
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .send({ success: false, message: "Internal ServerError.", err });
    }
  };
}
