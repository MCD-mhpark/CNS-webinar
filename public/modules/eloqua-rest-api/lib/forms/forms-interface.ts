import { IFormElement } from "./form-element-interface";
import { IFormProcessingStep } from "./form-processing-step-interface";

export interface IForm {
  accessedAt?: string;
  createdAt?: string;
  createdBy?: string;
  currentStatus?: string;
  depth?: string;
  description?: string;
  elements?: IFormElement[];
  emailAddressFormFieldId?: string;
  html?: string;
  htmlName?: string;
  id: number;
  isHidden?: string;
  name?: string;
  permissions?: string;
  processingSteps?: IFormProcessingStep[];
  processingType?: string;
  style?: string;
  submitFailedLandingPageId?: string;
  type?: string;
  updatedAt?: string;
  updatedBy?: string;
}
