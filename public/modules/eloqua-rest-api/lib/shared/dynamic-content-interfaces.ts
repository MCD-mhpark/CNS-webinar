import { IContentSection } from "./content-section-interface";
import { ICriterion } from "./criterion-interface";

export interface IDynamicContent {
  accessedAt?: string;
  createdAt?: string;
  createdBy?: string;
  currentStatus?: string;
  defaultContentSection?: IContentSection;
  depth?: string;
  description?: string;
  id?: string;
  name?: string;
  permissions?: string;
  rules?: IDynamicContentRule[];
  type?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface IDynamicContentRule {
  contentSection?: IContentSection;
  criteria?: ICriterion[];
  currentStatus?: string;
  depth?: string;
  id?: string;
  statement?: string;
  type?: string;
}
