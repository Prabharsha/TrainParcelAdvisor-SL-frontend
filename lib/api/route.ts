import { apiClient, handleApiError } from './client';

// ========================
// Legacy Types (kept for backward compatibility)
// ========================

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

// ========================
// New Predict API Types (TrainParcelAdvisor v3)
// ========================

export interface WeatherInput {
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  precipitation?: number;
  visibility?: number;
  pressure?: number;
  weather_condition?: string;
  chance_of_rain?: number;
}

export interface PredictRequest {
  from_station: string;
  to_station: string;
  weather: WeatherInput;
  booking_date?: string | null;
  booking_time?: string | null;
}

export interface PredictResponse {
  from_station: string;
  from_station_name: string;
  to_station: string;
  to_station_name: string;
  inference_path: string;
  total_distance_km: number;
  num_hops: number;
  recommended_train: string;
  train_type: string;
  scheduled_departure: string;
  base_duration: string;
  base_duration_hours: number;
  weather_adjusted_duration: string;
  weather_adjusted_hours: number;
  weather_floor_applied: number;
  estimated_base_arrival: string;
  estimated_weather_arrival: string;
  weather_condition: string;
  weather_risk_level: string;
  weather_advisory: string;
  model_versions: Record<string, unknown>;
}

const ML_API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://51.21.2.3:8000';

export const routeApi = {
  // Predict delivery duration & weather risk (new v3 API)
  getDeliveryPrediction: async (
    request: PredictRequest
  ): Promise<PredictResponse> => {
    try {
      const response = await fetch(`${ML_API_BASE_URL}/api/v1/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Prediction API error (${response.status}): ${errorBody}`);
      }

      const data: PredictResponse = await response.json();
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Legacy: Get route recommendation from ML model
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
