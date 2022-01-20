import * as axios from "axios";
import {IEloquaCredentials} from "../eloqua-credentials";
import {IBaseUrl} from "./base-url-interfaces";

const loginUrl = "https://login.eloqua.com/id";

export class BaseUrlClient {
  public static get(
    credentials: IEloquaCredentials,
  ): Promise<IBaseUrl> {
    return axios.default.get(
      loginUrl, {
        auth: {
          password: credentials.password,
          username: `${credentials.siteName}\\${credentials.userName}`,
        },
      },
    ).then((response) => {
      if (response.status === 200 && typeof response.data === "object") {
        return response.data as IBaseUrl;
      } else {
        throw Error(response.statusText);
      }
    });
  }

  private constructor() { }
}
