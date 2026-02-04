/**
 * 예약 API
 */

import { API_ENDPOINTS } from "@/lib/constants";
import type {
  CreateReservationRequest,
  CreateReservationResponse,
  GuestReservationLookupDto,
  PageResponse,
  Reservation,
  ReservationSearchParams,
} from "@/types";
import { get, patch, post } from "./client";

export const reservationApi = {
  /**
   * 예약 목록 조회 (내 예약)
   */
  getAll: (params?: ReservationSearchParams) =>
    get<PageResponse<Reservation>>(API_ENDPOINTS.RESERVATIONS.LIST, { params }),

  /**
   * 예약 상세 조회
   */
  getById: (id: number) =>
    get<Reservation>(API_ENDPOINTS.RESERVATIONS.DETAIL(id)),

  /**
   * 예약 생성
   */
  create: (data: CreateReservationRequest) =>
    post<CreateReservationResponse>(API_ENDPOINTS.RESERVATIONS.CREATE, data),

  /**
   * 예약 취소
   */
  cancel: (id: number) =>
    patch<Reservation>(API_ENDPOINTS.RESERVATIONS.CANCEL(id)),

  /**
   * 비회원 예약 조회
   */
  getByGuest: (query: GuestReservationLookupDto) =>
    get<Reservation>(API_ENDPOINTS.RESERVATIONS.GUEST, {
      params: query,
    }),

  /**
   * 사이트의 예약된 날짜 조회
   */
  getSiteReservedDates: (siteId: number) =>
    get<{ checkInDate: string; checkOutDate: string }[]>(
      API_ENDPOINTS.RESERVATIONS.SITE_RESERVED_DATES(siteId),
      { skipAuthRefresh: true }
    ),

  /**
   * 캠핑장의 모든 사이트 예약 날짜 조회
   */
  getCampgroundReservedDates: (campgroundId: number) =>
    get<Record<number, { checkInDate: string; checkOutDate: string }[]>>(
      API_ENDPOINTS.RESERVATIONS.CAMPGROUND_RESERVED_DATES(campgroundId),
      { skipAuthRefresh: true }
    ),
};
