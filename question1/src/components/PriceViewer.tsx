
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stockAPI } from "@/utils/stockAPI";
import { StockPrice } from "@/types/stock";

interface PriceViewerProps {
  ticker: string;
  companyName: string;
}

export const PriceViewer = ({ ticker, companyName }: PriceViewerProps) => {
  const [currentPrice, setCurrentPrice] = useState<StockPrice | null>(null);
  const [historicalData, setHistoricalData] = useState<StockPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const [current, historical] = await Promise.all([
        stockAPI.getCurrentPrice(ticker),
        stockAPI.getLastNMinutes(ticker, 50)
      ]);
      setCurrentPrice(current);
      setHistoricalData(historical);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError("Failed to fetch stock data. Please try again.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };

    if (ticker) {
      loadData();
    }
  }, [ticker]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-12 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <Badge variant="destructive" className="mb-4">{error}</Badge>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const priceChange = currentPrice && historicalData.length > 1 
    ? currentPrice.price - historicalData[historicalData.length - 2].price 
    : 0;
  
  const priceChangePercent = currentPrice && historicalData.length > 1
    ? (priceChange / historicalData[historicalData.length - 2].price) * 100
    : 0;

  const isPositive = priceChange >= 0;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="text-green-600" />
            {companyName} ({ticker})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPrice && (
            <>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${currentPrice.price.toFixed(2)}
                </span>
                <div className="flex items-center gap-2">
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                  <Badge 
                    variant={isPositive ? "default" : "destructive"}
                    className={isPositive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                  >
                    {isPositive ? "+" : ""}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Clock className="w-4 h-4" />
                Last updated: {new Date(currentPrice.timestamp).toLocaleString()}
              </div>
              
              <Button onClick={handleRefresh} disabled={refreshing} className="w-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Price'}
              </Button>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Market Status</div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Live Trading
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <LineChart className="text-blue-600" />
            Price History (Last 50 Minutes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historicalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                  stroke="#666"
                  fontSize={12}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, stroke: '#2563eb', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              No historical data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
