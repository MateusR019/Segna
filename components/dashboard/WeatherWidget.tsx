"use client";
import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Loader2, CloudOff } from "lucide-react";

type WeatherData = {
  current: {
    temperature_2m: number;
    weathercode: number;
    windspeed_10m: number;
  };
};

function getWeatherIcon(code: number) {
  if (code === 0) return <Sun size={18} className="text-[#f59e0b]" />;
  if (code <= 3) return <Cloud size={18} className="text-[#9ca3af]" />;
  if (code <= 67) return <CloudRain size={18} className="text-[#60a5fa]" />;
  if (code <= 77) return <CloudSnow size={18} className="text-[#a5f3fc]" />;
  return <CloudRain size={18} className="text-[#60a5fa]" />;
}

function getWeatherLabel(code: number): string {
  if (code === 0) return "Céu limpo";
  if (code <= 3) return "Nublado";
  if (code <= 49) return "Névoa";
  if (code <= 67) return "Chuva";
  if (code <= 77) return "Neve";
  return "Tempestade";
}

export function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/weather")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(true);
        else setData(d);
      })
      .catch(() => setError(true));
  }, []);

  if (error) return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 flex items-center gap-2 text-[#4a4a4a]">
      <CloudOff size={14} />
      <span className="text-xs">Clima indisponível</span>
    </div>
  );

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 flex items-center gap-3">
      {!data ? (
        <Loader2 size={16} className="text-[#4a4a4a] animate-spin" />
      ) : (
        <>
          {getWeatherIcon(data.current.weathercode)}
          <div>
            <p className="text-base font-semibold text-white leading-none">
              {Math.round(data.current.temperature_2m)}°C
            </p>
            <p className="text-xs text-[#6b7280]">{getWeatherLabel(data.current.weathercode)} · SP</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs text-[#4a4a4a]">
            <Wind size={11} />
            {Math.round(data.current.windspeed_10m)} km/h
          </div>
        </>
      )}
    </div>
  );
}
