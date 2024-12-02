"use client";

import { useEffect, useState } from "react";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

import { loadGoogleMapsScript } from "../lib/loadGoogleMapsScript";

export interface Place {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlaceSelection {
  description: string;
  coordinates: Coordinates;
}

export const useGooglePlaces = (): {
  isLoaded: boolean;
  ready: boolean;
  value: string;
  suggestions: Place[];
  status: string;
  error: string | null;
  setValue: (value: string, shouldFetchData?: boolean) => void;
  clearSuggestions: () => void;
  handleSelect: (description: string) => Promise<PlaceSelection | null>;
} => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        await loadGoogleMapsScript();
        setIsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Google Maps");
        console.error("Google Maps loading error:", err);
      }
    };

    initializeGoogleMaps();
  }, []);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ["(cities)"],
      componentRestrictions: { country: "TR" },
    },
    debounce: 300,
    cache: true,
  });

  const handleSelect = async (description: string): Promise<PlaceSelection | null> => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      return { description, coordinates: { lat, lng } };
    } catch (err) {
      console.error("Error selecting place:", err);
      return null;
    }
  };

  return {
    isLoaded,
    ready,
    value,
    suggestions: data,
    status,
    error,
    setValue,
    clearSuggestions,
    handleSelect,
  };
};
