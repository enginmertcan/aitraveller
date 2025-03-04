import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_VISUAL_CROSSING_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  date: string;
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitationProbability: number;
  uvIndex: number;
}

export async function getWeatherForecast(location: string, date: Date): Promise<WeatherData[]> {
  try {
    const formattedDate = date.toISOString().split('T')[0];
    const response = await fetch(
      `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}/${formattedDate}?unitGroup=metric&include=days&key=${API_KEY}&contentType=json`
    );

    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }

    const data = await response.json();
    
    return data.days.map((day: any) => ({
      date: day.datetime,
      temperature: day.temp,
      feelsLike: day.feelslike,
      description: day.conditions,
      icon: getWeatherIcon(day.icon),
      humidity: day.humidity,
      windSpeed: day.windspeed,
      precipitationProbability: day.precipprob,
      uvIndex: day.uvindex
    }));
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return [];
  }
}

// Helper function to map Visual Crossing icons to our icon set
function getWeatherIcon(icon: string): string {
  const iconMap: { [key: string]: string } = {
    'clear-day': '01d',
    'clear-night': '01n',
    'partly-cloudy-day': '02d',
    'partly-cloudy-night': '02n',
    'cloudy': '03d',
    'rain': '10d',
    'snow': '13d',
    'sleet': '13d',
    'wind': '50d',
    'fog': '50d',
    'thunder-rain': '11d',
    'thunder-showers-day': '11d',
    'thunder-showers-night': '11n',
  };

  return iconMap[icon] || '01d';
} 