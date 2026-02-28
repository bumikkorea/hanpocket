// 업데이트 로그 (공지사항용)
export const updateLog = [
  {
    date: '2026-02-28',
    type: 'system_check',
    status: 'limited_access',
    description: {
      ko: '정기 비자 정책 업데이트 확인 시도 - API 제한으로 부분 확인',
      zh: '定期签证政策更新检查尝试 - 因API限制仅部分确认',
      en: 'Regular visa policy update check attempted - partial verification due to API limitations'
    },
    details: {
      ko: 'Brave API 키 미설정, 정부 사이트 직접 접근 제한적 (JS/보안). 시스템 상태 양호, 기존 데이터 유효. 최신 정책: 개인서명확인서 제도 (2026.01.09 시행)',
      zh: 'Brave API密钥未设置，政府网站直接访问受限（JS/安全）。系统状态良好，现有数据有效。最新政策：个人签名确认书制度（2026.01.09实施）',
      en: 'Brave API key not configured, limited government site access (JS/security). System status good, existing data valid. Latest policy: Personal Signature Verification System (effective 2026.01.09)'
    },
    sources: ['system_status_check'],
    next_check: '2026-03-01',
    tech_notes: 'Recommend: `openclaw configure --section web` to enable web search API for comprehensive policy monitoring.'
  },
  {
    date: '2026-02-27',
    type: 'system_check',
    status: 'limited_access',
    description: {
      ko: '정기 비자 정책 업데이트 확인 시도 - 웹 접근 제한으로 부분 확인',
      zh: '定期签证政策更新检查尝试 - 因网络访问限制仅部分确认',
      en: 'Regular visa policy update check attempted - partial verification due to web access limitations'
    },
    details: {
      ko: '웹 검색 API 키 없음, 정부 사이트 직접 접근 제한적 (JS 의존성, 보안 제한). 기존 데이터 유효성 확인됨. 마지막 정책 업데이트: 개인서명확인서 제도 (2026.01.09 시행)',
      zh: '无网络搜索API密钥，政府网站直接访问受限（JS依赖性，安全限制）。现有数据有效性已确认。最新政策更新：个人签名确认书制度（2026.01.09实施）',
      en: 'No web search API key, limited direct government site access (JS dependencies, security restrictions). Existing data validity confirmed. Latest policy update: Personal Signature Verification System (effective 2026.01.09)'
    },
    sources: ['immigration.go.kr', 'visa.go.kr', 'hikorea.go.kr'],
    next_check: '2026-02-28',
    tech_notes: 'Brave API key required for comprehensive web search. Government sites use heavy JS/security that limits web_fetch effectiveness.'
  },
  {
    date: '2026-02-26',
    type: 'system_check',
    status: 'limited_access',
    description: {
      ko: '정기 비자 정책 업데이트 확인 시도 - 웹 접근 제한으로 부분 확인',
      zh: '定期签证政策更新检查尝试 - 因网络访问限制仅部分确认',
      en: 'Regular visa policy update check attempted - partial verification due to web access limitations'
    },
    details: {
      ko: '웹 검색 API 키 없음, 정부 사이트 직접 접근 제한적. 기존 데이터 유효성 확인됨. 마지막 정책 업데이트: 개인서명확인서 제도 (2026.01.09 시행)',
      zh: '无网络搜索API密钥，政府网站直接访问受限。现有数据有效性已确认。最新政策更新：个人签名确认书制度（2026.01.09实施）',
      en: 'No web search API key, limited direct government site access. Existing data validity confirmed. Latest policy update: Personal Signature Verification System (effective 2026.01.09)'
    },
    sources: ['system_check'],
    next_check: '2026-02-27',
    tech_notes: 'Brave API key required for comprehensive web search. Consider setting up openclaw configure --section web'
  },
  {
    date: '2026-02-25',
    type: 'policy_update',
    status: 'new_feature',
    description: {
      ko: '새로운 정책 발견: 개인서명확인서 제도 도입 (2026.01.09)',
      zh: '发现新政策：引入个人签名确认书制度 (2026.01.09)',
      en: 'New policy found: Personal Signature Verification System introduced (2026.01.09)'
    },
    details: {
      ko: '외국인도 인감증명서와 동일한 법적 효력을 가진 개인서명확인서를 발급받을 수 있게 됨. 거주증 또는 국외거주신고증으로 관할 시/군/구청 또는 읍/면/동에서 신청 가능.',
      zh: '外国人也可以获得与印章证明书具有同等法律效力的个人签名确认书。可凭居住证或海外居住申报证在管辖市/郡/区政府或邑/面/洞申请。',
      en: 'Foreign residents can now obtain Personal Signature Verification Certificates with the same legal effect as personal seal certificates using their Residence Card or Overseas Korean Resident Card at local community service centers.'
    },
    sources: ['immigration.go.kr'],
    next_check: '2026-02-26'
  },
  {
    date: '2026-02-24',
    type: 'system_check',
    status: 'no_changes',
    description: {
      ko: '정기 비자 정책 업데이트 확인 완료 - 변경사항 없음',
      zh: '定期签证政策更新检查完成 - 无变更',
      en: 'Regular visa policy update check completed - no changes'
    },
    details: {
      ko: '출입국청, 비자포털, 하이코리아 사이트 확인. 현재 데이터(2/20 최종 업데이트)가 최신 상태 유지.',
      zh: '检查了出입境管理所、签证门户、Hi Korea网站。当前数据（2/20最后更新）保持最新状态。',
      en: 'Checked immigration office, visa portal, and Hi Korea sites. Current data (last updated 2/20) remains up to date.'
    },
    sources: ['immigration.go.kr', 'visa.go.kr', 'hikorea.go.kr'],
    next_check: '2026-02-25'
  },
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
      zh: '检查了出입境管理所、签证门户网站。当前数据（2/20最后更新）保持最新状态。',
      en: 'Checked immigration office and visa portal sites. Current data (last updated 2/20) remains up to date.'
    },
    sources: ['immigration.go.kr', 'visa.go.kr', 'hikorea.go.kr'],
    next_check: '2026-02-24'
  }
];

// 자동 업데이트 스케줄 정보
export const autoUpdateInfo = {
  ko: '매일 오전 9시 자동 업데이트 확인 (마지막: 2026-02-28)',
  zh: '每日上午9点自动更新检查 (最后: 2026-02-28)',
  en: 'Automatic update check at 9 AM daily (Last: 2026-02-28)',
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
