# 🍜 Tokyo West Gurume（東京西グルメ）

도쿄 중앙선 역 주변（中野〜吉祥寺）의 맛집을 검색할 수 있는 웹앱입니다.  
지역과 카테고리를 선택하거나 자유롭게 검색하면 Google Maps 기반으로 맛집 목록을 보여줍니다.

---

## 목차

1. [필요한 것들](#1-필요한-것들)
2. [Node.js 설치](#2-nodejs-설치)
3. [프로젝트 내려받기](#3-프로젝트-내려받기)
4. [Google Maps API 키 발급](#4-google-maps-api-키-발급)
5. [API 키 설정](#5-api-키-설정)
6. [로컬에서 실행하기](#6-로컬에서-실행하기)
7. [Vercel로 배포하기](#7-vercel로-배포하기)
8. [API 키 보안 설정 (중요)](#8-api-키-보안-설정-중요)
9. [주의사항 및 비용](#9-주의사항-및-비용)

---

## 1. 필요한 것들

- **컴퓨터**: Windows / Mac / Linux 모두 가능
- **인터넷 연결**
- **Google 계정**: API 키 발급에 필요
- **GitHub 계정**: 코드 업로드에 필요 ([무료 가입](https://github.com))
- **Vercel 계정**: 배포에 필요 ([무료 가입](https://vercel.com))

---

## 2. Node.js 설치

Node.js가 없으면 앱을 실행할 수 없습니다.

1. [https://nodejs.org](https://nodejs.org) 접속
2. **LTS** 버전 다운로드 및 설치 (기본 설정으로 Next 계속 클릭)
3. 설치 확인: 터미널(명령 프롬프트)을 열고 아래 명령어 입력

```bash
node -v
```

`v20.x.x` 같은 버전 번호가 나오면 성공입니다.

---

## 3. 프로젝트 내려받기

터미널에서 아래 명령어를 순서대로 입력합니다.

```bash
# 프로젝트 클론 (GitHub 주소를 본인 레포지토리 주소로 변경)
git clone https://github.com/본인계정/레포지토리이름.git

# 프로젝트 폴더로 이동
cd 레포지토리이름

# 필요한 패키지 설치 (시간이 조금 걸릴 수 있습니다)
npm install
```

---

## 4. Google Maps API 키 발급

이 앱은 Google Maps의 Places API를 사용합니다. API 키 발급은 무료이며, 월 $200 무료 크레딧이 제공됩니다.

### 4-1. Google Cloud Console 접속

1. [https://console.cloud.google.com](https://console.cloud.google.com) 접속
2. Google 계정으로 로그인

### 4-2. 프로젝트 생성

1. 상단 「프로젝트 선택」 클릭
2. 「새 프로젝트」 클릭
3. 프로젝트 이름 입력 (예: `tokyo-gurume`) 후 「만들기」

### 4-3. 결제 계정 연결

> ⚠️ API 사용을 위해 신용카드 등록이 필요합니다. 월 $200 무료 크레딧 범위 내에서 개인 수준 사용 시 실제 청구는 거의 없습니다. 단, 비용 관리 설정(9번 참고)을 꼭 하세요.

1. 왼쪽 메뉴 → 「결제」
2. 결제 계정 연결 또는 생성

### 4-4. API 활성화

아래 두 가지 API를 활성화합니다.

1. 상단 검색창에 **Places API (New)** 검색 → 「사용 설정」
2. 상단 검색창에 **Maps JavaScript API** 검색 → 「사용 설정」

### 4-5. API 키 생성

1. 왼쪽 메뉴 → 「API 및 서비스」 → 「사용자 인증 정보」
2. 상단 「+ 사용자 인증 정보 만들기」 → 「API 키」 클릭
3. 생성된 API 키를 복사해두세요 (나중에 사용)

---

## 5. API 키 설정

프로젝트 폴더 안에 `.env` 파일을 만들고 아래 내용을 입력합니다.

```
VITE_GOOGLE_MAPS_API_KEY=여기에_복사한_API_키_붙여넣기
```

**예시:**
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ
```

> `.env` 파일은 `.gitignore`에 포함되어 있어 GitHub에 업로드되지 않습니다. 절대 GitHub에 올리지 마세요.

---

## 6. 로컬에서 실행하기

```bash
npm run dev
```

터미널에 `http://localhost:5173` 주소가 나타나면 브라우저에서 접속하세요.

종료하려면 터미널에서 `Ctrl + C` 를 누릅니다.

---

## 7. Vercel로 배포하기

### 7-1. GitHub에 코드 올리기

1. GitHub에서 새 레포지토리 생성 (Private 권장)
2. 아래 명령어 실행:

```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/본인계정/레포지토리이름.git
git push -u origin main
```

### 7-2. Vercel 배포

1. [https://vercel.com](https://vercel.com) 접속 → GitHub 계정으로 로그인
2. 「Add New Project」 클릭
3. 방금 올린 GitHub 레포지토리 선택 → 「Import」
4. 빌드 설정은 자동으로 감지됩니다 (변경 불필요)
5. **「Environment Variables」 섹션에서 API 키 추가:**
   - Name: `VITE_GOOGLE_MAPS_API_KEY`
   - Value: 발급받은 API 키
6. 「Deploy」 클릭

배포 완료 후 `https://프로젝트이름.vercel.app` 주소로 접속 가능합니다.

### 7-3. 이후 업데이트

코드를 수정하고 `git push`하면 Vercel이 자동으로 재배포합니다.

---

## 8. API 키 보안 설정 (중요)

API 키가 노출되면 타인이 사용해 요금이 청구될 수 있습니다. 반드시 아래 설정을 하세요.

### HTTP 리퍼러 제한 (배포 후 즉시 설정)

1. Google Cloud Console → 「API 및 서비스」 → 「사용자 인증 정보」
2. 생성한 API 키 클릭
3. 「앱 제한사항」 → 「웹사이트」 선택
4. 아래 주소 추가:
   - `https://프로젝트이름.vercel.app/*`
   - `http://localhost:5173/*` (로컬 개발용)
5. 「저장」

이 설정 후 등록된 주소에서만 API 키가 동작합니다.

---

## 9. 주의사항 및 비용

### 무료 사용 범위

| API | 무료 한도 (월) | 초과 시 단가 |
|-----|--------------|------------|
| Places Text Search | 약 5,000회 | $0.032/회 |
| Place Details | 약 5,000회 | $0.017/회 |
| Maps JavaScript API | 28,000회 | $0.007/회 |

개인 수준의 사용(하루 수십~수백 회)에서는 무료 크레딧($200/월) 내에서 운영 가능합니다.

### 예산 알림 설정 (강력 권장)

예상치 못한 과금을 방지하려면 알림을 설정하세요.

1. Google Cloud Console → 「결제」 → 「예산 및 알림」
2. 「예산 만들기」 클릭
3. 금액을 `$1`로 설정 → $1 초과 시 이메일 알림

### 일일 쿼터 제한 설정

1. 「API 및 서비스」 → 「할당량」
2. Places API 검색 → 일일 최대 요청 수 제한 설정

### 기타 주의사항

- `.env` 파일은 절대 GitHub에 올리지 마세요
- API 키를 코드에 직접 쓰지 마세요 (항상 `.env` 파일 사용)
- 배포 URL이 바뀌면 HTTP 리퍼러 설정도 업데이트하세요
- 앱을 더 이상 사용하지 않을 경우 Google Cloud Console에서 API를 비활성화하세요

---

## 기술 스택

- **React 19 + TypeScript** — UI 프레임워크
- **Vite** — 빌드 도구
- **Tailwind CSS v4** — 스타일링
- **Google Maps Places API (New)** — 맛집 검색 데이터
- **@vis.gl/react-google-maps** — 지도 표시
- **Vercel** — 배포 호스팅
