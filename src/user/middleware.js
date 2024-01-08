import * as utils from "../utils.js";

export function isAuthenticated(req, res, next) {
  const header = req.headers.authorization || req.headers.Authorization;

  if (!header) {
    return res
      .status(401)
      .json({ status: "error", message: "Token Not Found", data: null });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = utils.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ status: "error", message: "Invalid Token", data: null });
  }
}
