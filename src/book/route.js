import { Op } from "sequelize";
import { Router } from "express";
import * as schemas from "./schema.js";
import { bookModel } from "./model.js";
import { isAuthenticated } from "../user/middleware.js";

export const bookRouter = Router();

bookRouter.post("/publish", isAuthenticated, async (req, res) => {
  try {
    const payload = schemas.bookPublishInputSchema.parse(req.body);
    const userId = req.user.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const book = await bookModel.create({
      ...payload,
      isPublished: true,
      publisherId: userId,
      picture: "https://picsum.photos/450/600" + "?random=" + Math.random(),
    });

    res.status(201).json({
      status: "success",
      message: "Book published successfully",
      data: { ...book.toJSON() },
    });
  } catch (error) {
    //console.log(error);
    res.status(400).json({
      status: "error",
      message: "Something went wrong while publishing book",
      data: null,
      _meta: {
        error: {
          name: error.name,
          message: error.message,
        },
      },
    });
  }
});

bookRouter.put("/unpublish/:bookId", isAuthenticated, async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const book = await bookModel.findByPk(bookId);

    if (!book) {
      throw new Error("Book not found");
    }

    await book.update({ isPublished: false });
    await book.save();

    res.status(200).json({
      status: "success",
      message: "Book unpublished successfully",
      data: { ...book.toJSON() },
    });
  } catch (error) {
    //console.log(error);
    res.status(400).json({
      status: "error",
      message: "Something went wrong while unpublishing book",
      data: null,
      _meta: {
        error: {
          name: error.name,
          message: error.message,
        },
      },
    });
  }
});

bookRouter.get("/user", isAuthenticated, async (req, res) => {
  try {
    const books = await bookModel.findAll({
      where: { publisherId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "Books fetched successfully",
      data: books,
    });
  } catch (error) {
    //console.log(error);
    res.status(400).json({
      status: "error",
      message: "Something went wrong while fetching books",
      data: null,
      _meta: {
        error: {
          name: error.name,
          message: error.message,
        },
      },
    });
  }
});

bookRouter.get("/published", isAuthenticated, async (_req, res) => {
  try {
    const books = await bookModel.findAll({
      where: { isPublished: true },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "Books fetched successfully",
      data: books,
    });
  } catch (error) {
    //console.log(error);
    res.status(400).json({
      status: "error",
      message: "Something went wrong while fetching books",
      data: null,
      _meta: {
        error: {
          name: error.name,
          message: error.message,
        },
      },
    });
  }
});

bookRouter.get("/search", async (req, res) => {
  try {
    const title = req.query.title;

    if (typeof title !== "string") {
      throw new Error("Invalid title");
    }

    const books = await bookModel.findAll({
      where: { title: { [Op.like]: `%${title}%` } },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "Books fetched successfully",
      data: books,
    });
  } catch (error) {
    //console.log(error);
    res.status(400).json({
      status: "error",
      message: "Something went wrong while fetching books",
      data: null,
      _meta: {
        error: {
          name: error.name,
          message: error.message,
        },
      },
    });
  }
});
