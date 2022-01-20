import * as axios from "axios";
import "jest-extended";
import {IEloquaCredentials} from "../eloqua-credentials";
import {BaseUrlClient} from "./base-url-client";

describe("BaseUrlClient", () => {
  let axiosGetMock: jest.Mock;
  beforeEach(() => {
    axiosGetMock = jest.fn();
    axios.default.get = axiosGetMock;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("gets the base urls from eloqua", (done) => {
    const response: axios.AxiosResponse<any> = {
      config: {},
      data: {},
      headers: {},
      status: 200,
      statusText: "OK",
    };
    axiosGetMock.mockResolvedValue(response);
    BaseUrlClient.get({} as any).then(() => {
      expect(axiosGetMock).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it("sends credentials as header", (done) => {
    const credentials: IEloquaCredentials = {
      password: "pass",
      siteName: "site",
      userName: "user",
    };
    const response: axios.AxiosResponse<any> = {
      config: {},
      data: {},
      headers: {},
      status: 200,
      statusText: "OK",
    };
    axiosGetMock.mockResolvedValue(response);
    BaseUrlClient.get(credentials).then(() => {
      expect(axiosGetMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        auth: {
          password: credentials.password,
          username: `${credentials.siteName}\\${credentials.userName}`,
        },
      }));
      done();
    });
  });

  it("when axios throws an error, it throws the same error", (done) => {
    axiosGetMock.mockRejectedValue("bad-error");
    BaseUrlClient.get({} as any).catch((error) => {
      expect(error).toBe("bad-error");
      done();
    });
  });

  it("when eloqua responds with 200 but it's actually an error", (done) => {
    const response: axios.AxiosResponse<any> = {
      config: {},
      data: undefined,
      headers: {},
      status: 200,
      statusText: "Unauthenticated",
    };
    axiosGetMock.mockResolvedValue(response);
    BaseUrlClient.get({} as any).catch((error) => {
      expect(error.message).toBe("Unauthenticated");
      done();
    });
  });
});
