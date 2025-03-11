"use client";

import { useCallback, useEffect, useState } from "react";

import { loadGoogleMapsScript } from "../lib/loadGoogleMapsScript";

export interface Place {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  country?: string;
}

interface UsePlacesOptions {
  country?: string;
  types?: string[];
  debounceMs?: number;
}

export const usePlaces = (
  options: UsePlacesOptions = {}
): {
  isLoaded: boolean;
  error: string | null;
  predictions: Place[];
  inputValue: string;
  isLoading: boolean;
  selectedPlace: Place | null;
  setInput: (value: string) => void;
  getPlaceDetails: (placeId: string) => Promise<PlaceDetails | null>;
  clearPredictions: () => void;
  handleSelect: (place: Place) => Promise<void>;
} => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Place[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initialize = async () => {
      try {
        await loadGoogleMapsScript();
        setIsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Google Maps");
        console.error("Google Maps initialization error:", err);
      }
    };

    if (!isLoaded && !error) {
      initialize();
    }
  }, [isLoaded, error]);

  // Get place predictions
  const getPredictions = useCallback(
    async (input: string) => {
      if (!window.google?.maps || !input.trim()) {
        setPredictions([]);
        return;
      }

      setIsLoading(true);

      try {
        const service = new window.google.maps.places.AutocompleteService();
        const sessionToken = new window.google.maps.places.AutocompleteSessionToken();

        const request: google.maps.places.AutocompletionRequest = {
          input,
          sessionToken,
          types: options.types || ["(cities)"],
          componentRestrictions: options.country ? { country: options.country } : undefined,
        };

        const results = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
          service.getPlacePredictions(request, (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              resolve(predictions);
            } else {
              reject(status);
            }
          });
        });

        setPredictions(
          results.map(prediction => ({
            placeId: prediction.place_id,
            description: prediction.description,
            mainText: prediction.structured_formatting.main_text,
            secondaryText: prediction.structured_formatting.secondary_text,
          }))
        );
      } catch (err) {
        console.error("Error fetching predictions:", err);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [options.country, options.types]
  );

  // Get place details
  const getPlaceDetails = useCallback(async (placeId: string): Promise<PlaceDetails | null> => {
    if (!window.google?.maps) return null;

    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ placeId });

      if (response.results[0]) {
        const { location } = response.results[0].geometry;
        const country = response.results[0].address_components?.find(
          component => component.types.includes("country")
        )?.long_name;

        return {
          description: response.results[0].formatted_address,
          coordinates: {
            lat: location.lat(),
            lng: location.lng(),
          },
          country,
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching place details:", err);
      return null;
    }
  }, []);

  // Handle input with debounce
  const handleInput = useCallback(
    (value: string) => {
      setInputValue(value);
      if (!selectedPlace || value !== selectedPlace.mainText) {
        setSelectedPlace(null);
        const timeoutId = setTimeout(() => {
          getPredictions(value);
        }, options.debounceMs || 300);
        return () => clearTimeout(timeoutId);
      }
    },
    [getPredictions, options.debounceMs, selectedPlace]
  );

  const handleSelect = useCallback(async (place: Place) => {
    setSelectedPlace(place);
    setInputValue(place.mainText);
    setPredictions([]);
  }, []);

  const clearPredictions = useCallback(() => {
    setPredictions([]);
  }, []);

  return {
    isLoaded,
    error,
    predictions,
    inputValue,
    isLoading,
    selectedPlace,
    setInput: handleInput,
    getPlaceDetails,
    clearPredictions,
    handleSelect,
  };
};
