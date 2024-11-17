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

    const { rows: contactDetails } = (await dbClient.query(query)) as any;

    const linkedIds = contactDetails
      ?.map((contact: { linkedId: any }) => contact?.linkedId)
      .filter((contact: { linkedId: any }) => contact);

    if (linkedIds?.length > 0) {
      const primaryContactQuery = `SELECT * FROM contacts WHERE id = $1 `;

      const relatedContacts = `SELECT * FROM contacts  WHERE "linkedId" = $1`;

      const [primaryContactDetails, relartedSecondaryContactDetails] =
        (await Promise.allSettled([
          dbClient.query(primaryContactQuery, [linkedIds[0]]),
          dbClient.query(relatedContacts, [linkedIds[0]]),
        ])) as any;
      return [
        ...primaryContactDetails?.value?.rows,
        ...relartedSecondaryContactDetails?.value?.rows,
      ];
    } else {
      return contactDetails;
    }
  };

  public addAsPrimary = async (body: IIdentifyBody) => {
    const { email, phoneNumber } = body;

    const query = `INSERT INTO contacts ("phoneNumber", email, "linkPrecedence")
      VALUES ($1, $2, $3)
      returning *
    `;

    const { rows } = (await dbClient.query(query, [
      phoneNumber,
      email,
      ContactType.PRIMARY,
    ])) as any;
    return rows[0];
  };

  public createSecondaryContact = async (
    linkedId: number,
    email: string,
    phoneNumber: number
  ) => {
    const query = `
      INSERT INTO contacts ("linkedId", "phoneNumber", email, "linkPrecedence")
      VALUES ($1, $2,$3,$4)
      returning *
    `;

    const { rows } = (await dbClient.query(query, [
      linkedId,
      phoneNumber,
      email,
      ContactType.SECONDARY,
    ])) as any;

    return rows[0];
  };

  public updateContactToSecondary = async (
    contactId: number,
    linkedId: number
  ) => {
    const query = `
  UPDATE contacts 
  SET "linkPrecedence" = $1, "linkedId" = $2
  WHERE id = $3;
`;

    await dbClient.query(query, [ContactType.SECONDARY, linkedId, contactId]);
  };

  public fetchRelatedContacts = async (linkedId: number) => {
    const query = `
      SELECT * FROM contacts
      WHERE "linkedId" = $1
    `;

    const { rows: relatedContacts } = (await dbClient.query(query, [
      linkedId,
    ])) as any;

    return relatedContacts;
  };
}

