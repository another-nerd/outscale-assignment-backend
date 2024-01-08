import { Router } from "express";
import * as utils from "../utils.js";
import * as schemas from "./schema.js";
import { userModel } from "./model.js";

export const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
  try {
    const payload = schemas.signupInputSchema.parse(req.body);
    const hashResp = utils.createHash(payload.password);
    const user = await userModel.create({
      ...payload,
      salt: hashResp.salt,
      passwordHash: hashResp.hash,
    });

    res.status(201).json({
      status: "success",
      message: "Signup successful",
      data: { ...user.toJSON(), passwordHash: undefined, salt: undefined },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Something went wrong while signing up",
      data: {},
      _meta: {
        error: {
          name: error.name,
          message: error.message,
        },
      },
    });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const payload = schemas.loginInputSchema.parse(req.body);
    const user = await userModel.findOne({
      where: { email: payload.email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = utils.comparePassword(
      payload.password,
      user.passwordHash,
      user.salt
    );

    if (!isPasswordValid) {
      throw new Error("Invalid Email or Password");
    }

    const token = utils.generateToken({
      id: user.id,
      sub: user.id,
      name: user.name,
      email: user.email,
    });

    res.header("Authorization", `Bearer ${token}`);
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        ...user.toJSON(),
        passwordHash: undefined,
        salt: undefined,
        accessToken: token,
      },
    });
  } catch (error) {
    //console.log(error);
    res.status(400).json({
      status: "error",
      message: "Something went wrong while logging in",
      data: {},
      _meta: {
        error: {
          name: error.name,
          message: error.message,
        },
      },
    });
  }
});
