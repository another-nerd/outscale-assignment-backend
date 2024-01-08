import {
  Sequelize,
  ConnectionError,
  ConnectionTimedOutError,
  TimeoutError,
} from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db.prod.sqlite",
  logging: false,
  retry: {
    match: [
      /DeadLock/i,
      TimeoutError,
      ConnectionError,
      ConnectionTimedOutError,
    ],
    max: 3,
  },
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  define: { timestamps: false },
});

sequelize.authenticate().catch((error) => console.log(error));
sequelize.sync().catch((error) => console.log(error));

export { sequelize };
