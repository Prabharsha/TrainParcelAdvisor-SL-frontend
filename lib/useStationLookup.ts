'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { publicApi } from '@/lib/api';
import type { Station } from '@/lib/types';

// Module-level cache so stations are fetched only once across all components
let cachedStations: Station[] | null = null;
let fetchPromise: Promise<Station[]> | null = null;

async function loadStations(): Promise<Station[]> {
  if (cachedStations) return cachedStations;
  if (!fetchPromise) {
    fetchPromise = publicApi.getDestinations().then((data) => {
      cachedStations = data;
      return data;
    }).catch(() => {
      fetchPromise = null;
      return [];
    });
  }
  return fetchPromise;
}

/**
 * Hook that provides a station code → full name lookup.
 * Fetches stations once and caches them globally.
 */
export function useStationLookup() {
  const [stations, setStations] = useState<Station[]>(cachedStations || []);

  useEffect(() => {
    if (cachedStations) {
      setStations(cachedStations);
      return;
    }
    loadStations().then(setStations);
  }, []);

  const stationMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of stations) {
      map.set(s.code, s.name);
    }
    return map;
  }, [stations]);

  /** Resolve a station code to its full name. Falls back to the code itself. */
  const getStationName = useCallback(
    (code: string): string => {
      if (!code) return code;
      return stationMap.get(code) || code;
    },
    [stationMap]
  );

  return { stations, getStationName };
}
