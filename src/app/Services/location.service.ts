const REST_COUNTRIES_API_URL = "https://restcountries.com/v3.1";

interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  flags: {
    png: string;
    svg: string;
  };
}

export const getCountries = async (): Promise<Country[]> => {
  try {
    const response = await fetch(`${REST_COUNTRIES_API_URL}/all?fields=name,cca2,flags`);
    if (!response.ok) {
      throw new Error("Failed to fetch countries");
    }
    const countries: Country[] = await response.json();
    return countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
};

export const AVAILABLE_COUNTRIES = [] as Country[];
