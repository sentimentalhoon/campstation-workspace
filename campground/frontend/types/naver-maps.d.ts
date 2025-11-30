// Naver Maps API 타입 정의

declare global {
  namespace naver.maps {
    class Map {
      constructor(element: HTMLElement, options?: MapOptions);
      setCenter(center: LatLng): void;
      getCenter(): LatLng;
      setZoom(zoom: number): void;
      getZoom(): number;
    }

    interface MapOptions {
      center?: LatLng;
      zoom?: number;
      minZoom?: number;
      maxZoom?: number;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setPosition(position: LatLng): void;
      getPosition(): LatLng;
      setMap(map: Map | null): void;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      icon?: string;
      title?: string;
    }

    interface PointerEvent {
      coord: {
        x: number;
        y: number;
      };
    }

    class Event {
      static addListener(
        target: Map | Marker,
        eventName: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listener: (e: any) => void
      ): void;
      static removeListener(
        target: Map | Marker,
        eventName: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listener: (e: any) => void
      ): void;
    }
  }
}

export {};
