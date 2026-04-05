# Tokyo West Gurume (東京西グルメ) - 맛집 검색 웹앱

## Context
도쿄 서쪽 지역(新宿・豊島・中野・杉並・練馬・板橋・武蔵野/三鷹) 맛집을 검색할 수 있는 웹앱. Google Maps Places API (New)를 사용하여 음식 카테고리/지역별로 검색하고, 결과를 리스트/지도로 보여주며 클릭 시 상세정보를 표시한다.

## 기술 스택
- **React 19 + Vite 8 + TypeScript**
- **Tailwind CSS v4** (Vite 플러그인)
- **@vis.gl/react-google-maps v1.8.2** (지도 표시용)
- **API 키**: `.env` 파일 (`VITE_GOOGLE_MAPS_API_KEY`) 또는 앱 내 직접 입력
- **배포**: Vercel

## 프로젝트 구조

```
src/
  components/
    layout/Header.tsx           -- 앱 타이틀바 + API 키 변경 버튼
    search/SearchBar.tsx        -- 검색 입력창
    search/AreaSelector.tsx     -- 구(Ward) 단위 그룹화 지역 선택 칩 (7구, 22개 역)
    search/CategoryFilter.tsx   -- 카테고리 버튼 (13개)
    results/ResultsList.tsx     -- 결과 카드 그리드 (5개씩 페이지네이션)
    results/RestaurantCard.tsx  -- 개별 레스토랑 카드 (즐겨찾기 하트 버튼 포함)
    results/ResultsSkeleton.tsx -- 로딩 스켈레톤
    results/ResultsControls.tsx -- 영업중/가격대/평점 필터 + 정렬 + 뷰 모드 토글
    results/ResultsMap.tsx      -- 검색 결과 지도 뷰 (InfoWindow + bounds 필터)
    detail/DetailModal.tsx      -- 상세정보 모달 (리뷰 온디맨드 로드)
    detail/DetailMap.tsx        -- Static Maps API 이미지 (클릭 시 Google Maps 오픈)
    detail/PhotoGallery.tsx     -- 사진 슬라이더 (스와이프 지원, 최대 5장)
  hooks/
    useTextSearch.ts            -- Places Text Search 호출 + 캐시 (24h TTL)
    usePlaceDetails.ts          -- Place Details 최소 필드 호출 + 즉시 모달 표시
    useFavorites.ts             -- 즐겨찾기 localStorage 관리
    useDebounce.ts              -- 입력 디바운스
  lib/
    api.ts                      -- Google API fetch 함수들
    constants.ts                -- 지역 좌표, 카테고리 정의, FieldMask 상수
    types.ts                    -- TypeScript 타입 정의
  App.tsx                       -- APIProvider 루트 배치, 전체 상태 관리
  main.tsx
  index.css
```

## 핵심 설계

### Google Maps API 사용 및 비용 최적화

#### FieldMask 전략
| 엔드포인트 | FieldMask | 비용 | 타이밍 |
|-----------|-----------|------|--------|
| Text Search | `places.id,displayName,formattedAddress,location,rating,userRatingCount,photos,priceLevel,regularOpeningHours.openNow,regularOpeningHours.weekdayDescriptions` | Advanced (~$0.032) | 검색 시 |
| Place Details | `nationalPhoneNumber,websiteUri,googleMapsUri` | Basic (~$0.005) | 카드 클릭 시 |
| Place Reviews | `reviews` | Preferred (~$0.017) | "レビューを見る" 버튼 클릭 시만 |
| Static Maps | `staticmap?center=...&markers=...` | ~$0.002 | 모달 열 때 |

#### 비용 절감 포인트
- **Place Details 대폭 축소**: 기존 14개 필드 → 3개 (phone/website/mapsUri). 사진·영업시간 등은 Text Search에서 이미 취득하여 모달에 즉시 표시
- **Reviews 분리**: Preferred tier 필드를 별도 온디맨드 요청으로 분리. 버튼 클릭 시에만 과금
- **Static Maps**: DetailMap을 인터랙티브 Map에서 Static Maps 이미지로 교체 ($0.007 → $0.002)
- **InfoWindow 우선 표시**: 지도 마커 클릭 시 팝업(InfoWindow)만 표시, "詳しく見る" 클릭 시에만 Place Details API 호출 → 실수로 클릭한 경우 비용 0
- **캐시 전략**: 검색결과 24h TTL (memory + localStorage `tkg_search_`), 추가 필드 24h TTL (`tkg_extra_`), 리뷰 세션 내 in-memory
- **APIProvider 단일화**: 루트(App.tsx)에 한 번만 초기화. 기존에는 ResultsMap·DetailMap 각각 초기화

### 지역 정의 (constants.ts)
7구, 총 22개 역/지역을 지원한다.

| 구 | 역/지역 |
|---|--------|
| 新宿区 | 新宿, 新大久保, 高田馬場, 神楽坂 |
| 豊島区 | 池袋, 大塚, 巣鴨 |
| 中野区 | 中野, 東中野 |
| 杉並区 | 高円寺, 阿佐ヶ谷, 荻窪, 西荻窪 |
| 練馬区 | 練馬, 石神井公園, 大泉学園, 光が丘 |
| 武蔵野市・三鷹市 | 吉祥寺, 三鷹 |
| 板橋区 | 板橋, 成増, 志村坂上 |

### 카테고리 (13개)
韓国料理, 中華料理, 洋食, 和食, ラーメン, カフェ, 居酒屋, イタリアン, 定食, うどん・そば, アジア料理, スイーツ・ケーキ, ベーカリー

### 검색 동작 규칙
- 카테고리와 자유 검색어는 **상호 배타적** (하나 선택 시 나머지 초기화)
- 자유 검색어는 **최소 2자** 이상이어야 검색 트리거
- 복수 지역 선택 가능: 선택된 각 지역별로 Text Search 1회씩 병렬 호출 → 결과 합산 후 중복 제거
- 일부 지역 호출 실패 시 성공 결과만 표시하고 실패 지역명을 경고 배너로 표시

### 필터 및 정렬
- **영업중 필터** (`openNow`)
- **가격대 필터** (¥/¥¥/¥¥¥/¥¥¥¥ 복수 선택)
- **최소 평점 필터** (3.5+ / 4.0+ / 4.5+)
- **정렬** (평점순 / 리뷰수순 / 거리순, 거리순 선택 시 Geolocation 권한 요청)
- **뷰 모드** (리스트 / 지도)

### 즐겨찾기
- `useFavorites` 훅이 `localStorage('tkg_favorites')`에 Place 객체 배열을 저장
- 카드 우상단 ❤️/🤍 버튼으로 토글 (카드 클릭과 독립)
- 상단 "❤️ お気に入り" 버튼으로 즐겨찾기 전용 뷰 전환

### 지도 뷰 (ResultsMap)
- **InfoWindow**: 마커 클릭 시 이름·평점·영업 여부 팝업 표시. "詳しく見る →" 클릭 시에만 모달 오픈
- **Bounds 필터**: "このエリアで絞り込む" 버튼으로 현재 지도 영역 내 마커만 표시
- **APIProvider**: App.tsx 루트에 단일 인스턴스로 관리

### 상태 관리 (App.tsx)
```
query, selectedAreas, selectedCategory          -- 검색 조건
selectedPlace (Place | null)                   -- 선택된 장소 (Place 객체 전달)
openNowOnly, priceFilter, minRating            -- 필터
sortBy, viewMode, userLocation                 -- 정렬/뷰
showFavorites                                  -- 즐겨찾기 뷰 토글
```

### URL 상태 동기화
- `?areas=koenji,ogikubo&category=ラーメン` 또는 `?areas=nakano&q=焼肉`
- `useState` 초기값에서 `URLSearchParams`로 복원 → `history.replaceState`로 동기화

### 반응형 및 접근성
- 모바일: 1열 카드, 모달 bottom sheet (`items-end`)
- 태블릿(md): 2열, 모달 오버레이 (`items-center`)
- 데스크톱(lg): 3열
- 모바일 뒤로가기: `history.pushState` + `popstate` 이벤트로 모달 닫기
- 포커스 트랩, ESC 키, Tab 순환, `aria-pressed`, `aria-modal`, `role="dialog"`

### API 키 보안
- 클라이언트에서 직접 Google API 호출 → API 키가 번들에 노출됨
- **HTTP 리퍼러 제한** 필수 (Google Cloud Console → API 키 → 앱 제한사항)
- **일일 쿼터 상한** + **예산 알림** ($0 초과 시) 설정 권장
- 향후 트래픽 증가 시 Vercel Serverless Function 프록시 도입 검토

## 비용 추정 (월 $200 무료 크레딧 기준)
- 1인 1일: 3검색 × 2지역 + 10클릭 ≈ $0.18~$0.28
- 1인 1개월 (캐시 포함): 약 $4~$8
- **$200 크레딧으로 약 30~50명/월** 운영 가능

## 구현 완료 기능
- [x] Text Search + 지역/카테고리 검색
- [x] 결과 필터링 (영업중/가격대/평점)
- [x] 정렬 (평점/리뷰수/거리)
- [x] 리스트/지도 뷰 전환
- [x] 페이지네이션 (5개씩 더보기)
- [x] 사진 슬라이더 (스와이프, 화살표, 도트)
- [x] Place Details 모달 (즉시 표시, 추가 필드 비동기 로드)
- [x] 리뷰 온디맨드 로드 (Preferred tier 비용 최소화)
- [x] 가격 정보 추출 (리뷰 텍스트 정규식)
- [x] Static Maps 디테일 지도 (클릭 → Google Maps)
- [x] InfoWindow (마커 팝업 → 모달 전환)
- [x] 지도 Bounds 필터
- [x] 즐겨찾기 (localStorage 영속화)
- [x] 검색결과/추가필드 캐시 (24h TTL, localStorage)
- [x] URL 상태 동기화 (공유 가능)
- [x] 모바일 뒤로가기 처리
- [x] 오늘 영업시간 표시 (JST 기준)
- [x] APIProvider 단일화 (App.tsx 루트)
