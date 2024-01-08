import assert from "assert";
import { initServer } from "../src/server.js";

// disable console.log
//console.log = () => {};

describe("TEST: Server", () => {
  it("should start server", async () => {
    const server = initServer();
    assert.ok(server);
    server.close();
  });

  it("should start server on port 3000", async () => {
    const server = initServer(3000);
    assert.ok(server);
    server.close();
  });

  it("should fail when `abc` port is passed", async () => {
    assert.throws(() => initServer("abc"), Error);
  });
});
