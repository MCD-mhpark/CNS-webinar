import { ISize } from "./size-interface";

export interface IImage {
  accessedAt?: string;
  createdAt?: string;
  createdBy?: string;
  currentStatus?: string;
  depth?: string;
  description?: string;
  fullImageUrl?: string;
  id?: string;
  name?: string;
  permissions?: string;
  size?: ISize;
  thumbnailUrl?: string;
  type?: string;
  updatedAt?: string;
  updatedBy?: string;
}
