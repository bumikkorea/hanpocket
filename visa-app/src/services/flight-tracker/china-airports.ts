// ============================================================
// 추적 대상 중국 공항 IATA 코드
// ============================================================

import type { ChinaAirport } from './types';

export const CHINA_AIRPORTS: ChinaAirport[] = [
  // Tier 1 - 주요 허브
  { code: 'PVG', nameKo: '상하이 푸동', nameZh: '上海浦东', nameEn: 'Shanghai Pudong', tier: 'tier1', hasGimpoRoute: false },
  { code: 'SHA', nameKo: '상하이 홍차오', nameZh: '上海虹桥', nameEn: 'Shanghai Hongqiao', tier: 'tier1', hasGimpoRoute: true },
  { code: 'PEK', nameKo: '베이징 수도', nameZh: '北京首都', nameEn: 'Beijing Capital', tier: 'tier1', hasGimpoRoute: true },
  { code: 'PKX', nameKo: '베이징 다싱', nameZh: '北京大兴', nameEn: 'Beijing Daxing', tier: 'tier1', hasGimpoRoute: false },
  { code: 'CAN', nameKo: '광저우 바이윈', nameZh: '广州白云', nameEn: 'Guangzhou Baiyun', tier: 'tier1', hasGimpoRoute: false },
  { code: 'SZX', nameKo: '선전 바오안', nameZh: '深圳宝安', nameEn: 'Shenzhen Baoan', tier: 'tier1', hasGimpoRoute: false },

  // Tier 2 - 주요 지방 도시
  { code: 'CTU', nameKo: '청두 솽류', nameZh: '成都双流', nameEn: 'Chengdu Shuangliu', tier: 'tier2', hasGimpoRoute: false },
  { code: 'TFU', nameKo: '청두 톈푸', nameZh: '成都天府', nameEn: 'Chengdu Tianfu', tier: 'tier2', hasGimpoRoute: false },
  { code: 'CKG', nameKo: '충칭 장베이', nameZh: '重庆江北', nameEn: 'Chongqing Jiangbei', tier: 'tier2', hasGimpoRoute: false },
  { code: 'HGH', nameKo: '항저우 샤오산', nameZh: '杭州萧山', nameEn: 'Hangzhou Xiaoshan', tier: 'tier2', hasGimpoRoute: false },
  { code: 'NKG', nameKo: '난징 루커우', nameZh: '南京禄口', nameEn: 'Nanjing Lukou', tier: 'tier2', hasGimpoRoute: false },
  { code: 'WUH', nameKo: '우한 톈허', nameZh: '武汉天河', nameEn: 'Wuhan Tianhe', tier: 'tier2', hasGimpoRoute: false },
  { code: 'XIY', nameKo: '시안 셴양', nameZh: '西安咸阳', nameEn: "Xi'an Xianyang", tier: 'tier2', hasGimpoRoute: false },
  { code: 'CSX', nameKo: '창사 황화', nameZh: '长沙黄花', nameEn: 'Changsha Huanghua', tier: 'tier2', hasGimpoRoute: false },
  { code: 'KMG', nameKo: '쿤밍 창수이', nameZh: '昆明长水', nameEn: 'Kunming Changshui', tier: 'tier2', hasGimpoRoute: false },
  { code: 'SYX', nameKo: '싼야 펑황', nameZh: '三亚凤凰', nameEn: 'Sanya Phoenix', tier: 'tier2', hasGimpoRoute: false },
  { code: 'HAK', nameKo: '하이커우 메이란', nameZh: '海口美兰', nameEn: 'Haikou Meilan', tier: 'tier2', hasGimpoRoute: false },
  { code: 'TSN', nameKo: '톈진 빈하이', nameZh: '天津滨海', nameEn: 'Tianjin Binhai', tier: 'tier2', hasGimpoRoute: false },
  { code: 'DLC', nameKo: '다롄 저우수이쯔', nameZh: '大连周水子', nameEn: 'Dalian Zhoushuizi', tier: 'tier2', hasGimpoRoute: false },
  { code: 'SHE', nameKo: '선양 타오셴', nameZh: '沈阳桃仙', nameEn: 'Shenyang Taoxian', tier: 'tier2', hasGimpoRoute: false },
  { code: 'TAO', nameKo: '칭다오 자오둥', nameZh: '青岛胶东', nameEn: 'Qingdao Jiaodong', tier: 'tier2', hasGimpoRoute: false },
  { code: 'HRB', nameKo: '하얼빈 타이핑', nameZh: '哈尔滨太平', nameEn: 'Harbin Taiping', tier: 'tier2', hasGimpoRoute: false },
  { code: 'CGO', nameKo: '정저우 신정', nameZh: '郑州新郑', nameEn: 'Zhengzhou Xinzheng', tier: 'tier2', hasGimpoRoute: false },
  { code: 'XMN', nameKo: '샤먼 가오치', nameZh: '厦门高崎', nameEn: 'Xiamen Gaoqi', tier: 'tier2', hasGimpoRoute: false },
  { code: 'FOC', nameKo: '푸저우 창러', nameZh: '福州长乐', nameEn: 'Fuzhou Changle', tier: 'tier2', hasGimpoRoute: false },
  { code: 'NNG', nameKo: '난닝 우쉬', nameZh: '南宁吴圩', nameEn: 'Nanning Wuxu', tier: 'tier2', hasGimpoRoute: false },
  { code: 'YNT', nameKo: '옌타이 펑라이', nameZh: '烟台蓬莱', nameEn: 'Yantai Penglai', tier: 'tier2', hasGimpoRoute: false },
  { code: 'WEH', nameKo: '웨이하이', nameZh: '威海大水泊', nameEn: 'Weihai Dashuibo', tier: 'tier2', hasGimpoRoute: false },

  // 홍콩/마카오 (참고용)
  { code: 'HKG', nameKo: '홍콩', nameZh: '香港', nameEn: 'Hong Kong', tier: 'hongkong_macau', hasGimpoRoute: false },
  { code: 'MFM', nameKo: '마카오', nameZh: '澳门', nameEn: 'Macau', tier: 'hongkong_macau', hasGimpoRoute: false },
];

/** Tier 1 공항 코드 (매 폴링 사이클마다 조회) */
export const TIER1_CODES = CHINA_AIRPORTS
  .filter(a => a.tier === 'tier1')
  .map(a => a.code);

/** Tier 2 공항 코드 (라운드로빈 조회) */
export const TIER2_CODES = CHINA_AIRPORTS
  .filter(a => a.tier === 'tier2')
  .map(a => a.code);

/** 김포 노선이 있는 공항 코드 */
export const GIMPO_ROUTE_CODES = CHINA_AIRPORTS
  .filter(a => a.hasGimpoRoute)
  .map(a => a.code);

/** 모든 중국 공항 코드 Set (빠른 lookup) */
export const CHINA_AIRPORT_CODES = new Set(CHINA_AIRPORTS.map(a => a.code));

/** 코드로 공항 정보 조회 */
export function getAirportByCode(code: string): ChinaAirport | undefined {
  return CHINA_AIRPORTS.find(a => a.code === code);
}
