# 팝업스토어 DB 설계 v3 — 3차원 설계

**작성일:** 2026-03-16
**버전:** v3 (v2를 폐기하고 재설계)

---

## 설계 차원 정의

```
1차원: "어떤 팝업이 있어?" → 종류와 분류
2차원: "어떻게 수집해?" → 자격 기준 + 수집 루트
3차원: "사용자가 현장에서 뭘 해?" → 반응 수집 + 보상 + 추천 루프
4차원: "브랜드가 뭘 얻어?" → 축적된 데이터의 사업 가치
```

---

# 1차원 — 팝업의 종류 정의

## 11개 카테고리

| code | 이름 | 설명 | 대표 예시 |
|------|------|------|----------|
| `fashion` | 패션 | 의류, 신발, 가방, 주얼리 | 나이키 에어맥스, 마르디메크르디 |
| `beauty` | 뷰티 | 스킨케어, 메이크업, 향수 | 설화수, 탬버린즈, 논픽션 |
| `sports` | 운동 | 스포츠 브랜드, 피트니스, 아웃도어 | 아디다스, 뉴발란스, 아크테릭스 |
| `exhibition` | 전시 | 갤러리, 미디어아트, 사진전 | teamLab, 뱅크시, 포토서울 |
| `lifestyle` | 라이프스타일 | 가구, 식품, 잡화, 테크 | 이케아, 다이슨, 양키캔들 |
| `idol` | 아이돌 | K-POP, 가수, 배우, 연예인 | 에스파, 뉴진스, BTS |
| `anime` | 애니/웹툰 | 애니메이션, 웹툰, 캐릭터 IP | 짱구, 산리오, 나혼렙 |
| `hangang` | 한강 | 한강공원 일대 팝업/행사 | 한강 야시장, 밤도깨비 |
| `seoul` | 서울시 주최 | Seoul My Soul 브랜드 행사 | 서울빛초롱, 서울페스타 |
| `festival` | 페스티벌 | 음악제, 문화축제, 푸드페스티벌 | 워터밤, 서울재즈페스티벌 |
| `ddp` | DDP | 동대문디자인플라자 내 모든 행사 | DDP 패션위크, DDP 디자인마켓 |

**분류 규칙:**
- 하나의 팝업은 **주 카테고리 1개 + 보조 태그 최대 3개**
- 예: 에스파 × 탬버린즈 콜라보 → 주: `idol`, 보조: `beauty`
- DDP에서 열리는 전시 → 주: `ddp`, 보조: `exhibition`
- 한강에서 열리는 축제 → 주: `hangang`, 보조: `festival`
- **장소가 카테고리를 이기는 경우:** DDP, 한강은 장소 자체가 브랜드이므로 장소를 주 카테고리로

---

# 2차원 — 수집 자격 기준 + 루트

## 카테고리별 수집 전략

### 1) 패션 / 뷰티 / 운동 / 라이프스타일

**자격 기준: 아래 유통 채널 중 1곳이라도 입점되어 있으면 수집 대상**

```
[4대 백화점]
├── 신세계백화점     shinsegae.com
├── 롯데백화점       lotteshopping.com
├── 현대백화점       ehyundai.com (더현대 포함)
└── 아이파크백화점   iparkmall.co.kr

[온라인 플랫폼]
├── 무신사          musinsa.com (무신사스탠다드, 무신사뷰티, 솔드아웃 포함)
├── 29CM           29cm.co.kr
├── W컨셉          wconceptkorea.com
├── 에이블리        a-bly.com
├── 지그재그        zigzag.kr
├── 올리브영        oliveyoung.co.kr
└── A-Land         a-land.co.kr
```

**수집 루트:**

```
[자동 — 매일 크롤링]
  각 백화점 웹사이트 → "팝업" or "POP-UP" 섹션
  무신사/29CM/올리브영 공식 SNS → 팝업 관련 게시물
  popga.co.kr → 전체 팝업 리스트 (1차 필터링 후 입점 여부 체크)
  popply.co.kr → 큐레이션 팝업

[반자동 — 주 3회]
  네이버 블로그 "○○ 팝업스토어" 검색
  인스타그램 #팝업스토어 #팝업 #popup

[매칭 검증 로직]
  수집된 브랜드명 → 4대 백화점 + 7대 플랫폼 입점 DB 대조
  → 1곳이라도 매칭되면 → 수집 확정
  → 매칭 안 되면 → "미확인" 상태로 보류, 수동 확인
```

**입점 DB 구축이 핵심이다:**
```
brands_retail 테이블:
  brand_name    TEXT
  channel       TEXT  (shinsegae/lotte/hyundai/ipark/musinsa/29cm/wconcept/ably/zigzag/oliveyoung/aland)
  brand_url     TEXT
  confirmed_at  DATE
  → 주 1회 갱신 (각 플랫폼 브랜드 목록 크롤링)
```

### 2) 아이돌 (idol)

**자격 기준: 시가총액 기준 TOP 10 엔터테인먼트 회사 소속 전원**

```
[2026년 3월 기준 — 주기적 갱신 필요]
  1. HYBE (하이브)           — BTS, 세븐틴, 투모로우바이투게더, 뉴진스, 르세라핌, &TEAM, KATSEYE, ILLIT, TWS
  2. SM (에스엠)             — EXO, NCT, aespa, Red Velvet, SHINee, 라이즈, 위시
  3. JYP                    — TWICE, Stray Kids, NMIXX, ITZY, Xdinary Heroes, NiziU
  4. YG (와이지)             — BLACKPINK, TREASURE, BABYMONSTER
  5. CJ ENM/Mnet            — 프로듀스 계열, I-LAND 계열, Wanna One
  6. 카카오엔터/IST           — ATEEZ, ITZY(이전), 더보이즈, STAYC
  7. 큐브                    — (여자)아이들, PENTAGON, LIGHTSUM
  8. 스타쉽                  — IVE, 몬스타엑스, 크래비티, CRAVITY
  9. 판타지오/기타 중견        — 배우 소속사 포함 시 변동
 10. RBW/DSP 등              — 마마무, KARD, APRIL

 ※ 시가총액 순위는 분기별 갱신
 ※ 배우/연예인은 해당 소속사 소속이면 포함
```

**수집 루트:**

```
[공식 채널 — 매일 체크]
  각 소속사 공식 홈페이지 → 공지/이벤트 섹션
  각 소속사 공식 인스타그램 → @hyloghybe, @smtown, @jaborajyp ...
  각 아이돌 공식 인스타그램 → 팝업/이벤트 게시물 감지

[팬덤 채널 — 주 2회]
  트위터/X → 아이돌명 + "팝업" 검색
  위버스 → 아티스트 공지
  인스타그램 → 아이돌명 + popup/팝업 태그

[자동 감지 키워드]
  "팝업", "POP-UP", "전시", "카페", "콜라보", "굿즈", "팬미팅 연계"
  → 각 공식 채널에서 이 키워드가 감지되면 수집 파이프라인 진입
```

**아이돌 마스터 테이블:**
```
idol_master 테이블:
  id            INTEGER
  name_ko       TEXT     "에스파"
  name_zh       TEXT     "aespa" (중국 팬들이 쓰는 이름)
  name_en       TEXT     "aespa"
  agency        TEXT     "SM"
  agency_rank   INTEGER  2
  instagram     TEXT     "@aespa_official"
  weibo         TEXT     "@aespa_official"  (중국 팬 접근용)
  douyin        TEXT
  debut_year    INTEGER  2020
  is_active     INTEGER  1
  cn_fandom     TEXT     "MY" (중국 팬덤명)
  cn_popularity INTEGER  (小红书 팔로워 수 기반, 분기 갱신)
```

### 3) 애니 / 웹툰 (anime)

**자격 기준: 중국에서 인기 + 한국에서 인지도 있는 IP**

```
[중국 인기 판단 기준 — 아래 중 1개 이상]
  ● 빌리빌리(B站) 재생수 1억 뷰 이상
  ● 腾讯动漫/爱奇艺 인기 랭킹 TOP 50 진입 이력
  ● 小红书 관련 태그 게시물 10만 건 이상
  ● 중국 코스프레/팬아트 씬에서 활발히 다뤄지는 IP

[한국 인지도 판단 기준 — 아래 중 1개 이상]
  ● 네이버웹툰/카카오웹툰 연재 또는 완결작
  ● 한국 OTT(넷플릭스KR, 웨이브, 티빙) 방영
  ● 한국 극장 개봉
  ● 한국 내 공식 팝업/전시 개최 이력

[현재 대상 IP 예시]
  나 혼자만 레벨업, 신의 탑, 갓 오브 하이스쿨
  짱구는 못말려, 산리오, 포켓몬, 원피스, 원신, 블루아카이브
  슬램덩크(중국에서 폭발적), 스파이패밀리, 주술회전
```

**수집 루트:**

```
[공식 채널]
  해당 IP 공식 홈페이지 (한국판) → 이벤트/팝업 섹션
  해당 IP 공식 인스타그램/X

[스트리밍/방송 채널]
  넷플릭스 KR, 웨이브, 티빙 → 연계 팝업 공지
  네이버웹툰, 카카오웹툰 → 작품 연계 팝업 공지

[작가 채널]
  웹툰 작가 인스타그램 → 전시/팝업 참여 게시물

[팬 커뮤니티]
  小红书 → IP명 + "首尔" + "快闪" (서울+팝업) 검색
  빌리빌리 → IP명 + "韩国" 검색
  → 중국 팬이 먼저 올리는 경우 역추적
```

**애니/웹툰 IP 마스터 테이블:**
```
anime_ip_master 테이블:
  id              INTEGER
  title_ko        TEXT     "나 혼자만 레벨업"
  title_zh        TEXT     "我独自升级"
  title_en        TEXT     "Solo Leveling"
  origin          TEXT     "webtoon" (webtoon/anime/game/character)
  platform_kr     TEXT     "네이버웹툰"
  bilibili_views  INTEGER  (억 단위)
  xhs_posts       INTEGER  (만 단위)
  cn_tier         TEXT     "S" (S/A/B — 중국 인기도)
```

### 4) 한강 (hangang)

**수집 루트:**

```
[1차 — 공식]
  서울관광재단 visitseoul.net → 한강 관련 행사/축제
  한국관광공사 visitkorea.or.kr → 한강 이벤트
  서울시 hangang.seoul.go.kr → 한강사업본부 공지

[2차 — SNS]
  @visitseoul_official 인스타그램
  @seoul_official 인스타그램
  #한강팝업 #한강야시장 #밤도깨비 검색

[포함 범위]
  한강공원 11개 지구 전체:
  여의도, 뚝섬, 잠실, 반포, 이촌, 잠원, 망원, 난지,
  양화, 선유도, 광나루

  + 한강 수변 상업시설 (세빛섬, 노들섬 등)
```

### 5) 서울시 주최 (seoul)

**수집 루트:**

```
[공식 — 매일]
  서울관광재단 visitseoul.net
  서울시 공식 seoul.go.kr/main/index.jsp
  서울시 공식 인스타그램 @seoul_official
  Seoul My Soul 브랜드 관련 행사 전체

[문화 행사]
  서울문화재단 sfac.or.kr
  서울문화포털 culture.seoul.go.kr

[포함 범위]
  서울시 또는 서울시 산하기관이 주최/주관/후원하는 모든 팝업/행사
  "Seoul My Soul" 로고가 붙은 모든 것
```

### 6) 페스티벌 (festival)

**자격 기준:**

```
[음악 페스티벌]
  연간 관객 5,000명 이상 OR 티켓 판매 이력 있는 것
  → 워터밤, 서울재즈페스티벌, 펜타포트, 뷰티풀민트라이프,
    그랜드민트페스티벌, 월드DJ페스티벌, 울트라코리아, 소닉시티

[문화/푸드 페스티벌]
  서울시/관광공사/지자체 주관 OR 언론 보도 3건 이상
  → 서울빛초롱, 치맥페스티벌, 서울카페쇼, 서울디자인페스티벌

[중국인 특화 판단]
  아래 중 하나라도 해당하면 우선 수집:
  ● 小红书에서 해당 축제 관련 게시물 1,000건 이상
  ● 중국 여행사 패키지에 포함된 이력
  ● 중국어 안내/티켓 판매 지원
```

**수집 루트:**

```
[1차 — 티켓 플랫폼]
  인터파크 ticket.interpark.com → "페스티벌/축제" 카테고리
  YES24 ticket.yes24.com → 공연/축제
  멜론티켓 ticket.melon.com

[2차 — 관광 공식]
  한국관광공사 → 축제 캘린더 (TourAPI contentTypeId=85)
  서울관광재단 → 축제/행사
  각 지자체 관광 사이트 (부산, 제주 등)

[3차 — 미디어]
  네이버 뉴스 "페스티벌 2026" 검색
  인스타그램 #서울페스티벌 #koreafestival
  小红书 "韩国音乐节" "首尔庆典" 검색

[4차 — 주최 직접]
  주요 페스티벌 공식 사이트 (연 1회 업데이트되는 경우 많음)
  주최사 인스타그램
```

### 7) DDP (ddp)

**수집 루트:**

```
[공식 — 매일]
  DDP 공식 홈페이지 ddp.or.kr → 전시/행사 일정
  DDP 공식 인스타그램 @ddp_seoul

[보조]
  서울디자인재단 seouldesign.or.kr
  네이버 "DDP 전시" 검색
  인스타그램 #DDP #동대문디자인플라자

[포함 범위]
  DDP 내부 모든 공간:
  알림1관, 알림2관, 배움터, 살림터, 디자인둘레길, 야외광장
  → DDP 안이면 전부 수집
```

---

## 수집 소스 마스터 테이블

```
collection_sources 테이블:
  id              INTEGER
  name            TEXT     "popga.co.kr"
  type            TEXT     "crawl" / "api" / "rss" / "instagram" / "manual"
  url             TEXT     "https://popga.co.kr"
  category_scope  TEXT     "all" / "fashion,beauty" / "idol" ...
  frequency       TEXT     "daily" / "3x_week" / "weekly" / "event"
  priority        INTEGER  1~3 (1=매일필수, 2=주기적, 3=보조)
  last_crawled    DATETIME
  is_active       INTEGER  1
```

전체 수집 소스 맵:

```
[매일 — Tier 1]
  popga.co.kr               전체          크롤링
  popply.co.kr              전체          크롤링
  신세계 팝업 페이지          fashion/beauty 크롤링
  롯데 팝업 페이지            fashion/beauty 크롤링
  현대(더현대) 팝업 페이지     fashion/beauty 크롤링
  아이파크 팝업 페이지         fashion/beauty 크롤링
  DDP 공식 ddp.or.kr        ddp           크롤링
  visitseoul.net             hangang/seoul 크롤링
  각 소속사 공식 홈페이지 ×10   idol          크롤링

[주 3회 — Tier 2]
  무신사/29CM/올리브영 SNS     fashion/beauty 인스타 감지
  소속사 인스타그램 ×10         idol          인스타 감지
  아이돌 인스타그램 ×50+       idol          인스타 감지
  인터파크/YES24 축제 카테고리  festival      크롤링
  TourAPI (contentTypeId=85)  festival      API
  네이버웹툰/카카오웹툰 공지    anime         크롤링

[주 1회 — Tier 3]
  小红书 키워드 검색            전체 (역추적)  반자동
  빌리빌리 키워드 검색          anime         반자동
  네이버 블로그 검색            전체          반자동
  작가 인스타그램              anime         수동
  브랜드 입점 DB 갱신           —             크롤링
```

---

# 3차원 — 현장 반응 루프

## 핵심 시나리오: 사용자가 팝업에 도착했을 때

```
┌──────────────────────────────────────────────────────────┐
│  사용자가 앱을 켜놓은 채로 팝업 장소 반경 100m 진입        │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────┐
│  📍 위치 감지 → 근처 활성 팝업과 매칭                      │
│  (geofence 트리거 — 같은 팝업은 24시간 내 1회만)           │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────┐
│  🔔 푸시 또는 인앱 팝업 알림                               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  📍 [브랜드명] 팝업스토어 근처에 계시네요!            │  │
│  │                                                    │  │
│  │  [더현대 서울 B1F — D-3 마감]                       │  │
│  │                                                    │  │
│  │          [ 자세히 보기 →]                           │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
          (사용자가 팝업 방문 후 일정 시간 경과)
          (해당 geofence 내 체류 15분 이상 감지)
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  💬 후속 팝업 — "마음에 드셨나요?"                         │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │  [브랜드명] 팝업은 어떠셨어요? 😊                    │  │
│  │                                                    │  │
│  │     ❤️‍🔥              ❤️                            │  │
│  │   [왕좋아요!]      [좋아요]                          │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  왕좋아요 → "와! 저희의 취향 매칭이 통했네요! 🎉"          │
│           → "리뷰 남기고 🎁 랜덤박스 받기" CTA            │
│                                                          │
│  좋아요   → "저희의 취향 매칭 알고리즘이 괜찮았군요 ㅠㅠ"  │
│           → (관리자에게만 집계됨, 사용자엔 가볍게)         │
│           → "리뷰 남기면 다음엔 더 잘 맞춰드릴게요!"       │
│           → "리뷰 남기고 🎁 랜덤박스 받기" CTA            │
│                                                          │
│  ※ 두 경우 모두 리뷰 작성으로 유도                        │
│  ※ "좋아요"와 "왕좋아요"의 차이는 내부 스코어링에만 사용   │
│  ※ 관리자 대시보드에서만 왕좋아요/좋아요 비율 확인 가능     │
└──────────────────────┬──────────────────────────────────┘
                       │
              (리뷰 작성 화면으로)
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  ✍️ 리뷰 작성 (최소 마찰 설계)                             │
│                                                          │
│  [필수 — 탭 1번]                                         │
│  ├── 별점 1~5 (별 탭)                                    │
│  └── 혼잡도: 한산 / 보통 / 붐빔 / 줄섰음 (아이콘 탭)      │
│                                                          │
│  [선택 — 하면 보상 UP]                                    │
│  ├── 한줄평 (자유 텍스트, 중국어/한국어/영어)               │
│  ├── 사진 1~3장                                          │
│  └── 태그 체크: #알리페이가능 #중국어OK #굿즈구매 #포토존   │
│      #대기시간길어요 #무료체험 #한정판매                    │
│                                                          │
│  [작성 완료]                                              │
│  → "🎁 랜덤박스 오픈!" 애니메이션                         │
│  → 보상 등급:                                            │
│     ★★★ 사진+텍스트 리뷰: 프리미엄 박스 (협찬 상품 포함)   │
│     ★★  텍스트 리뷰: 일반 박스                            │
│     ★   별점만: 미니 박스                                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  🎁 랜덤박스 보상 체계                                    │
│                                                          │
│  [자체 보상 — 항상 가능]                                  │
│  ├── HanPocket 포인트 (50~500P)                          │
│  │   → 추후 제휴사 할인/쿠폰으로 교환                     │
│  ├── 프리미엄 배지 ("팝업 탐험가 Lv.3" 등)                │
│  ├── 특별 기능 잠금해제 (AI 맞춤추천 횟수 증가 등)          │
│  └── 앱 내 랭킹 (이달의 팝업 탐험가 TOP 10)               │
│                                                          │
│  [브랜드 협찬 보상 — 파트너 팝업일 때]                      │
│  ├── 해당 브랜드 할인 쿠폰 (10~20%)                       │
│  ├── 해당 브랜드 굿즈 (스티커, 포토카드 등)                │
│  ├── 해당 브랜드 샘플 (뷰티 카테고리)                      │
│  └── 해당 브랜드 온라인몰 무료배송                         │
│                                                          │
│  ※ 브랜드 협찬 = 광고 수익과 직결 (4차원에서 상세)         │
│  ※ 보상은 리뷰 품질에 비례 → 사진 리뷰 유도                │
│  ※ "사진 리뷰가 텍스트보다 보상이 크다"를 명시             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  🗺️ 리뷰 완료 후 — 맞춤 추천 카드                         │
│                                                          │
│  로직: "방금 뷰티 팝업을 좋아했으니까"                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  🎉 리뷰 감사합니다!                                │  │
│  │                                                    │  │
│  │  ────────────────────────────                      │  │
│  │                                                    │  │
│  │  📍 근처에 이런 곳도 있어요                          │  │
│  │                                                    │  │
│  │  [같은 카테고리 팝업]                                │  │
│  │  ┌──────────────────────────────┐                  │  │
│  │  │ 💄 이니스프리 그린티 팝업       │ 도보 8분        │  │
│  │  │    성수 — D-5 마감             │                 │  │
│  │  └──────────────────────────────┘                  │  │
│  │  ┌──────────────────────────────┐                  │  │
│  │  │ 🧴 논픽션 향수 팝업            │ 도보 12분       │  │
│  │  │    한남 — 오늘 마감!           │                 │  │
│  │  └──────────────────────────────┘                  │  │
│  │                                                    │  │
│  │  ────────────────────────────                      │  │
│  │                                                    │  │
│  │  🍽️ 배고프지 않으세요?                              │  │
│  │                                                    │  │
│  │  ┌──────────────────────────────┐                  │  │
│  │  │ 🍜 성수 인기 맛집 TOP 3        │                 │  │
│  │  │    (오늘 날씨: 맑음 18°C ☀️)   │                 │  │
│  │  │    → 테라스 맛집 추천!          │                 │  │
│  │  └──────────────────────────────┘                  │  │
│  │                                                    │  │
│  │  ☕ 카페 쉬어가기                                    │  │
│  │  ┌──────────────────────────────┐                  │  │
│  │  │ ☕ 블루보틀 성수               │ 도보 5분        │  │
│  │  └──────────────────────────────┘                  │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  [추천 알고리즘]                                          │
│  1순위: 같은 카테고리 팝업 (뷰티→뷰티, 패션→패션)           │
│         → 반경 2km 이내 + 현재 영업중 + days_left 적은 순   │
│  2순위: 주변 맛집/카페                                    │
│         → 현재 날씨 반영                                  │
│         맑음 18°C+ → 테라스/야외석 있는 곳                  │
│         비 → 실내 분위기 좋은 곳                           │
│         추움 → 따뜻한 국물 음식                            │
│  3순위: 주변 관광지 (TourAPI 연동)                         │
│         → 사용자 과거 좋아요 카테고리 가중                  │
│                                                          │
│  ※ "이 사용자가 방금 뭘 좋아했는지"가 추천의 기준           │
│  ※ 날씨+시간+위치+취향 = 4중 맞춤                         │
│  ※ "아주 맞춤식을 위해 노력하고 있어요!!!!" 느낌 전달       │
└──────────────────────────────────────────────────────────┘
```

## 같은 카테고리 vs 주변 추천 — 둘 다 한다

질문: "뷰티 팝업 후 또 뷰티를? 아니면 주변 추천을?"
→ **정답: 둘 다. 순서가 다를 뿐.**

```
[카드 순서]
1번 카드: 같은 카테고리 팝업 (가장 가까운 1~2개)
          → "당신이 좋아한 뷰티, 근처에 더 있어요"
          → 클릭률 예상: 높음 (방금 관심 카테고리)

2번 카드: 주변 맛집/카페 (날씨+시간 반영)
          → "이 근처에서 쉬어가세요"
          → 클릭률 예상: 중간 (실용적 니즈)

3번 카드: 주변 다른 카테고리 (사용자 과거 이력 반영)
          → "혹시 관심있으신..." (약한 푸시)
          → 클릭률 예상: 낮지만 발견의 재미

[왜 같은 카테고리를 1순위로?]
  ● 방금 뷰티 팝업에서 "좋아요"를 눌렀다 = 지금 뷰티 모드
  ● "뷰티 모드"인 사용자에게 패션을 밀면 어색함
  ● 같은 무드를 이어가다가 자연스럽게 맛집/카페로 전환
  ● 이게 "맞춤식 노력" 느낌을 강하게 주는 구조
```

## 현장 반응 데이터 스키마

```sql
-- 위치 기반 감지 로그
CREATE TABLE geo_triggers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_token    TEXT NOT NULL,
  popup_id      INTEGER NOT NULL REFERENCES popups(id),
  trigger_type  TEXT NOT NULL,          -- 'enter' / 'dwell_15min' / 'exit'
  lat           REAL,
  lng           REAL,
  triggered_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_geo_popup ON geo_triggers(popup_id, triggered_at);
CREATE INDEX idx_geo_user ON geo_triggers(user_token, triggered_at);

-- 반응 (왕좋아요 / 좋아요)
CREATE TABLE reactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_token    TEXT NOT NULL,
  popup_id      INTEGER NOT NULL REFERENCES popups(id),
  reaction_type TEXT NOT NULL,          -- 'super_like' / 'like'
  reacted_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_token, popup_id)
);

-- 리뷰
CREATE TABLE reviews (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_token    TEXT NOT NULL,
  popup_id      INTEGER NOT NULL REFERENCES popups(id),
  rating        INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  crowd_level   TEXT DEFAULT 'medium',  -- low/medium/high/packed
  comment       TEXT DEFAULT '',
  lang          TEXT DEFAULT 'zh',      -- zh/ko/en
  photos        TEXT DEFAULT '[]',      -- JSON array of image URLs
  tags          TEXT DEFAULT '[]',      -- JSON ["alipay","cn_staff","goods","photozone","long_wait","free","limited"]
  review_tier   TEXT DEFAULT 'mini',    -- mini(별점만) / normal(텍스트) / premium(사진+텍스트)

  -- 보상
  reward_type   TEXT DEFAULT '',        -- 'points' / 'badge' / 'coupon' / 'goods'
  reward_detail TEXT DEFAULT '',        -- "500P" / "팝업탐험가Lv3" / "이니스프리20%쿠폰"
  reward_source TEXT DEFAULT 'system',  -- 'system' / 'brand_sponsor'

  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_token, popup_id)
);

CREATE INDEX idx_reviews_popup ON reviews(popup_id, created_at);

-- 리뷰 후 추천 클릭 추적
CREATE TABLE post_review_clicks (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_token    TEXT NOT NULL,
  source_popup  INTEGER NOT NULL,       -- 리뷰를 남긴 팝업
  clicked_type  TEXT NOT NULL,          -- 'same_category_popup' / 'restaurant' / 'cafe' / 'attraction'
  clicked_id    TEXT NOT NULL,          -- 클릭한 대상 ID
  card_position INTEGER DEFAULT 0,     -- 몇 번째 카드였는지
  clicked_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 랜덤박스 이력
CREATE TABLE rewards_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_token    TEXT NOT NULL,
  popup_id      INTEGER,
  review_id     INTEGER REFERENCES reviews(id),
  reward_type   TEXT NOT NULL,
  reward_detail TEXT NOT NULL,
  reward_source TEXT DEFAULT 'system',
  is_claimed    INTEGER DEFAULT 0,      -- 실제 수령 여부
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 취향 프로필 (축적)
CREATE TABLE user_taste (
  user_token      TEXT PRIMARY KEY,
  fav_categories  TEXT DEFAULT '[]',    -- JSON, 방문+좋아요 기반 자동 계산
  fav_districts   TEXT DEFAULT '[]',
  visit_count     INTEGER DEFAULT 0,
  review_count    INTEGER DEFAULT 0,
  explorer_level  INTEGER DEFAULT 1,    -- 탐험가 레벨 1~10
  last_active     DATETIME
);
```

---

# 4차원 — 브랜드가 얻는 가치

## 브랜드 관점에서 HanPocket 팝업 DB의 의미

기존 팝업 운영 브랜드의 현실:

```
[현재 — 블랙박스]
  "팝업에 중국인이 얼마나 왔는지 모른다"
  "왔다 해도 뭘 사는지 모른다"
  "만족했는지 모른다"
  "小红书에 뭐라고 쓰는지 모른다"
  "다음 팝업에 뭘 바꿔야 하는지 모른다"

[HanPocket 이후 — 투명]
  "중국인 조회 1,247건, 위시리스트 312건, 방문인증 89건"
  "왕좋아요 62%, 좋아요 38%"
  "리뷰 태그 TOP: #포토존(72%) #굿즈구매(58%) #알리페이가능(45%)"
  "혼잡도 피크: 토요일 14~16시"
  "리뷰 후 같은 카테고리 팝업 클릭율 34%"
  "小红书 공유 의향 추정: 리뷰 사진 첨부율 41%"
```

## 브랜드에게 제공하는 데이터 패키지

### Level 0 — 자동 수집 팝업 (무료)

```
브랜드가 아직 모름. 우리가 먼저 수집.
기본 조회수만 내부 집계.
브랜드에게 "당신의 팝업이 HanPocket에 노출되고 있습니다" 알림 가능.
→ 이것이 Level 1로 전환하는 미끼.
```

### Level 1 — 클레임 (무료)

```
브랜드가 소유권 주장 → 기본 대시보드 접근:
  ● 조회수, 위시리스트 수, 체크인 수
  ● 별점 평균
  ● 리뷰 원문 (텍스트)
  → 무료지만 가치 있는 데이터. 맛보기.
```

### Level 2 — 파트너 (월 50~100만 원)

```
분석 대시보드:
  ● 왕좋아요 vs 좋아요 비율 (감정 강도)
  ● 리뷰 태그 워드클라우드
  ● 혼잡도 시간대별 히트맵
  ● 방문자 여정 분석 ("이 팝업 전에 어디서 왔고, 후에 어디로 갔나")
  ● 같은 카테고리 경쟁 팝업 대비 벤치마크
  ● 추천 카드 클릭률 (리뷰 후 같은 카테고리 추천에서 얼마나 클릭되는가)

  + 랜덤박스 협찬 참여 가능:
    브랜드가 쿠폰/굿즈 제공 → 해당 팝업 리뷰어에게 랜덤박스로 배포
    → 쿠폰 사용률 추적 가능
```

### Level 3 — 프리미엄 (캠페인당 300~1,000만 원)

```
  ● 홈화면 추천 슬롯 (중국인 사용자 첫 화면)
  ● 타겟 푸시 알림 ("뷰티 관심 + 성수 근처" 사용자에게)
  ● "HOT" 배지 + 카테고리 내 1순위 노출
  ● 중국어 마케팅 소재 제작 대행
  ● 小红书 KOL 연결 (리뷰어 중 팔로워 많은 사용자 매칭)
  ● 팝업 현장 중국인 응대 컨설팅 (알리페이 도입, 중문 POP 제작 등)
  ● 사후 종합 리포트: PDF 형태의 "캠페인 성과 보고서"
```

## 브랜드에게 파는 것의 본질

```
[표면적으로] "중국인 마케팅 채널"
[실제로]     "중국인 소비자 이해의 독점적 데이터"

  HanPocket만이 가진 것:
  1. 중국인의 한국 팝업 방문 행동 데이터 (다른 곳에 없음)
  2. 실시간 감정 데이터 (왕좋아요/좋아요 비율)
  3. 카테고리 간 이동 패턴 ("뷰티 다음에 뭘 하는가")
  4. 보상 기반 리뷰 → 경쟁사 대비 리뷰 양 압도
  5. 중국어 네이티브 리뷰 → 小红书/抖音 콘텐츠로 바로 사용 가능
```

## 데이터 축적이 만드는 해자(Moat)

```
[6개월 후]
  "성수 뷰티 팝업 중국인 방문 패턴"이라는 데이터셋이 생김
  → 어떤 브랜드도 이 데이터를 가지고 있지 않음
  → 브랜드에게 "다음 팝업 장소를 성수로 하세요, 왜냐하면..." 컨설팅 가능

[12개월 후]
  "카테고리 × 지역 × 시즌" 3차원 매트릭스 완성
  → "3월 성수에서 뷰티 팝업을 열면 중국인 방문 기대치는 하루 약 N명"
  → 이 예측을 할 수 있는 서비스는 한국에 HanPocket뿐

[24개월 후]
  "중국인이 한국에서 뭘 좋아하는지"에 대한 가장 큰 데이터베이스
  → 팝업뿐 아니라 리테일 전체로 확장 가능
  → 컨설팅, 리서치 리포트, 시장 분석 B2B로 확장
```

## 선순환 모델 (3차원 + 4차원 통합)

```
  사용자가 도착한다
       │
       ▼
  알림 → 방문 → 체류
       │
       ▼
  "마음에 드셨나요?" → 왕좋아요 / 좋아요
       │
       ▼
  리뷰 작성 → 🎁 랜덤박스 (자체 or 브랜드 협찬)
       │                         ↑
       ▼                         │
  맞춤 추천 → 다음 팝업 방문     [브랜드가 협찬으로 참여]
       │                         ↑
       ▼                         │
  데이터 축적 ──────────────────→ 브랜드에게 인사이트 판매
       │                         ↑
       ▼                         │
  사용자 취향 정교화 ──────────→ 더 정확한 맞춤 추천
       │                         │
       ▼                         │
  사용자 만족도 UP ─────────────→ 리텐션 UP → 데이터 MORE
```

---

# 5. 전체 DB 스키마 요약

```
[마스터 데이터]
  popups              — 팝업 본체
  venues              — 반복 장소 (더현대, DDP 등)
  brands_retail       — 브랜드 × 유통채널 입점 매칭
  idol_master         — 아이돌 마스터
  anime_ip_master     — 애니/웹툰 IP 마스터
  collection_sources  — 수집 소스 관리

[사용자 행동]
  geo_triggers        — 위치 감지 로그
  reactions           — 왕좋아요 / 좋아요
  reviews             — 리뷰 (별점, 텍스트, 사진, 태그)
  post_review_clicks  — 리뷰 후 추천 클릭 추적
  wishlists           — 위시리스트

[보상]
  rewards_log         — 랜덤박스 지급 이력

[축적]
  user_taste          — 사용자 취향 프로필
  popup_views         — 조회 로그

[분석 (View)]
  v_active            — 현재 활성 팝업
  v_closing_soon      — 마감 임박
  v_cn_friendly       — 중국인 친화
  v_brand_report      — 브랜드별 종합 리포트
```

---

# 6. 구현 우선순위

```
[Phase 1 — MVP (2주)]
  popups 테이블 + 수동 입력 50개
  11개 카테고리 필터
  지역 필터
  카드 UI (1층 정보)

[Phase 2 — 수집 자동화 (4주)]
  brands_retail 매칭 DB 구축
  idol_master / anime_ip_master 구축
  popga/popply/백화점 크롤러
  DDP/서울관광재단 크롤러

[Phase 3 — 3차원 현장 루프 (6주)]
  geofence 트리거
  왕좋아요/좋아요 반응
  리뷰 + 랜덤박스
  리뷰 후 맞춤 추천 카드

[Phase 4 — 4차원 B2B (3개월)]
  브랜드 클레임 기능
  브랜드 대시보드 MVP
  인사이트 리포트 자동 생성
  협찬 랜덤박스 연동
```

---

*v3 — 2026-03-16*
*1차원(분류) → 2차원(수집) → 3차원(현장 루프) → 4차원(브랜드 가치)*
