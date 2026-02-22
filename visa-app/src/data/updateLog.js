// 업데이트 로그 (공지사항용)
export const updateLog = [
  {
    date: '2026-02-23',
    type: 'system_check',
    status: 'no_changes',
    description: {
      ko: '정기 비자 정책 업데이트 확인 완료 - 변경사항 없음',
      zh: '定期签证政策更新检查完成 - 无变更',
      en: 'Regular visa policy update check completed - no changes'
    },
    details: {
      ko: '출입국청, 비자포털 사이트 확인. 현재 데이터(2/20 최종 업데이트)가 최신 상태 유지.',
      zh: '检查了出入境管理所、签证门户网站。当前数据（2/20最后更新）保持最新状态。',
      en: 'Checked immigration office and visa portal sites. Current data (last updated 2/20) remains up to date.'
    },
    sources: ['immigration.go.kr', 'visa.go.kr', 'hikorea.go.kr'],
    next_check: '2026-02-24'
  }
];

// 자동 업데이트 스케줄 정보
export const autoUpdateInfo = {
  ko: '매일 오전 9시 자동 업데이트 확인 (마지막: 2026-02-23)',
  zh: '每日上午9点自动更新检查 (最后: 2026-02-23)',
  en: 'Automatic update check at 9 AM daily (Last: 2026-02-23)',
};

// 데이터 소스
export const dataSources = {
  ko: [
    { name: '출입국·외국인정책본부', url: 'https://immigration.go.kr' },
    { name: '비자포털', url: 'https://visa.go.kr' },
    { name: '하이코리아', url: 'https://hikorea.go.kr' },
    { name: '외교부 영사서비스', url: 'https://overseas.mofa.go.kr' }
  ],
  zh: [
    { name: '出入境·外国人政策本部', url: 'https://immigration.go.kr' },
    { name: '签证门户', url: 'https://visa.go.kr' },
    { name: 'Hi Korea', url: 'https://hikorea.go.kr' },
    { name: '外交部领事服务', url: 'https://overseas.mofa.go.kr' }
  ],
  en: [
    { name: 'Korea Immigration Service', url: 'https://immigration.go.kr' },
    { name: 'Korea Visa Portal', url: 'https://visa.go.kr' },
    { name: 'Hi Korea', url: 'https://hikorea.go.kr' },
    { name: 'MOFA Consular Services', url: 'https://overseas.mofa.go.kr' }
  ],
};
