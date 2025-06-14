
export interface ApiResponse {
  windowPrevState: number[];
  windowCurrState: number[];
  numbers: number[];
  avg: number;
}

export const NUMBER_TYPES = {
  p: 'Prime Numbers',
  f: 'Fibonacci Numbers', 
  e: 'Even Numbers',
  r: 'Random Numbers'
} as const;

export type NumberType = keyof typeof NUMBER_TYPES;

export const fetchNumbers = async (numberType: NumberType): Promise<ApiResponse> => {
  const response = await fetch(`http://localhost:9876/numbers/${numberType}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const resetWindow = async (): Promise<void> => {
  const response = await fetch('http://localhost:9876/reset', {
    method: 'POST'
  });
  
  if (!response.ok) {
    throw new Error('Failed to reset window');
  }
};

export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:9876/health');
    return response.ok;
  } catch {
    return false;
  }
};
