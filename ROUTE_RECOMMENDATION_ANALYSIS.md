# Route Recommendation Feature - Detailed Analysis Report

**Reference Project:** `rail-parcel-fe`  
**Analysis Date:** February 23, 2026  
**Feature Location:** Home - Book Parcel page

---

## Executive Summary

The RouteRecommendation feature is a sophisticated ML-powered route suggestion system integrated into the parcel booking flow. It provides intelligent route recommendations based on booking date, origin station, and destination station by consuming an external Python ML API.

---

## 1. Feature Integration & UI Location

### Page/Component
- **File:** `src/app/home/book-parcel/page.tsx`
- **Component Type:** React Server Component (Next.js App Router)
- **UI Element:** Modal dialog displaying recommendation results
- **Trigger:** "Get Route Recommendation" button (appears after date selection)

### User Flow
1. User fills in form (at minimum: source station, destination station, date)
2. After selecting a date, a "Get Route Recommendation" button appears
3. Clicking the button triggers the recommendation fetch
4. A modal displays with route details, weather forecast, and recommendations

---

## 2. ML API Endpoint Details

### Endpoint Configuration

**URL:** `http://51.21.2.3:8000/suggest-route`  
**Method:** `POST`  
**Protocol:** HTTP (not HTTPS)  
**Port:** 8000  
**Base Server:** `51.21.2.3` (External Python/ML server)

### Request Structure

```typescript
// Request Method
const response = await fetch("http://51.21.2.3:8000/suggest-route", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    booking_date: formData.date,
    start_station: formData.startingDestination,
    end_station: formData.destination,
  }),
});
```

**Request Parameters:**

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `booking_date` | string | "2026-02-24" | Date in YYYY-MM-DD format |
| `start_station` | string | "CMB" | Station code for origin |
| `end_station` | string | "KDY" | Station code for destination |

**Content-Type:** `application/json`

**Authentication:** None (Public endpoint)

---

## 3. Response Structure

### Response Format

```typescript
interface RecommendationResponse {
  route: {
    full_route: string[];  // Array of station codes along the route
  };
  weather: {
    weather_condition: string;  // e.g., "Clear", "Partly Cloudy", "Light Rain"
    recommendations: string[];  // Array of recommendation strings
  };
}
```

### Full Response Example

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
      "No delays expected due to weather."
    ]
  }
}
```

### Data Fields

| Field | Type | Purpose |
|-------|------|---------|
| `route.full_route` | string[] | Complete ordered list of station codes from start to destination |
| `weather.weather_condition` | string | Current/forecasted weather condition for the route |
| `weather.recommendations` | string[] | List of actionable recommendations based on weather and route data |

### Possible Weather Conditions

The system handles these weather conditions:
- `"Clear"` - Ideal conditions
- `"Partly Cloudy"` - Generally good conditions
- `"Cloudy"` - Moderate conditions
- `"Light Rain"` - Caution recommended
- `"Moderate Rain"` - Higher risk
- `"Heavy Rain"` - Significant delays expected
- `"Thunderstorm"` - Dangerous conditions

---

## 4. Route Analysis API (Secondary Feature)

### Purpose
Safety analysis of the selected route before booking

### Endpoint Configuration

**URL:** `/api/analyze-route` (Local Next.js API route)  
**Method:** `POST`  
**Base:** Same frontend server

### Request Structure

```typescript
const response = await fetch("/api/analyze-route", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    source: formData.startingDestination || "Colombo",
    destination: formData.destination,
    date: formData.date,
    time: "12:00",
    parcelType: formData.parcelType,
    weight: parseFloat(formData.weightInKg),
  }),
});
```

**Request Parameters:**

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `source` | string | "CMB" | Source station code |
| `destination` | string | "KDY" | Destination station code |
| `date` | string | "2026-02-24" | Booking date |
| `time` | string | "12:00" | Time of booking (fixed) |
| `parcelType` | string | "PACKAGE" | Type of parcel |
| `weight` | number | 2.5 | Weight in kilograms |

### Response Structure

```typescript
interface SafetyAnalysisResponse {
  safety_score: number;  // 0-100 scale
  // Additional fields as needed
}
```

**Scoring:**
- `>= 80`: Highly safe route
- `>= 60 && < 80`: Moderate risk
- `< 60`: High risk - consider alternatives

---

## 5. State Management & Variables

### Component State

```typescript
// Recommendation state
const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
const [showRecommendationModal, setShowRecommendationModal] = useState(false);
const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
const [showRecommendationButton, setShowRecommendationButton] = useState(false);

// Safety analysis state
const [safetyPrediction, setSafetyPrediction] = useState<SafetyAnalysisResponse | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);
```

### Form Data Dependencies

The recommendation feature depends on these form fields:
- `formData.date` - Booking date (triggers button visibility)
- `formData.startingDestination` - Source station
- `formData.destination` - Destination station

---

## 6. UI/UX Implementation Details

### Recommendation Modal Display

**Location:** Modal overlay (z-index: 50)

**Components Displayed:**

1. **Header**
   - Title: "Route Recommendation"
   - Close button (X)

2. **Route Details Section**
   - Title: "Route Details"
   - Visual flow: Station badges with arrow separators
   - Scrollable horizontal layout for long routes
   - CSS: `flex items-center justify-start space-x-2`

3. **Weather Forecast Section**
   - Title: "Weather Forecast"
   - Weather icon (SVG) - varies by condition
   - Weather condition text (centered)
   - Icons included for: Clear, Partly Cloudy, Cloudy, Light/Moderate/Heavy Rain, Thunderstorm

4. **Recommendations Section**
   - Title: "Recommendations"
   - List of bullet points with checkmark icons
   - Each recommendation is a separate item

5. **Close Button**
   - Blue button at bottom: `bg-[#1a73e8] hover:bg-[#1557b0]`

### Button States

**"Get Route Recommendation" Button:**
- **Visible:** Only after date is selected
- **Normal State:** Blue background, enabled
- **Loading State:** 
  - Disabled
  - Shows spinning loader animation
  - Text: "Getting Recommendation..."
- **Location:** Below date input field

### Error Handling

```typescript
// Toast notification on error
toast.error("Failed to get route recommendation. Please try again.");
```

---

## 7. Integration Architecture

### API Call Flow

```
User clicks "Get Route Recommendation"
    ↓
fetchRecommendation() function called
    ↓
POST to http://51.21.2.3:8000/suggest-route
    ↓
ML Server processes request
    ↓
Returns route + weather + recommendations
    ↓
Response stored in state
    ↓
Modal displayed with data
```

### Error Handling Flow

```
API Request
    ├─ Success (200)
    │   └─ Store recommendation
    │   └─ Show modal
    │
    └─ Failure
        └─ Log error
        └─ Show toast notification
        └─ Maintain button state
```

---

## 8. Secondary Feature: Route Safety Analysis

### Function: `analyzeSafety(formData)`

**Triggered:** Automatically when form data changes (called in handleChange)

**Purpose:** Provide real-time safety scoring of the selected route

**Response Handling:**

```
Safety Score >= 80
    ↓
Success toast: "This route is highly safe for your parcel!"

Safety Score >= 60 && < 80
    ↓
Custom toast: "This route has moderate risk factors to consider."

Safety Score < 60
    ↓
Warning toast: "This route has high risk factors. Consider alternatives."
```

---

## 9. Data Types & Interfaces

### Form Data Structure

```typescript
interface FormData {
  senderName: string;
  senderAddress: string;
  senderNIC: string;
  senderMobile: string;
  senderEmail: string;
  startingDestination: string;      // Required for recommendation
  destination: string;              // Required for recommendation
  receiverName: string;
  receiverAddress: string;
  receiverEmail: string;
  parcelType: string;
  numberOfParcels: string;
  date: string;                      // Required for recommendation
  weightInKg: string;
  trainNumber: string;
}
```

### Recommendation Response Type

```typescript
interface RecommendationResponse {
  route: {
    full_route: string[];
  };
  weather: {
    weather_condition: string;
    recommendations: string[];
  };
}
```

---

## 10. Network Configuration

### External Services

| Service | Endpoint | Purpose | Protocol |
|---------|----------|---------|----------|
| ML Engine | `http://51.21.2.3:8000` | Route recommendations | HTTP |
| Backend API | `http://51.21.2.3:8082` | Parcel booking & station data | HTTP |

### CORS Considerations

- Direct fetch calls to ML API (port 8000)
- May require CORS headers on ML server
- No explicit CORS handling in frontend code

---

## 11. Key Implementation Features

### 1. Smart Button Visibility
- Button only appears after a date is selected
- Prevents incomplete requests

### 2. Loading States
- Spinner animation during API call
- Button disabled during loading
- Loading text provides user feedback

### 3. Modal Management
- Independent state for modal visibility
- Can be closed independently of form
- Persists recommendation data until closed

### 4. Weather Icon Mapping
- Dynamic SVG icons based on weather condition
- Color-coded for visual clarity
- Responsive sizing (w-12 h-12)

### 5. Toast Notifications
- Multiple toast types: success, error, custom
- Styled with custom colors and borders
- Dark theme (bg-[#1F2937])

---

## 12. Implementation Checklist for Your Project

- [ ] Create ML service endpoint at `http://<your-ml-server>:8000/suggest-route`
- [ ] Implement `/api/analyze-route` local API endpoint
- [ ] Add recommendation state variables to book parcel component
- [ ] Implement `fetchRecommendation()` function
- [ ] Implement `analyzeSafety()` function
- [ ] Create recommendation modal UI component
- [ ] Add weather icon SVG components
- [ ] Style modal with dark theme colors
- [ ] Add loading spinner animation
- [ ] Implement toast notification system
- [ ] Update form to include recommendation button
- [ ] Test with actual ML API endpoint
- [ ] Handle error cases and edge cases
- [ ] Add input validation for required fields

---

## 13. Code Snippets for Reference

### Function: fetchRecommendation

```typescript
const fetchRecommendation = async () => {
  try {
    setIsLoadingRecommendation(true);
    const response = await fetch("http://51.21.2.3:8000/suggest-route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_date: formData.date,
        start_station: formData.startingDestination,
        end_station: formData.destination,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recommendation");
    }

    const data = await response.json();
    setRecommendation(data);
    setShowRecommendationModal(true);
    setShowRecommendationButton(false);
  } catch (error) {
    console.error("Error fetching recommendation:", error);
    toast.error("Failed to get route recommendation. Please try again.");
  } finally {
    setIsLoadingRecommendation(false);
  }
};
```

### Function: analyzeSafety

```typescript
const analyzeSafety = async (formData: FormData) => {
  setIsAnalyzing(true);
  try {
    const response = await fetch("/api/analyze-route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: formData.startingDestination || "Colombo",
        destination: formData.destination,
        date: formData.date,
        time: "12:00",
        parcelType: formData.parcelType,
        weight: parseFloat(formData.weightInKg),
      }),
    });

    const prediction = await response.json();
    setSafetyPrediction(prediction);

    if (prediction.safety_score >= 80) {
      toast.success("This route is highly safe for your parcel!");
    } else if (prediction.safety_score >= 60) {
      toast.custom((t) => (
        <div className={`${t.visible ? "animate-enter" : "animate-leave"} ...`}>
          This route has moderate risk factors to consider.
        </div>
      ));
    } else {
      toast.custom((t) => (
        <div className={`${t.visible ? "animate-enter" : "animate-leave"} ...`}>
          This route has high risk factors. Consider alternatives.
        </div>
      ));
    }
  } catch (error) {
    toast.error("Failed to analyze route safety. Please try again.");
  } finally {
    setIsAnalyzing(false);
  }
};
```

---

## 14. Testing Recommendations

### Unit Tests
- Test recommendation fetch function with mock API
- Test safety analysis with various score levels
- Test error handling and toast notifications

### Integration Tests
- Test complete flow from form to recommendation display
- Test modal open/close functionality
- Test weather icon rendering for all conditions

### E2E Tests
- Full user journey: fill form → get recommendation → view modal
- Test with various station combinations
- Test with different dates
- Test error scenarios (API down, network errors)

### Manual Testing
- Test with actual ML API endpoint
- Verify response data displays correctly
- Verify toast notifications appear
- Test modal responsiveness on different screen sizes

---

## 15. Security & Best Practices

### Current Implementation
- No authentication required for recommendation API
- Direct HTTP calls (no HTTPS)
- Input validation at form level only

### Recommendations
1. Add HTTPS for production
2. Implement API key or token authentication if needed
3. Add rate limiting on frontend
4. Validate response structure before using
5. Add error boundary for modal component
6. Sanitize user input before sending to ML API

---

## Conclusion

The RouteRecommendation feature is a well-integrated ML feature that enhances the user experience during parcel booking. It combines real-time route suggestions with weather forecasting to provide intelligent, context-aware recommendations. The implementation leverages Next.js capabilities and maintains clean separation between frontend and ML backend services.

For successful implementation in your project:
1. Set up an ML API endpoint that accepts the defined request structure
2. Ensure it returns recommendations in the expected response format
3. Implement the matching UI components and state management
4. Test thoroughly with your actual data and ML models
5. Consider the security and performance implications for production deployment
