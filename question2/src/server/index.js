
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const TIMEOUT_MS = 500;

// In-memory storage for numbers window
let numbersWindow = [];

// API endpoints mapping
const API_ENDPOINTS = {
  'p': 'http://20.244.56.144/evaluation-service/primes',
  'f': 'http://20.244.56.144/evaluation-service/fibo', 
  'e': 'http://20.244.56.144/evaluation-service/even',
  'r': 'http://20.244.56.144/evaluation-service/rand'
};

// Middleware
app.use(cors());
app.use(express.json());

// Utility function to fetch numbers with timeout
async function fetchNumbersWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.numbers || [];
  } catch (error) {
    clearTimeout(timeoutId);
    console.log(`Error fetching from ${url}:`, error.message);
    return [];
  }
}

// Utility function to calculate average
function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return parseFloat((sum / numbers.length).toFixed(2));
}

// Main endpoint
app.get('/numbers/:numberid', async (req, res) => {
  const startTime = Date.now();
  const { numberid } = req.params;
  
  // Validate number ID
  if (!API_ENDPOINTS[numberid]) {
    return res.status(400).json({
      error: 'Invalid number ID. Use p (prime), f (fibonacci), e (even), or r (random)'
    });
  }
  
  // Store previous state
  const windowPrevState = [...numbersWindow];
  
  try {
    // Fetch numbers from third-party API
    const fetchedNumbers = await fetchNumbersWithTimeout(API_ENDPOINTS[numberid]);
    console.log(`Fetched numbers for ${numberid}:`, fetchedNumbers);
    
    // Filter unique numbers and add to window
    const uniqueNewNumbers = fetchedNumbers.filter(num => !numbersWindow.includes(num));
    
    // Add unique numbers to window, maintaining window size
    uniqueNewNumbers.forEach(num => {
      if (numbersWindow.length >= WINDOW_SIZE) {
        numbersWindow.shift(); // Remove oldest
      }
      numbersWindow.push(num);
    });
    
    // Calculate average
    const avg = calculateAverage(numbersWindow);
    
    // Prepare response
    const response = {
      windowPrevState,
      windowCurrState: [...numbersWindow],
      numbers: fetchedNumbers,
      avg
    };
    
    // Ensure response time is under 500ms
    const responseTime = Date.now() - startTime;
    console.log(`Response time: ${responseTime}ms`);
    
    res.json(response);
    
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: 'Internal server error',
      windowPrevState,
      windowCurrState: [...numbersWindow],
      numbers: [],
      avg: calculateAverage(numbersWindow)
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Reset window endpoint (for testing)
app.post('/reset', (req, res) => {
  numbersWindow = [];
  res.json({ message: 'Window reset successfully' });
});

app.listen(PORT, () => {
  console.log(`Average Calculator Microservice running on http://localhost:${PORT}`);
  console.log(`Window size: ${WINDOW_SIZE}`);
  console.log(`Timeout: ${TIMEOUT_MS}ms`);
});

module.exports = app;
