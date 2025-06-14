
/**
 * Utility functions for calculating statistical correlations
 */

export class CorrelationUtils {
  /**
   * Calculate Pearson correlation coefficient between two arrays of numbers
   * Formula: correlation = covariance(x, y) / (stdDev(x) * stdDev(y))
   */
  calculatePearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) {
      throw new Error("Arrays must have the same length and contain at least 2 elements");
    }

    const n = x.length;
    
    // Calculate means
    const meanX = this.calculateMean(x);
    const meanY = this.calculateMean(y);
    
    // Calculate covariance and standard deviations
    const covariance = this.calculateCovariance(x, y, meanX, meanY);
    const stdDevX = this.calculateStandardDeviation(x, meanX);
    const stdDevY = this.calculateStandardDeviation(y, meanY);
    
    // Handle edge case where one of the arrays has zero variance
    if (stdDevX === 0 || stdDevY === 0) {
      return 0;
    }
    
    return covariance / (stdDevX * stdDevY);
  }

  /**
   * Calculate the mean (average) of an array of numbers
   */
  private calculateMean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Calculate covariance between two arrays
   */
  private calculateCovariance(x: number[], y: number[], meanX: number, meanY: number): number {
    const n = x.length;
    let covariance = 0;
    
    for (let i = 0; i < n; i++) {
      covariance += (x[i] - meanX) * (y[i] - meanY);
    }
    
    return covariance / (n - 1); // Sample covariance (divide by n-1)
  }

  /**
   * Calculate standard deviation of an array
   */
  private calculateStandardDeviation(values: number[], mean: number): number {
    const n = values.length;
    let variance = 0;
    
    for (let i = 0; i < n; i++) {
      variance += Math.pow(values[i] - mean, 2);
    }
    
    variance = variance / (n - 1); // Sample variance (divide by n-1)
    return Math.sqrt(variance);
  }

  /**
   * Calculate correlation matrix for multiple assets
   */
  calculateCorrelationMatrix(data: Record<string, number[]>): Record<string, Record<string, number>> {
    const tickers = Object.keys(data);
    const matrix: Record<string, Record<string, number>> = {};
    
    for (const ticker1 of tickers) {
      matrix[ticker1] = {};
      for (const ticker2 of tickers) {
        if (ticker1 === ticker2) {
          matrix[ticker1][ticker2] = 1.0; // Perfect correlation with itself
        } else {
          matrix[ticker1][ticker2] = this.calculatePearsonCorrelation(
            data[ticker1], 
            data[ticker2]
          );
        }
      }
    }
    
    return matrix;
  }

  /**
   * Interpret correlation coefficient
   */
  interpretCorrelation(correlation: number): {
    strength: string;
    direction: string;
    description: string;
  } {
    const abs = Math.abs(correlation);
    let strength: string;
    
    if (abs >= 0.8) strength = "Very Strong";
    else if (abs >= 0.6) strength = "Strong";
    else if (abs >= 0.4) strength = "Moderate";
    else if (abs >= 0.2) strength = "Weak";
    else strength = "Very Weak";
    
    const direction = correlation >= 0 ? "Positive" : "Negative";
    
    let description: string;
    if (abs >= 0.8) {
      description = direction === "Positive" 
        ? "These assets move very closely together in the same direction"
        : "These assets move very closely together in opposite directions";
    } else if (abs >= 0.6) {
      description = direction === "Positive"
        ? "These assets tend to move in the same direction"
        : "These assets tend to move in opposite directions";
    } else if (abs >= 0.4) {
      description = "There is a moderate relationship between these assets";
    } else if (abs >= 0.2) {
      description = "There is a weak relationship between these assets";
    } else {
      description = "These assets move largely independently of each other";
    }
    
    return { strength, direction, description };
  }
}

export const correlationUtils = new CorrelationUtils();
