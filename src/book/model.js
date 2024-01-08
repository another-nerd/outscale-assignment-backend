import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../database/index.js";

/**
 * create book model
 * @param {Sequelize} sequelize
 * @returns {Model}
 */
function initBookModel(sequelize) {
  const User = sequelize.define(
    "Book",
    {
      id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      title: { type: DataTypes.STRING(100), allowNull: false },
      isbn: { type: DataTypes.STRING(14), allowNull: false },
      publicationYear: { type: DataTypes.INTEGER, allowNull: false },
      genre: { type: DataTypes.STRING(100), allowNull: false },
      price: { type: DataTypes.FLOAT, allowNull: false },
      publisherId: { type: DataTypes.UUIDV4, allowNull: false },
      isPublished: { type: DataTypes.BOOLEAN, allowNull: false },
      description: { type: DataTypes.TEXT },
      picture: { type: DataTypes.STRING },
    },
    {
      // model options
      timestamps: true,
      paranoid: false,
      tableName: "books",
    }
  );

  return User;
}

export const bookModel = initBookModel(sequelize);
