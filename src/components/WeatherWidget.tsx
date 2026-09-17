import React from 'react';
import { 
  CloudRain, 
  Sun, 
  Droplets, 
  AlertTriangle, 
  Clock, 
  Fuel 
} from 'lucide-react';
import { WeatherData } from '../types';

interface WeatherWidgetProps {
  weather: WeatherData;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather }) => {
  return (
    <div id="hyperlocal-weather-widget" className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-stone-900 leading-tight">
              Hyper-Local Village Weather
            </h4>
            <span className="text-[11px] text-stone-500 font-medium">
              {weather.location}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <span className="text-base sm:text-lg font-black text-stone-900 block leading-none">
              {weather.tempC}°C
            </span>
            <span className="text-[10px] text-stone-500 font-semibold flex items-center gap-0.5 justify-end">
              <Droplets className="w-3 h-3 text-blue-500" />
              <span>{weather.humidity}% hum</span>
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic 24-48h Rain Forecast Banner */}
      {weather.rainExpectedNext48h ? (
        <div className="bg-sky-50 border border-sky-300 rounded-xl p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-sky-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-extrabold text-sky-950 block">
              Heavy Rain Forecasted: {weather.rainSumMm} mm ({weather.rainProbabilityMax}% chance)
            </span>
            <span className="text-sky-800 font-medium">
              Pause irrigation today. Delaying tube-well pumping prevents root waterlogging and saves ~₹360 in diesel!
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-900 font-medium">
          <Sun className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>No heavy rain predicted in next 48h. Standard irrigation schedule applies.</span>
        </div>
      )}

      {/* 3-Day Forecast mini strip */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-100 text-center text-xs">
        <div className="bg-stone-50 p-2 rounded-xl border border-stone-200/70">
          <span className="text-[10px] text-stone-500 font-bold block">Today</span>
          <span className="font-extrabold text-stone-800">{weather.tempC}°C</span>
          <span className="text-[10px] text-blue-600 block font-semibold">Dry / Sunny</span>
        </div>

        <div className="bg-sky-50/80 p-2 rounded-xl border border-sky-200">
          <span className="text-[10px] text-sky-700 font-bold block">Tomorrow</span>
          <span className="font-extrabold text-sky-950">{weather.tempC - 2}°C</span>
          <span className="text-[10px] text-sky-700 block font-bold">
            {weather.forecastDay1Rain > 0 ? `🌧️ ${weather.forecastDay1Rain}mm` : 'Scattered'}
          </span>
        </div>

        <div className="bg-stone-50 p-2 rounded-xl border border-stone-200/70">
          <span className="text-[10px] text-stone-500 font-bold block">Day After</span>
          <span className="font-extrabold text-stone-800">{weather.tempC - 1}°C</span>
          <span className="text-[10px] text-stone-600 block font-semibold">
            {weather.forecastDay2Rain > 0 ? `🌦️ ${weather.forecastDay2Rain}mm` : 'Normal'}
          </span>
        </div>
      </div>
    </div>
  );
};
