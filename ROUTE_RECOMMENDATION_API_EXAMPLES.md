# Route Recommendation - API Examples & Test Data

## ML API Examples

### Example 1: Colombo to Kandy Route

#### Request
```bash
curl -X POST http://51.21.2.3:8000/suggest-route \
  -H "Content-Type: application/json" \
  -d '{
    "booking_date": "2026-02-24",
    "start_station": "CMB",
    "end_station": "KDY"
  }'
```

#### Response
```json
{
  "route": {
    "full_route": ["CMB", "NEG", "BRA", "KDY"]
  },
  "weather": {
    "weather_condition": "Clear",
    "recommendations": [
      "Weather is clear and favorable for transport.",
      "Optimal conditions for quick delivery.",
      "No delays expected due to weather.",
      "Safe to transport temperature-sensitive items.",
      "Estimated travel time: 2.5 hours"
    ]
  }
}
```

---

### Example 2: Colombo to Galle Route (Rainy)

#### Request
```bash
curl -X POST http://51.21.2.3:8000/suggest-route \
  -H "Content-Type: application/json" \
  -d '{
    "booking_date": "2026-02-25",
    "start_station": "CMB",
    "end_station": "GLE"
  }'
```

#### Response
```json
{
  "route": {
    "full_route": ["CMB", "MTR", "GLE"]
  },
  "weather": {
    "weather_condition": "Light Rain",
    "recommendations": [
      "Light rain expected on route.",
      "Recommend protective packaging for sensitive items.",
      "Expected minor delays due to weather.",
      "Possible travel time increase: 30-45 minutes.",
      "Ensure proper waterproofing of packages."
    ]
  }
}
```

---

### Example 3: Complex Route with Thunderstorm Warning

#### Request
```bash
curl -X POST http://51.21.2.3:8000/suggest-route \
  -H "Content-Type: application/json" \
  -d '{
    "booking_date": "2026-02-26",
    "start_station": "CMB",
    "end_station": "JFN"
  }'
```

#### Response
```json
{
  "route": {
    "full_route": ["CMB", "NEG", "MRT", "KDY", "KNL", "JFN"]
  },
  "weather": {
    "weather_condition": "Thunderstorm",
    "recommendations": [
      "⚠️ WEATHER ALERT: Thunderstorm warning on route.",
      "Consider postponing shipment if possible.",
      "Use heavy-duty protective packaging.",
      "Do NOT transport fragile or electronic items.",
      "Estimated travel time significantly delayed: +3-4 hours.",
      "Route may be closed due to safety concerns.",
      "Contact support for alternative routing options."
    ]
  }
}
```

---

### Example 4: Partial Cloudy Route

#### Request
```json
{
  "booking_date": "2026-02-27",
  "start_station": "KDY",
  "end_station": "MTR"
}
```

#### Response
```json
{
  "route": {
    "full_route": ["KDY", "NEG", "MTR"]
  },
  "weather": {
    "weather_condition": "Partly Cloudy",
    "recommendations": [
      "Mixed weather conditions expected.",
      "Generally favorable for transport.",
      "Some cloud cover may slow operations slightly.",
      "Standard packaging is acceptable.",
      "Estimated travel time: 1.5-2 hours."
    ]
  }
}
```

---

## Local API Examples

### Safety Analysis Examples

#### Example 1: High Safety Score

**Request:**
```json
{
  "source": "CMB",
  "destination": "KDY",
  "date": "2026-02-24",
  "time": "12:00",
  "parcelType": "DOCUMENT",
  "weight": 0.5
}
```

**Response:**
```json
{
  "safety_score": 85
}
```

**Frontend Effect:**
- Green toast notification
- Message: "This route is highly safe for your parcel!"

---

#### Example 2: Moderate Safety Score

**Request:**
```json
{
  "source": "CMB",
  "destination": "JFN",
  "date": "2026-02-25",
  "time": "12:00",
  "parcelType": "ELECTRONICS",
  "weight": 3.5
}
```

**Response:**
```json
{
  "safety_score": 68
}
```

**Frontend Effect:**
- Blue toast notification
- Message: "This route has moderate risk factors to consider."

---

#### Example 3: Low Safety Score

**Request:**
```json
{
  "source": "CMB",
  "destination": "JFN",
  "date": "2026-02-26",
  "time": "12:00",
  "parcelType": "FRAGILE",
  "weight": 5.2
}
```

**Response:**
```json
{
  "safety_score": 45
}
```

**Frontend Effect:**
- Orange toast notification
- Message: "This route has high risk factors. Consider alternatives."

---

## Test Data Sets

### Test Scenario 1: Happy Path - Clear Weather

```javascript
const testData1 = {
  formData: {
    senderName: "John Doe",
    senderAddress: "123 Main St, Colombo",
    senderNIC: "991234567V",
    senderMobile: "+94771234567",
    senderEmail: "john@example.com",
    startingDestination: "CMB",
    destination: "KDY",
    receiverName: "Jane Smith",
    receiverAddress: "456 Hill Rd, Kandy",
    receiverEmail: "jane@example.com",
    parcelType: "DOCUMENT",
    numberOfParcels: "1",
    date: "2026-02-24",
    weightInKg: "0.5",
    trainNumber: "T001",
  },
  expectedResponse: {
    route: { full_route: ["CMB", "NEG", "BRA", "KDY"] },
    weather: {
      weather_condition: "Clear",
      recommendations: [...],
    },
  },
  expectedSafetyScore: 85,
};
```

**Expected Results:**
✅ Recommendation modal opens  
✅ Route displays with 4 stations  
✅ Weather icon is sun (yellow)  
✅ Green success toast appears  

---

### Test Scenario 2: Rainy Weather

```javascript
const testData2 = {
  formData: {
    // ... same as above but
    date: "2026-02-25",
    parcelType: "PACKAGE",
    weightInKg: "2.5",
  },
  expectedResponse: {
    route: { full_route: ["CMB", "MTR", "GLE"] },
    weather: {
      weather_condition: "Moderate Rain",
      recommendations: [...],
    },
  },
  expectedSafetyScore: 62,
};
```

**Expected Results:**
✅ Modal opens  
✅ Weather icon is rain (blue)  
✅ Blue caution toast appears  

---

### Test Scenario 3: Long Distance Route

```javascript
const testData3 = {
  formData: {
    // ... same as above but
    destination: "JFN",  // Long distance
    date: "2026-02-26",
    weightInKg: "4.0",
  },
  expectedResponse: {
    route: { 
      full_route: ["CMB", "NEG", "MRT", "KDY", "KNL", "JFN"] 
    },
    weather: {
      weather_condition: "Thunderstorm",
      recommendations: [...],
    },
  },
  expectedSafetyScore: 35,  // Low due to long distance + weather
};
```

**Expected Results:**
✅ Modal opens  
✅ 6-station route displayed  
✅ Weather icon is thunderbolt (yellow)  
✅ Orange warning toast appears  

---

## Mock API Response Generator (for Testing)

```typescript
// utils/mockRecommendationData.ts

export function generateMockRecommendation(
  source: string,
  destination: string,
  date: string
): RecommendationResponse {
  // Simulate different responses based on date
  const dayOfWeek = new Date(date).getDay();
  
  const weatherConditions: WeatherCondition[] = [
    "Clear",
    "Partly Cloudy",
    "Cloudy",
    "Light Rain",
    "Moderate Rain",
    "Heavy Rain",
    "Thunderstorm",
  ];
  
  // Deterministic but varied based on date and route
  const weatherIndex = 
    (source.charCodeAt(0) + destination.charCodeAt(0) + dayOfWeek) % 
    weatherConditions.length;
  
  const weather = weatherConditions[weatherIndex];
  
  const recommendationsByWeather: Record<WeatherCondition, string[]> = {
    Clear: [
      "Weather is clear and favorable for transport.",
      "Optimal conditions for quick delivery.",
      "No delays expected due to weather.",
    ],
    "Partly Cloudy": [
      "Mixed weather conditions expected.",
      "Generally favorable for transport.",
      "Minimal delays anticipated.",
    ],
    Cloudy: [
      "Cloud cover present.",
      "Standard transport conditions.",
      "No significant delays expected.",
    ],
    "Light Rain": [
      "Light rain expected.",
      "Recommend protective packaging.",
      "Minor delays possible.",
    ],
    "Moderate Rain": [
      "Moderate rain on route.",
      "Use heavy-duty packaging.",
      "30-45 minute delays expected.",
    ],
    "Heavy Rain": [
      "Heavy rain expected.",
      "Significant packaging protection needed.",
      "2+ hour delays likely.",
    ],
    Thunderstorm: [
      "⚠️ Thunderstorm warning!",
      "Consider postponing delivery.",
      "Do NOT transport fragile items.",
    ],
  };
  
  return {
    route: {
      full_route: [source, "NEG", "MTR", destination],
    },
    weather: {
      weather_condition: weather,
      recommendations: recommendationsByWeather[weather],
    },
  };
}

export function generateMockSafetyScore(
  weight: number,
  distance: number,
  weather: string
): number {
  let baseScore = 80;
  
  // Weight penalty
  if (weight > 5) baseScore -= 15;
  else if (weight > 3) baseScore -= 10;
  
  // Distance penalty
  if (distance > 200) baseScore -= 10;
  else if (distance > 100) baseScore -= 5;
  
  // Weather penalty
  const weatherPenalties: Record<string, number> = {
    Clear: 0,
    "Partly Cloudy": -2,
    Cloudy: -5,
    "Light Rain": -10,
    "Moderate Rain": -20,
    "Heavy Rain": -30,
    Thunderstorm: -45,
  };
  
  baseScore += weatherPenalties[weather] || 0;
  
  // Ensure 0-100 range
  return Math.max(0, Math.min(100, baseScore));
}
```

---

## Postman Collection Example

```json
{
  "info": {
    "name": "Route Recommendation API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/"
  },
  "item": [
    {
      "name": "Suggest Route - Clear Weather",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"booking_date\": \"2026-02-24\",\n  \"start_station\": \"CMB\",\n  \"end_station\": \"KDY\"\n}"
        },
        "url": {
          "raw": "http://51.21.2.3:8000/suggest-route",
          "protocol": "http",
          "host": ["51", "21", "2", "3"],
          "port": "8000",
          "path": ["suggest-route"]
        }
      }
    },
    {
      "name": "Suggest Route - Rainy Weather",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"booking_date\": \"2026-02-25\",\n  \"start_station\": \"CMB\",\n  \"end_station\": \"GLE\"\n}"
        },
        "url": {
          "raw": "http://51.21.2.3:8000/suggest-route",
          "protocol": "http",
          "host": ["51", "21", "2", "3"],
          "port": "8000",
          "path": ["suggest-route"]
        }
      }
    },
    {
      "name": "Analyze Route Safety",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"source\": \"CMB\",\n  \"destination\": \"KDY\",\n  \"date\": \"2026-02-24\",\n  \"time\": \"12:00\",\n  \"parcelType\": \"DOCUMENT\",\n  \"weight\": 0.5\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/analyze-route",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "analyze-route"]
        }
      }
    }
  ]
}
```

---

## Station Codes Reference

```typescript
const stationCodes = {
  CMB: "Colombo",
  NEG: "Negombo",
  BRA: "Brawara",
  KDY: "Kandy",
  MTR: "Matara",
  GLE: "Galle",
  KNL: "Kurunegala",
  JFN: "Jaffna",
  TRM: "Trincomalee",
  BTL: "Batticaloa",
  RAD: "Ratnapura",
  BDL: "Badulla",
};
```

---

## Parcel Type Categories

```typescript
const parcelTypes = [
  {
    code: "DOCUMENT",
    name: "Document",
    maxWeight: 2,
    fragile: false,
    riskFactor: 0.5,
  },
  {
    code: "PACKAGE",
    name: "General Package",
    maxWeight: 50,
    fragile: false,
    riskFactor: 1,
  },
  {
    code: "FRAGILE",
    name: "Fragile Items",
    maxWeight: 10,
    fragile: true,
    riskFactor: 1.8,
  },
  {
    code: "ELECTRONICS",
    name: "Electronics",
    maxWeight: 20,
    fragile: true,
    riskFactor: 1.5,
  },
  {
    code: "PERISHABLE",
    name: "Perishable",
    maxWeight: 30,
    fragile: true,
    riskFactor: 2,
  },
];
```

---

## Error Responses to Handle

### ML API Errors

```json
// 400 Bad Request
{
  "error": "Invalid station code",
  "message": "Start station CMB1 does not exist"
}

// 500 Server Error
{
  "error": "Internal server error",
  "message": "Failed to fetch weather data"
}

// 503 Service Unavailable
{
  "error": "Service unavailable",
  "message": "ML model is currently training, please try again later"
}
```

### Network Error Example

```typescript
const handleApiError = (error: unknown) => {
  if (error instanceof TypeError) {
    // Network error
    return "Network connection failed. Please check your internet.";
  } else if (error instanceof SyntaxError) {
    // JSON parse error
    return "Received invalid response from server.";
  } else {
    return "An unexpected error occurred.";
  }
};
```

---

## Integration Test Script

```typescript
// __tests__/recommendationIntegration.test.ts

describe("Route Recommendation Feature", () => {
  describe("Happy Path Tests", () => {
    test("should fetch and display recommendation for clear weather", async () => {
      // Setup
      const response = await suggestRoute({
        booking_date: "2026-02-24",
        start_station: "CMB",
        end_station: "KDY",
      });

      // Assert
      expect(response).toHaveProperty("route");
      expect(response).toHaveProperty("weather");
      expect(Array.isArray(response.route.full_route)).toBe(true);
      expect(response.route.full_route.length).toBeGreaterThan(0);
      expect(["Clear", "Cloudy", "Rain"]).toContain(
        response.weather.weather_condition
      );
      expect(Array.isArray(response.weather.recommendations)).toBe(true);
    });

    test("should analyze route safety", async () => {
      const response = await analyzeRoute({
        source: "CMB",
        destination: "KDY",
        date: "2026-02-24",
        time: "12:00",
        parcelType: "PACKAGE",
        weight: 2.5,
      });

      expect(response).toHaveProperty("safety_score");
      expect(typeof response.safety_score).toBe("number");
      expect(response.safety_score).toBeGreaterThanOrEqual(0);
      expect(response.safety_score).toBeLessThanOrEqual(100);
    });
  });

  describe("Error Handling Tests", () => {
    test("should handle invalid station code", async () => {
      await expect(
        suggestRoute({
          booking_date: "2026-02-24",
          start_station: "INVALID",
          end_station: "KDY",
        })
      ).rejects.toThrow();
    });

    test("should handle network errors", async () => {
      // Mock fetch to simulate network error
      jest.spyOn(global, "fetch").mockRejectedValueOnce(new TypeError());

      await expect(
        suggestRoute({
          booking_date: "2026-02-24",
          start_station: "CMB",
          end_station: "KDY",
        })
      ).rejects.toThrow();
    });
  });
});
```

---

## Summary

This document provides:
- ✅ 4 complete API request/response examples
- ✅ 3 test data scenarios
- ✅ Mock data generator for testing
- ✅ Postman collection for manual testing
- ✅ Station and parcel type references
- ✅ Error response examples
- ✅ Integration test template

Use these examples to:
1. Test your API endpoints
2. Create comprehensive test suites
3. Generate mock data for development
4. Understand expected response formats
5. Debug integration issues
