import ContactsDb from "./db";
import { ContactType } from "./enum";
import { IIdentifyBody } from "./interface";

export default class ContactsService extends ContactsDb {
  public fetchContactDetails = async (body: IIdentifyBody) => {
    const { email, phoneNumber } = body;
    const contactDetails = await this.fetchContactDetailsFromDb(body);

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
          primaryContact.email === email &&
          primaryContact.phoneNumber === phoneNumber;

        if (isPrimaryMatch) {
          return this.collectContactInfo(primaryContact.id, contactDetails);
        } else {
          await this.createSecondaryContact(
            primaryContact.id,
            email!,
            phoneNumber!
          );
          const linkedContacts = await this.fetchRelatedContacts(
            primaryContact.id
          );
          return this.collectContactInfo(primaryContact.id, [
            ...contactDetails,
            ...linkedContacts,
          ]);
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

    contacts.forEach((contact) => {
      emails.add(contact.email);
      phoneNumbers.add(contact.phoneNumber);
      if (contact.linkPrecedence === ContactType.SECONDARY) {
        secondaryContactIds.push(contact.id);
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
