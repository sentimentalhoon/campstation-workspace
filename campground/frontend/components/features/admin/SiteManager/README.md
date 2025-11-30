/\*\*

- SiteManager 사용 예시
-
- 캠핑장 구역(Site) 관리를 위한 컴포넌트 사용법
  \*/

/\*\*

- 기본 사용 예시
-
- ```tsx

  ```
- import { SiteManager } from "@/components/features/admin/SiteManager";
- import { convertSiteToFormData } from "@/lib/utils/siteFormData";
- import { ownerApi } from "@/lib/api/owner";
-
- function CampgroundSitesPage() {
- const [sites, setSites] = useState<Site[]>([]);
- const campgroundId = 1; // 실제 캠핑장 ID
-
- // 사이트 목록 불러오기
- useEffect(() => {
-     const fetchSites = async () => {
-       const res = await ownerApi.getSites(campgroundId);
-       setSites(res.content || []);
-     };
-     fetchSites();
- }, [campgroundId]);
-
- // 사이트 추가
- const handleSiteAdd = async (data: SiteFormData) => {
-     const formData = convertSiteToFormData(data, campgroundId);
-     await ownerApi.createSite(formData);
-
-     // 목록 새로고침
-     const res = await ownerApi.getSites(campgroundId);
-     setSites(res.content || []);
- };
-
- // 사이트 수정
- const handleSiteUpdate = async (siteId: number, data: SiteFormData) => {
-     const formData = convertSiteToFormData(data);
-     await ownerApi.updateSite(siteId, formData);
-
-     // 목록 새로고침
-     const res = await ownerApi.getSites(campgroundId);
-     setSites(res.content || []);
- };
-
- // 사이트 삭제
- const handleSiteDelete = async (siteId: number) => {
-     await ownerApi.deleteSite(siteId);
-
-     // 목록 새로고침
-     const res = await ownerApi.getSites(campgroundId);
-     setSites(res.content || []);
- };
-
- return (
-     <SiteManager
-       campgroundId={campgroundId}
-       sites={sites}
-       onSiteAdd={handleSiteAdd}
-       onSiteUpdate={handleSiteUpdate}
-       onSiteDelete={handleSiteDelete}
-     />
- );
- }
- ```
  */
  ```

/\*\*

- 이미지 최적화 프로세스
-
- 1.  사용자가 이미지 선택
- 2.  validateImageFile()로 파일 검증 (크기, 형식)
- 3.  optimizeImages()로 자동 최적화
- - 1920x1080 최대 크기
- - JPEG 형식 (서버 호환성)
- - 85% 품질
- - 500KB 목표 크기
- 4.  최적화된 이미지 미리보기 표시
- 5.  FormData로 변환하여 서버 전송
- 6.  서버에서 원본(originalImageUrls)과 썸네일(thumbnailUrls) 생성
      \*/

/\*\*

- 백엔드 요구사항
-
- POST /api/v1/sites
- PUT /api/v1/sites/{siteId}
-
- FormData 필드:
- - campgroundId: number (생성 시만)
- - siteNumber: string
- - siteType: string (CARAVAN, GLAMP, CABIN)
- - capacity: number
- - description: string
- - basePrice: number
- - status: string (AVAILABLE, UNAVAILABLE, MAINTENANCE)
- - amenities: string[] (다중값)
- - latitude?: number
- - longitude?: number
- - imageFiles: File[] (다중 파일)
-
- 응답:
- {
- id: number
- siteNumber: string
- ...
- thumbnailUrls: string[]
- originalImageUrls: string[]
- }
  \*/

export {};
