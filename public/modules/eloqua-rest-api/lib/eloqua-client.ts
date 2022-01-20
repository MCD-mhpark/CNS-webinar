import {BaseUrlClient} from "./base-urls/base-url-client";
import {IBaseUrl} from "./base-urls/base-url-interfaces";
import {IEloquaCredentials} from "./eloqua-credentials";
import { EmailClient } from "./emails/emails-client";
import {LandingPageClient} from "./landing-pages/landing-pages-client";
import {RestClient} from "./rest-client";

export class EloquaClient {
  public static login(
    siteName: string,
    userName: string,
    password: string,
  ): Promise<EloquaClient> {
    const credentials: IEloquaCredentials = {
      password,
      siteName,
      userName,
    };
    return this.getBaseUrls(credentials)
      .then((baseUrls) => {
        return new EloquaClient(credentials, baseUrls);
      }).catch((error) => {
        throw error;
      });
  }

  private static getBaseUrls(
    credentials: IEloquaCredentials,
  ): Promise<IBaseUrl> {
    return BaseUrlClient.get(credentials);
  }

  private restClient: RestClient;
  private landingPages: LandingPageClient;
  private emails: EmailClient;

  public get LandingPages() {
    return this.landingPages;
  }

  public get Emails() {
    return this.emails;
  }

  private constructor(
    private credentials: IEloquaCredentials,
    private baseUrls: IBaseUrl,
  ) {
    this.restClient = new RestClient(credentials, baseUrls);
    this.landingPages = new LandingPageClient(this.restClient);
    this.emails = new EmailClient(this.restClient);
  }
}
