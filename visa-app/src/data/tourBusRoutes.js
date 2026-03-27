/**
 * 서울시티투어버스 전체 노선 데이터 v3
 * // 주 1회 https://www.seoulcitybus.com/ 확인하여 변동사항 업데이트
 * // 마지막 업데이트: 2026-03-26
 * // 나머지 노선 데이터 추가 예정: TOUR02 파노라마, TOUR03 전통문화/하이라이트, 강남순환
 */

// ─── 공유 정류장 상세 데이터 ───
const STOP_DETAILS = {
  gwanghwamun: {
    summary: {
      stop: { ko: '광화문역 사거리, 동화면세점, 코리아나 호텔', zh: '光化门十字路口，东和免税店', en: 'Gwanghwamun intersection' },
      marker: { ko: '매표소/쉘터', zh: '售票处/候车亭', en: 'Ticket office / Shelter' },
      subway: { ko: '5호선 광화문역 6번 출구 100m', zh: '5号线光化门站6号出口100m', en: 'Line 5 Gwanghwamun Exit 6' },
      address: { ko: '서울 중구 태평로 1가 63-1', zh: '首尔中区太平路1街63-1', en: 'Taepyeong-ro 1-ga 63-1' },
    },
    nearbySpots: [
      { name: { ko: '광화문광장', zh: '光化门广场', en: 'Gwanghwamun Square' }, lat: 37.5724, lng: 126.9768 },
      { name: { ko: '청계광장', zh: '清溪广场', en: 'Cheonggyecheon Plaza' }, lat: 37.5691, lng: 126.9784 },
    ],
    story: { ko: '광화문역은 대한민국의 정부, 대기업, 문화시설이 모여있는 곳입니다. 서울시티투어버스도 광화문역 6번출구 앞에서 출발합니다.', zh: '光化门站是韩国政府和文化设施的中心。城市观光巴士从6号出口出发。', en: 'Gwanghwamun is the heart of Korean government and culture.' },
  },
  myeongdong: {
    summary: {
      stop: { ko: '프린스 호텔 옆, 노스페이스 빌딩 앞', zh: 'Prince酒店旁', en: 'Next to Prince Hotel' },
      marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
      subway: { ko: '4호선 명동역 2,3번 출구 사이', zh: '4号线明洞站2、3号出口之间', en: 'Line 4 Myeongdong Exit 2-3' },
      address: { ko: '서울 중구 퇴계로 124-1', zh: '首尔中区退溪路124-1', en: 'Toegye-ro 124-1' },
    },
    nearbySpots: [{ name: { ko: '명동성당', zh: '明洞圣堂', en: 'Myeongdong Cathedral' }, lat: 37.5633, lng: 126.9873 }],
    story: { ko: '명동 거리는 서울의 대표적인 쇼핑타운으로, 백화점과 화장품, 브랜드 매장을 만날 수 있습니다.', zh: '明洞是首尔代表性购物区。', en: 'Myeongdong is Seoul\'s premier shopping district.' },
  },
  namsangol: {
    summary: {
      stop: { ko: '파리바게트 앞, 이디야 커피 앞', zh: '巴黎贝甜前', en: 'In front of Paris Baguette' },
      marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
      subway: { ko: '3,4호선 충무로역 4번 출구 50m', zh: '3、4号线忠武路站4号出口50m', en: 'Line 3/4 Chungmuro Exit 4' },
      address: { ko: '서울 중구 필동1가 22-1', zh: '首尔中区笔洞1街22-1', en: 'Pildong 1-ga 22-1' },
    },
    nearbySpots: [{ name: { ko: '남산골 한옥마을', zh: '南山韩屋村', en: 'Namsangol Hanok' }, lat: 37.5590, lng: 126.9941 }],
    story: { ko: '조선 시대 마을의 모습을 간직한 남산골 한옥마을에서는 전통문화 체험을 할 수 있습니다.', zh: '南山韩屋村可体验传统文化。', en: 'Traditional culture experiences at Namsangol Hanok Village.' },
  },
  ambassador: {
    summary: {
      stop: { ko: '앰배서더 서울 풀만 호텔 정문 앞', zh: '酒店正门前', en: 'Hotel main entrance' },
      marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
      subway: null,
      address: { ko: '서울 중구 장충동2가 186-169', zh: '首尔中区奖忠洞2街186-169', en: 'Jangchung-dong 2-ga' },
    },
    nearbySpots: [],
    story: { ko: '국내 첫 민영 호텔로써 1955년부터 유서 깊은 헤리티지를 지켜오고 있습니다.', zh: '韩国首家民营酒店，自1955年延续至今。', en: 'Korea\'s first private hotel since 1955.' },
  },
  shilla: {
    summary: {
      stop: { ko: '장충체육관 건너 장충단공원 입구', zh: '奖忠体育馆对面公园入口', en: 'Across Jangchung Gym' },
      marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
      subway: { ko: '3호선 동대입구역 6번 출구 50m', zh: '3号线东大入口站6号出口50m', en: 'Line 3 Dongguk Univ Exit 6' },
      address: { ko: '서울 중구 장충동2가 산 4-91', zh: '首尔中区奖忠洞2街', en: 'Jangchung-dong 2-ga' },
    },
    nearbySpots: [
      { name: { ko: '장충단공원', zh: '奖忠坛公园', en: 'Jangchungdan Park' }, lat: 37.5565, lng: 127.0050 },
      { name: { ko: '장충동 족발거리', zh: '奖忠洞猪蹄街', en: 'Jokbal Street' }, lat: 37.5575, lng: 127.0055 },
    ],
    story: { ko: '신라호텔은 수많은 국빈 방문과 국제행사를 치뤄낸 서울의 대표 호텔입니다.', zh: '新罗酒店是首尔代表性酒店。', en: 'Shilla Hotel is one of Seoul\'s premier hotels.' },
  },
  nSeoulTower: {
    summary: {
      stop: { ko: 'N서울타워 버스정류장', zh: 'N首尔塔公交站', en: 'N Seoul Tower bus stop' },
      marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
      subway: null,
      address: { ko: '서울 중구 예장동 산 5-6', zh: '首尔中区艺场洞', en: 'Yejang-dong' },
    },
    nearbySpots: [
      { name: { ko: 'N서울타워', zh: 'N首尔塔', en: 'N Seoul Tower' }, lat: 37.5512, lng: 126.9882 },
      { name: { ko: '남산케이블카', zh: '南山缆车', en: 'Namsan Cable Car' }, lat: 37.5570, lng: 126.9813 },
    ],
    story: { ko: '서울의 상징이자 관광 명소 1위. 야경 투어에서는 약 20분간 정차합니다.', zh: '首尔象征，夜景游停留约20分钟。', en: 'Seoul\'s #1 landmark. Night tour stops ~20 min.' },
  },
  hyatt: {
    summary: {
      stop: { ko: '하얏트호텔, 육교 버스 정류장', zh: '凯悦酒店天桥站', en: 'Hyatt overpass stop' },
      marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
      subway: null,
      address: { ko: '서울 용산구 이태원동 258-466', zh: '首尔龙山区', en: 'Itaewon-dong' },
    },
    nearbySpots: [{ name: { ko: '경리단길', zh: '经理团路', en: 'Gyeongridan-gil' }, lat: 37.5370, lng: 126.9900 }],
    story: { ko: '1978년 개관한 하얏트호텔은 남산과 한강을 가까이 즐길 수 있는 곳입니다.', zh: '凯悦酒店1978年开业。', en: 'Hyatt Hotel opened in 1978.' },
  },
  ddp: {
    summary: {
      stop: { ko: 'DDP 중앙, 태극기 게양대 앞', zh: 'DDP中央', en: 'DDP center' },
      marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
      subway: { ko: '2·4호선 동대문역사문화공원역 1번 출구', zh: '2·4号线1号出口', en: 'Line 2/4 DHCP Exit 1' },
      address: { ko: '서울 중구 을지로7가 2-34', zh: '首尔中区乙支路7街', en: 'Euljiro 7-ga' },
    },
    nearbySpots: [
      { name: { ko: 'DDP', zh: '东大门设计广场', en: 'DDP' }, lat: 37.5673, lng: 127.0095 },
      { name: { ko: '광장시장', zh: '广藏市场', en: 'Gwangjang Market' }, lat: 37.5700, lng: 127.0100 },
    ],
    story: { ko: '우주선을 닮은 건축 랜드마크. 컨벤션, 디자인 전시, 패션쇼 등 복합문화공간.', zh: 'DDP是如宇宙飞船般的建筑地标。', en: 'DDP is a spaceship-like cultural complex.' },
  },
  daehangno: {
    summary: {
      stop: { ko: '마로니에 공원 근처 스타벅스 앞', zh: '梧桐公园附近星巴克前', en: 'Near Marronnier Park Starbucks' },
      marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
      subway: { ko: '4호선 혜화역 2번 출구 100m', zh: '4号线惠化站2号出口100m', en: 'Line 4 Hyehwa Exit 2' },
      address: { ko: '서울 종로구 동숭동 1-177', zh: '首尔钟路区东崇洞', en: 'Dongsung-dong' },
    },
    nearbySpots: [{ name: { ko: '마로니에 공원', zh: '梧桐公园', en: 'Marronnier Park' }, lat: 37.5820, lng: 127.0020 }],
    story: { ko: '100여개의 크고작은 공연장이 밀집해 있는 서울 공연 문화의 중심지이자 젊음의 거리입니다.', zh: '聚集100多个大小剧场的首尔演艺文化中心。', en: 'Heart of Seoul\'s performing arts with 100+ theaters.' },
  },
  changgyeonggung: {
    summary: {
      stop: { ko: '창경궁 정문 근처', zh: '昌庆宫正门附近', en: 'Near Changgyeonggung gate' },
      marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
      subway: { ko: '4호선 혜화역 4번 출구 500m', zh: '4号线惠化站4号出口500m', en: 'Line 4 Hyehwa Exit 4' },
      address: { ko: '서울 종로구 창경궁로 185', zh: '首尔钟路区昌庆宫路185', en: 'Changgyeonggung-ro 185' },
    },
    nearbySpots: [{ name: { ko: '창경궁', zh: '昌庆宫', en: 'Changgyeonggung' }, lat: 37.5787, lng: 126.9951 }],
    story: { ko: '창경궁은 조선 시대 왕과 왕비를 위해 지어진 궁궐로, 1983년 복원되어 현재의 모습을 갖추게 되었습니다.', zh: '昌庆宫建于朝鲜时代，1983年修复。', en: 'Changgyeonggung was restored in 1983.' },
  },
  changdeokgung: {
    summary: {
      stop: { ko: '창덕궁 정문 근처', zh: '昌德宫正门附近', en: 'Near Changdeokgung gate' },
      marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
      subway: { ko: '3호선 안국역 3번 출구 500m', zh: '3号线安国站3号出口', en: 'Line 3 Anguk Exit 3' },
      address: { ko: '서울 종로구 와룡동 8', zh: '首尔钟路区卧龙洞8', en: 'Waryong-dong 8' },
    },
    nearbySpots: [{ name: { ko: '창덕궁', zh: '昌德宫', en: 'Changdeokgung' }, lat: 37.5794, lng: 126.9910 }],
    story: { ko: '유네스코 세계 문화유산. 조선 시대 궁궐 중 원형이 가장 잘 보존된 궁궐.', zh: '联合国教科文组织世界文化遗产。', en: 'UNESCO World Heritage Site.' },
  },
  insadong: {
    summary: {
      stop: { ko: '종로경찰서 건너편', zh: '钟路警察局对面', en: 'Across Jongno Police' },
      marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
      subway: { ko: '3호선 안국역 1번 출구 50m', zh: '3号线安国站1号出口50m', en: 'Line 3 Anguk Exit 1' },
      address: { ko: '서울 종로구 안국동 175-92', zh: '首尔钟路区安国洞', en: 'Anguk-dong' },
    },
    nearbySpots: [
      { name: { ko: '인사동거리', zh: '仁寺洞街', en: 'Insadong Street' }, lat: 37.5743, lng: 126.9858 },
      { name: { ko: '북촌한옥마을', zh: '北村韩屋村', en: 'Bukchon Hanok' }, lat: 37.5826, lng: 126.9831 },
    ],
    story: { ko: '인사동은 화랑거리, 북촌은 9백여 동의 한옥이 있는 곳입니다.', zh: '仁寺洞画廊街，北村有900多栋韩屋。', en: 'Insadong galleries and Bukchon\'s 900+ hanok houses.' },
  },
  cheongwadae: {
    summary: {
      stop: { ko: '청와대 앞 삼거리 분수대 인근', zh: '青瓦台前喷泉附近', en: 'Near Cheongwadae fountain' },
      marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
      subway: null,
      address: { ko: '서울 종로구 세종로 1-39', zh: '首尔钟路区世宗路', en: 'Sejong-ro' },
    },
    nearbySpots: [{ name: { ko: '청와대', zh: '青瓦台', en: 'Cheongwadae' }, lat: 37.5866, lng: 126.9748 }],
    story: { ko: '대한민국 대통령의 집무실과 관저. 사전 예약 시 내부 관람 가능.', zh: '韩国总统办公和居住设施，可预约参观。', en: 'Former presidential residence, open for tours.' },
  },
  gyeongbokgung: {
    summary: {
      stop: { ko: '국립민속박물관 정문 옆', zh: '国立民俗博物馆旁', en: 'Next to Folk Museum' },
      marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
      subway: { ko: '3호선 경복궁역', zh: '3号线景福宫站', en: 'Line 3 Gyeongbokgung' },
      address: { ko: '서울 종로구 세종로 1-61', zh: '首尔钟路区世宗路', en: 'Sejong-ro' },
    },
    nearbySpots: [{ name: { ko: '경복궁', zh: '景福宫', en: 'Gyeongbokgung' }, lat: 37.5796, lng: 126.9770 }],
    story: { ko: '조선 시대 최초의 궁궐. 매주 화요일 휴궁.', zh: '朝鲜时代第一座宫殿。周二闭宫。', en: 'First Joseon palace. Closed Tuesdays.' },
  },
  sejong: {
    summary: {
      stop: { ko: '세종문화회관 정문 근처', zh: '世宗文化会馆正门附近', en: 'Near Sejong Center' },
      marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
      subway: { ko: '5호선 광화문역 2번 출구', zh: '5号线光化门站2号出口', en: 'Line 5 Gwanghwamun Exit 2' },
      address: { ko: '서울 종로구 세종로 1-68', zh: '首尔钟路区世宗路', en: 'Sejong-ro' },
    },
    nearbySpots: [{ name: { ko: '광화문광장', zh: '光化门广场', en: 'Gwanghwamun Sq' }, lat: 37.5724, lng: 126.9768 }],
    story: { ko: '광화문광장은 길이 557m, 세종대왕·이순신 장군 동상이 있습니다.', zh: '光化门广场长557米，有世宗大王和李舜臣将军铜像。', en: 'Gwanghwamun Square, 557m long, with statues of King Sejong and Admiral Yi.' },
  },
  deoksugung: {
    summary: {
      stop: { ko: '덕수궁대한문, 서울광장 건너편', zh: '德寿宫大汉门，首尔广场对面', en: 'Deoksugung Daehanmun' },
      marker: { ko: '쉘터', zh: '候车亭', en: 'Shelter' },
      subway: { ko: '시청역 3번출구', zh: '市厅站3号出口', en: 'City Hall Exit 3' },
      address: { ko: '서울 중구 세종대로 101', zh: '首尔中区世宗大路101', en: 'Sejong-daero 101' },
    },
    nearbySpots: [
      { name: { ko: '덕수궁', zh: '德寿宫', en: 'Deoksugung' }, lat: 37.5658, lng: 126.9750 },
      { name: { ko: '덕수궁돌담길', zh: '德寿宫石墙路', en: 'Stone Wall Road' }, lat: 37.5665, lng: 126.9740 },
    ],
    story: { ko: '덕수궁은 대한제국의 궁궐로, 서양식 건물인 석조전과 전통 한식 건물이 조화를 이룹니다. 왕궁 수문장 교대식을 관람할 수 있습니다.', zh: '德寿宫是大韩帝国的宫殿，可观看王宫守门将换岗仪式。', en: 'Deoksugung features a mix of Western and Korean architecture. Watch the Royal Guard Changing ceremony.' },
  },
  namdaemun: {
    summary: {
      stop: { ko: '부영태평빌딩앞, 프레이저플레이스 건너', zh: '富荣太平大厦前', en: 'In front of Buyoung Bldg' },
      marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
      subway: { ko: '2호선 시청역 8번 출구 300m', zh: '2号线市厅站8号出口300m', en: 'Line 2 City Hall Exit 8' },
      address: { ko: '서울 중구 세종대로 53-2', zh: '首尔中区世宗大路53-2', en: 'Sejong-daero 53-2' },
    },
    nearbySpots: [
      { name: { ko: '남대문시장', zh: '南大门市场', en: 'Namdaemun Market' }, lat: 37.5593, lng: 126.9775 },
      { name: { ko: '숭례문', zh: '崇礼门', en: 'Sungnyemun' }, lat: 37.5600, lng: 126.9753 },
    ],
    story: { ko: '남대문시장은 600년 전통의 재래시장으로 1700여 종의 상품을 판매합니다. 갈치조림골목이 유명합니다.', zh: '南大门市场有600年传统，销售1700多种商品。', en: 'Namdaemun Market is a 600-year-old traditional market.' },
  },
  hybe: {
    summary: {
      stop: { ko: '용산역사박물관 앞 버스정류장', zh: '龙山历史博物馆前公交站', en: 'Near Yongsan History Museum' },
      marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
      subway: { ko: '1호선 용산역 1번 출구 500m', zh: '1号线龙山站1号出口500m', en: 'Line 1 Yongsan Exit 1' },
      address: { ko: '서울 용산구 한강로3가 64', zh: '首尔龙山区', en: 'Hangang-ro 3-ga 64' },
    },
    nearbySpots: [
      { name: { ko: '하이브 본사', zh: 'HYBE总部', en: 'HYBE HQ' }, lat: 37.5283, lng: 126.9654 },
      { name: { ko: '용산역사박물관', zh: '龙山历史博物馆', en: 'Yongsan Museum' }, lat: 37.5285, lng: 126.9660 },
    ],
    story: { ko: 'BTS를 비롯한 글로벌 아티스트들이 소속된 HYBE 본사. 전 세계 ARMY 팬들이 찾는 K-pop 성지입니다.', zh: 'BTS等全球艺人所属HYBE总部，全球ARMY粉丝圣地。', en: 'HYBE HQ, home of BTS, a pilgrimage site for ARMY worldwide.' },
  },
}

function sd(key) { return STOP_DETAILS[key] || { summary: null, nearbySpots: [], story: null } }

// ─── TOUR01 정류장 (16회 운행, 30분 간격) ───
const TOUR01_STOPS = [
  { id: 'T01-01', name: { ko: '광화문역', zh: '光化门站', en: 'Gwanghwamun' }, lat: 37.5710, lng: 126.9769, isTicketStop: true,
    timetable: ['9:20','9:50','10:20','10:50','11:20','11:50','12:20','12:50','13:20','13:50','14:20','14:50','15:20','15:50','16:20','16:50'], ...sd('gwanghwamun') },
  { id: 'T01-02', name: { ko: '명동', zh: '明洞', en: 'Myeongdong' }, lat: 37.5607, lng: 126.9860,
    timetable: ['9:29','9:59','10:29','10:59','11:29','11:59','12:29','12:59','13:29','13:59','14:29','14:59','15:29','15:59','16:29','16:59'], ...sd('myeongdong') },
  { id: 'T01-03', name: { ko: '남산골 한옥마을', zh: '南山韩屋村', en: 'Namsangol Hanok' }, lat: 37.5590, lng: 126.9940,
    timetable: ['9:31','10:01','10:31','11:01','11:31','12:01','12:31','13:01','13:31','14:01','14:31','15:01','15:31','16:01','16:31','17:01'], ...sd('namsangol') },
  { id: 'T01-04', name: { ko: '앰배서더 호텔', zh: 'Ambassador酒店', en: 'Ambassador Hotel' }, lat: 37.5580, lng: 126.9980,
    timetable: ['9:37','10:07','10:37','11:07','11:37','12:07','12:37','13:07','13:37','14:07','14:37','15:07','15:37','16:07','16:37','17:07'], ...sd('ambassador') },
  { id: 'T01-05', name: { ko: '신라호텔, 장충단공원', zh: '新罗酒店', en: 'Shilla Hotel' }, lat: 37.5571, lng: 127.0042,
    timetable: ['9:40','10:10','10:40','11:10','11:40','12:10','12:40','13:10','13:40','14:10','14:40','15:10','15:40','16:10','16:40','17:10'], ...sd('shilla') },
  { id: 'T01-06', name: { ko: 'N서울타워', zh: 'N首尔塔', en: 'N Seoul Tower' }, lat: 37.5512, lng: 126.9882,
    timetable: ['9:50','10:20','10:50','11:20','11:50','12:20','12:50','13:20','13:50','14:20','14:50','15:20','15:50','16:20','16:50','17:20'], ...sd('nSeoulTower') },
  { id: 'T01-07', name: { ko: '하얏트호텔', zh: '凯悦酒店', en: 'Hyatt Hotel' }, lat: 37.5380, lng: 126.9920,
    timetable: ['10:01','10:31','11:01','11:31','12:01','12:31','13:01','13:31','14:01','14:31','15:01','15:31','16:01','16:31','17:01','17:31'], ...sd('hyatt') },
  { id: 'T01-08', name: { ko: '동대문DDP', zh: '东大门DDP', en: 'DDP' }, lat: 37.5673, lng: 127.0095,
    timetable: ['10:12','10:42','11:12','11:42','12:12','12:42','13:12','13:42','14:12','14:42','15:12','15:42','16:12','16:42','17:12','17:42'], ...sd('ddp') },
  { id: 'T01-09', name: { ko: '대학로', zh: '大学路', en: 'Daehangno' }, lat: 37.5820, lng: 127.0020,
    timetable: ['10:22','10:52','11:22','11:52','12:22','12:52','13:22','13:52','14:22','14:52','15:22','15:52','16:22','16:52','17:22','17:52'], ...sd('daehangno') },
  { id: 'T01-10', name: { ko: '창경궁', zh: '昌庆宫', en: 'Changgyeonggung' }, lat: 37.5787, lng: 126.9951,
    timetable: ['10:27','10:57','11:27','11:57','12:27','12:57','13:27','13:57','14:27','14:57','15:27','15:57','16:27','16:57','17:27','17:57'], ...sd('changgyeonggung') },
  { id: 'T01-11', name: { ko: '창덕궁', zh: '昌德宫', en: 'Changdeokgung' }, lat: 37.5794, lng: 126.9910,
    timetable: ['10:31','11:01','11:31','12:01','12:31','13:01','13:31','14:01','14:31','15:01','15:31','16:01','16:31','17:01','17:31','18:01'], ...sd('changdeokgung') },
  { id: 'T01-12', name: { ko: '인사동, 북촌', zh: '仁寺洞, 北村', en: 'Insadong, Bukchon' }, lat: 37.5760, lng: 126.9854,
    timetable: ['10:35','11:05','11:35','12:05','12:35','13:05','13:35','14:05','14:35','15:05','15:35','16:05','16:35','17:05','17:35','18:05'], ...sd('insadong') },
  { id: 'T01-13', name: { ko: '청와대 앞', zh: '青瓦台前', en: 'Cheongwadae' }, lat: 37.5866, lng: 126.9748,
    timetable: ['10:38','11:08','11:38','12:08','12:38','13:08','13:38','14:08','14:38','15:08','15:38','16:08','16:38','17:08','17:38','18:08'], ...sd('cheongwadae') },
  { id: 'T01-14', name: { ko: '경복궁, 민속박물관', zh: '景福宫', en: 'Gyeongbokgung' }, lat: 37.5815, lng: 126.9790,
    timetable: ['10:41','11:11','11:41','12:11','12:41','13:11','13:41','14:11','14:41','15:11','15:41','16:11','16:41','17:11','17:41','18:11'], ...sd('gyeongbokgung') },
  { id: 'T01-15', name: { ko: '세종문화회관', zh: '世宗文化会馆', en: 'Sejong Center' }, lat: 37.5724, lng: 126.9768,
    timetable: ['10:45','11:15','11:45','12:15','12:45','13:15','13:45','14:15','14:45','15:15','15:45','16:15','16:45','17:15','17:45','18:15'], ...sd('sejong') },
]

// BTS DAY 정류장: TOUR01 + 하이브본사 (용산역 위치에 삽입, 실제로는 TOUR01과 동일 경로)
const BTS_DAY_STOPS = [
  ...TOUR01_STOPS.slice(0, 7), // 광화문~하얏트
  { id: 'BTS-HYBE', name: { ko: '하이브본사 HYBE', zh: 'HYBE总部', en: 'HYBE HQ' }, lat: 37.5283, lng: 126.9654,
    timetable: ['10:05','10:35','11:05','11:35','12:05','12:35','13:05','13:35','14:05','14:35','15:05','15:35','16:05','16:35','17:05','17:35'],
    summary: {
      stop: { ko: '용산역사박물관 앞', zh: '龙山历史博物馆前', en: 'Near Yongsan History Museum' },
      marker: { ko: '사인폴', zh: '标志杆', en: 'Sign pole' },
      subway: { ko: '1호선 용산역 1번 출구 500m', zh: '1号线龙山站1号出口500m', en: 'Line 1 Yongsan Exit 1' },
      address: { ko: '서울 용산구 한강로3가 64', zh: '首尔龙山区', en: 'Hangang-ro 3-ga 64' },
    },
    nearbySpots: [{ name: { ko: '하이브 본사', zh: 'HYBE总部', en: 'HYBE HQ' }, lat: 37.5283, lng: 126.9654 }],
    story: { ko: 'BTS를 비롯한 글로벌 아티스트들이 소속된 HYBE 본사. 전 세계 ARMY 팬들이 찾는 성지.', zh: 'BTS等全球艺人所属HYBE总部，全球ARMY粉丝圣地。', en: 'HYBE HQ, home of BTS and global artists, a pilgrimage site for ARMY worldwide.' },
    btsCityDay: true,
  },
  ...TOUR01_STOPS.slice(7), // DDP~세종문화회관
]

// TOUR04 야경 정류장
const TOUR04_NIGHT_STOPS = [
  { id: 'T04-01', name: { ko: '광화문', zh: '光化门', en: 'Gwanghwamun' }, lat: 37.5710, lng: 126.9769, isTicketStop: true, noStop: false, timetable: ['19:00'], ...sd('gwanghwamun') },
  { id: 'T04-02', name: { ko: '덕수궁', zh: '德寿宫', en: 'Deoksugung' }, lat: 37.5660, lng: 126.9754, noStop: true, timetable: ['19:02'], ...sd('deoksugung') },
  { id: 'T04-03', name: { ko: '남대문시장', zh: '南大门市场', en: 'Namdaemun' }, lat: 37.5594, lng: 126.9772, noStop: true, timetable: ['19:04'], ...sd('namdaemun') },
  { id: 'T04-04', name: { ko: '명동', zh: '明洞', en: 'Myeongdong' }, lat: 37.5607, lng: 126.9860, noStop: true, timetable: ['19:08'], ...sd('myeongdong') },
  { id: 'T04-05', name: { ko: '남산골 한옥마을', zh: '南山韩屋村', en: 'Namsangol' }, lat: 37.5590, lng: 126.9940, noStop: true, timetable: ['19:12'], ...sd('namsangol') },
  { id: 'T04-06', name: { ko: '앰배서더 호텔', zh: 'Ambassador酒店', en: 'Ambassador' }, lat: 37.5580, lng: 126.9980, noStop: true, timetable: ['19:14'], ...sd('ambassador') },
  { id: 'T04-07', name: { ko: '신라호텔', zh: '新罗酒店', en: 'Shilla Hotel' }, lat: 37.5571, lng: 127.0042, noStop: true, timetable: ['19:16'], ...sd('shilla') },
  { id: 'T04-08', name: { ko: 'N서울타워 (20분 정차)', zh: 'N首尔塔（20分钟）', en: 'N Tower (20min)' }, lat: 37.5512, lng: 126.9882, noStop: false, timetable: ['19:25'], ...sd('nSeoulTower') },
  { id: 'T04-09', name: { ko: '하얏트호텔', zh: '凯悦酒店', en: 'Hyatt' }, lat: 37.5380, lng: 126.9920, noStop: true, timetable: ['19:50'], ...sd('hyatt') },
  { id: 'T04-10', name: { ko: '동대문DDP', zh: 'DDP', en: 'DDP' }, lat: 37.5673, lng: 127.0095, noStop: true, timetable: ['20:00'], ...sd('ddp') },
  { id: 'T04-11', name: { ko: '창덕궁', zh: '昌德宫', en: 'Changdeokgung' }, lat: 37.5794, lng: 126.9910, noStop: true, timetable: ['20:10'], ...sd('changdeokgung') },
  { id: 'T04-12', name: { ko: '인사동, 북촌', zh: '仁寺洞', en: 'Insadong' }, lat: 37.5760, lng: 126.9854, noStop: true, timetable: ['20:14'], ...sd('insadong') },
  { id: 'T04-13', name: { ko: '경복궁', zh: '景福宫', en: 'Gyeongbokgung' }, lat: 37.5815, lng: 126.9790, noStop: true, timetable: ['20:18'], ...sd('gyeongbokgung') },
  { id: 'T04-14', name: { ko: '청와대 앞', zh: '青瓦台', en: 'Cheongwadae' }, lat: 37.5866, lng: 126.9748, noStop: true, timetable: ['20:22'], ...sd('cheongwadae') },
  { id: 'T04-15', name: { ko: '세종문화회관 (종점)', zh: '世宗文化会馆', en: 'Sejong Center' }, lat: 37.5724, lng: 126.9768, noStop: false, timetable: ['20:30'], ...sd('sejong') },
]

// ─── 6개 노선 ───
export const TOURBUS_ROUTES_V2 = [
  {
    id: 'bts-day',
    label: { ko: 'BTS THE CITY DAY', zh: 'BTS城市首尔日间', en: 'BTS THE CITY DAY' },
    color: '#FF0000',
    type: 'hop-on-hop-off',
    period: { start: '2026-03-23', end: '2026-04-17' },
    interval: 60, runs: 8,
    operatingDays: ['tue','wed','thu','fri','sat','sun'],
    fee: { adult: 28000, child: 20000 },
    duration: { ko: '약 1시간 30분', zh: '约1.5小时', en: '~1h 30min' },
    phone: '02-777-6090',
    note: { ko: 'BTS 컴백 기념 글로벌 ARMY를 위한 특별 시티투어', zh: 'BTS回归纪念特别城市游', en: 'Special city tour for BTS comeback' },
    stops: BTS_DAY_STOPS,
  },
  {
    id: 'bts-night',
    label: { ko: 'BTS THE CITY NIGHT', zh: 'BTS城市首尔夜间', en: 'BTS THE CITY NIGHT' },
    color: '#CC0000',
    type: 'non-stop',
    period: { start: '2026-03-22', end: '2026-04-19' },
    operatingDays: ['mon','tue','wed','thu','fri','sat','sun'],
    fee: { adult: 26000, child: 17000 },
    duration: { ko: '약 1시간 30분', zh: '约1.5小时', en: '~1h 30min' },
    departure: '19:00', boardingStart: '18:20',
    phone: '02-777-6090',
    note: { ko: '무정차 야경 투어. N서울타워 20분 정차. BTS 대표곡과 함께.', zh: '不停站夜景游。N首尔塔停留20分钟。', en: 'Non-stop night tour. 20min at N Seoul Tower. With BTS hits.' },
    stops: TOUR04_NIGHT_STOPS,
  },
  {
    id: 'night-temp',
    label: { ko: 'NIGHT 도심·고궁(A)', zh: '夜间 都心·古宫(A)', en: 'NIGHT Downtown Palace' },
    color: '#990000',
    type: 'non-stop',
    period: { start: '2026-03-22', end: '2026-04-19' },
    operatingDays: ['mon','tue','wed','thu','fri','sat','sun'],
    fee: { adult: 25000, child: 16000 },
    duration: { ko: '약 1시간 30분', zh: '约1.5小时', en: '~1h 30min' },
    departure: '19:00',
    phone: '02-777-6090',
    note: { ko: '벚꽃 시즌 한정 야간 도심·고궁 코스. 미디어 아트와 야경.', zh: '樱花季限定夜间都心·古宫路线。', en: 'Cherry blossom season night palace tour.' },
    stops: TOUR04_NIGHT_STOPS, // BTS NIGHT와 동일
  },
  {
    id: 'tour01',
    label: { ko: 'TOUR01 도심고궁남산', zh: 'TOUR01 都心古宫南山', en: 'TOUR01 Downtown Palace' },
    color: '#8B0000',
    type: 'hop-on-hop-off',
    period: null, // 상시
    interval: 30, runs: 16,
    operatingDays: ['tue','wed','thu','fri','sat','sun'],
    fee: { adult: 27000, child: 19000 },
    duration: { ko: '약 1시간 30분 (순환)', zh: '约1.5小时(循环)', en: '~1h 30min (loop)' },
    phone: '02-777-6090',
    note: { ko: '월요일 휴무 (공휴일이면 정상운행)', zh: '周一休息（公休日正常运行）', en: 'Closed Mon (open if holiday)' },
    stops: TOUR01_STOPS,
  },
  {
    id: 'tour04',
    label: { ko: 'TOUR04 야경투어', zh: 'TOUR04 夜景路线', en: 'TOUR04 Night Tour' },
    color: '#660000',
    type: 'non-stop',
    period: { start: '2026-04-21', end: null }, // 4/21부터 복귀
    operatingDays: ['mon','tue','wed','thu','fri','sat','sun'],
    fee: { adult: 20000, child: 17000 },
    duration: { ko: '약 1시간 30분', zh: '约1.5小时', en: '~1h 30min' },
    departure: '19:00',
    phone: '02-777-6090',
    note: { ko: '현재 3/22~4/19 기간에는 NIGHT(도심·고궁A) 코스로 임시 운영중. 4/21부터 야간 한강·남산 코스 복귀.', zh: '3/22~4/19期间由NIGHT路线临时运营。4/21恢复。', en: 'Temporarily replaced by NIGHT route until 4/19. Returns 4/21.' },
    currently_replaced_by: 'night-temp',
    stops: TOUR04_NIGHT_STOPS,
  },
  {
    id: 'glow-up',
    label: { ko: 'GLOW UP IN SEOUL', zh: 'GLOW UP IN SEOUL', en: 'GLOW UP IN SEOUL' },
    color: '#6B8E23',
    type: 'hop-on-hop-off',
    period: null,
    interval: 30,
    operatingDays: ['tue','wed','thu','fri','sat','sun'],
    fee: { adult: 27000, child: 19000 },
    duration: { ko: 'TOUR01 + DDP 뷰티 체험', zh: 'TOUR01 + DDP美容体验', en: 'TOUR01 + DDP Beauty Experience' },
    phone: '02-777-6090',
    note: { ko: 'TOUR01 탑승 + DDP B the B 뷰티 체험 패키지', zh: 'TOUR01乘车 + DDP美容体验套餐', en: 'TOUR01 ride + DDP beauty experience package' },
    stops: TOUR01_STOPS, // TOUR01과 동일
    btheB: {
      location: { ko: 'DDP 마켓 B2, C2 GATE', zh: 'DDP市场B2, C2入口', en: 'DDP Market B2, C2 GATE' },
      hours: '12:00-20:00',
      docentTour: '15:00',
      highlights: [
        { ko: '개인 맞춤형 피부 분석', zh: '个人定制皮肤分析', en: 'Personalized skin analysis' },
        { ko: 'AI 기반 메이크업 진단', zh: 'AI化妆诊断', en: 'AI-based makeup diagnosis' },
        { ko: '글로벌 뷰티 브랜드 쇼케이스', zh: '全球美容品牌展示', en: 'Global beauty brand showcase' },
        { ko: '스페셜 웰컴 트래블 키트 증정', zh: '赠送欢迎旅行套装', en: 'Special welcome travel kit' },
      ],
      audioGuide: { ko: '한국어, 영어, 중국어', zh: '韩语、英语、中文', en: 'Korean, English, Chinese' },
    },
  },
]

// ─── 유틸리티 함수 ───

export function getActiveRoutes(date = new Date()) {
  const today = date.toISOString().slice(0, 10)
  return TOURBUS_ROUTES_V2.filter(r => {
    if (!r.period) return true
    if (r.period.start && today < r.period.start) return false
    if (r.period.end && today > r.period.end) return false
    return true
  })
}

export function isOperatingToday(route, date = new Date()) {
  const dayName = ['sun','mon','tue','wed','thu','fri','sat'][date.getDay()]
  return route.operatingDays.includes(dayName)
}

export function getNextArrival(stop, date = new Date()) {
  if (!stop.timetable) return null
  const nowMin = date.getHours() * 60 + date.getMinutes()
  for (const t of stop.timetable) {
    const [h, m] = t.split(':').map(Number)
    if (h * 60 + m > nowMin) return t
  }
  return null
}

export function formatFee(fee, lang) {
  if (lang === 'zh') return `成人 ¥${Math.round(fee.adult / 180)} / 儿童 ¥${Math.round(fee.child / 180)}`
  if (lang === 'en') return `Adult ₩${fee.adult.toLocaleString()} / Child ₩${fee.child.toLocaleString()}`
  return `성인 ${fee.adult.toLocaleString()}원 / 소인 ${fee.child.toLocaleString()}원`
}

export function getRouteDisplayLabel(route) {
  if (route._tempLabel && route._tempStart && route._tempEnd) {
    const d = new Date().toISOString().slice(0, 10)
    if (d >= route._tempStart && d <= route._tempEnd) return route._tempLabel
  }
  return route.label
}
