export interface IListResponse<T> {
  elements: T[];
  page: number;
  pageSize: number;
  total: number;
  type: string;
}

export interface IListRequestOptions {
  count?: number;
  depth?: Depth;
  lastUpdatedAt?: number;
  orderBy?: string;
  page?: number;
  search?: string;
}

export enum Depth {
  minimal = "minimal",
  partial = "partial",
  complete = "complete",
}
