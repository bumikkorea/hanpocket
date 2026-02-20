// AI 챗봇 응답 로직
import { visaTransitions } from './visaTransitions';

// 키워드 → 비자 매핑
const keywordMap = {
  en: {
    'tourist|travel|visit|sightseeing': 'C-3',
    'study|university|college|school|enroll': 'D-2',
    'language|korean|learn korean': 'D-4',
    'work|job|employ|company|career': 'E-7',
    'invest|business|startup|entrepreneur': 'D-8',
    'marry|marriage|spouse|husband|wife|wedding': 'F-6',
    'permanent|residency|settle|PR|green card': 'F-5',
    'ethnic korean|korean descent': 'F-4',
    'working holiday|WHV|backpack': 'H-1',
    'job seek|graduate|after graduation': 'D-10',
    'research|researcher|postdoc': 'E-3',
    'professor|teach|lecture': 'E-1',
    'jeju|jejudo': 'B-2',
    'change|switch|convert|transition': '_transition',
    'extend|renew|expir': '_extend',
    'document|paper|require|apply|submit': '_documents',
    'fee|cost|price|how much': '_fee',
    'how long|process|time|duration': '_processing',
    'naturaliz|citizen|nationality': '_naturalization',
  },
  ko: {
    '관광|여행|놀러|구경': 'C-3',
    '유학|대학|공부|학교|입학': 'D-2',
    '어학|한국어|언어|연수': 'D-4',
    '취업|일하|직장|회사|근무': 'E-7',
    '투자|창업|사업|경영': 'D-8',
    '결혼|배우자|혼인|남편|아내|와이프': 'F-6',
    '영주|영주권|영구|정착': 'F-5',
    '동포|조선족|교포': 'F-4',
    '방문취업|노동|노무': 'H-2',
    '워킹홀리데이|워홀': 'H-1',
    '구직|졸업|취직': 'D-10',
    '연구|연구원|박사후': 'E-3',
    '교수|강의|교육': 'E-1',
    '제주|제주도': 'B-2',
    '변경|바꾸|전환|갱신': '_transition',
    '연장|기간|만료': '_extend',
    '서류|준비|필요한|신청': '_documents',
    '비용|수수료|돈|가격': '_fee',
    '기간|얼마나|시간': '_processing',
    '귀화|국적|시민권': '_naturalization',
  },
  zh: {
    '旅游|观光|游玩|旅行': 'C-3',
    '留学|大学|学习|入学|读书': 'D-2',
    '语言|韩语|研修|语学': 'D-4',
    '工作|就业|上班|公司|就职': 'E-7',
    '投资|创业|做生意|经营|开公司': 'D-8',
    '结婚|配偶|婚姻|老公|老婆|丈夫|妻子': 'F-6',
    '永住|永久|永居|定居|绿卡': 'F-5',
    '同胞|朝鲜族|韩裔': 'F-4',
    '访问就业|打工|劳务': 'H-2',
    '打工度假|WHV': 'H-1',
    '求职|毕业|找工作': 'D-10',
    '研究|研究员|博士后': 'E-3',
    '教授|讲课|教育': 'E-1',
    '济州|济州岛': 'B-2',
    '变更|换签|转换|更换': '_transition',
    '延期|延长|到期|过期': '_extend',
    '材料|准备|需要|申请|资料': '_documents',
    '费用|手续费|多少钱|价格': '_fee',
    '多久|时间|多长': '_processing',
    '归化|国籍|入籍|公民': '_naturalization',
  },
};

function findKeywordMatch(text, lang) {
  const map = keywordMap[lang] || keywordMap.zh;
  for (const [pattern, visaId] of Object.entries(map)) {
    if (new RegExp(pattern, 'i').test(text)) {
      return visaId;
    }
  }
  return null;
}

export function generateChatResponse(message, { nationality, currentVisa, lang }) {
  const l = lang || 'zh';
  const region = ['china_hk', 'china_macau', 'china_taiwan'].includes(nationality) ? 'hkMoTw' : 'mainland';
  const match = findKeywordMatch(message, l);

  // 비자 변경 질문
  if (match === '_transition') {
    return getTransitionResponse(currentVisa, l, region);
  }

  // 연장 질문
  if (match === '_extend') {
    return getExtendResponse(currentVisa, l);
  }

  // 서류 질문
  if (match === '_documents') {
    return getDocumentsResponse(currentVisa, l);
  }

  // 수수료 질문
  if (match === '_fee') {
    return getFeeResponse(l);
  }

  // 처리기간 질문
  if (match === '_processing') {
    return getProcessingResponse(l);
  }

  // 귀화 질문
  if (match === '_naturalization') {
    return getNaturalizationResponse(currentVisa, l);
  }

  // 특정 비자 관련 질문
  if (match && !match.startsWith('_')) {
    return getVisaInfoResponse(match, currentVisa, l, region);
  }

  // 기본 응답
  return getDefaultResponse(currentVisa, l);
}

function getTransitionResponse(currentVisa, l, region) {
  const data = visaTransitions[currentVisa || 'none'];
  if (!data) {
    return l === 'ko'
      ? '현재 비자 정보가 설정되지 않았습니다. 프로필에서 현재 비자를 선택해주세요.'
      : '当前签证信息未设置。请在资料中选择当前签证。';
  }

  let transitions = data.transitions;
  if (region === 'mainland') {
    transitions = transitions.filter(t => !t.hkMoTwOnly);
  } else {
    transitions = transitions.filter(t => !t.mainlandOnly);
  }

  let resp = l === 'ko'
    ? `📋 **현재: ${data.label[l]}**\n\n변경 가능한 비자:\n\n`
    : l === 'en'
    ? `📋 **Current: ${data.label[l] || data.label.ko}**\n\nAvailable visa changes:\n\n`
    : `📋 **当前：${data.label[l]}**\n\n可变更的签证：\n\n`;

  transitions.forEach(t => {
    resp += `🔹 **${t.label[l]}**\n`;
    t.conditions[l].forEach(c => {
      resp += `  • ${c}\n`;
    });
    resp += '\n';
  });

  if (data.notes) {
    resp += `\n${data.notes[l]}`;
  }

  return resp;
}

function getExtendResponse(currentVisa, l) {
  const extendInfo = {
    'C-3': {
      ko: '📌 C-3 연장: 출입국·외국인청에서 체류 기간 연장 가능 (사유 소명 필요, 최대 90일 한도). C-3 체류 중 취업은 절대 불가.',
      zh: '📌 C-3延期：可在出入境管理局申请延期（需说明理由，最多90天）。C-3期间绝对不可就业。',
    },
    'D-2': {
      ko: '📌 D-2 연장: 재학 증명서 + 성적 증명서 + 출석률 확인(70% 이상) + 등록금 납부 → 출입국·외국인청 또는 하이코리아. 방학 중 시간제 취업 허가 가능.',
      zh: '📌 D-2延期：在学证明 + 成绩证明 + 出勤率（70%以上）+ 学费缴纳 → 出入境管理局或HiKorea。假期可申请兼职许可。',
    },
    'D-4': {
      ko: '📌 D-4 연장: 재학 증명 + 출석률 확인(70% 이상) + 다음 학기 등록금 납부. 출석률 70% 미만 시 연장 거부될 수 있음.',
      zh: '📌 D-4延期：在学证明 + 出勤率（70%以上）+ 下学期学费。出勤率低于70%可能被拒绝。',
    },
    'E-7': {
      ko: '📌 E-7 연장: 고용 지속 + 4대 보험 가입 + 납세 증명 → 출입국·외국인청. 사업장 변경 시 사전 허가 필요.',
      zh: '📌 E-7延期：雇佣持续 + 四大保险 + 纳税证明 → 出入境管理局。变更工作场所需事先许可。',
    },
    'F-6': {
      ko: '📌 F-6 연장: 혼인 지속 증명 (동거 확인) + 배우자 소득 증명 → 출입국·외국인청.',
      zh: '📌 F-6延期：婚姻持续证明（同居确认）+ 配偶收入证明 → 出入境管理局。',
    },
    'F-5': {
      ko: '📌 F-5(영주)는 체류 기간이 무기한입니다! 단, 외국인등록증은 10년마다 갱신 필요. 1년 이상 출국 시 재입국허가 필요.',
      zh: '📌 F-5(永住)停留期间无期限！但外国人登记证每10年需更新。1年以上出境需再入境许可。',
    },
  };

  if (extendInfo[currentVisa]) {
    return extendInfo[currentVisa][l];
  }

  return l === 'ko'
    ? '📌 체류 연장은 만료 전 출입국·외국인청 방문 또는 하이코리아(hikorea.go.kr) 온라인으로 신청 가능합니다. 비자 유형에 따라 필요 서류가 다르니, "비자변경" 탭에서 현재 비자를 확인해주세요.'
    : '📌 居留延期可在到期前到出入境管理局或HiKorea(hikorea.go.kr)在线申请。根据签证类型所需材料不同，请在"签证变更"标签确认当前签证。';
}

function getDocumentsResponse(currentVisa, l) {
  return l === 'ko'
    ? '📄 필요 서류는 비자 유형에 따라 다릅니다. 홈 탭에서 해당 비자를 검색하면 상세 서류 목록을 확인할 수 있습니다.\n\n공통 필수 서류:\n• 비자 신청서\n• 여권 원본 + 사본\n• 증명사진 (3.5×4.5cm, 흰 배경)\n\n💡 중국 발행 서류는 공증처 공증 → 외교부 인증 → 영사 확인 (또는 아포스티유) 필요.'
    : '📄 所需材料根据签证类型不同。在首页搜索对应签证即可查看详细材料清单。\n\n通用必备材料：\n• 签证申请表\n• 护照原件 + 复印件\n• 证件照（3.5×4.5cm，白底）\n\n💡 中国出具的文件需：公证处公证 → 外交部认证 → 领事确认（或海牙认证）。';
}

function getFeeResponse(l) {
  return l === 'ko'
    ? '💰 비자 수수료:\n\n• 단기비자 (B/C계열): 단수 $40, 복수 $70\n• 장기비자 (D/E/F계열): 단수 $60, 복수 $90\n• F-5 영주: 약 23만원\n• KVAC 대행 수수료: 별도 (약 120~180위안)\n\n⚠️ 상호주의에 따라 중국 국적자 수수료가 다를 수 있음. 재외공관 확인 필수.'
    : '💰 签证费用：\n\n• 短期签证（B/C系列）：单次$40，多次$70\n• 长期签证（D/E/F系列）：单次$60，多次$90\n• F-5永住：约23万韩元\n• KVAC代办费：另算（约120~180元）\n\n⚠️ 根据相互主义，中国国籍者费用可能不同。请确认驻外使领馆。';
}

function getProcessingResponse(l) {
  return l === 'ko'
    ? '⏳ 처리 기간:\n\n• C계열 (단기): 5~7 영업일 (성수기 14일)\n• D계열 (유학/투자): 7~30 영업일\n• E계열 (취업): 14~30 영업일 (인정서 포함)\n• F-6 (결혼): 1~3개월 (면접 포함)\n• F-5 (영주): 1~3개월\n\n💡 사증발급인정서가 필요한 경우 추가 2~4주 소요.'
    : '⏳ 处理时间：\n\n• C系列（短期）：5~7工作日（旺季14天）\n• D系列（留学/投资）：7~30工作日\n• E系列（就业）：14~30工作日（含认定书）\n• F-6（结婚）：1~3个月（含面试）\n• F-5（永住）：1~3个月\n\n💡 需要签证发放认定书时额外需2~4周。';
}

function getNaturalizationResponse(currentVisa, l) {
  return l === 'ko'
    ? '🇰🇷 귀화 (한국 국적 취득):\n\n**일반귀화**: 5년 이상 한국 거주 + 한국어 능력 + 생계 능력 + 무범죄\n\n**간이귀화 (결혼)**: 한국인 배우자와 혼인 2년 + 1년 이상 거주, 또는 혼인 3년 + 1년 거주\n\n**특별귀화**: 특별 공로자, 한국인 부모 등\n\n💡 F-5(영주) → 귀화가 가장 일반적인 경로. 귀화 시 원래 국적을 포기해야 합니다 (이중국적 예외 있음).'
    : '🇰🇷 归化（取得韩国国籍）：\n\n**一般归化**：在韩居住5年以上 + 韩语能力 + 生计能力 + 无犯罪\n\n**简易归化（结婚）**：与韩国人结婚2年 + 居住1年以上，或结婚3年 + 居住1年\n\n**特别归化**：特殊贡献者、韩国人父母等\n\n💡 F-5(永住) → 归化是最常见的路径。归化时需放弃原国籍（双重国籍有例外）。';
}

function getVisaInfoResponse(visaId, currentVisa, l, region) {
  // 현재 비자에서 해당 비자로 변경 가능한지 확인
  const transData = visaTransitions[currentVisa || 'none'];
  let transitionInfo = '';

  if (transData) {
    const found = transData.transitions.find(t => t.to === visaId);
    if (found) {
      const conditions = found.conditions[l].map(c => `  • ${c}`).join('\n');
      transitionInfo = l === 'ko'
        ? `\n\n✅ **현재 비자(${currentVisa || '없음'})에서 변경 가능!**\n${conditions}`
        : `\n\n✅ **从当前签证(${currentVisa || '无'})可以变更！**\n${conditions}`;
    } else {
      transitionInfo = l === 'ko'
        ? `\n\n⚠️ 현재 비자(${currentVisa || '없음'})에서 직접 변경은 어렵습니다. 다른 경로를 고려해보세요.`
        : `\n\n⚠️ 从当前签证(${currentVisa || '无'})直接变更较难。请考虑其他路径。`;
    }
  }

  const visaNames = {
    'C-3': { ko: 'C-3 단기방문', zh: 'C-3 短期访问' },
    'D-2': { ko: 'D-2 유학', zh: 'D-2 留学' },
    'D-4': { ko: 'D-4 어학연수', zh: 'D-4 语言研修' },
    'D-8': { ko: 'D-8 기업투자', zh: 'D-8 企业投资' },
    'D-10': { ko: 'D-10 구직', zh: 'D-10 求职' },
    'E-7': { ko: 'E-7 특정활동', zh: 'E-7 特定活动' },
    'F-4': { ko: 'F-4 재외동포', zh: 'F-4 海外同胞' },
    'F-5': { ko: 'F-5 영주', zh: 'F-5 永住' },
    'F-6': { ko: 'F-6 결혼이민', zh: 'F-6 结婚移民' },
    'H-1': { ko: 'H-1 워킹홀리데이', zh: 'H-1 打工度假' },
    'H-2': { ko: 'H-2 방문취업', zh: 'H-2 访问就业' },
    'B-2': { ko: 'B-2 관광통과 (제주 무비자)', zh: 'B-2 旅游过境（济州免签）' },
    'E-1': { ko: 'E-1 교수', zh: 'E-1 教授' },
    'E-3': { ko: 'E-3 연구', zh: 'E-3 研究' },
  };

  const name = visaNames[visaId]?.[l] || visaId;

  return l === 'ko'
    ? `📌 **${name}**에 대해 물어보셨네요!\n\n홈 탭에서 "${visaId}"를 검색하면 상세 정보(자격, 서류, 수수료, 처리기간)를 확인할 수 있습니다.${transitionInfo}`
    : `📌 您问的是 **${name}**！\n\n在首页搜索"${visaId}"即可查看详细信息（资格、材料、费用、处理时间）。${transitionInfo}`;
}

function getDefaultResponse(currentVisa, l) {
  if (l === 'ko') {
    return `질문을 이해하지 못했습니다. 다음과 같이 물어보세요:\n\n• "변경 가능한 비자가 뭐야?"\n• "영주권 받으려면?"\n• "결혼비자 조건이 뭐야?"\n• "비자 연장하려면?"\n• "수수료가 얼마야?"\n• "필요한 서류가 뭐야?"`;
  }
  if (l === 'en') {
    return `I didn't understand your question. Try asking:\n\n• "What visas can I change to?"\n• "How to get permanent residency?"\n• "Marriage visa conditions?"\n• "How to extend my visa?"\n• "What are the fees?"\n• "What documents do I need?"`;
  }
  return `没能理解您的问题。您可以这样问：\n\n• "可以变更什么签证？"\n• "怎么拿永住权？"\n• "结婚签证条件是什么？"\n• "签证怎么延期？"\n• "费用多少？"\n• "需要什么材料？"`;
}
