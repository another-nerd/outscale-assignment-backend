import assert from "assert";
import superTest from "supertest";
import { randomUUID } from "crypto";
import * as utils from "../../src/utils.js";
import { initServer } from "../../src/server.js";

describe("TEST: Authentication Routes", () => {
  describe("POST /signup", () => {
    let server;

    before(async () => {
      server = await initServer();
    });

    after(async () => {
      await server.close();
    });

    it("should create a user", async () => {
      const randEmail = randomUUID() + "@test.com";

      await superTest(server)
        .post("/api/auth/signup")
        .send({ name: "test", email: randEmail, password: "test1234" })
        .expect(201);
    });

    it("should NOT create a user with empty email", async () => {
      await superTest(server)
        .post("/api/auth/signup")
        .send({ name: "", email: "", password: "test1234" })
        .expect(400);
    });

    it("should NOT create a user with an existing email", async () => {
      const randEmail = randomUUID() + "@test.com";

      await superTest(server)
        .post("/api/auth/signup")
        .send({ name: "test", email: randEmail, password: "test1234" });

      await superTest(server)
        .post("/api/auth/signup")
        .send({ name: "test", email: randEmail, password: "test1234" })
        .expect(400);
    });

    it("should throw error when no body is passed", async () => {
      await superTest(server).post("/api/auth/signup").send().expect(400);
    });
  });

  describe("POST /login", () => {
    let server;

    before(async () => {
      server = await initServer();
    });

    after(async () => {
      await server.close();
    });

    it("should login a user", async () => {
      const randEmail = randomUUID() + "@test.com";

      await superTest(server)
        .post("/api/auth/signup")
        .send({ name: "test", email: randEmail, password: randEmail });

      await superTest(server)
        .post("/api/auth/login")
        .send({ email: randEmail, password: randEmail })
        .expect(200);
    });

    it("should NOT login a user with empty email", async () => {
      await superTest(server)
        .post("/api/auth/login")
        .send({ email: "", password: "test1234" })
        .expect(400);
    });

    it("should NOT login a user with empty password", async () => {
      await superTest(server)
        .post("/api/auth/login")
        .send({ email: "test@test.com", password: "" })
        .expect(400);
    });

    it("should be able to login with correct credentials", async () => {
      await superTest(server).post("/api/auth/signup").send({
        name: "test",
        email: "correct@test.com",
        password: "test1234",
      });

      await superTest(server)
        .post("/api/auth/login")
        .send({ email: "correct@test.com", password: "test1234" })
        .expect(200);
    });

    it("should NOT be able to login with incorrect password", async () => {
      const email = randomUUID() + "@test.com";
      await superTest(server).post("/api/auth/signup").send({
        email,
        name: "test",
        password: "test80000",
      });

      await superTest(server)
        .post("/api/auth/login")
        .send({ email, password: "test12345" })
        .expect(400);
    });

    it("should return a jwt", async () => {
      const email = randomUUID() + "@test.com";
      const password = randomUUID();

      await superTest(server).post("/api/auth/signup").send({
        email,
        name: "test",
        password,
      });

      const resp = await superTest(server)
        .post("/api/auth/login")
        .send({ email, password });

      assert.doesNotThrow(() => utils.verifyToken(resp.body.data.accessToken));
    });
  });
});
