
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calculator, TrendingUp, TrendingDown } from "lucide-react";
import { stockAPI } from "@/utils/stockAPI";
import { correlationUtils } from "@/utils/correlationUtils";
import { toast } from "sonner";

interface CorrelationResult {
  ticker1: string;
  ticker2: string;
  correlation: number;
  minutes: number;
  timestamp: string;
}

export const CorrelationMatrix = () => {
  const [availableStocks, setAvailableStocks] = useState<Record<string, string>>({});
  const [ticker1, setTicker1] = useState("");
  const [ticker2, setTicker2] = useState("");
  const [minutes, setMinutes] = useState(50);
  const [loading, setLoading] = useState(false);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [result, setResult] = useState<CorrelationResult | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const stocks = await stockAPI.getAllStocks();
        setAvailableStocks(stocks);
        
        // Set default values if available
        const stockTickers = Object.keys(stocks);
        if (stockTickers.length >= 2) {
          setTicker1(stockTickers[0]);
          setTicker2(stockTickers[1]);
        }
      } catch (error) {
        console.error("Error fetching stocks:", error);
        toast.error("Failed to load available stocks");
      } finally {
        setLoadingStocks(false);
      }
    };

    fetchStocks();
  }, []);

  const handleCalculateCorrelation = async () => {
    if (!ticker1 || !ticker2) {
      toast.error("Please select both stock symbols");
      return;
    }

    if (ticker1 === ticker2) {
      toast.error("Please select different stock symbols");
      return;
    }

    if (minutes < 10 || minutes > 100) {
      toast.error("Minutes must be between 10 and 100");
      return;
    }

    setLoading(true);
    try {
      const correlationData = await stockAPI.getCorrelation(ticker1, ticker2, minutes);

      const correlationResult: CorrelationResult = {
        ticker1: ticker1,
        ticker2: ticker2,
        correlation: correlationData.correlation,
        minutes,
        timestamp: new Date().toISOString()
      };

      setResult(correlationResult);
      toast.success("Correlation calculated successfully!");
    } catch (error) {
      console.error("Error calculating correlation:", error);
      toast.error("Failed to calculate correlation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCorrelationDescription = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return "Very Strong";
    if (abs >= 0.6) return "Strong";
    if (abs >= 0.4) return "Moderate";
    if (abs >= 0.2) return "Weak";
    return "Very Weak";
  };

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return "bg-purple-100 text-purple-800 border-purple-200";
    if (abs >= 0.6) return "bg-blue-100 text-blue-800 border-blue-200";
    if (abs >= 0.4) return "bg-green-100 text-green-800 border-green-200";
    if (abs >= 0.2) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loadingStocks) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-pulse">
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calculator className="text-blue-600" />
            Stock Correlation Calculator
          </CardTitle>
          <p className="text-gray-600">
            Calculate the Pearson correlation coefficient between two stocks using real market data
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ticker1">First Stock</Label>
              <Select value={ticker1} onValueChange={setTicker1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first stock" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(availableStocks).map(([ticker, name]) => (
                    <SelectItem key={ticker} value={ticker}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{ticker}</span>
                        <span className="text-sm text-gray-600">- {name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ticker2">Second Stock</Label>
              <Select value={ticker2} onValueChange={setTicker2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second stock" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(availableStocks).map(([ticker, name]) => (
                    <SelectItem key={ticker} value={ticker}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{ticker}</span>
                        <span className="text-sm text-gray-600">- {name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minutes">Time Period (Minutes)</Label>
              <Input
                id="minutes"
                type="number"
                min="10"
                max="100"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 50)}
                className="text-center"
              />
            </div>
          </div>

          <Button 
            onClick={handleCalculateCorrelation}
            disabled={loading || !ticker1 || !ticker2}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Correlation
              </>
            )}
          </Button>

          {result && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="text-blue-600" />
                  Correlation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-sm text-gray-600 mb-1">Stock Pair</div>
                    <div className="text-xl font-bold text-gray-900">
                      {result.ticker1} vs {result.ticker2}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {availableStocks[result.ticker1]} vs {availableStocks[result.ticker2]}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <div className="text-sm text-gray-600 mb-1">Time Period</div>
                    <div className="text-xl font-bold text-gray-900">
                      {result.minutes} minutes
                    </div>
                  </div>
                </div>

                <div className="text-center p-6 bg-white rounded-lg border">
                  <div className="text-sm text-gray-600 mb-2">Pearson Correlation Coefficient</div>
                  <div className="text-4xl font-bold text-gray-900 mb-3">
                    {result.correlation.toFixed(4)}
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 mb-3">
                    {result.correlation >= 0 ? (
                      <TrendingUp className="text-green-600" />
                    ) : (
                      <TrendingDown className="text-red-600" />
                    )}
                    <Badge className={getCorrelationColor(result.correlation)}>
                      {getCorrelationDescription(result.correlation)} {result.correlation >= 0 ? "Positive" : "Negative"}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600">
                    Calculated at {new Date(result.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Interpretation:</h4>
                  <p className="text-sm text-blue-800">
                    {Math.abs(result.correlation) >= 0.8 && (
                      "Very strong correlation - these stocks move very similarly."
                    )}
                    {Math.abs(result.correlation) >= 0.6 && Math.abs(result.correlation) < 0.8 && (
                      "Strong correlation - these stocks tend to move in the same direction."
                    )}
                    {Math.abs(result.correlation) >= 0.4 && Math.abs(result.correlation) < 0.6 && (
                      "Moderate correlation - some relationship exists between these stocks."
                    )}
                    {Math.abs(result.correlation) >= 0.2 && Math.abs(result.correlation) < 0.4 && (
                      "Weak correlation - limited relationship between these stocks."
                    )}
                    {Math.abs(result.correlation) < 0.2 && (
                      "Very weak correlation - these stocks move largely independently."
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
