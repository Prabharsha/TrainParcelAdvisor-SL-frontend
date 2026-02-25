import { NextRequest, NextResponse } from 'next/server';

interface AnalyzeRouteRequest {
  source: string;
  destination: string;
  date: string;
  time: string;
  parcelType: string;
  weight: number;
}

interface Route {
  stations: string[];
  estimated_time: string;
  safety_score: number;
}

interface SafetyPrediction {
  safety_score: number;
  risk_factors: string[];
  recommended_time: string;
  alternative_routes: Route[];
}

function calculateSafetyScore(params: AnalyzeRouteRequest): number {
  let score = 80;
  
  // Weight impact
  if (params.weight > 50) score -= 10;
  else if (params.weight > 20) score -= 5;
  
  // Parcel type impact
  if (params.parcelType === 'FRAGILE') score -= 15;
  else if (params.parcelType === 'VALUABLE') score -= 10;
  
  // Time impact (evening/night slightly riskier)
  const hour = parseInt(params.time.split(':')[0]);
  if (hour >= 20 || hour < 6) score -= 5;
  
  return Math.max(0, Math.min(100, score));
}

function getRiskFactors(score: number, params: AnalyzeRouteRequest): string[] {
  const factors: string[] = [];
  
  if (params.weight > 50) {
    factors.push('Heavy parcel - requires careful handling');
  }
  if (params.parcelType === 'FRAGILE') {
    factors.push('Fragile items - extra care needed');
  }
  if (params.parcelType === 'VALUABLE') {
    factors.push('High-value items - enhanced security recommended');
  }
  
  const hour = parseInt(params.time.split(':')[0]);
  if (hour >= 20 || hour < 6) {
    factors.push('Night travel - limited staff availability');
  }
  
  if (score >= 80) {
    factors.push('Route conditions are favorable');
  } else if (score >= 60) {
    factors.push('Moderate risk - standard precautions apply');
  } else {
    factors.push('Higher risk route - consider alternatives');
  }
  
  return factors;
}

function generateAlternativeRoutes(source: string, destination: string): Route[] {
  return [
    {
      stations: [source, `${source}-INT`, destination],
      estimated_time: '4 hours',
      safety_score: 85,
    },
    {
      stations: [source, `${source}-EXP`, destination],
      estimated_time: '3 hours',
      safety_score: 75,
    },
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRouteRequest = await request.json();
    
    if (!body.source || !body.destination || !body.date || !body.time) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }
    
    const safetyScore = calculateSafetyScore(body);
    const riskFactors = getRiskFactors(safetyScore, body);
    const alternativeRoutes = generateAlternativeRoutes(body.source, body.destination);
    
    const prediction: SafetyPrediction = {
      safety_score: safetyScore,
      risk_factors: riskFactors,
      recommended_time: body.time,
      alternative_routes: alternativeRoutes,
    };
    
    return NextResponse.json(prediction, { status: 200 });
  } catch (error) {
    console.error('Safety analysis error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze route safety',
      },
      { status: 500 }
    );
  }
}
