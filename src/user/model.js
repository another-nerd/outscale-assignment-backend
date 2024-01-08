import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../database/index.js";

/**
 * create user model
 * @param {Sequelize} sequelize
 * @returns {Model}
 */
function initUserModel(sequelize) {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: { type: DataTypes.STRING, defaultValue: "" },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      salt: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
    },
    {
      // model options
      timestamps: true,
      paranoid: false,
      tableName: "users",
    }
  );

  return User;
}

export const userModel = initUserModel(sequelize);
