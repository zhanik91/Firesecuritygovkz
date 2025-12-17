
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RegionCitySelectorProps {
  selectedRegion: string;
  selectedCity: string;
  onRegionChange: (region: string) => void;
  onCityChange: (city: string) => void;
}

const regionsAndCities = {
  'almaty': {
    name: 'Алматинская область',
    cities: ['Алматы', 'Талдыкорган', 'Капчагай', 'Текели', 'Ушарал']
  },
  'astana': {
    name: 'Нур-Султан',
    cities: ['Нур-Султан']
  },
  'shymkent': {
    name: 'Туркестанская область',
    cities: ['Шымкент', 'Туркестан', 'Арысь', 'Кентау']
  },
  'karaganda': {
    name: 'Карагандинская область',
    cities: ['Караганда', 'Темиртау', 'Жезказган', 'Сатпаев', 'Балхаш']
  },
  'aktobe': {
    name: 'Актюбинская область',
    cities: ['Актобе', 'Алга', 'Кандыагаш', 'Хромтау']
  },
  'pavlodar': {
    name: 'Павлодарская область',
    cities: ['Павлодар', 'Экибастуз', 'Аксу', 'Иртышск']
  },
  'usk': {
    name: 'Восточно-Казахстанская область',
    cities: ['Усть-Каменогорск', 'Семей', 'Риддер', 'Зыряновск']
  },
  'atyrau': {
    name: 'Атырауская область',
    cities: ['Атырау', 'Кульсары', 'Индер']
  },
  'kostanay': {
    name: 'Костанайская область',
    cities: ['Костанай', 'Рудный', 'Лисаковск', 'Житикара']
  },
  'kyzylorda': {
    name: 'Кызылординская область',
    cities: ['Кызылорда', 'Байконур', 'Аральск', 'Жалагаш']
  },
  'mangystau': {
    name: 'Мангистауская область',
    cities: ['Актау', 'Жанаозен', 'Бейнеу', 'Форт-Шевченко']
  },
  'wko': {
    name: 'Западно-Казахстанская область',
    cities: ['Уральск', 'Аксай', 'Зайсан', 'Казталовка']
  },
  'nko': {
    name: 'Северо-Казахстанская область',
    cities: ['Петропавловск', 'Сергеевка', 'Булаево', 'Тайынша']
  },
  'zhambyl': {
    name: 'Жамбылская область',
    cities: ['Тараз', 'Жамбыл', 'Шу', 'Каратау']
  }
};

export default function RegionCitySelector({ 
  selectedRegion, 
  selectedCity, 
  onRegionChange, 
  onCityChange 
}: RegionCitySelectorProps) {
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    if (selectedRegion && selectedRegion !== 'all') {
      const region = regionsAndCities[selectedRegion as keyof typeof regionsAndCities];
      setAvailableCities(region ? region.cities : []);
      
      // Сбросить город если он не в новом регионе
      if (selectedCity !== 'all' && region && !region.cities.includes(selectedCity)) {
        onCityChange('all');
      }
    } else {
      setAvailableCities([]);
    }
  }, [selectedRegion, selectedCity, onCityChange]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">Регион</label>
        <Select value={selectedRegion} onValueChange={onRegionChange}>
          <SelectTrigger>
            <SelectValue placeholder="Все регионы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все регионы</SelectItem>
            {Object.entries(regionsAndCities).map(([key, region]) => (
              <SelectItem key={key} value={key}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Город</label>
        <Select 
          value={selectedCity} 
          onValueChange={onCityChange}
          disabled={!selectedRegion || selectedRegion === 'all'}
        >
          <SelectTrigger>
            <SelectValue placeholder="Все города" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все города</SelectItem>
            {availableCities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
