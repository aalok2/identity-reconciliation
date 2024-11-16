import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Define attributes for the Contacts model
interface ContactAttributes {
  id: number;
  phoneNumber: string;
  email: string;
  linkedId: number | null;
  linkPrecedence: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Define creation attributes for the Contacts model
interface ContactCreationAttributes
  extends Optional<ContactAttributes, "id" | "linkedId" | "deletedAt"> {}

// Extend Sequelize Model
export class Contact
  extends Model<ContactAttributes, ContactCreationAttributes>
  implements ContactAttributes
{
  public id!: number;
  public phoneNumber!: string;
  public email!: string;
  public linkedId!: number | null;
  public linkPrecedence!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date | null;
}

export default (sequelize: Sequelize, Sequelize: typeof DataTypes) => {
  Contact.init(
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      linkedId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      linkPrecedence: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Contact",
      timestamps: true,
      paranoid: true,
    }
  );
  return Contact;
};
