# Route Recommendation Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Book Parcel Page (app/home/book-parcel/page.tsx)     │    │
│  │                                                        │    │
│  │  ┌──────────────────────────────────────────────────┐ │    │
│  │  │ Form Inputs                                      │ │    │
│  │  │ ├─ Sender Information                            │ │    │
│  │  │ ├─ Parcel Details                                │ │    │
│  │  │ │  ├─ Source Station                             │ │    │
│  │  │ │  ├─ Destination Station                        │ │    │
│  │  │ │  ├─ Date                                       │ │    │
│  │  │ │  └─ [Get Route Recommendation Button]          │ │    │
│  │  │ ├─ Receiver Information                           │ │    │
│  │  │ └─ Submit Button                                  │ │    │
│  │  └──────────────────────────────────────────────────┘ │    │
│  │                                                        │    │
│  │  STATE MANAGEMENT:                                     │    │
│  │  - recommendation (RecommendationResponse)            │    │
│  │  - showRecommendationModal (boolean)                  │    │
│  │  - isLoadingRecommendation (boolean)                  │    │
│  │  - safetyPrediction (SafetyAnalysisResponse)          │    │
│  │  - showRecommendationButton (boolean)                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                      │
│                          │ fetchRecommendation()               │
│                          ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  API Client Service (lib/api/recommendation.ts)       │    │
│  │  - suggestRoute()  [POST to ML API]                   │    │
│  │  - analyzeRoute()  [POST to local API]                │    │
│  └────────────────────────────────────────────────────────┘    │
│                     ▲                    ▲                      │
│                     │                    │                      │
└─────────────────────┼────────────────────┼──────────────────────┘
                      │                    │
                      │ HTTP POST          │ HTTP POST
                      │                    │
      ┌───────────────┘                    └──────────────────┐
      │                                                       │
      ▼                                                       ▼
┌──────────────────────────────┐           ┌────────────────────────┐
│  ML API Server               │           │  Local API Server      │
│  (External Service)          │           │  (Next.js Routes)      │
├──────────────────────────────┤           ├────────────────────────┤
│                              │           │                        │
│  Endpoint:                   │           │  Endpoint:             │
│  /suggest-route              │           │  /api/analyze-route    │
│                              │           │                        │
│  Purpose:                    │           │  Purpose:              │
│  Route recommendation        │           │  Safety analysis       │
│  with weather forecast       │           │  scoring               │
│                              │           │                        │
│  Input:                      │           │  Input:                │
│  - booking_date              │           │  - source              │
│  - start_station             │           │  - destination         │
│  - end_station               │           │  - date                │
│                              │           │  - time                │
│  Output:                     │           │  - parcelType          │
│  - route.full_route[]        │           │  - weight              │
│  - weather.condition         │           │                        │
│  - weather.recommendations[] │           │  Output:               │
│                              │           │  - safety_score        │
└──────────────────────────────┘           │                        │
                                           └────────────────────────┘
                      │
                      │ JSON Response
                      │
                      ▼
                ┌──────────────┐
                │ Frontend UI  │
                ├──────────────┤
                │              │
                │  Modal Shows:│
                │              │
                │ 1. Route     │
                │    CMB→NEG→  │
                │    BRA→KDY   │
                │              │
                │ 2. Weather   │
                │    [Icon] +  │
                │    Condition │
                │              │
                │ 3. Recs      │
                │    • ...     │
                │    • ...     │
                │              │
                └──────────────┘
```

---

## Data Flow Diagram

### Route Recommendation Flow

```
User Input
├─ Source Station
├─ Destination Station
└─ Date
        │
        │ onchange event
        ▼
Form State Updated
        │
        │ showRecommendationButton = true (when date selected)
        ▼
User Clicks "Get Route Recommendation"
        │
        │ fetchRecommendation() called
        ▼
Request Prepared:
{
  booking_date: "2026-02-24",
  start_station: "CMB",
  end_station: "KDY"
}
        │
        │ setIsLoadingRecommendation(true)
        │ Button disabled, spinner shown
        ▼
HTTP POST to http://51.21.2.3:8000/suggest-route
        │
        │ ML API processes request
        │ - Generates optimal route
        │ - Fetches weather forecast
        │ - Creates recommendations
        ▼
Response Received:
{
  route: {
    full_route: ["CMB", "NEG", "BRA", "KDY"]
  },
  weather: {
    weather_condition: "Clear",
    recommendations: [...]
  }
}
        │
        │ setRecommendation(data)
        │ setShowRecommendationModal(true)
        ▼
Modal Rendered with:
1. Route visualization
2. Weather icon + condition
3. Recommendation list
        │
        │ User closes modal
        ▼
State Cleanup:
- recommendation cleared or kept
- modal closed
- button hidden
```

### Safety Analysis Flow

```
Form Data Changes
(source, destination, or weight changed)
        │
        ▼
analyzeSafety() called
        │
        │ setIsAnalyzing(true)
        ▼
Request Prepared:
{
  source: "CMB",
  destination: "KDY",
  date: "2026-02-24",
  time: "12:00",
  parcelType: "PACKAGE",
  weight: 2.5
}
        │
        ▼
HTTP POST to /api/analyze-route (local)
        │
        │ Server analyzes:
        │ - Distance
        │ - Weather conditions
        │ - Parcel type risks
        │ - Weight considerations
        ▼
Response with Safety Score:
{
  safety_score: 78
}
        │
        ▼
Score Evaluation:
├─ >= 80 → Green toast: "Highly safe"
├─ 60-79 → Blue toast: "Moderate risk"
└─ < 60  → Orange toast: "High risk"
        │
        │ setIsAnalyzing(false)
        ▼
Toast Notification Shown
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   BookParcelPage Component                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────────────────┐ │
│  │  Form Component  │         │  RecommendationModal         │ │
│  ├──────────────────┤         ├──────────────────────────────┤ │
│  │                  │         │                              │ │
│  │ Input: date      │────────▶│ Props:                       │ │
│  │        source    │ onChange│ - recommendation             │ │
│  │        dest      │ + Click │ - isOpen                     │ │
│  │                  │         │ - onClose                    │ │
│  │ onClick: Get     │         │                              │ │
│  │  Recommendation  │         │ Displays:                    │ │
│  │                  │         │ - Route flow                 │ │
│  └──────────────────┘         │ - Weather icon + condition   │ │
│         │                     │ - Recommendations list       │ │
│         │ fetchRecommendation()
│         │ analyzeSafety()     │                              │ │
│         │                     │ Events:                      │ │
│         │                     │ - onClose()                  │ │
│         │                     └──────────────────────────────┘ │
│         │                                                      │
│         ├────────────────────────────────────────────────────┐ │
│         │                                                    │ │
│         ▼                                                    ▼ │
│  ┌────────────────────────────┐                            │ │
│  │  API Service Layer         │                            │ │
│  ├────────────────────────────┤                            │ │
│  │                            │                            │ │
│  │ - suggestRoute()           │                            │ │
│  │ - analyzeRoute()           │                            │ │
│  │                            │                            │ │
│  └────────────────────────────┘                            │ │
│         │                      ┌─────────────────────────┐ │ │
│         │                      │  Toast Notifications    │ │ │
│         │                      ├─────────────────────────┤ │ │
│         │                      │ Success, Error, Custom  │ │ │
│         │                      └─────────────────────────┘ │ │
│         │                                                    │ │
└─────────┼────────────────────────────────────────────────────┘ │
          │                                                      │
          │ External HTTP Calls                                 │
          │                                                      │
          ├──────────────────┬──────────────────┐              │
          │                  │                  │              │
          ▼                  ▼                  ▼              │
    ┌──────────┐         ┌──────────┐    ┌──────────────┐    │
    │ ML API   │         │ Local    │    │ Toast        │    │
    │ :8000    │         │ API      │    │ Library      │    │
    │ suggest- │         │ /analyze │    │              │    │
    │ route    │         │ -route   │    │              │    │
    └──────────┘         └──────────┘    └──────────────┘    │
```

---

## Request/Response Sequence Diagram

```
Frontend              API Client           ML Server          Local API
   │                     │                    │                   │
   │ fetchRecommendation()
   ├────────────────────▶│                    │                   │
   │                     │ POST /suggest-route
   │                     ├───────────────────▶│                   │
   │                     │                    │                   │
   │                     │                    │ Process:          │
   │                     │                    │ - Query routes    │
   │                     │                    │ - Get weather     │
   │                     │                    │ - Generate recs   │
   │                     │                    │                   │
   │                     │◀───────────────────┤                   │
   │                     │ JSON Response      │                   │
   │ Recommendation Data │                    │                   │
   │◀────────────────────┤                    │                   │
   │                     │                    │                   │
   │ (simultaneously)    │                    │                   │
   │ analyzeSafety()     │                    │                   │
   ├────────────────────▶│                    │                   │
   │                     │              POST /api/analyze-route   │
   │                     │ ───────────────────────────────────────▶│
   │                     │                    │                   │
   │                     │                    │              Process:
   │                     │                    │              - Analyze
   │                     │                    │                 route
   │                     │                    │              - Score
   │                     │                    │              - Safety
   │                     │                    │                   │
   │                     │                    │ JSON Response    │
   │                     │◀───────────────────────────────────────┤
   │ Safety Score        │                    │                   │
   │◀────────────────────┤                    │                   │
   │                     │                    │                   │
   │ Display Modal & Toast
   ├─────────────────────────────────────────────────────────────▶│
   │ (User interaction)  │                    │                   │
```

---

## State Management Lifecycle

```
Initial State:
{
  recommendation: null,
  showRecommendationModal: false,
  isLoadingRecommendation: false,
  showRecommendationButton: false,
  safetyPrediction: null,
  isAnalyzing: false
}

User selects date:
        ▼
{
  ...
  showRecommendationButton: true  ← Changed
  ...
}

User clicks "Get Recommendation":
        ▼
{
  ...
  isLoadingRecommendation: true   ← Changed (Button disabled, spinner shown)
  ...
}

API response received:
        ▼
{
  recommendation: { route: [...], weather: [...] },  ← Changed
  showRecommendationModal: true,                     ← Changed
  isLoadingRecommendation: false,                    ← Changed
  showRecommendationButton: false                    ← Changed
}

User closes modal:
        ▼
{
  ...
  showRecommendationModal: false  ← Changed (But recommendation data persists)
  ...
}
```

---

## Error Handling Flowchart

```
API Call Initiated
        │
        ├─ Network Error
        │   ├─ timeout
        │   ├─ no connection
        │   └─ DNS failure
        │          │
        │          ▼
        │   catch (error)
        │          │
        │          ▼
        │   Toast: "Failed to get route recommendation..."
        │          │
        │          ▼
        │   Finally: setIsLoading(false)
        │
        ├─ HTTP Error Response
        │   ├─ 400 Bad Request
        │   ├─ 500 Server Error
        │   ├─ 503 Service Unavailable
        │   └─ etc.
        │          │
        │          ▼
        │   if (!response.ok)
        │          │
        │          ▼
        │   throw new Error(...)
        │          │
        │          ▼
        │   catch (error)
        │          │
        │          ▼
        │   Toast: "Failed to get route recommendation..."
        │          │
        │          ▼
        │   Finally: setIsLoading(false)
        │
        └─ Success (200)
           │
           ▼
        response.json()
           │
           ├─ JSON Parse Error ──▶ catch (error)
           │                             │
           │                             ▼
           │                        Toast: "Failed..."
           │
           └─ Valid Data
              │
              ▼
           setRecommendation(data)
           setShowRecommendationModal(true)
           showRecommendationButton(false)
              │
              ▼
           Finally: setIsLoading(false)
              │
              ▼
           Modal displayed successfully
```

---

## API Interaction Model

### Request/Response Types

```
REQUEST → suggestRoute()
{
  booking_date: string (YYYY-MM-DD)
  start_station: string (station code)
  end_station: string (station code)
}
        │
        ▼
RESPONSE ← suggestRoute()
{
  route: {
    full_route: string[] (array of station codes)
  }
  weather: {
    weather_condition: string (Clear|Cloudy|Rain|...)
    recommendations: string[] (array of text recommendations)
  }
}

---

REQUEST → analyzeRoute()
{
  source: string
  destination: string
  date: string
  time: string
  parcelType: string
  weight: number
}
        │
        ▼
RESPONSE ← analyzeRoute()
{
  safety_score: number (0-100)
}
```

---

## Performance Considerations

### Critical Path
```
User Input → Button Click → API Call → Response → Display
   ~0ms        ~0ms         ~500-2000ms  ~10ms    ~100ms
                                         ┬
                                         │
                         (Network latency + Server processing)
```

### Optimization Points
1. **Button Visibility** - Only show when data is ready (date selected)
2. **Debouncing** - Optionally debounce analyzeSafety calls
3. **Caching** - Cache recommendations for same route + date
4. **Loading State** - Show spinner immediately for UX feedback
5. **Error Recovery** - Allow retry without form reset

---

## Summary

The Route Recommendation feature follows a clean separation of concerns:
- **UI Layer**: Form and Modal components
- **State Layer**: React hooks managing component state
- **API Layer**: Service functions handling HTTP calls
- **Backend Layer**: ML API and local API endpoints

This architecture allows for easy testing, maintenance, and future enhancements.
