// features/search/hooks/useCitySearch.ts
import { useState } from "react";
import { searchCities } from "../api/geocoding";

export function useCitySearch() {
  const [results, setResults] = useState<Array<{ name: string; country: string; lat: number; lon: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchCitiesAsync = async (query: string) => {
    setIsLoading(true);
    try {
      const cities = await searchCities(query);
      setResults(cities);
      return cities;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    results, 
    isLoading, 
    searchCities: searchCitiesAsync 
  };
}