'use client';

import { PredictResponse } from '@/lib/api/route';

interface RouteRecommendationModalProps {
  isOpen: boolean;
  prediction: PredictResponse | null;
  onClose: () => void;
}

export function RouteRecommendationModal({
  isOpen,
  prediction,
  onClose,
}: RouteRecommendationModalProps) {
  if (!isOpen || !prediction) return null;

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' };
      case 'medium':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' };
      case 'high':
        return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' };
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' };
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('clear') || lower.includes('sunny')) {
      return (
        <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    }
    if (lower.includes('cloud') || lower.includes('partly')) {
      return (
        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      );
    }
    if (lower.includes('thunder')) {
      return (
        <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    }
    if (lower.includes('rain') || lower.includes('drizzle')) {
      return (
        <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9m0-13v5m-2 4v3m4-6v6m4-9v9"
          />
        </svg>
      );
    }
    return (
      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
        />
      </svg>
    );
  };

  const riskColors = getRiskColor(prediction.weather_risk_level);

  // Parse inference path for visual display
  const pathStations = prediction.inference_path
    ? prediction.inference_path.split('→').map((s) => s.trim())
    : [prediction.from_station, prediction.to_station];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e2837] p-6 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Delivery Prediction</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {/* Route Summary */}
          <div className="bg-[#2a3444] p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3">Route Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="block text-xs text-gray-400 uppercase tracking-wide">From</span>
                <span className="text-white font-semibold">{prediction.from_station_name}</span>
                <span className="text-gray-400 text-sm ml-1">({prediction.from_station})</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400 uppercase tracking-wide">To</span>
                <span className="text-white font-semibold">{prediction.to_station_name}</span>
                <span className="text-gray-400 text-sm ml-1">({prediction.to_station})</span>
              </div>
            </div>

            {/* Inference Path Visual */}
            <div className="mt-3">
              <span className="block text-xs text-gray-400 uppercase tracking-wide mb-2">
                Inference Path ({prediction.num_hops} hops)
              </span>
              <div className="flex items-center flex-wrap gap-1 pb-1">
                {pathStations.map((station, index) => (
                  <div key={index} className="flex items-center shrink-0">
                    <div className={`px-3 py-1.5 rounded-lg font-medium text-sm ${
                      index === 0 || index === pathStations.length - 1
                        ? 'bg-[#1a73e8] text-white'
                        : 'bg-[#3a4a5a] text-gray-200'
                    }`}>
                      {station}
                    </div>
                    {index < pathStations.length - 1 && (
                      <svg className="w-4 h-4 text-gray-500 mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-600">
              <div>
                <span className="block text-xs text-gray-400">Total Distance</span>
                <span className="text-white font-bold text-lg">{prediction.total_distance_km.toFixed(1)} km</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400">Number of Hops</span>
                <span className="text-white font-bold text-lg">{prediction.num_hops}</span>
              </div>
            </div>
          </div>

          {/* Recommended Train */}
          <div className="bg-[#2a3444] p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3">Recommended Train</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-gray-400">Train</span>
                <span className="text-white font-semibold">{prediction.recommended_train}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400">Type</span>
                <span className="text-white font-semibold">{prediction.train_type}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400">Scheduled Departure</span>
                <span className="text-white font-semibold">{prediction.scheduled_departure}</span>
              </div>
            </div>
          </div>

          {/* Duration & Arrival Estimates */}
          <div className="bg-[#2a3444] p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3">Duration & Arrival Estimates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Base (no weather) */}
              <div className="bg-[#1e2837] p-3 rounded-lg border border-gray-600">
                <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Base Estimate</span>
                <div className="text-white font-bold text-xl">{prediction.base_duration}</div>
                <div className="text-gray-400 text-sm mt-1">
                  Arrival: <span className="text-blue-300">{prediction.estimated_base_arrival}</span>
                </div>
              </div>

              {/* Weather adjusted */}
              <div className={`p-3 rounded-lg border ${riskColors.border} ${riskColors.bg}`}>
                <span className="block text-xs text-gray-400 uppercase tracking-wide mb-1">Weather Adjusted</span>
                <div className="text-white font-bold text-xl">{prediction.weather_adjusted_duration}</div>
                <div className="text-gray-400 text-sm mt-1">
                  Arrival: <span className="text-blue-300">{prediction.estimated_weather_arrival}</span>
                </div>
                {/* {prediction.weather_floor_applied > 0 && (
                  <div className="text-xs text-yellow-300 mt-1">
                    +{prediction.weather_floor_applied.toFixed(1)}h weather delay applied
                  </div>
                )} */}
              </div>
            </div>
          </div>

          {/* Weather & Risk */}
          <div className="bg-[#2a3444] p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3">Weather & Risk Assessment</h3>
            <div className="flex items-center gap-4 mb-4">
              {getWeatherIcon(prediction.weather_condition)}
              <div>
                <div className="text-2xl font-bold text-white">{prediction.weather_condition}</div>
                <div className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${riskColors.bg} ${riskColors.text} border ${riskColors.border}`}>
                  Risk Level: {prediction.weather_risk_level}
                </div>
              </div>
            </div>

            {/* Weather Advisory */}
            {prediction.weather_advisory && (
              <div className="bg-[#1e2837] p-3 rounded-lg border border-blue-500/30 mt-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-300 text-sm">{prediction.weather_advisory}</p>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
