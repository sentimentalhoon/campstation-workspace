/**
 * LocationSection Component
 * 위치 정보 섹션
 */


import { AddressSearch } from "../AddressSearch";
import { MapPicker } from "../MapPicker";
import { FormField } from "./FormField";
import { FormSection } from "./FormSection";

interface LocationSectionProps {
  address: string;
  latitude: number;
  longitude: number;
  errors: Record<string, string>;
  onLocationUpdate: (address: string, lat: number, lng: number) => void;
  onChange: (name: string, value: string | number) => void;
}

export function LocationSection({
  address,
  latitude,
  longitude,
  errors,
  onLocationUpdate,
  onChange,
}: LocationSectionProps) {
  return (
    <FormSection title="위치 정보">
      {/* Address Search */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          주소 검색 *
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <AddressSearch
              currentAddress={address}
              onSelect={onLocationUpdate}
            />
          </div>
          <MapPicker
            initialLat={latitude || 37.5665}
            initialLng={longitude || 126.978}
            onSelect={onLocationUpdate}
          />
        </div>
      </div>

      {/* Address Display */}
      <FormField
        label="선택된 주소"
        name="address"
        value={address}
        onChange={onChange}
        error={errors.address}
        placeholder="주소를 검색하면 자동으로 입력됩니다"
        readonly
      />

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="위도"
          name="latitude"
          type="number"
          value={latitude}
          onChange={onChange}
          error={errors.latitude}
          placeholder="자동 입력됩니다"
          readonly
          step="any"
        />
        <FormField
          label="경도"
          name="longitude"
          type="number"
          value={longitude}
          onChange={onChange}
          error={errors.longitude}
          placeholder="자동 입력됩니다"
          readonly
          step="any"
        />
      </div>
    </FormSection>
  );
}
