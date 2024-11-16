import { IIdentifyBody, IOrderDetails } from "./interface";
import db from "../models/db";
import { Sequelize, Op } from "sequelize";
import { ContactType } from "./enum";

export default class contactsDb {
  public fetchContactDetailsFromDb = async (body: IIdentifyBody) => {
    const { email, phoneNumber } = body;
    let whereClause = {};

    if (email && phoneNumber) {
      whereClause = { [Op.or]: [{ email }, { phoneNumber }] };
    } else if (!email) {
      whereClause = { phoneNumber };
    } else if (!phoneNumber) {
      whereClause = { email };
    }
    console.log(Object.keys(db)); // Should include "Contacts"
    const contactDetails = (await db.contacts.findAll({
      where: whereClause,
      raw: true,
    })) as unknown as IOrderDetails[];

    return contactDetails;
  };

  public addAsPrimary = async (body: IIdentifyBody) => {
    const { email, phoneNumber } = body;

    const primaryContact = await db.contacts.create({
      phoneNumber,
      email,
      linkPrecedence: ContactType.PRIMARY,
    });

    return primaryContact;
  };

  public createSecondaryContact = async (
    linkedId: number,
    email: string,
    phoneNumber: number
  ) => {
    const secondaryContact = await db.contacts.create({
      linkedId,
      phoneNumber,
      email,
      linkPrecedence: ContactType.SECONDARY,
    });

    return secondaryContact.dataValues;
  };

  public updateContactToSecondary = async (
    contactId: number,
    linkedId: number
  ) => {
    return await db.contacts.update(
      {
        linkPrecedence: ContactType.SECONDARY,
        linkedId,
      },
      {
        where: {
          id: contactId,
        },
      }
    );
  };

  public fetchRelatedContacts = async (linkedId: number) => {
    return await db.contacts.findAll({
      where: {
        linkedId,
      },
      raw: true,
    });
  };
}
