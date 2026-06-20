import { goldMockData } from "../data/goldMockData";
import { mockRequest } from "./mockClient";
export const companyApi = {
  getAll() {
    return mockRequest(goldMockData.companies);
  },
};
