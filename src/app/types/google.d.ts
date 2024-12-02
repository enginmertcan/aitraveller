interface Window {
  google: {
    maps: {
      places: {
        AutocompleteService: new () => google.maps.places.AutocompleteService;
        PlacesService: new (attrContainer: HTMLDivElement) => google.maps.places.PlacesService;
        AutocompleteSessionToken: new () => google.maps.places.AutocompleteSessionToken;
      };
      Geocoder: new () => google.maps.Geocoder;
    };
  };
}
