
import { StockPrice } from "@/types/stock";

const API_BASE_URL = "http://20.244.56.144/evaluation-service";
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ5ODc5Njk1LCJpYXQiOjE3NDk4NzkzOTUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjI5ODA5OWM5LWViZjUtNGQxNy1iMjFhLTFhZDE1N2YyZTM5MiIsInN1YiI6IjFybjIyY2QwNjMucHJhYmhhdGt1bWFyQHJuc2l0LmFjLmluIn0,ImVtYWlsIjoiMXJuMjJjZDA2My5wcmFiaGF0a3VtYXJAcm5zaXQuYWMuaW4iLCJuYW1lIjoicHJhYmhhdCBrdW1hciIsInJvbGxObyI6IjFybjIyY2QwNjMiLCJhY2Nlc3NDb2RlIjoicG1Wc0VoIiwiY2xpZW50SUQiOiIyOTgwOTljOS1lYmY1LTRkMTctYjIxYS0xYWQxNTdmMmUzOTIiLCJjbGllbnRTZWNyZXQiOiJad2h1TlNkbmNlUWJyQmF4In0.Ksf_aOGXEGFP8vLKbUyWBkO6GsONvWXvJCTmdEe_19Q";

class StockAPI {
  private getHeaders() {
    return {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }

  async getAllStocks(): Promise<Record<string, string>> {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("All stocks data:", data);
      return data.stocks || {};
    } catch (error) {
      console.error("Error fetching all stocks:", error);
      throw error;
    }
  }

  async getCurrentPrice(ticker: string): Promise<StockPrice> {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/${ticker}`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Current price data for ${ticker}:`, data);
      
      return {
        ticker,
        price: data.stock.price,
        timestamp: data.stock.lastUpdatedAt
      };
    } catch (error) {
      console.error(`Error fetching current price for ${ticker}:`, error);
      throw error;
    }
  }

  async getLastNMinutes(ticker: string, minutes: number): Promise<StockPrice[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/${ticker}?minutes=${minutes}`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Historical data for ${ticker} (${minutes} minutes):`, data);
      
      // Convert API response to our StockPrice format
      return data.map((item: any) => ({
        ticker,
        price: item.price,
        timestamp: item.lastUpdatedAt
      }));
    } catch (error) {
      console.error(`Error fetching historical data for ${ticker}:`, error);
      throw error;
    }
  }

  async getCorrelation(ticker1: string, ticker2: string, minutes: number): Promise<{
    ticker1: string;
    ticker2: string;
    correlation: number;
    minutes: number;
  }> {
    try {
      const [data1, data2] = await Promise.all([
        this.getLastNMinutes(ticker1, minutes),
        this.getLastNMinutes(ticker2, minutes)
      ]);
      
      const prices1 = data1.map(d => d.price);
      const prices2 = data2.map(d => d.price);
      
      const correlation = this.calculatePearsonCorrelation(prices1, prices2);
      
      return {
        ticker1,
        ticker2,
        correlation,
        minutes
      };
    } catch (error) {
      console.error(`Error calculating correlation between ${ticker1} and ${ticker2}:`, error);
      throw error;
    }
  }

  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
}

export const stockAPI = new StockAPI();
