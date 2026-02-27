# TourAPI 4.0 - 중문간체(ChsService2) API 명세

## Base URL
```
https://apis.data.go.kr/B551011/ChsService2
```

## 공통 파라미터
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| serviceKey | Y | 인증키 |
| numOfRows | N | 한 페이지 결과 수 (기본 10) |
| pageNo | N | 페이지 번호 |
| MobileOS | Y | ETC / AND / IOS / WIN |
| MobileApp | Y | 서비스명 (HanPocket) |
| _type | N | json (기본 XML) |

## ContentTypeId (관광타입)
| ID | 타입 |
|----|------|
| 75 | 레포츠 |
| 76 | 관광지 |
| 77 | 교통 |
| 78 | 문화시설 |
| 79 | 쇼핑 |
| 80 | 숙박 |
| 82 | 음식점 |
| 85 | 행사/공연/축제 |

## 엔드포인트

### 1. areaBasedList2 - 지역기반 관광정보 조회
추가 파라미터: contentTypeId, areaCode, sigunguCode, arrange(A=제목순,C=수정일순,D=생성일순,O=제목순,Q=수정일순,R=생성일순)
응답: contentid, contenttypeid, title, addr1, addr2, firstimage, firstimage2, mapx, mapy, tel, cat1, cat2, cat3

### 2. locationBasedList2 - 위치기반 관광정보 조회
추가 파라미터: mapX(경도, 필수), mapY(위도, 필수), radius(거리m, 필수, max 20000), contentTypeId, arrange
응답: 위와 동일 + dist(거리)

### 3. searchKeyword2 - 키워드 검색 조회
추가 파라미터: keyword(필수, URL인코딩), contentTypeId, areaCode, sigunguCode, arrange
응답: areaBasedList2와 동일

### 4. searchFestival2 - 행사정보 조회
추가 파라미터: eventStartDate(필수, YYYYMMDD), eventEndDate, areaCode, sigunguCode, arrange
응답: areaBasedList2와 동일 + eventstartdate, eventenddate

### 5. searchStay2 - 숙박정보 조회
추가 파라미터: areaCode, sigunguCode, arrange
응답: areaBasedList2와 동일

### 6. detailCommon2 - 공통정보 조회
추가 파라미터: contentId(필수), contentTypeId(필수), defaultYN(Y), firstImageYN(Y), areacodeYN(Y), addrinfoYN(Y), mapinfoYN(Y), overviewYN(Y)
응답: contentid, contenttypeid, title, homepage, tel, addr1, addr2, zipcode, firstimage, firstimage2, mapx, mapy, overview, areacode, sigungucode

### 7. detailIntro2 - 소개정보 조회
추가 파라미터: contentId(필수), contentTypeId(필수)
응답 (타입별 상이):
- 76(관광지): infocenter, usetime, restdate, parking, expguide
- 78(문화시설): usetimeculture, restdateculture, usefee, parkingculture, spendtime
- 85(행사): eventstartdate, eventenddate, eventplace, playtime, usetimefestival, sponsor1, program
- 75(레포츠): usetimeleports, restdateleports, usefeeleports, reservation
- 80(숙박): checkintime, checkouttime, roomcount, roomtype, reservationlodging, reservationurl, subfacility
- 79(쇼핑): opentime, restdateshopping, parkingshopping, saleitem, shopguide
- 82(음식점): firstmenu, opentimefood, restdatefood, treatmenu, seat, reservationfood, smoking

### 8. detailInfo2 - 반복정보 조회
추가 파라미터: contentId(필수), contentTypeId(필수)
응답: fldgubun, infoname, infotext, serialnum

### 9. detailImage2 - 이미지정보 조회
추가 파라미터: contentId(필수), imageYN(Y=콘텐츠이미지, N=음식메뉴이미지)
응답: contentid, originimgurl, imgname, smallimageurl, serialnum

### 10. areaBasedSyncList2 - 동기화 목록 조회
추가 파라미터: showflag(Y/N), modifiedtime(YYYYMMDD), contentTypeId, areaCode
응답: areaBasedList2 + modifiedtime

### 11. ldongCode2 - 법정동 코드 조회
추가 파라미터: areaCode, sigunguCode
응답: code, name

### 12. lclsSystmCode2 - 분류체계 코드 조회
추가 파라미터: contentTypeId, lclsSystemCode1, lclsSystemCode2
응답: code, name

## 지역코드 (areaCode)
1:서울 2:인천 3:대전 4:대구 5:광주 6:부산 7:울산 8:세종 31:경기 32:강원 33:충북 34:충남 35:경북 36:경남 37:전북 38:전남 39:제주
