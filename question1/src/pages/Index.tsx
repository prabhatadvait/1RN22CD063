
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceViewer } from "@/components/PriceViewer";
import { CorrelationMatrix } from "@/components/CorrelationMatrix";
import { StockSelector } from "@/components/StockSelector";
import { TrendingUp, BarChart3, Building2 } from "lucide-react";

const Index = () => {
  const [selectedStock, setSelectedStock] = useState<{ticker: string, name: string} | null>(null);

  const handleStockSelect = (ticker: string, name: string) => {
    setSelectedStock({ ticker, name });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <TrendingUp className="text-blue-600" />
            Stock Market Analytics Hub
          </h1>
          <p className="text-lg text-gray-600">
            Real-time stock analysis and correlation insights powered by live market data
          </p>
        </div>

        <Tabs defaultValue="selector" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
            <TabsTrigger value="selector" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Stocks
            </TabsTrigger>
            <TabsTrigger value="prices" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Live Prices
            </TabsTrigger>
            <TabsTrigger value="correlation" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Correlation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="selector">
            <StockSelector onStockSelect={handleStockSelect} selectedTicker={selectedStock?.ticker} />
          </TabsContent>

          <TabsContent value="prices">
            {selectedStock ? (
              <PriceViewer ticker={selectedStock.ticker} companyName={selectedStock.name} />
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Stock Selected</h3>
                <p className="text-gray-500">Please select a stock from the Stocks tab first.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="correlation">
            <CorrelationMatrix />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
