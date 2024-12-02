/// <reference types="@types/google.maps" />

declare module "use-places-autocomplete" {
  export interface Suggestion {
    description: string;
    place_id: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
    terms: Array<{
      offset: number;
      value: string;
    }>;
    types: string[];
  }

  export interface RequestOptions {
    location?: google.maps.LatLng;
    radius?: number;
    types?: string[];
    componentRestrictions?: {
      country: string | string[];
    };
  }

  export interface UsePlacesAutocompleteOptions {
    requestOptions?: RequestOptions;
    debounce?: number;
    cache?: boolean;
    cacheKey?: string;
    defaultValue?: string;
    initOnMount?: boolean;
  }

  export interface UsePlacesAutocompleteResult {
    ready: boolean;
    value: string;
    suggestions: {
      status: string;
      data: Suggestion[];
    };
    setValue: (value: string, shouldFetchData?: boolean) => void;
    clearSuggestions: () => void;
  }

  export default function usePlacesAutocomplete(options?: UsePlacesAutocompleteOptions): UsePlacesAutocompleteResult;

  export function getGeocode(args: {
    address?: string;
    location?: { lat: number; lng: number };
    placeId?: string;
  }): Promise<google.maps.GeocoderResult[]>;

  export function getLatLng(result: google.maps.GeocoderResult): { lat: number; lng: number };

  export function getZipCode(result: google.maps.GeocoderResult, useShortName?: boolean): string;
}
