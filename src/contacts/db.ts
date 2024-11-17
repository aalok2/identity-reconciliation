import { IIdentifyBody, IOrderDetails } from "./interface";
import dbClient from "../db";
import { ContactType } from "./enum";

export default class contactsDb {
  public fetchContactDetailsFromDb = async (body: IIdentifyBody) => {
    const { email, phoneNumber } = body;

    let whereClause = "";
    if (email && phoneNumber) {
      whereClause = `WHERE contacts.email = '${email}' OR contacts."phoneNumber" = '${phoneNumber}'`;
    } else if (!email) {
      whereClause = `WHERE contacts."phoneNumber" = '${phoneNumber}'`;
    } else if (!phoneNumber) {
      whereClause = `WHERE contacts.email = '${email}'`;
    }

    const query = `SELECT * FROM contacts ${whereClause}`;

    console.log(query);

    const { rows: contactDetails } = (await dbClient.query(query)) as any;

    return contactDetails as IOrderDetails[];
  };

  public addAsPrimary = async (body: IIdentifyBody) => {
    const { email, phoneNumber } = body;

    const query = `INSERT INTO contacts ("phoneNumber", email, "linkPrecedence")
      VALUES ('${phoneNumber}', '${email}', '${ContactType.PRIMARY}')
      returning *
    `;

    const { rows } = (await dbClient.query(query)) as any;
    return rows[0];
  };

  public createSecondaryContact = async (
    linkedId: number,
    email: string,
    phoneNumber: number
  ) => {
    const query = `
      INSERT INTO contacts ("linkedId", "phoneNumber", email, "linkPrecedence")
      VALUES ('${linkedId}', '${phoneNumber}', '${email}', '${ContactType.SECONDARY}')
    `;

    return dbClient.query(query) as any;
  };

  public updateContactToSecondary = async (
    contactId: number,
    linkedId: number
  ) => {
    const query = `
  UPDATE contacts 
  SET "linkPrecedence" = '${ContactType.SECONDARY}', "linkedId" = '${linkedId}'
  WHERE id = '${contactId}';
`;

    await dbClient.query(query);
  };

  public fetchRelatedContacts = async (linkedId: number) => {
    const query = `
      SELECT * FROM contacts
      WHERE "linkedId" = '${linkedId}'
    `;

    const { rows: relatedContacts } = (await dbClient.query(query)) as any;

    return relatedContacts;
  };
}
