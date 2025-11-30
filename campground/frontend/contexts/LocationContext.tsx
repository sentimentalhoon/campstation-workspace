/**
 * LocationContext
 *
 * 사용자의 현재 위치 정보를 전역으로 관리
 * - localStorage에 저장하여 지속성 유지
 * - 다른 페이지에서도 위치 정보 공유
 */

"use client";

import { createContext, useContext, useState } from "react";

type Location = {
  lat: number;
  lng: number;
};

type LocationContextType = {
  currentLocation: Location | null;
  setCurrentLocation: (location: Location | null) => void;
  getCurrentLocation: () => Promise<Location>;
  isLoading: boolean;
  error: string | null;
};

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  // localStorage에서 초기값 불러오기
  const getInitialLocation = (): Location | null => {
    if (typeof window === "undefined") return null;

    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      try {
        return JSON.parse(savedLocation);
      } catch (error) {
        console.error("위치 정보 파싱 실패:", error);
        localStorage.removeItem("userLocation");
        return null;
      }
    }
    return null;
  };

  const [currentLocation, setCurrentLocationState] = useState<Location | null>(
    getInitialLocation
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 위치 정보 저장
  const setCurrentLocation = (location: Location | null) => {
    setCurrentLocationState(location);
    if (location) {
      localStorage.setItem("userLocation", JSON.stringify(location));
    } else {
      localStorage.removeItem("userLocation");
    }
  };

  // 현재 위치 가져오기
  const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        const error = "이 브라우저는 위치 정보를 지원하지 않습니다.";
        setError(error);
        setIsLoading(false);
        reject(new Error(error));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          setIsLoading(false);
          resolve(location);
        },
        (error) => {
          const errorMessage = "현재 위치를 가져올 수 없습니다.";
          setError(errorMessage);
          setIsLoading(false);
          console.error("위치 정보 오류:", error);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        setCurrentLocation,
        getCurrentLocation,
        isLoading,
        error,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
