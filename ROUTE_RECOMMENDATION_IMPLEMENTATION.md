# Route Recommendation Implementation Guide

This guide provides step-by-step instructions to implement the RouteRecommendation feature in your frontend project.

---

## Step 1: Create Types File

Create `lib/types/recommendation.ts`:

```typescript
export interface RecommendationResponse {
  route: {
    full_route: string[];
  };
  weather: {
    weather_condition: string;
    recommendations: string[];
  };
}

export interface SafetyAnalysisResponse {
  safety_score: number;
}

export type WeatherCondition = 
  | "Clear"
  | "Partly Cloudy"
  | "Cloudy"
  | "Light Rain"
  | "Moderate Rain"
  | "Heavy Rain"
  | "Thunderstorm";
```

---

## Step 2: Create Recommendation API Service

Create `lib/api/recommendation.ts`:

```typescript
const ML_API_BASE = "http://51.21.2.3:8000";

interface SuggestRouteRequest {
  booking_date: string;
  start_station: string;
  end_station: string;
}

export async function suggestRoute(
  data: SuggestRouteRequest
): Promise<RecommendationResponse> {
  const response = await fetch(`${ML_API_BASE}/suggest-route`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch route suggestion");
  }

  return response.json();
}

interface AnalyzeRouteRequest {
  source: string;
  destination: string;
  date: string;
  time: string;
  parcelType: string;
  weight: number;
}

export async function analyzeRoute(
  data: AnalyzeRouteRequest
): Promise<SafetyAnalysisResponse> {
  const response = await fetch("/api/analyze-route", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze route");
  }

  return response.json();
}
```

---

## Step 3: Create Weather Icon Component

Create `components/WeatherIcon.tsx`:

```typescript
import React from "react";

interface WeatherIconProps {
  condition: string;
  className?: string;
}

export function WeatherIcon({ condition, className = "w-12 h-12" }: WeatherIconProps) {
  switch (condition) {
    case "Clear":
      return (
        <svg
          className={`${className} text-yellow-400`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    case "Partly Cloudy":
    case "Cloudy":
      return (
        <svg
          className={`${className} text-gray-400`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      );
    case "Light Rain":
      return (
        <svg
          className={`${className} text-blue-300`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9m0-13v5m-2 4v3m4-6v6m4-9v9"
          />
        </svg>
      );
    case "Moderate Rain":
      return (
        <svg
          className={`${className} text-blue-400`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9m0-13v5m-2 4v3m4-6v6m4-9v9"
          />
        </svg>
      );
    case "Heavy Rain":
      return (
        <svg
          className={`${className} text-blue-500`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9m0-13v5m-2 4v3m4-6v6m4-9v9"
          />
        </svg>
      );
    case "Thunderstorm":
      return (
        <svg
          className={`${className} text-yellow-500`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      );
    default:
      return null;
  }
}
```

---

## Step 4: Create Recommendation Modal Component

Create `components/RecommendationModal.tsx`:

```typescript
"use client";

import React from "react";
import { RecommendationResponse } from "@/lib/types/recommendation";
import { WeatherIcon } from "./WeatherIcon";

interface RecommendationModalProps {
  recommendation: RecommendationResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RecommendationModal({
  recommendation,
  isOpen,
  onClose,
}: RecommendationModalProps) {
  if (!isOpen || !recommendation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e2837] p-6 rounded-xl shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Route Recommendation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Route Details */}
          <div className="bg-[#2a3444] p-4 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4">
              Route Details
            </h3>
            <div className="flex items-center justify-start space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600">
              {recommendation.route.full_route.map((station, index) => (
                <div key={station} className="flex items-center shrink-0">
                  <div className="bg-[#1a73e8] text-white px-3 py-1.5 rounded-lg font-medium text-sm">
                    {station}
                  </div>
                  {index < recommendation.route.full_route.length - 1 && (
                    <svg
                      className="w-5 h-5 text-gray-400 mx-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weather Information */}
          <div className="bg-[#2a3444] p-4 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4">
              Weather Forecast
            </h3>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <WeatherIcon condition={recommendation.weather.weather_condition} />
                <div className="text-3xl font-bold text-white mt-3">
                  {recommendation.weather.weather_condition}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-[#2a3444] p-4 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4">
              Recommendations
            </h3>
            <div className="space-y-3">
              {recommendation.weather.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-[#1a73e8] mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-gray-300 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 5: Integrate into Book Parcel Page

Update your `app/parcels/book/page.tsx` with these additions:

```typescript
"use client";

import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { suggestRoute, analyzeRoute } from "@/lib/api/recommendation";
import { RecommendationResponse } from "@/lib/types/recommendation";
import { RecommendationModal } from "@/components/RecommendationModal";

export default function BookParcelPage() {
  // ... existing state variables ...

  // Recommendation states
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [showRecommendationButton, setShowRecommendationButton] = useState(false);

  // Safety analysis states
  const [safetyPrediction, setSafetyPrediction] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch route recommendation from ML API
  const fetchRecommendation = useCallback(async () => {
    if (!formData.date || !formData.startingDestination || !formData.destination) {
      toast.error("Please fill in date, source, and destination");
      return;
    }

    try {
      setIsLoadingRecommendation(true);
      const data = await suggestRoute({
        booking_date: formData.date,
        start_station: formData.startingDestination,
        end_station: formData.destination,
      });

      setRecommendation(data);
      setShowRecommendationModal(true);
      setShowRecommendationButton(false);
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      toast.error("Failed to get route recommendation. Please try again.");
    } finally {
      setIsLoadingRecommendation(false);
    }
  }, [formData.date, formData.startingDestination, formData.destination]);

  // Analyze route safety
  const analyzeSafety = useCallback(async () => {
    if (!formData.destination || !formData.startingDestination) return;

    setIsAnalyzing(true);
    try {
      const data = await analyzeRoute({
        source: formData.startingDestination || "Colombo",
        destination: formData.destination,
        date: formData.date,
        time: "12:00",
        parcelType: formData.parcelType,
        weight: parseFloat(formData.weightInKg) || 0,
      });

      setSafetyPrediction(data);

      if (data.safety_score >= 80) {
        toast.success("This route is highly safe for your parcel!");
      } else if (data.safety_score >= 60) {
        toast((t) => (
          <div className="bg-[#1F2937] text-[#60A5FA] border border-[#2563EB] px-4 py-2 rounded-lg">
            This route has moderate risk factors to consider.
          </div>
        ));
      } else {
        toast((t) => (
          <div className="bg-[#1F2937] text-[#F59E0B] border border-[#D97706] px-4 py-2 rounded-lg">
            This route has high risk factors. Consider alternatives.
          </div>
        ));
      }
    } catch (error) {
      console.error("Error analyzing route:", error);
      toast.error("Failed to analyze route safety. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [formData]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Show recommendation button when date is selected
    if (name === "date" && value) {
      setShowRecommendationButton(true);
    }

    // Analyze safety when route is complete
    if (name === "destination" || name === "startingDestination") {
      if (formData.destination && formData.startingDestination) {
        analyzeSafety();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* ... existing JSX ... */}

      {/* Add recommendation button in date field section */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
          required
        />
        
        {showRecommendationButton && (
          <button
            type="button"
            onClick={fetchRecommendation}
            disabled={isLoadingRecommendation}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingRecommendation ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Getting Recommendation...
              </span>
            ) : (
              "Get Route Recommendation"
            )}
          </button>
        )}
      </div>

      {/* Recommendation Modal */}
      <RecommendationModal
        recommendation={recommendation}
        isOpen={showRecommendationModal}
        onClose={() => setShowRecommendationModal(false)}
      />
    </div>
  );
}
```

---

## Step 6: Create Backend API Route (Optional)

If you need the `/api/analyze-route` endpoint, create `app/api/analyze-route/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Implement your safety analysis logic here
    // For now, returning a mock response based on weight
    const weight = body.weight || 1;
    const safetyScore = Math.min(100, 70 + Math.random() * 30 - weight);

    return NextResponse.json({
      safety_score: Math.round(safetyScore),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to analyze route" },
      { status: 500 }
    );
  }
}
```

---

## Step 7: Testing

Create `__tests__/recommendation.test.ts`:

```typescript
import { suggestRoute, analyzeRoute } from "@/lib/api/recommendation";

describe("Recommendation API", () => {
  // Note: These tests require actual API endpoints

  it("should fetch route suggestion", async () => {
    const response = await suggestRoute({
      booking_date: "2026-02-24",
      start_station: "CMB",
      end_station: "KDY",
    });

    expect(response).toHaveProperty("route");
    expect(response).toHaveProperty("weather");
    expect(Array.isArray(response.route.full_route)).toBe(true);
  });

  it("should analyze route safety", async () => {
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
  });
});
```

---

## Verification Checklist

- [ ] Types created and imported correctly
- [ ] API service functions working with your ML endpoint
- [ ] Weather icon component displays all conditions
- [ ] Recommendation modal opens and closes properly
- [ ] Toast notifications appear on safety analysis
- [ ] Form validation prevents incomplete requests
- [ ] Loading spinner appears during API call
- [ ] Error handling works for failed requests
- [ ] Styling matches your design system
- [ ] Responsive layout on mobile devices
- [ ] State cleanup on component unmount

---

## Configuration

Update your environment if needed:

```env
# .env.local
NEXT_PUBLIC_ML_API_URL=http://51.21.2.3:8000
NEXT_PUBLIC_BACKEND_API_URL=http://51.21.2.3:8082
```

Then update the API service:

```typescript
const ML_API_BASE = process.env.NEXT_PUBLIC_ML_API_URL || "http://51.21.2.3:8000";
```

---

## Troubleshooting

### CORS Issues
If you get CORS errors:
1. Add CORS headers to your ML API server
2. Use a proxy if needed
3. Check Network tab in browser dev tools

### API Not Responding
1. Verify the ML API is running
2. Check the endpoint URL
3. Test with curl or Postman first

### Types Not Found
1. Ensure files are in correct locations
2. Check import paths
3. Run `npm install` if needed

---

## Next Steps

1. Integrate with your actual ML API endpoint
2. Customize styling to match your brand
3. Add more error handling
4. Implement caching if needed
5. Add analytics tracking
6. Write comprehensive tests
