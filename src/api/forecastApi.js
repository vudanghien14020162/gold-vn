import { goldMockData } from "../data/goldMockData";
import { mockRequest } from "./mockClient";

export const forecastApi = {
  getForecast() {
    const forecast =
      goldMockData.forecast ||
      goldMockData.forecasts?.find(
        (item) =>
          item.companyId === 1 &&
          item.goldType === "sjc-gold-bar" &&
          item.area === "ha-noi"
      ) ||
      goldMockData.forecasts?.[0];

    return mockRequest(forecast);
  },

  getForecasts() {
    return mockRequest(goldMockData.forecasts || []);
  },
};