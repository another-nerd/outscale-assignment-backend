import crypto from "crypto";
import jwt from "jsonwebtoken";

const KEY_LEN = 64;
const ALGORITHM = "sha512";
const ITERATIONS = 100000;

/**
 * createSalt - Creates a salt
 * @returns {string} salt
 */
export function createSalt() {
  return crypto.randomBytes(KEY_LEN).toString("hex");
}

/**
 * createHash - Creates a hash from a password and salt
 * @param {string} password
 * @param {string} salt
 * @returns {object} salt and hash
 */
export function createHash(password, salt) {
  const newSalt = salt || createSalt();
  const hash = crypto
    .pbkdf2Sync(password, newSalt, ITERATIONS, KEY_LEN, ALGORITHM)
    .toString("hex");

  return { salt: newSalt, hash };
}

/**
 * comparePassword - Compares a password to a hash
 * @param {string} password
 * @param {string} hash
 * @param {string} salt
 * @returns {boolean} isMatch
 */
export function comparePassword(password, hash, salt) {
  const newHash = createHash(password, salt).hash;
  return newHash === hash;
}

/**
 * generate JWT token
 * @param {object} payload
 * @returns {string} token
 * @throws {Error} if token generation fails
 */
export function generateToken(payload = {}) {
  try {
    const secret = process.env.JWT_SECRET || "shhh".repeat(10);
    const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
    return jwt.sign(payload, secret, { expiresIn: expiresIn });
  } catch (error) {
    throw new Error("Token generation failed");
  }
}

/**
 * verifyToken - Verifies a token
 * @param {string} token
 * @returns {object} decodedToken
 * @throws {Error} if token verification fails
 */
export function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET || "shhh".repeat(10);
    return jwt.verify(token, secret, { ignoreExpiration: false });
  } catch (err) {
    throw new Error("Token verification failed");
  }
}
