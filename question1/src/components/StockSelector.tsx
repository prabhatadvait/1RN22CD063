
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Building2 } from "lucide-react";
import { stockAPI } from "@/utils/stockAPI";

interface StockSelectorProps {
  onStockSelect: (ticker: string, name: string) => void;
  selectedTicker?: string;
}

export const StockSelector = ({ onStockSelect, selectedTicker }: StockSelectorProps) => {
  const [stocks, setStocks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        setError(null);
        const stocksData = await stockAPI.getAllStocks();
        setStocks(stocksData);
        console.log("Available stocks:", stocksData);
      } catch (err) {
        console.error("Error fetching stocks:", err);
        setError("Failed to load available stocks");
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  const handleStockChange = (ticker: string) => {
    const companyName = stocks[ticker] || ticker;
    onStockSelect(ticker, companyName);
  };

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="text-blue-600" />
            Select Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="text-blue-600" />
            Select Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="destructive">{error}</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="text-blue-600" />
          Select Stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select onValueChange={handleStockChange} value={selectedTicker}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a stock to analyze" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(stocks).map(([ticker, name]) => (
              <SelectItem key={ticker} value={ticker}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-mono font-bold">{ticker}</span>
                  <span className="text-sm text-gray-600">- {name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedTicker && (
          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Selected:</strong> {selectedTicker} - {stocks[selectedTicker]}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
