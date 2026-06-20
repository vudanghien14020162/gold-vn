import { goldMockData } from "../data/goldMockData";
import { mockRequest } from "./mockClient";
export const newsApi = {
  getNews() {
    return mockRequest(goldMockData.news);
  },
};
