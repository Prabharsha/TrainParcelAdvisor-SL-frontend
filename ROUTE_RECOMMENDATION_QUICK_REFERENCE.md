# Route Recommendation Feature - Quick Reference

## TL;DR - Key Facts

| Aspect | Detail |
|--------|--------|
| **Feature Name** | Route Recommendation with Weather Forecast |
| **Page Location** | `/home/book-parcel` |
| **File** | `src/app/home/book-parcel/page.tsx` |
| **ML API Endpoint** | `http://51.21.2.3:8000/suggest-route` |
| **Method** | POST |
| **Authentication** | None (public endpoint) |
| **Response Type** | Route details + Weather + Recommendations |

---

## API Endpoints at a Glance

### 1. ML Route Suggestion Service
```
Endpoint: http://51.21.2.3:8000/suggest-route
Method:   POST
Input:    { booking_date, start_station, end_station }
Output:   { route: { full_route: [...] }, weather: { weather_condition, recommendations: [...] } }
```

### 2. Safety Analysis Service (Local)
```
Endpoint: /api/analyze-route
Method:   POST
Input:    { source, destination, date, time, parcelType, weight }
Output:   { safety_score: number }
```

---

## Request & Response Examples

### Request to ML API

**URL:** `http://51.21.2.3:8000/suggest-route`

**Body:**
```json
{
  "booking_date": "2026-02-24",
  "start_station": "CMB",
  "end_station": "KDY"
}
```

### Response from ML API

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

---

## Component State Variables

```typescript
// Recommendation feature states
const [recommendation, setRecommendation] = useState(null);
const [showRecommendationModal, setShowRecommendationModal] = useState(false);
const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
const [showRecommendationButton, setShowRecommendationButton] = useState(false);

// Safety analysis states
const [safetyPrediction, setSafetyPrediction] = useState(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);
```

---

## Critical Functions

### fetchRecommendation()
- **Trigger:** Click "Get Route Recommendation" button
- **Required Fields:** date, startingDestination, destination
- **Calls:** `http://51.21.2.3:8000/suggest-route`
- **Result:** Opens modal with recommendation

### analyzeSafety()
- **Trigger:** Form field changes
- **Calls:** `/api/analyze-route`
- **Result:** Shows safety toast notification (score >= 80: green, 60-79: blue, < 60: orange)

### getWeatherIcon()
- **Returns:** SVG icon based on weather condition
- **Conditions:** Clear, Partly Cloudy, Cloudy, Light Rain, Moderate Rain, Heavy Rain, Thunderstorm

---

## UI Components

### "Get Route Recommendation" Button
- **Location:** Below date input field
- **Visibility:** Only after date is selected
- **States:** 
  - Enabled (blue)
  - Loading (disabled with spinner)
- **Click Handler:** Calls `fetchRecommendation()`

### Recommendation Modal
- **Sections:**
  1. Route Details - shows station flow (CMB → NEG → BRA → KDY)
  2. Weather Forecast - displays condition and icon
  3. Recommendations - bulleted list of suggestions
- **Styling:** Dark theme (#1e2837, #2a3444)
- **Animation:** Fade in/out on visibility change

---

## Weather Condition Mapping

| Condition | SVG Icon | Color |
|-----------|----------|-------|
| Clear | Sun icon | yellow-400 |
| Partly Cloudy | Partial cloud icon | gray-300 |
| Cloudy | Cloud icon | gray-400 |
| Light Rain | Rain icon | blue-300 |
| Moderate Rain | Rain icon | blue-400 |
| Heavy Rain | Heavy rain icon | blue-500 |
| Thunderstorm | Lightning bolt | yellow-500 |

---

## Safety Score Interpretation

| Score Range | Message | Toast Color |
|-------------|---------|-------------|
| >= 80 | Highly safe for your parcel | Green (#10B981) |
| 60-79 | Moderate risk factors to consider | Blue (#60A5FA) |
| < 60 | High risk - Consider alternatives | Orange (#F59E0B) |

---

## Integration Steps

1. **Setup ML API** - Create endpoint at `http://<server>:8000/suggest-route`
2. **Create Response Schema** - Match the example response structure
3. **Copy Component** - Adapt `book-parcel/page.tsx` to your project
4. **Add State** - Include recommendation state variables
5. **Add Functions** - Implement `fetchRecommendation()` and `analyzeSafety()`
6. **Add Modal** - Create recommendation display modal
7. **Add Styles** - Use provided Tailwind classes
8. **Test** - Verify with live ML API endpoint

---

## Dependencies

- React (useState, React.FormEvent)
- Next.js (fetch, NextResponse)
- Toast Library (for notifications)
- Tailwind CSS (for styling)
- SVG Icons (built-in)

---

## Error Handling

**Failed Recommendation Fetch:**
```
Toast Error: "Failed to get route recommendation. Please try again."
```

**Failed Safety Analysis:**
```
Toast Error: "Failed to analyze route safety. Please try again."
```

---

## Important Notes

1. **No HTTPS** - Current implementation uses HTTP (upgrade for production)
2. **No Auth** - ML API is public (add authentication if needed)
3. **Station Codes** - Use station codes (e.g., "CMB", "KDY", not full names)
4. **Date Format** - Use YYYY-MM-DD format for dates
5. **Default Values** - Some fields have defaults (source="Colombo", time="12:00")

---

## Testing Checklist

- [ ] ML API endpoint responds correctly
- [ ] Request format matches exactly
- [ ] Response structure is as expected
- [ ] Modal opens on successful recommendation
- [ ] Weather icons display correctly
- [ ] Safety toast notifications show
- [ ] Error handling works
- [ ] Loading spinner appears
- [ ] Modal closes properly
- [ ] Multiple recommendations work
- [ ] Different weather conditions render

---

## Related Files to Check

- `src/app/home/book-parcel/page.tsx` - Main implementation
- `src/utils/api.ts` - API utilities
- `src/types/order.ts` - Data types
- `src/components/` - UI components

---

## Resources

- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com
- React Hooks: https://react.dev/reference/react/hooks

---

## Questions to Ask Your ML Team

1. What station codes does your model expect?
2. What date range does the model support?
3. What's the expected response time?
4. Can you add rate limiting?
5. What error codes might be returned?
6. Is HTTPS available for production?
7. Should we implement authentication?
8. What's the maximum request frequency?

