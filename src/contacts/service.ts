import ContactsDb from "./db";
import { ContactType } from "./enum";
import { IIdentifyBody, IOrderDetails } from "./interface";
import { isEmpty } from "lodash";
export default class ContactsService extends ContactsDb {
  public fetchContactDetails = async (body: IIdentifyBody) => {
    const { email, phoneNumber } = body;
    const contactDetails = (await this.fetchContactDetailsFromDb(
      body
    )) as unknown as IOrderDetails[];

    if (contactDetails?.length === 0) {
      const primaryContact = await this.addAsPrimary(body);
      return this.formatContactResponse(
        primaryContact.id,
        [primaryContact.email],
        [primaryContact.phoneNumber],
        []
      );
    } else {
      const primaryContacts = contactDetails?.filter(
        (contact) => contact.linkPrecedence === ContactType.PRIMARY
      );

      if (primaryContacts?.length > 1) {
        primaryContacts.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        await this.updateContactToSecondary(
          primaryContacts[1]?.id,
          primaryContacts[0]?.id
        );

        const linkedContacts = await this.fetchRelatedContacts(
          primaryContacts[0]?.id
        );

        return this.collectContactInfo(primaryContacts[0].id, [
          ...contactDetails,
          ...linkedContacts,
        ]);
      } else {
        const primaryContact = primaryContacts[0];
        const isPrimaryMatch =
          primaryContact?.email === email &&
          primaryContact?.phoneNumber === phoneNumber;

        if (isPrimaryMatch) {
          return this.collectContactInfo(primaryContact.id, contactDetails);
        } else {
          await this.createSecondaryContact(
            primaryContact?.id,
            email!,
            phoneNumber!
          );
          const linkedContacts = await this.fetchRelatedContacts(
            primaryContacts[0]?.id
          );
          const completeContactsSet = [...contactDetails, ...linkedContacts]
            .reduce((acc, item) => {
              acc.set(item.id, item);
              return acc;
            }, new Map())
            .values();

          const uniqueContactsList = Array.from(completeContactsSet);

          return this.collectContactInfo(
            primaryContact?.id,
            uniqueContactsList
          );
        }
      }
    }
  };

  private formatContactResponse(
    primaryContactId: number,
    emails: string[],
    phoneNumbers: string[],
    secondaryContactIds: number[]
  ) {
    return {
      primaryContactId,
      emails,
      phoneNumbers,
      secondaryContactIds,
    };
  }

  private collectContactInfo(primaryContactId: number, contacts: any[]) {
    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();
    const secondaryContactIds: number[] = [];

    contacts?.forEach((contact) => {
      if (!isEmpty(contact?.email)) {
        emails?.add(contact?.email);
      }
      if (!isEmpty(contact?.phoneNumber)) {
        phoneNumbers?.add(contact?.phoneNumber);
      }
      if (contact.linkPrecedence === ContactType.SECONDARY) {
        secondaryContactIds?.push(contact.id);
      }
    });

    return this.formatContactResponse(
      primaryContactId,
      Array.from(emails),
      Array.from(phoneNumbers),
      secondaryContactIds
    );
  }
}
