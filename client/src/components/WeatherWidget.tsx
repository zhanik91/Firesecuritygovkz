import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, CloudRain, Sun, Wind, Thermometer, Eye, MapPin } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  city: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Получаем погоду для Алматы через OpenWeatherMap API
        const API_KEY = ''; // Здесь нужен реальный API ключ
        if (!API_KEY) {
          setError('API ключ не настроен');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Almaty,KZ&appid=${API_KEY}&units=metric&lang=ru`
        );
        
        if (!response.ok) throw new Error('Ошибка загрузки погоды');
        
        const data = await response.json();
        
        setWeather({
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
          visibility: Math.round(data.visibility / 1000),
          city: 'Алматы'
        });
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить данные о погоде');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    // Update weather every 10 minutes
    const weatherTimer = setInterval(fetchWeather, 10 * 60 * 1000);
    
    return () => {
      clearInterval(timer);
      clearInterval(weatherTimer);
    };
  }, []);

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('дождь') || condition.includes('осадки')) {
      return <CloudRain className="h-8 w-8 text-blue-500" />;
    } else if (condition.includes('солнце') || condition.includes('ясно')) {
      return <Sun className="h-8 w-8 text-yellow-500" />;
    } else {
      return <Cloud className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Алматы
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date and Time */}
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold text-blue-600">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Weather */}
        {loading ? (
          <div className="border-t pt-4">
            <div className="text-center text-sm text-muted-foreground">
              Загружаем погоду...
            </div>
          </div>
        ) : error ? (
          <div className="border-t pt-4">
            <div className="text-center text-sm text-red-500">
              {error}
            </div>
          </div>
        ) : weather ? (
          <>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Погода сейчас</span>
                {getWeatherIcon(weather.condition)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Температура</span>
                  </div>
                  <span className="text-sm font-medium">{weather.temperature}°C</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Ветер</span>
                  </div>
                  <span className="text-sm font-medium">{weather.windSpeed} км/ч</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Видимость</span>
                  </div>
                  <span className="text-sm font-medium">{weather.visibility} км</span>
                </div>
              </div>
              
              <div className="mt-3 text-center">
                <span className="text-sm text-muted-foreground capitalize">{weather.condition}</span>
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}