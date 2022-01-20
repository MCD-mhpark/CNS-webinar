import { Depth } from "..";
import { IForm } from "../forms/forms-interface";
import { IHyperlink } from "./hyperlink-interface";
import { IImage } from "./image-interface";
import { ISize } from "./size-interface";

export interface IContentSection {
  id?: string;
  accessedAt?: string;
  contentHtml?: string;
  contentText?: string;
  createdAt?: string;
  createdBy?: string;
  currentStatus?: string;
  depth?: Depth;
  description?: string;
  forms?: IForm[];
  hyperlinks?: IHyperlink[];
  images?: IImage[];
  name?: string;
  permissions?: string;
  scope: string;
  size?: ISize;
  type?: string;
  updatedAt?: string;
  updatedBy?: string;
}
