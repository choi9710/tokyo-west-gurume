# Tokyo West Gurume (東京西グルメ) - 맛집 검색 웹앱

## Context
도쿄 서쪽 중앙선 역 주변(中野~吉祥寺) 맛집을 검색할 수 있는 웹앱을 만든다. Google Maps Places API를 사용하여 음식 카테고리/지역별로 검색하고, 결과를 리스트로 보여주며 클릭 시 지도와 상세정보를 표시한다.

## 기술 스택
- **React + Vite + TypeScript**
- **Tailwind CSS v4** (Vite 플러그인)
- **@vis.gl/react-google-maps** (지도 표시용)
- **API 키**: `.env` 파일 (`VITE_GOOGLE_MAPS_API_KEY`)
- **배포**: Vercel

## 프로젝트 구조

```
src/
  components/
    layout/Header.tsx           -- 앱 타이틀바
    search/SearchBar.tsx        -- 검색 입력창
    search/AreaSelector.tsx     -- 6개 지역 선택 칩
    search/CategoryFilter.tsx   -- 카테고리 버튼 (韓国料理, 中華料理, 洋食 등)
    results/ResultsList.tsx     -- 결과 카드 그리드
    results/RestaurantCard.tsx  -- 개별 레스토랑 카드
    results/ResultsSkeleton.tsx -- 로딩 스켈레톤
    results/ResultsControls.tsx -- 영업중 필터 / 정렬 / 뷰 모드 토글 바
    results/ResultsMap.tsx      -- 검색 결과 지도 뷰 (핀 클릭 시 상세 모달)
    detail/DetailModal.tsx      -- 상세정보 모달
    detail/DetailMap.tsx        -- Google Map 임베드
    detail/PhotoGallery.tsx     -- 사진 갤러리
  hooks/
    useTextSearch.ts            -- Places Text Search 호출
    usePlaceDetails.ts          -- Place Details 호출
    useDebounce.ts              -- 입력 디바운스
  lib/
    api.ts                      -- Google API fetch 함수들
    constants.ts                -- 지역 좌표, 카테고리 정의
    types.ts                    -- TypeScript 타입 정의
  App.tsx
  main.tsx
  index.css
```

## 핵심 설계

### Google Maps API 사용

1. **Text Search** (`places:searchText`): 검색어 + 지역명을 조합하여 호출. `locationBias`로 중앙선 구간(中野~吉祥寺) 영역을 지정하여 결과 정확도 향상. `X-Goog-FieldMask`로 필요한 필드만 요청하여 비용 최적화.
   - Text Search FieldMask: `places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.priceLevel,places.regularOpeningHours.openNow`
2. **Place Details** (`places/{id}`): 카드 클릭 시 상세정보 조회.
   - Details FieldMask: `id,displayName,formattedAddress,location,rating,userRatingCount,photos,regularOpeningHours,nationalPhoneNumber,websiteUri,googleMapsUri,reviews,priceLevel`
3. **Photo URL**: `places/{photoName}/media?maxWidthPx=400&key=...` 엔드포인트로 사진 표시. 카드 썸네일은 `maxWidthPx=400`, 갤러리는 `maxWidthPx=800` 사용.
4. **Maps JavaScript API**: 상세 모달에서 `@vis.gl/react-google-maps`의 `Map` + `AdvancedMarker`로 지도 표시.

### API 키 보안 및 비용 관리
- **무료 운영 전략**: Google Maps Platform 매월 $200 무료 크레딧 활용. 개인 프로젝트 수준(월 ~6,000회 Text Search)에서 과금 없이 운영 가능.
- 클라이언트에서 직접 Google API를 호출하므로 API 키가 번들에 노출된다. **HTTP 리퍼러 제한**을 Phase 1에서 즉시 설정한다 (Google Cloud Console → API 키 → 앱 제한사항 → HTTP 리퍼러).
- Google Cloud Console에서 **일일 요청 쿼터 상한** 설정 및 **예산 알림**($0 초과 시 알림)을 구성하여 무료 크레딧 초과를 방지한다.
- Places API (New) Text Search는 호출당 ~$0.032이므로, `useDebounce`(300ms, 자유 검색어 입력에만 적용)로 불필요한 호출을 방지한다. 카테고리/지역 칩 클릭은 즉시 트리거.
- 향후 트래픽 증가 시 Vercel Serverless Function 프록시 도입을 검토한다.

### 지역 정의 (constants.ts)
구(Ward) 단위로 그룹화되어 있으며, 총 20개 역/지역을 지원한다.

| 구 | ID | 이름 | 위도 | 경도 |
|---|---|---|---|---|
| 新宿区 | shinjuku | 新宿 | 35.6896 | 139.7006 |
| 新宿区 | shinokubo | 新大久保 | 35.7009 | 139.7004 |
| 新宿区 | takadanobaba | 高田馬場 | 35.7127 | 139.7036 |
| 新宿区 | kagurazaka | 神楽坂 | 35.7021 | 139.7445 |
| 豊島区 | ikebukuro | 池袋 | 35.7295 | 139.7109 |
| 豊島区 | otsuka | 大塚 | 35.7318 | 139.7285 |
| 豊島区 | sugamo | 巣鴨 | 35.7336 | 139.7394 |
| 中野区 | nakano | 中野 | 35.7074 | 139.6645 |
| 中野区 | higashinakano | 東中野 | 35.7121 | 139.6680 |
| 杉並区 | koenji | 高円寺 | 35.7053 | 139.6496 |
| 杉並区 | asagaya | 阿佐ヶ谷 | 35.7042 | 139.6355 |
| 杉並区 | ogikubo | 荻窪 | 35.7038 | 139.6199 |
| 杉並区 | nishiogikubo | 西荻窪 | 35.7031 | 139.5993 |
| 練馬区 | nerima | 練馬 | 35.7357 | 139.6517 |
| 練馬区 | shakujikoen | 石神井公園 | 35.7369 | 139.6214 |
| 練馬区 | oizumigakuen | 大泉学園 | 35.7393 | 139.5971 |
| 練馬区 | hikarigaoka | 光が丘 | 35.7606 | 139.6189 |
| 武蔵野市・三鷹市 | kichijoji | 吉祥寺 | 35.7028 | 139.5798 |
| 武蔵野市・三鷹市 | mitaka | 三鷹 | 35.6836 | 139.5603 |
| 板橋区 | itabashi | 板橋 | 35.7506 | 139.7087 |
| 板橋区 | narimasu | 成増 | 35.7680 | 139.6391 |
| 板橋区 | shimurosakaue | 志村坂上 | 35.7604 | 139.6729 |

### 카테고리
韓国料理, 中華料理, 洋食, 和食, ラーメン, カフェ, 居酒屋, イタリアン, 定食, うどん・そば, アジア料理, スイーツ・ケーキ, ベーカリー

### 검색 동작 규칙
- **다중 지역 선택 시**: 선택된 지역별로 개별 API 호출(`Promise.allSettled`) 후 결과를 병합하여 표시한다. (최대 6회 호출)
  - 병합 결과는 `place.id` 기준으로 중복 제거 후, **rating 내림차순**으로 정렬한다.
  - 일부 지역 호출 실패 시 성공한 결과만 표시하고, 실패한 지역을 알림으로 안내한다.
- **카테고리 + 자유 검색어 조합**: 카테고리를 선택한 상태에서 자유 검색어를 입력하면, 카테고리는 해제되고 자유 검색어만 적용된다. 반대로 카테고리를 클릭하면 자유 검색어는 초기화된다. (상호 배타적)

### 상태 관리
React `useState`로 충분 (외부 라이브러리 불필요):
- `query`, `selectedAreas`, `selectedCategory`, `results`, `isLoading`, `error`, `selectedPlaceId`, `placeDetail`
- `openNowOnly`, `sortBy`, `viewMode`, `userLocation`

### URL 상태 동기화
- 검색 상태(지역·카테고리·자유검색어)를 URL 쿼리스트링에 반영한다.
  - 예: `?areas=koenji,ogikubo&category=ラーメン`, `?areas=nakano&q=焼肉`
- `useState` 초기값에서 `URLSearchParams`로 URL을 읽어 앱 진입 시 상태를 복원한다.
- 상태 변경 시 `useEffect` + `history.replaceState`로 URL을 동기화한다 (히스토리 스택 오염 없이).
- 카테고리와 자유검색어는 상호 배타적이므로 URL에도 둘 중 하나만 포함된다.

### UI 흐름
1. 사용자가 지역 칩 선택 + 카테고리 클릭 또는 자유 검색어 입력
2. Text Search API 호출 → 카드 리스트 표시
3. 카드 클릭 → Place Details API 호출 → 모달로 상세정보 + 지도 표시

### 반응형
- 모바일: 1열 카드, 모달 풀스크린
- 태블릿(md): 2열, 모달 오버레이
- 데스크톱(lg): 3열
- 모바일 풀스크린 모달: `history.pushState`로 뒤로가기 시 모달 닫기 처리

### 접근성 (a11y)
- 모달: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` 지정, 포커스 트랩 적용, **ESC 키로 닫기**
- 지역 칩/카테고리 버튼: `aria-pressed` 속성으로 선택 상태 전달
- RestaurantCard: `<button>` 또는 `role="button"` + `tabIndex` 적용하여 키보드 접근 보장
- 로딩 스켈레톤: `aria-busy="true"` 적용
- PhotoGallery 이미지: `alt="${displayName} 사진 ${index+1}"` 규칙 적용

## 구현 단계

### Phase 1: 프로젝트 초기화 및 기본 UI
1. Vite + React + TS 프로젝트 초기화
2. Tailwind CSS v4, `@vis.gl/react-google-maps` 설치
3. `.env`, `.gitignore` 설정
4. Google Cloud Console에서 API 키 HTTP 리퍼러 제한 설정, 일일 쿼터 상한 및 예산 알림($0 초과) 구성
5. `constants.ts`, `types.ts` 작성
6. `Header`, `SearchBar`, `AreaSelector`, `CategoryFilter` 컴포넌트 구현

### Phase 2: 검색 기능 연동
1. `api.ts`에 `textSearch`, `getPhotoUrl` 함수 구현 (에러 처리 `try/catch` 포함)
2. `useTextSearch`, `useDebounce` 훅 구현 (`error` 상태 포함)
3. `ResultsList`, `RestaurantCard`, `ResultsSkeleton`, 에러/빈 상태 UI 구현
4. `App.tsx`에서 검색 → 결과 표시 연결

### Phase 3: 상세 보기
1. `api.ts`에 `getPlaceDetails` 함수 추가
2. `usePlaceDetails` 훅 구현
3. `DetailModal`, `DetailMap`, `PhotoGallery` 구현
4. 카드 클릭 → 상세 모달 표시 연결

### Phase 4: 마무리 및 배포
1. 로딩 스켈레톤/에러/빈 상태 UI 개선
2. 반응형 디자인 점검
3. Git 초기화 → GitHub 푸시
4. Vercel에 배포, 환경변수 설정
5. Google Cloud Console에서 API 키 리퍼러 제한 및 쿼터/예산 설정 재확인
6. `CLAUDE.md` 생성 — 프로젝트 개발 컨벤션, 빌드/실행 명령어, 디렉토리 구조 요약을 기록하는 Claude Code 설정 파일

## 검증 방법
1. `npm run dev`로 로컬 실행 → 검색/결과/상세 모달 동작 확인
2. 각 지역별, 카테고리별 검색 결과가 올바르게 나오는지 확인
3. 모바일/데스크톱 뷰포트에서 반응형 레이아웃 확인
4. `npm run build` 성공 확인
5. Vercel 배포 후 프로덕션 URL에서 전체 플로우 테스트
