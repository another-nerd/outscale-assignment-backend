import fs from "fs";
import assert from "assert";
import superTest from "supertest";
import { faker } from "@faker-js/faker";
import * as utils from "../../src/utils.js";
import { initServer } from "../../src/server.js";

function log(data) {
  fs.appendFileSync("./test.log", JSON.stringify(data, null, 2) + "\n");
}

function createBook() {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    isbn: faker.lorem
      .sentence({ min: 10, max: 13 })
      .toUpperCase()
      .replace(/ /gi, "")
      .split("")
      .slice(0, 13)
      .join(""),
    publicationYear: faker.date.past().getFullYear(),
    genre: faker.lorem.word(),
    price: faker.number.float({ min: 10, max: 1000, precision: 2 }),
    description: faker.lorem.paragraph(),
  };
}

async function getCreds(server) {
  const email = faker.internet.email();
  const fName = faker.person.firstName();
  const password = faker.internet.password();

  await superTest(server)
    .post("/api/auth/signup")
    .send({ email, password, name: fName })
    .expect("Content-Type", /json/);

  const response = await superTest(server)
    .post("/api/auth/login")
    .send({ email, password })
    .expect("Content-Type", /json/);

  return response.body;
}

const insertBookInDb = async (server, creds) => {
  const book = createBook();

  await superTest(server)
    .post("/api/books/publish")
    .set("Authorization", `Bearer ${creds.data.accessToken}`)
    .send(book)
    .expect("Content-Type", /json/)
    .expect(201);
};

describe("TEST: Book Routes", () => {
  describe("POST /publish", () => {
    let server;

    before(async () => {
      server = await initServer();
    });

    after(async () => {
      await server.close();
    });

    it("should return 201 when book is published", async () => {
      const book = createBook();
      const creds = await getCreds(server);

      const response = await superTest(server)
        .post("/api/books/publish")
        .set("Authorization", `Bearer ${creds.data.accessToken}`)
        .send(book)
        .expect("Content-Type", /json/)
        .expect(201);

      assert.strictEqual(response.body.status, "success");
    });

    it("should return 401 when no token is provided", async () => {
      const book = createBook();

      const response = await superTest(server)
        .post("/api/books/publish")
        .send(book)
        .expect("Content-Type", /json/)
        .expect(401);

      assert.strictEqual(response.body.status, "error");
    });

    it("should return 400 when book is invalid", async () => {
      const book = createBook();
      delete book.title;
      const creds = await getCreds(server);

      const response = await superTest(server)
        .post("/api/books/publish")
        .set("Authorization", `Bearer ${creds.data.accessToken}`)
        .send(book)
        .expect("Content-Type", /json/)
        .expect(400);

      assert.strictEqual(response.body.status, "error");
    });
  });

  describe("POST /unpublish/{bookId}", () => {
    let server;

    before(async () => {
      server = await initServer();
    });

    after(async () => {
      await server.close();
    });

    it("unpublish a book", async () => {
      const book = createBook();
      const creds = await getCreds(server);

      const response = await superTest(server)
        .post("/api/books/publish")
        .set("Authorization", `Bearer ${creds.data.accessToken}`)
        .send(book)
        .expect("Content-Type", /json/)
        .expect(201);

      await superTest(server)
        .put("/api/books/unpublish/" + response.body.data.id)
        .set("Authorization", `Bearer ${creds.data.accessToken}`)
        .send(book)
        .expect("Content-Type", /json/)
        .expect(200);
    });

    it("should fail to unpublish a non-existant book", async () => {
      const creds = await getCreds(server);

      await superTest(server)
        .put("/api/books/unpublish/" + faker.string.uuid())
        .set("Authorization", `Bearer ${creds.data.accessToken}`)
        .expect("Content-Type", /json/)
        .expect(400);
    });
  });

  describe("GET /user", () => {
    let server;

    before(async () => {
      server = await initServer();
    });

    after(async () => {
      await server.close();
    });

    it("should return 200 when books are fetched", async () => {
      const creds = await getCreds(server);
      const response = await superTest(server)
        .get("/api/books/user")
        .set("Authorization", `Bearer ${creds.data.accessToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assert.strictEqual(response.body.status, "success");
    });

    it("should return 401 when no token is provided", async () => {
      const response = await superTest(server)
        .get("/api/books/user")
        .expect("Content-Type", /json/)
        .expect(401);

      assert.strictEqual(response.body.status, "error");
    });

    it("should return 401 when token is invalid", async () => {
      const response = await superTest(server)
        .get("/api/books/user")
        .set("Authorization", `Bearer ${faker.string.uuid()}`)
        .expect("Content-Type", /json/)
        .expect(401);

      assert.strictEqual(response.body.status, "error");
    });

    it("should return >3 books", async () => {
      const creds = await getCreds(server);

      await insertBookInDb(server, creds);
      await insertBookInDb(server, creds);
      await insertBookInDb(server, creds);
      await insertBookInDb(server, creds);

      const response = await superTest(server)
        .get("/api/books/user")
        .set("Authorization", `Bearer ${creds.data.accessToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      log(response);

      assert.strictEqual(response.body.data.length > 3, true);
    });
  });

  describe("GET /published", () => {
    let server;

    before(async () => {
      server = await initServer();
    });

    after(async () => {
      await server.close();
    });

    it("should return 200 when books are fetched", async () => {
      const creds = await getCreds(server);
      const response = await superTest(server)
        .get("/api/books/published")
        .set("Authorization", `Bearer ${creds.data.accessToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      assert.strictEqual(response.body.status, "success");
    });

    it("should return 401 when no token is provided", async () => {
      const response = await superTest(server)
        .get("/api/books/published")
        .expect("Content-Type", /json/)
        .expect(401);

      assert.strictEqual(response.body.status, "error");
    });

    it("should return 401 when token is invalid", async () => {
      const response = await superTest(server)
        .get("/api/books/published")
        .set("Authorization", `Bearer ${faker.string.uuid()}`)
        .expect("Content-Type", /json/)
        .expect(401);

      assert.strictEqual(response.body.status, "error");
    });

    it("should return >3 books", async () => {
      const creds = await getCreds(server);

      await insertBookInDb(server, creds);
      await insertBookInDb(server, creds);
      await insertBookInDb(server, creds);
      await insertBookInDb(server, creds);

      const response = await superTest(server)
        .get("/api/books/published")
        .set("Authorization", `Bearer ${creds.data.accessToken}`)
        .expect("Content-Type", /json/)
        .expect(200);

      log(response);

      assert.strictEqual(response.body.data.length > 3, true);
    });
  });

  describe("GET /search", () => {
    let server;

    before(async () => {
      server = await initServer();
    });

    after(async () => {
      await server.close();
    });

    it("should return error on missing query", async () => {
      const response = await superTest(server)
        .get("/api/books/search")
        .expect("Content-Type", /json/)
        .expect(400);

      assert.strictEqual(response.body.status, "error");
    });

    it("should return 200 on valid search", async () => {
      const creds = await getCreds(server);

      await insertBookInDb(server, creds);
      await insertBookInDb(server, creds);
      await insertBookInDb(server, creds);
      await insertBookInDb(server, creds);

      const response = await superTest(server)
        .get("/api/books/search?title=" + faker.lorem.word())
        .expect("Content-Type", /json/)
        .expect(200);

      assert.strictEqual(response.body.status, "success");
    });
  });
});
