'use client';

import { RouteRecommendation } from '@/lib/api/route';

interface RouteRecommendationModalProps {
  isOpen: boolean;
  recommendation: RouteRecommendation | null;
  onClose: () => void;
}

export function RouteRecommendationModal({
  isOpen,
  recommendation,
  onClose,
}: RouteRecommendationModalProps) {
  if (!isOpen || !recommendation) return null;

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Clear':
        return (
          <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        );
      case 'Partly Cloudy':
      case 'Cloudy':
        return (
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
        );
      case 'Light Rain':
        return (
          <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9m0-13v5m-2 4v3m4-6v6m4-9v9"
            />
          </svg>
        );
      case 'Moderate Rain':
        return (
          <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9m0-13v5m-2 4v3m4-6v6m4-9v9"
            />
          </svg>
        );
      case 'Heavy Rain':
        return (
          <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9m0-13v5m-2 4v3m4-6v6m4-9v9"
            />
          </svg>
        );
      case 'Thunderstorm':
        return (
          <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e2837] p-6 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Route Recommendation</h2>
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

        <div className="space-y-6">
          {/* Route Information */}
          <div className="bg-[#2a3444] p-4 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Route Details</h3>
            <div className="flex items-center justify-start space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {recommendation.route.full_route.map((station, index) => (
                <div key={station} className="flex items-center shrink-0">
                  <div className="bg-[#1a73e8] text-white px-3 py-1.5 rounded-lg font-medium text-sm">
                    {station}
                  </div>
                  {index < recommendation.route.full_route.length - 1 && (
                    <svg className="w-5 h-5 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weather Information */}
          <div className="bg-[#2a3444] p-4 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Weather Forecast</h3>
            <div className="flex items-center justify-center">
              <div className="text-center">
                {getWeatherIcon(recommendation.weather.weather_condition)}
                <div className="text-3xl font-bold text-white mt-3">
                  {recommendation.weather.weather_condition}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-300">
                  <div>
                    <span className="block text-gray-400">Temperature</span>
                    <span className="font-semibold">{recommendation.weather.temperature}°C</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Humidity</span>
                    <span className="font-semibold">{recommendation.weather.humidity}%</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Wind Speed</span>
                    <span className="font-semibold">{recommendation.weather.wind_speed} km/h</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Rain Chance</span>
                    <span className="font-semibold">{recommendation.weather.chance_of_rain}%</span>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg" style={{
                  backgroundColor: recommendation.weather.risk_level === 'Low' ? '#10b981'
                    : recommendation.weather.risk_level === 'Medium' ? '#f59e0b'
                    : '#ef4444',
                  opacity: 0.2
                }}>
                  <span className="text-white font-semibold">Risk Level: {recommendation.weather.risk_level}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-[#2a3444] p-4 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Recommendations</h3>
            <div className="space-y-3">
              {recommendation.weather.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-[#1a73e8] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
