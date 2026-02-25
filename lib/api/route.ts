import { apiClient, handleApiError } from './client';

export interface RouteRecommendationRequest {
  booking_date: string;
  start_station: string;
  end_station: string;
}

export interface RouteDetails {
  start_station: string;
  end_station: string;
  full_route: string[];
}

export interface WeatherDetails {
  temperature: number;
  humidity: number;
  wind_speed: number;
  weather_condition: string;
  timestamp: string;
  precipitation: number;
  max_temperature: number;
  min_temperature: number;
  chance_of_rain: number;
  risk_level: string;
  delay_probability: number;
  recommendations: string[];
}

export interface RouteRecommendation {
  route: RouteDetails;
  weather: WeatherDetails;
}

export interface Route {
  stations: string[];
  estimated_time: string;
  safety_score: number;
}

export interface SafetyPrediction {
  safety_score: number;
  risk_factors: string[];
  recommended_time: string;
  alternative_routes: Route[];
}

const ML_API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://51.21.2.3:8000';

export const routeApi = {
  // Get route recommendation from ML model
  getRouteRecommendation: async (
    request: RouteRecommendationRequest
  ): Promise<RouteRecommendation> => {
    try {
      const response = await fetch(`${ML_API_BASE_URL}/suggest-route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`ML API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Analyze route safety using local API
  analyzeSafety: async (params: {
    source: string;
    destination: string;
    date: string;
    time: string;
    parcelType: string;
    weight: number;
  }): Promise<SafetyPrediction> => {
    try {
      const response = await fetch('/api/analyze-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze safety');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
