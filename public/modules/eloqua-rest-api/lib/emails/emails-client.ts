import { Depth, IListRequestOptions, IListResponse } from "..";
import { RestClient } from "../rest-client";
import { IEmail } from "./emails-interfaces";

const getListPath = "/api/REST/1.0/assets/emails";
const getItemPath = "/api/REST/1.0/assets/email";

export class EmailClient {
  constructor(private client: RestClient) { }

  public getEmails(
    options: IListRequestOptions): Promise<IListResponse<IEmail>> {
      return this.client.getList(getListPath, options);
  }

  public getEmail(
    id: number,
    depth?: Depth,
  ): Promise<IEmail> {
    return this.client.getItem(getItemPath, id, depth);
  }
}
