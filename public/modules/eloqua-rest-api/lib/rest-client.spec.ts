import Axios, { AxiosResponse } from "axios";
import "jest";
import "jest-extended";
import { IBaseUrl } from "./base-urls/base-url-interfaces";
import { IEloquaCredentials } from "./eloqua-credentials";
import { Depth, IListRequestOptions } from "./rest-api-interfaces";
import { RestClient } from "./rest-client";

describe("RestClient", () => {
  let axiosGetMock: jest.Mock;
  const credentials: IEloquaCredentials = { password: "pass", siteName: "site", userName: "user" };
  const baseUrl: IBaseUrl = {
    site: {} as any,
    urls: {
      apis: {} as any,
      base: "http://test",
    },
    user: {} as any,
  };

  beforeEach(() => {
    axiosGetMock = jest.fn();
    Axios.get = axiosGetMock;
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe("getList", () => {
    let response: AxiosResponse;

    beforeEach(() => {
      response = {
        config: {},
        data: [],
        headers: {},
        status: 200,
        statusText: "OK",
      };

      axiosGetMock.mockResolvedValue(response);
    });

    it("calculates endpoint path correctly", () => {
      const client = new RestClient(credentials, baseUrl);
      client.getList("/api/resource");
      expect(axiosGetMock)
        .toHaveBeenCalledWith(
          "http://test/api/resource",
          expect.anything());
    });

    it("passes the credentials", () => {
      const client = new RestClient(credentials, baseUrl);
      client.getList("/api/resource");
      const expectedCredentials = {
        auth: {
          password: credentials.password,
          username: `${credentials.siteName}\\${credentials.userName}`,
        },
      };
      expect(axiosGetMock)
        .toHaveBeenCalledWith(
          expect.anything(),
          expectedCredentials,
        );
    });

    it("other parameters", () => {
      const client = new RestClient(credentials, baseUrl);
      const params: IListRequestOptions = {
        count: 10,
        depth: Depth.partial,
        lastUpdatedAt: 1,
        orderBy: "id",
        page: 3,
        search: "name='test'",
      };
      client.getList("/api/resource", params);
      expect(axiosGetMock)
        .toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ params }),
        );
    });

    it("returns the data in the response", (done) => {
      response.data = ["x", "y"];
      const client = new RestClient(credentials, baseUrl);
      client.getList("/api/resource").then((result) => {
        expect(result).toBe(response.data);
        done();
      });
    });

    it("throws an error if data is undefined", (done) => {
      response.data = undefined;
      response.statusText = "something cheezy!";
      const client = new RestClient(credentials, baseUrl);
      client.getList("/api/resource").catch((error) => {
        expect(error.message).toBe(response.statusText);
        done();
      });
    });

    it("throws an error if status is not 200", (done) => {
      response.status = 400;
      response.statusText = "error details";
      const client = new RestClient(credentials, baseUrl);
      client.getList("/api/resource").catch((error) => {
        expect(error.message).toBe(response.statusText);
        done();
      });
    });

    it("throws an error if underlying ajax client throws an error", (done) => {
      const errorMessage = "something really bad happened!";
      axiosGetMock.mockRejectedValue(errorMessage);
      const client = new RestClient(credentials, baseUrl);
      client.getList("/api/resource").catch((error) => {
        expect(error).toBe(errorMessage);
        done();
      });
    });
  });

  describe("getItem", () => {
    let response: AxiosResponse;
    beforeEach(() => {
      response = {
        config: {},
        data: [],
        headers: {},
        status: 200,
        statusText: "OK",
      };

      axiosGetMock.mockResolvedValue(response);
    });

    it("uses the id to calculate path", () => {
      const client = new RestClient(credentials, baseUrl);
      client.getItem("/api/resource", 22);
      expect(axiosGetMock)
        .toHaveBeenCalledWith(
          "http://test/api/resource/22",
          expect.anything());
    });

    it("passes the credentials", () => {
      const client = new RestClient(credentials, baseUrl);
      client.getItem("/api/resource", 5);
      const expectedCredentials = {
        auth: {
          password: credentials.password,
          username: `${credentials.siteName}\\${credentials.userName}`,
        },
      };
      expect(axiosGetMock)
        .toHaveBeenCalledWith(
          expect.anything(),
          expectedCredentials,
        );
    });

    it("depth parameter", () => {
      const client = new RestClient(credentials, baseUrl);
      client.getItem("/api/resource", 7, Depth.complete);
      expect(axiosGetMock)
        .toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ params: { depth: "complete" } }),
        );
    });

    it("returns the data in the response", (done) => {
      response.data = { sample: "data"};
      const client = new RestClient(credentials, baseUrl);
      client.getItem("/api/resource", 5).then((result) => {
        expect(result).toBe(response.data);
        done();
      });
    });

    it("throws an error if data is undefined", (done) => {
      response.data = undefined;
      response.statusText = "something cheezy!";
      const client = new RestClient(credentials, baseUrl);
      client.getItem("/api/resource", 6).catch((error) => {
        expect(error.message).toBe(response.statusText);
        done();
      });
    });

    it("throws an error if status is not 200", (done) => {
      response.status = 400;
      response.statusText = "error details";
      const client = new RestClient(credentials, baseUrl);
      client.getItem("/api/resource", 7).catch((error) => {
        expect(error.message).toBe(response.statusText);
        done();
      });
    });

    it("throws an error if underlying ajax client throws an error", (done) => {
      const errorMessage = "something really bad happened!";
      axiosGetMock.mockRejectedValue(errorMessage);
      const client = new RestClient(credentials, baseUrl);
      client.getItem("/api/resource", 8).catch((error) => {
        expect(error).toBe(errorMessage);
        done();
      });
    });

  });
});
