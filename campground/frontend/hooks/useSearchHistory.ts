/**
 * useSearchHistory Hook
 *
 * 검색 히스토리 관리
 * - localStorage에 검색어 저장
 * - 최근 10개까지 유지
 * - 중복 제거
 *
 * @see docs/sprints/sprint-5.md
 */

"use client";

import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "@/lib/utils/storage";
import { useState } from "react";

const STORAGE_KEY = "campground_search_history";
const MAX_HISTORY = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(() => {
    // 초기 상태를 localStorage에서 가져오기
    if (typeof window === "undefined") return [];

    return getLocalStorage<string[]>(STORAGE_KEY, []);
  });

  // 검색어 추가
  const addSearchTerm = (term: string) => {
    if (!term.trim()) return;

    const newHistory = [
      term,
      ...history.filter((h) => h !== term), // 중복 제거
    ].slice(0, MAX_HISTORY); // 최대 10개

    setHistory(newHistory);
    setLocalStorage(STORAGE_KEY, newHistory);
  };

  // 검색어 삭제
  const removeSearchTerm = (term: string) => {
    const newHistory = history.filter((h) => h !== term);
    setHistory(newHistory);
    setLocalStorage(STORAGE_KEY, newHistory);
  };

  // 전체 삭제
  const clearHistory = () => {
    setHistory([]);
    removeLocalStorage(STORAGE_KEY);
  };

  return {
    history,
    addSearchTerm,
    removeSearchTerm,
    clearHistory,
  };
}
