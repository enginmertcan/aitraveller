"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { loadGoogleMapsScript } from "../lib/loadGoogleMapsScript";

export interface PlacePrediction {
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

export interface PlaceDetails {
  description: string;
  coordinates: Coordinates;
}

export const usePlacesAutocomplete = (options?: {
  country?: string;
  types?: string[];
  debounceMs?: number;
}): {
  isLoaded: boolean;
  error: string | null;
  predictions: PlacePrediction[];
  inputValue: string;
  isLoading: boolean;
  setInput: (value: string) => void;
  getPlaceDetails: (placeId: string) => Promise<PlaceDetails | null>;
  clearPredictions: () => void;
} => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | undefined>(undefined);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadGoogleMapsScript();

        if (window.google?.maps) {
          autocompleteService.current = new window.google.maps.places.AutocompleteService();
          geocoder.current = new window.google.maps.Geocoder();
          sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
          setIsLoaded(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Google Maps");
        console.error("Google Maps loading error:", err);
      }
    };

    if (!isLoaded && !error) {
      initialize();
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [isLoaded, error]);

  const getPlacePredictions = useCallback(
    async (input: string) => {
      if (!autocompleteService.current || !input.trim()) {
        setPredictions([]);
        return;
      }

      setIsLoading(true);

      try {
        const request: google.maps.places.AutocompletionRequest = {
          input,
          sessionToken: sessionToken.current ?? undefined,
          componentRestrictions: options?.country ? { country: options.country } : undefined,
          types: options?.types || ["(cities)"],
        };

        const response = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
          autocompleteService.current!.getPlacePredictions(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              reject(status);
            }
          });
        });

        setPredictions(
          response.map(prediction => ({
            description: prediction.description,
            place_id: prediction.place_id,
            structured_formatting: {
              main_text: prediction.structured_formatting.main_text,
              secondary_text: prediction.structured_formatting.secondary_text,
            },
          }))
        );
      } catch (err) {
        console.error("Error fetching predictions:", err);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [options?.country, options?.types]
  );

  const getPlaceDetails = useCallback(async (placeId: string): Promise<PlaceDetails | null> => {
    if (!geocoder.current) return null;

    try {
      const response = await geocoder.current.geocode({ placeId });

      if (response.results[0]) {
        const { location } = response.results[0].geometry;
        return {
          description: response.results[0].formatted_address,
          coordinates: {
            lat: location.lat(),
            lng: location.lng(),
          },
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching place details:", err);
      return null;
    }
  }, []);

  const handleInput = useCallback(
    (value: string) => {
      setInputValue(value);

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        getPlacePredictions(value);
      }, options?.debounceMs || 300);
    },
    [getPlacePredictions, options?.debounceMs]
  );

  const clearPredictions = useCallback(() => {
    setPredictions([]);
    sessionToken.current = new google.maps.places.AutocompleteSessionToken();
  }, []);

  return {
    isLoaded,
    error,
    predictions,
    inputValue,
    isLoading,
    setInput: handleInput,
    getPlaceDetails,
    clearPredictions,
  };
};
