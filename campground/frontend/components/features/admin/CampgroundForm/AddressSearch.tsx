/**
 * AddressSearch 컴포넌트
 * 네이버 맵 Geocoding API를 사용한 주소 검색
 */

"use client";

import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";
import { useState } from "react";

type AddressSearchProps = {
  onSelect: (address: string, lat: number, lng: number) => void;
  currentAddress?: string;
};

type SearchResult = {
  roadAddress: string;
  jibunAddress: string;
  x: string; // 경도
  y: string; // 위도
};

export function AddressSearch({
  onSelect,
  currentAddress = "",
}: AddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState(currentAddress);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("주소를 입력해주세요.");
      return;
    }

    setIsSearching(true);
    setError("");
    setSearchResults([]);

    try {
      // 네이버 맵 Geocoding API 호출
      const response = await fetch(
        `/api/naver/geocode?query=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error("주소 검색에 실패했습니다.");
      }

      const data = await response.json();

      if (data.addresses && data.addresses.length > 0) {
        setSearchResults(data.addresses);
        setShowResults(true);
      } else {
        setError(
          "검색 결과가 없습니다. 더 간단한 주소로 시도해보세요. (예: '서울시 강남구', '경기도 이천시')"
        );
      }
    } catch (err) {
      console.error("Address search error:", err);
      setError("주소 검색 중 오류가 발생했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAddress = (result: SearchResult) => {
    const address = result.roadAddress || result.jibunAddress;
    const lat = parseFloat(result.y);
    const lng = parseFloat(result.x);

    onSelect(address, lat, lng);
    setShowResults(false);
    setSearchQuery(address);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-2">
      {/* 검색 입력 */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="주소를 입력하세요 (예: 서울시 강남구 테헤란로)"
            className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          {isSearching ? "검색중..." : "검색"}
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 검색 결과 */}
      {showResults && searchResults.length > 0 && (
        <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {searchResults.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectAddress(result)}
              className="w-full border-b border-gray-100 p-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
            >
              <div className="font-medium text-gray-900">
                {result.roadAddress}
              </div>
              {result.jibunAddress && (
                <div className="mt-1 text-sm text-gray-500">
                  (지번: {result.jibunAddress})
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 도움말 */}
      <p className="text-xs text-gray-500">
        💡 주소를 검색하면 위도/경도가 자동으로 입력됩니다.
      </p>
    </div>
  );
}
