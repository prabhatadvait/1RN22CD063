
export interface StockPrice {
  ticker: string;
  price: number;
  timestamp: string;
}

export interface CorrelationData {
  ticker1: string;
  ticker2: string;
  correlation: number;
  minutes: number;
  timestamp: string;
}

export interface HistoricalData {
  ticker: string;
  data: StockPrice[];
}

export interface CorrelationMatrix {
  [ticker: string]: {
    [ticker: string]: number;
  };
}

export interface MarketData {
  currentPrices: Record<string, StockPrice>;
  correlations: CorrelationMatrix;
  lastUpdated: string;
}
