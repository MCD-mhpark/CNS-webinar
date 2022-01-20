import BaseUrlClient from "../../lib/base-urls/base-url-client";
import IEloquaCredentials from "../eloqua-credentials";
import getArguments from "./utils/get-arguments";

describe("BaseUrlClient", () => {
  let credentials: IEloquaCredentials;

  beforeAll(() => {
    credentials = getArguments();
  });

  it("Gets the base url information", (done) => {
    const baseUrlObservable = BaseUrlClient.get(credentials);
    baseUrlObservable.then((result) => {
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      expect(result.urls.base.length).toBeGreaterThan(0);
      done();
    });
  });
});
