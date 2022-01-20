import { IForm } from "../forms/forms-interface";
import { Depth } from "../rest-api-interfaces";
import { IContentSection } from "../shared/content-section-interface";
import { IDynamicContent } from "../shared/dynamic-content-interfaces";
import { IHtmlContent } from "../shared/html-content-interface";
import { IHyperlink } from "../shared/hyperlink-interface";
import { IImage } from "../shared/image-interface";
import { IImportedFile } from "../shared/imported-file-interface";

export interface ILandingPage {
  id: number;
  accessedAt?: string;
  autoCloseWaitFor?: string;
  autoRedirectWaitFor?: string;
  contentSections?: IContentSection[];
  createdAt?: string;
  createdBy?: string;
  currentStatus?: string;
  deployedAt?: string;
  depth?: Depth;
  description?: string;
  dynamicContents?: IDynamicContent[];
  files?: IImportedFile[];
  forms?: IForm[];
  htmlContent?: IHtmlContent;
  hyperlinks?: IHyperlink[];
  images?: IImage[];
  layout?: string;
  micrositeId?: string;
  name?: string;
  permissions?: string;
  refreshedAt?: string;
  relativePath?: string;
  style?: string;
  type?: string;
  updatedAt?: string;
  updatedBy?: string;
}
