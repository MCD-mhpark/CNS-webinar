import EloquaClient from "../eloqua-client";
import IEloquaCredentials from "../eloqua-credentials";
import getArguments from "./utils/get-arguments";

describe("EloquaClient", () => {
  let credentials: IEloquaCredentials;

  beforeAll(() => {
    credentials = getArguments();
  });

  describe("login", () => {
    it("returns an instance of the client when credentials are valid", (done) => {
      EloquaClient.login(
        credentials.siteName,
        credentials.userName,
        credentials.password,
      ).then((client) => {
        expect(client).not.toBeUndefined();
        done();
      });
    });

    it("throws an error when credentials are not correct", (done) => {
      EloquaClient.login(
        "test",
        "test",
        "test",
      ).catch(() => {
        done();
      });
    });
  });
});
