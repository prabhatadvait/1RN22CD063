
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Server, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchNumbers, resetWindow, checkServerHealth, NUMBER_TYPES, NumberType, ApiResponse } from '@/utils/apiUtils';

const CalculatorService = () => {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    const isHealthy = await checkServerHealth();
    setServerStatus(isHealthy);
    
    if (!isHealthy) {
      toast({
        title: "Server Offline",
        description: "Please start the microservice server on port 9876",
        variant: "destructive",
      });
    }
  };

  const handleFetchNumbers = async (numberType: NumberType) => {
    setLoading(true);
    try {
      const startTime = Date.now();
      const result = await fetchNumbers(numberType);
      const responseTime = Date.now() - startTime;
      
      setResponse(result);
      
      toast({
        title: "Success",
        description: `Fetched ${NUMBER_TYPES[numberType]} in ${responseTime}ms`,
      });
    } catch (error) {
      console.error('Error fetching numbers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch numbers. Check if server is running.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetWindow();
      setResponse(null);
      toast({
        title: "Reset Complete",
        description: "Number window has been cleared",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Could not reset the window",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Average Calculator Microservice</h1>
        <p className="text-muted-foreground">
          REST API that fetches qualified numbers and maintains a sliding window average
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Server className="h-4 w-4" />
          <span className="text-sm">Status:</span>
          <Badge variant={serverStatus ? "default" : "destructive"}>
            {serverStatus ? "Online" : "Offline"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={checkHealth}
            className="ml-2"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Number Type Selection</CardTitle>
          <CardDescription>
            Choose a qualified number ID to fetch from the third-party API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(NUMBER_TYPES).map(([key, label]) => (
              <Button
                key={key}
                onClick={() => handleFetchNumbers(key as NumberType)}
                disabled={loading || !serverStatus}
                variant="outline"
                className="h-20 flex flex-col gap-2"
              >
                <span className="font-bold text-lg">{key.toUpperCase()}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </Button>
            ))}
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button
              onClick={handleReset}
              variant="secondary"
              disabled={loading || !serverStatus}
            >
              Reset Window
            </Button>
          </div>
        </CardContent>
      </Card>

      {!serverStatus && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Server Not Running</p>
                <p className="text-sm">
                  Please start the microservice server by running: <code>node src/server/index.js</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
            <CardDescription>
              Window size: 10 | Response format as specified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Previous Window State</h4>
              <div className="bg-muted p-3 rounded text-sm">
                [{response.windowPrevState.join(', ')}]
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Current Window State</h4>
              <div className="bg-muted p-3 rounded text-sm">
                [{response.windowCurrState.join(', ')}]
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Fetched Numbers</h4>
              <div className="bg-muted p-3 rounded text-sm">
                [{response.numbers.join(', ')}]
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Average</h4>
              <div className="text-2xl font-bold text-primary">
                {response.avg}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">JSON Response</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalculatorService;
