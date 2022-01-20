export interface IBaseUrl {
  site: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    username: string;
    displayName: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
  };
  urls: {
    base: string;
    apis: {
      soap: {
        standard: string;
        dataTransfer: string;
        email: string;
        externalAction: string;
      };
      rest: {
        standard: string;
        bulk: string;
      };
    };
  };
}
