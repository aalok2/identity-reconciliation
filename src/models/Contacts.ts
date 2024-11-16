module.exports = (sequelize, Sequelize) => {
  const Contacts = sequelize.define(
    "contacts",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      phoneNumber: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      linkedId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      linkPrecedence: {
        type: Sequelize.STRING,
      },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true, // Enables createdAt/updatedAt
      paranoid: true, // Enables deletedAt
    }
  );
  return Contacts;
};
