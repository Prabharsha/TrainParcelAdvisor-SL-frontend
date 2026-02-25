# Route Recommendation Feature Documentation

## Overview

The RouteRecommendation feature integrates machine learning capabilities to suggest optimal routes for parcels and tickets based on real-time conditions like weather, traffic patterns, and safety metrics.

## Architecture

### Components

#### 1. **Route Recommendation API Module** (`lib/api/route.ts`)
- **getRouteRecommendation()** - Calls external ML model API
- **analyzeRouteSafety()** - Calls local Next.js API for safety analysis
- **getWeatherIcon()** - Maps weather conditions to emojis
- **getSafetyScoreColor()** - Determines color based on safety score
- **getSafetyScoreBg()** - Determines background color for score display

#### 2. **Route Recommendation Modal** (`components/RouteRecommendationModal.tsx`)
- Beautiful, responsive modal displaying route details
- Shows route flow, weather condition, safety score
- Displays recommendations in easy-to-read format
- Allows user to confirm and proceed with booking

#### 3. **Local Safety Analysis API** (`app/api/analyze-route/route.ts`)
- POST endpoint for safety analysis
- Calculates safety score based on route complexity and weather
- Generates contextual recommendations
- Returns structured response with recommendations

#### 4. **Integration in Booking Pages**
- **Parcel Booking** (`app/parcels/book/page.tsx`)
- **Ticket Booking** (`app/tickets/book/page.tsx`)
- Button appears after user selects both stations and travel date
- Opens modal with route recommendation
- User can review and proceed

## API Endpoints

### External ML Model API

**Endpoint:** `POST http://51.21.2.3:8000/suggest-route`

**Request:**
```json
{
  "booking_date": "2026-03-01",
  "start_station": "CMB",
  "end_station": "KDY"
}
```

**Response:**
```json
{
  "route_flow": "CMB -> NWR -> KDY",
  "weather_condition": "sunny",
  "recommendations": [
    "Expected arrival: 2 hours",
    "No delays expected",
    "Safe to travel"
  ]
}
```

### Local Safety Analysis API

**Endpoint:** `POST /api/analyze-route`

**Request:**
```json
{
  "route_flow": "CMB -> NWR -> KDY",
  "weather_condition": "sunny"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Safety analysis completed",
  "data": {
    "safety_score": 85,
    "recommendations": [
      "✅ Excellent conditions - Safe to travel",
      "✅ No weather-related concerns expected",
      "☀️ Clear skies - optimal travel conditions"
    ]
  }
}
```

## Usage Flow

### 1. Parcel Booking

```
User fills booking form
     ↓
User selects: From Station, To Station, Travel Date
     ↓
"Get Route Recommendation" button appears
     ↓
User clicks button
     ↓
System calls ML API with booking details
     ↓
Modal displays:
  - Route flow (from ML model)
  - Weather condition
  - Safety score and analysis (from local API)
  - Recommendations
     ↓
User can:
  - Review recommendation
  - Click "Proceed with Booking" to continue
  - Or go back and modify details
```

### 2. Ticket Booking

Same flow as parcel booking, using ticket-specific fields.

## Safety Score Calculation

The safety score is calculated based on:

1. **Base Score:** 80/100
2. **Weather Impact:**
   - Heavy rain: -20 points
   - Rain: -10 points
   - Foggy: -15 points
   - Sunny/Clear: +5 points
3. **Route Complexity:**
   - Each hop in route: -2 points
4. **Final Range:** 0-100 (clamped)

### Score Interpretation

| Score  | Status        | Color      | Recommendation |
|--------|---------------|------------|-----------------|
| 80-100 | Excellent     | Green      | Safe to travel  |
| 60-79  | Good          | Yellow     | Monitor updates |
| 40-59  | Fair          | Orange     | Extra caution   |
| 0-39   | Poor          | Red        | Reconsider trip |

## Weather Icon Mapping

| Condition      | Icon | CSS Class |
|----------------|------|-----------|
| Sunny          | ☀️   | -         |
| Cloudy         | ☁️   | -         |
| Rainy          | 🌧️   | -         |
| Heavy rain     | ⛈️   | -         |
| Foggy          | 🌫️   | -         |
| Clear          | ✨   | -         |
| Moderate       | ⛅   | -         |

## Environment Configuration

Add to `.env.local`:

```env
NEXT_PUBLIC_ML_API_URL=http://51.21.2.3:8000
```

## Code Examples

### Calling Route Recommendation

```typescript
import { routeApi } from '@/lib/api/route';

const recommendation = await routeApi.getRouteRecommendation({
  booking_date: '2026-03-01',
  start_station: 'CMB',
  end_station: 'KDY'
});

console.log(recommendation.route_flow);
console.log(recommendation.weather_condition);
console.log(recommendation.recommendations);
```

### Analyzing Route Safety

```typescript
const safety = await routeApi.analyzeRouteSafety(
  'CMB -> NWR -> KDY',
  'sunny'
);

console.log(safety.safety_score); // 85
console.log(safety.recommendations); // Array of recommendations
```

### Using Safety Score Color

```typescript
const color = routeApi.getSafetyScoreColor(85); // 'text-green-600'
const bg = routeApi.getSafetyScoreBg(85); // 'bg-green-50 border-green-200'
```

## Error Handling

The feature includes comprehensive error handling:

1. **ML API Connection Error**
   - Toast notification to user
   - Modal displays error message
   - User can try again

2. **Missing Required Fields**
   - Toast notification prompts user to fill required fields
   - Button disabled until all fields complete

3. **Safety Analysis Fallback**
   - If safety analysis fails, uses default safe values
   - Returns score of 75 and generic recommendations

## Testing

### Manual Testing Checklist

- [ ] Select parcel/ticket booking page
- [ ] Fill in basic details (stations, date)
- [ ] Click "Get Route Recommendation" button
- [ ] Modal appears with loading spinner
- [ ] After loading, modal displays:
  - [ ] Route flow
  - [ ] Weather condition with icon
  - [ ] Safety score with color indicator
  - [ ] Progress bar showing score
  - [ ] List of recommendations
- [ ] Click "Proceed with Booking" button
- [ ] Modal closes and booking continues
- [ ] Click "Back" button
- [ ] Modal closes without affecting form

### Test Cases

```
Test Case 1: Successful Route Recommendation
Input: Valid parcel/ticket details with dates
Expected: Modal displays complete recommendation

Test Case 2: ML API Offline
Input: Valid booking details
Expected: Error toast shown, user can retry

Test Case 3: Missing Stations
Input: Incomplete station selection
Expected: Toast prompts user to fill required fields

Test Case 4: High Safety Score
Input: Clear weather, simple route
Expected: Green score display with positive recommendations

Test Case 5: Low Safety Score
Input: Heavy rain, complex route
Expected: Red score display with cautionary recommendations
```

## Integration Points

### 1. Parcel Booking Page
- Imports `RouteRecommendationModal` component
- Imports `routeApi` from route module
- Button appears conditionally after user selects stations
- Passes form values to recommendation handler

### 2. Ticket Booking Page
- Same integration as parcel booking
- Uses ticket-specific field names (originStation, destinationStation)

### 3. User Experience Enhancements
- Toast notifications for user feedback
- Loading states with spinners
- Disabled buttons during API calls
- Keyboard support in modal
- Responsive design for mobile

## Future Enhancements

1. **Route History**
   - Save recommended routes for future reference
   - Show past route quality vs actual conditions

2. **Real-time Updates**
   - WebSocket integration for live weather updates
   - Push notifications for route status changes

3. **Advanced Analytics**
   - Historical safety data
   - Route reliability metrics
   - User preferences learning

4. **Multi-Route Comparison**
   - Show 2-3 alternative routes
   - Compare safety scores
   - Cost/time trade-offs

5. **Integration with Booking History**
   - Suggest routes based on past preferences
   - Learn user travel patterns

## Performance Considerations

1. **API Caching**
   - Cache recommendations for same route/date
   - Invalidate after 24 hours

2. **Lazy Loading**
   - Modal loads only when requested
   - ML API called asynchronously

3. **Optimizations**
   - Minimize re-renders
   - Debounce form inputs
   - Progressive loading

## Security

1. **Input Validation**
   - Validate station codes and dates
   - Prevent injection attacks

2. **API Security**
   - Use HTTPS for external API calls
   - Implement rate limiting on local API
   - Validate response format

3. **User Data**
   - No sensitive data logged
   - Station preferences optional

## Troubleshooting

### ML API Returns 500 Error
- Check if ML server is running at `http://51.21.2.3:8000`
- Verify network connectivity
- Check ML server logs

### Modal Not Appearing
- Verify both stations are selected
- Check browser console for errors
- Ensure `RouteRecommendationModal` is imported

### Safety Score Always Low
- Check weather condition string format
- Verify route format (should be "A -> B -> C")
- Review safety calculation logic

### Recommendations Not Showing
- Check if safety analysis API is responding
- Verify response structure matches expected format
- Check fallback values in `analyzeRouteSafety()`

## Related Files

- [lib/api/route.ts](lib/api/route.ts) - Route API module
- [components/RouteRecommendationModal.tsx](components/RouteRecommendationModal.tsx) - Modal component
- [app/api/analyze-route/route.ts](app/api/analyze-route/route.ts) - Safety analysis API
- [app/parcels/book/page.tsx](app/parcels/book/page.tsx) - Parcel booking integration
- [app/tickets/book/page.tsx](app/tickets/book/page.tsx) - Ticket booking integration
- [.env.local](.env.local) - Environment configuration

## Version History

- **v1.0.0** (February 23, 2026) - Initial implementation with ML API integration
