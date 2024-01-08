import http from "http";
import express from "express";
import { userRouter } from "./user/route.js";
import { bookRouter } from "./book/route.js";

export function initServer(port = 3000) {
  try {
    const normalizedPort = parseInt(port, 10);
    const app = express();
    const server = http.createServer(app);
    const serverStartMsg = `Server started on port ${normalizedPort}`;

    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));

    // handle cors
    app.use((_req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      next();
    });

    // routes
    app.use("/api/auth", userRouter);
    app.use("/api/books", bookRouter);

    // server.listen(normalizedPort, () => console.log(serverStartMsg));
    server.listen(normalizedPort);

    return server;
  } catch (error) {
    //console.log(`Failed to start server: ${error.message}`);
    //console.log(error.stack);
    throw error;
  }
}
