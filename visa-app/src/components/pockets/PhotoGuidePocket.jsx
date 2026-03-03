import React, { useState } from 'react';
import { Camera, ChevronDown, ChevronUp, MapPin, Clock, Star } from 'lucide-react';

function L(lang, obj) {
  return obj[lang] || obj.ko;
}

const SELFIE_COMPOSITIONS = [
  {
    id: 'thirds',
    name: { ko: '3분할 구도', zh: '三分法构图', en: 'Rule of Thirds' },
    tip: { ko: '얼굴을 화면 1/3 지점에 배치', zh: '将脸部放在画面1/3处', en: 'Place face at 1/3 point' },
    visual: 'grid',
    color: 'bg-rose-100',
  },
  {
    id: 'center',
    name: { ko: '중앙 구도', zh: '居中构图', en: 'Center Composition' },
    tip: { ko: '정면 셀카의 기본, 배경과 균형', zh: '正面自拍基础，与背景平衡', en: 'Classic selfie, balance with background' },
    visual: 'center-circle',
    color: 'bg-sky-100',
  },
  {
    id: 'diagonal',
    name: { ko: '대각선 구도', zh: '对角线构图', en: 'Diagonal Composition' },
    tip: { ko: '고개를 살짝 기울여 자연스러운 느낌', zh: '稍微侧头，营造自然感', en: 'Slight head tilt for natural feel' },
    visual: 'diagonal-line',
    color: 'bg-violet-100',
  },
  {
    id: 'lowangle',
    name: { ko: '로우앵글', zh: '低角度', en: 'Low Angle' },
    tip: { ko: '아래에서 위로, 턱선 + 하늘 배경', zh: '从下往上，下颌线 + 天空背景', en: 'From below, jawline + sky background' },
    visual: 'arrow-up',
    color: 'bg-amber-100',
  },
  {
    id: 'mirror',
    name: { ko: '거울 셀카', zh: '镜子自拍', en: 'Mirror Selfie' },
    tip: { ko: '전신 촬영의 정석, 카페/화장실 거울 활용', zh: '全身拍摄经典，利用咖啡厅/卫生间镜子', en: 'Full body classic, use cafe/bathroom mirrors' },
    visual: 'mirror-frame',
    color: 'bg-emerald-100',
  },
  {
    id: 'foodangle',
    name: { ko: '음식 촬영 45°', zh: '美食拍摄45°', en: 'Food Shot 45°' },
    tip: { ko: '45도 각도에서 자연광으로 촬영', zh: '45度角度用自然光拍摄', en: '45° angle with natural light' },
    visual: 'food-angle',
    color: 'bg-orange-100',
  },
];

const PHOTO_BOOTH_STEPS = [
  { ko: '매장 입장 → 부스 선택', zh: '进店 → 选择拍照间', en: 'Enter → Choose booth' },
  { ko: '프레임 선택 (4컷/6컷/8컷)', zh: '选择相框（4格/6格/8格）', en: 'Select frame (4/6/8 cuts)' },
  { ko: '결제 (카드/현금, 4,000~6,000원)', zh: '付款（刷卡/现金，4,000~6,000韩元）', en: 'Pay (card/cash, ₩4,000~6,000)' },
  { ko: '촬영 (10초 카운트다운 × 횟수)', zh: '拍摄（10秒倒计时 × 次数）', en: 'Shoot (10s countdown × times)' },
  { ko: '사진 선택 → 꾸미기 → 인쇄', zh: '选照片 → 装饰 → 打印', en: 'Select → Decorate → Print' },
  { ko: 'QR코드로 원본 다운로드', zh: '扫二维码下载原图', en: 'Download originals via QR' },
];

const PHOTO_BOOTH_BRANDS = [
  { name: '인생네컷', zh: '人生四格', locations: { ko: '전국 800+ 매장', zh: '全国800+门店', en: '800+ locations nationwide' } },
  { name: '포토이즘', zh: 'Photoism', locations: { ko: '전국 500+ 매장', zh: '全国500+门店', en: '500+ locations nationwide' } },
  { name: '하루필름', zh: 'Haru Film', locations: { ko: '주요 상권', zh: '主要商圈', en: 'Major shopping areas' } },
  { name: '포토그레이', zh: 'Photogray', locations: { ko: '신규 브랜드', zh: '新品牌', en: 'New brand' } },
];

const PHOTO_SPOTS_SEOUL = [
  { rank: 1, name: { ko: '경복궁', zh: '景福宫', en: 'Gyeongbokgung' }, bestTime: { ko: '오전 9~11시', zh: '上午9~11点', en: '9-11 AM' }, tip: { ko: '한복 입으면 무료입장', zh: '穿韩服免费入场', en: 'Free entry with Hanbok' } },
  { rank: 2, name: { ko: 'DDP 야경', zh: 'DDP夜景', en: 'DDP Night View' }, bestTime: { ko: '일몰 후 30분', zh: '日落后30分钟', en: '30min after sunset' }, tip: { ko: 'LED 장미가 점등되는 시간', zh: 'LED玫瑰亮灯时间', en: 'When LED roses light up' } },
  { rank: 3, name: { ko: 'N서울타워', zh: 'N首尔塔', en: 'N Seoul Tower' }, bestTime: { ko: '일몰 1시간 전', zh: '日落前1小时', en: '1h before sunset' }, tip: { ko: '남산케이블카 타고 올라가기', zh: '坐南山缆车上去', en: 'Take Namsan Cable Car' } },
  { rank: 4, name: { ko: '성수동 카페거리', zh: '圣水洞咖啡街', en: 'Seongsu Cafe Street' }, bestTime: { ko: '오후 2~4시', zh: '下午2~4点', en: '2-4 PM' }, tip: { ko: '벽화 + 카페 조합', zh: '壁画 + 咖啡组合', en: 'Murals + cafe combo' } },
  { rank: 5, name: { ko: '한강 야경', zh: '汉江夜景', en: 'Hangang Night' }, bestTime: { ko: '일몰~밤 9시', zh: '日落~晚9点', en: 'Sunset~9 PM' }, tip: { ko: '여의도 or 반포대교 무지개분수', zh: '汝矣岛或盘浦大桥彩虹喷泉', en: 'Yeouido or Banpo Rainbow Fountain' } },
  { rank: 6, name: { ko: '북촌한옥마을', zh: '北村韩屋村', en: 'Bukchon Hanok Village' }, bestTime: { ko: '오전 10시 이전', zh: '上午10点前', en: 'Before 10 AM' }, tip: { ko: '관광객 적은 이른 아침이 베스트', zh: '游客少的清晨最佳', en: 'Early morning = fewer tourists' } },
  { rank: 7, name: { ko: '이태원 경리단길', zh: '梨泰院经理团路', en: 'Gyeongnidan-gil' }, bestTime: { ko: '오후 3~5시', zh: '下午3~5点', en: '3-5 PM' }, tip: { ko: '이국적 카페 + 빈티지숍', zh: '异国情调咖啡厅 + 复古店', en: 'Exotic cafes + vintage shops' } },
  { rank: 8, name: { ko: '연남동 연트럴파크', zh: '延南洞延Central Park', en: 'Yeonnam-dong Yeontral Park' }, bestTime: { ko: '일몰 전후', zh: '日落前后', en: 'Around sunset' }, tip: { ko: '산책로 + 카페 테라스', zh: '散步路 + 咖啡露台', en: 'Walking path + cafe terrace' } },
  { rank: 9, name: { ko: '잠실 석촌호수', zh: '蚕室石村湖', en: 'Seokchon Lake' }, bestTime: { ko: '벚꽃: 4월 초', zh: '樱花：4月初', en: 'Cherry blossoms: early April' }, tip: { ko: '롯데타워 배경 벚꽃 = 인생샷', zh: '乐天塔背景樱花 = 人生照', en: 'Lotte Tower + cherry blossoms' } },
  { rank: 10, name: { ko: '을지로 레트로 골목', zh: '乙支路复古巷', en: 'Euljiro Retro Alley' }, bestTime: { ko: '저녁 6~8시', zh: '傍晚6~8点', en: '6-8 PM' }, tip: { ko: '네온사인 + 빈티지 감성', zh: '霓虹灯 + 复古感性', en: 'Neon signs + vintage vibes' } },
];

const PHOTO_TIPS = [
  { category: { ko: '빛', zh: '光线', en: 'Lighting' }, tips: [
    { ko: '골든아워(일출/일몰 전후 1시간)가 최고', zh: '黄金时段（日出/日落前后1小时）最佳', en: 'Golden hour is best' },
    { ko: '정오 직사광선 피하기 (그림자 강함)', zh: '避免正午直射光（阴影太重）', en: 'Avoid harsh noon light' },
    { ko: '카페 창가석 = 자연광 인물사진 최적', zh: '咖啡厅窗边座 = 自然光人像最佳', en: 'Cafe window seat = best natural portrait light' },
  ]},
  { category: { ko: '구도', zh: '构图', en: 'Composition' }, tips: [
    { ko: '머리 위 공간 남기기 (답답하지 않게)', zh: '头顶留空间（不要拍得太满）', en: 'Leave headroom' },
    { ko: '배경 정리: 쓰레기통, 사람 피하기', zh: '整理背景：避开垃圾桶、行人', en: 'Clean background: avoid trash, crowds' },
    { ko: '건물은 세로, 풍경은 가로', zh: '建筑竖拍，风景横拍', en: 'Portrait for buildings, landscape for scenery' },
  ]},
  { category: { ko: '앱 추천', zh: '推荐APP', en: 'Recommended Apps' }, tips: [
    { ko: 'SODA (셀카 보정), SNOW (필터), 미투데이 (중국용)', zh: 'SODA（自拍美颜），SNOW（滤镜），美图秀秀（中国用）', en: 'SODA (selfie), SNOW (filters), Meitu (Chinese)' },
    { ko: 'Lightroom (전문 색감 보정)', zh: 'Lightroom（专业调色）', en: 'Lightroom (pro color grading)' },
  ]},
];

function CompositionVisual({ type }) {
  const base = 'w-full h-full absolute inset-0';
  switch (type) {
    case 'grid':
      return (
        <div className={base}>
          <div className="absolute top-1/3 left-0 right-0 border-t border-white/50 border-dashed" />
          <div className="absolute top-2/3 left-0 right-0 border-t border-white/50 border-dashed" />
          <div className="absolute top-0 bottom-0 left-1/3 border-l border-white/50 border-dashed" />
          <div className="absolute top-0 bottom-0 left-2/3 border-l border-white/50 border-dashed" />
          <div className="absolute top-1/3 left-2/3 w-3 h-3 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
      );
    case 'center-circle':
      return (
        <div className={base + ' flex items-center justify-center'}>
          <div className="w-16 h-16 border-2 border-white/60 rounded-full" />
          <div className="absolute w-2 h-2 bg-white/80 rounded-full" />
        </div>
      );
    case 'diagonal-line':
      return (
        <div className={base}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-[141%] border-t border-white/50 border-dashed origin-top-left rotate-[30deg]" />
          </div>
          <div className="absolute top-[40%] left-[55%] w-3 h-3 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
      );
    case 'arrow-up':
      return (
        <div className={base + ' flex items-center justify-center'}>
          <div className="flex flex-col items-center">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[14px] border-l-transparent border-r-transparent border-b-white/70" />
            <div className="w-0.5 h-10 bg-white/50" />
          </div>
        </div>
      );
    case 'mirror-frame':
      return (
        <div className={base + ' flex items-center justify-center p-3'}>
          <div className="w-full h-full border-2 border-white/50 rounded-lg flex items-center justify-center">
            <div className="w-6 h-10 border border-white/60 rounded-sm" />
          </div>
        </div>
      );
    case 'food-angle':
      return (
        <div className={base + ' flex items-end justify-center pb-3'}>
          <div className="relative">
            <div className="w-14 h-14 border-2 border-white/50 rounded-full" />
            <div className="absolute -top-3 -right-1 text-white/70 text-[10px] font-medium">45°</div>
            <div className="absolute -top-5 left-1/2 w-0.5 h-6 bg-white/40 origin-bottom -rotate-45 -translate-x-1/2" />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default function PhotoGuidePocket({ lang = 'zh' }) {
  const [activeSection, setActiveSection] = useState('composition');
  const [openTipIdx, setOpenTipIdx] = useState(null);

  const sections = [
    { id: 'composition', label: { ko: '셀카 구도', zh: '自拍构图', en: 'Selfie Tips' } },
    { id: 'booth', label: { ko: '인생네컷', zh: '人生四格', en: 'Photo Booth' } },
    { id: 'spots', label: { ko: 'TOP 10', zh: 'TOP 10', en: 'TOP 10' } },
    { id: 'tips', label: { ko: '촬영 팁', zh: '拍照技巧', en: 'Photo Tips' } },
  ];

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex gap-1.5 pb-2">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all active:scale-[0.98] ${
              activeSection === sec.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {sec.id === 'composition' && <Camera size={12} />}
            <span className="font-medium">{L(lang, sec.label)}</span>
          </button>
        ))}
      </div>

      {/* Selfie Composition Guide */}
      {activeSection === 'composition' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {L(lang, { ko: '셀카 구도 가이드', zh: '自拍构图指南', en: 'Selfie Composition Guide' })}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {SELFIE_COMPOSITIONS.map((comp) => (
              <div
                key={comp.id}
                className={`${comp.color} rounded-2xl aspect-square relative overflow-hidden active:scale-[0.98] transition-transform`}
              >
                <CompositionVisual type={comp.visual} />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/30 to-transparent">
                  <p className="text-white font-semibold text-sm leading-tight">{L(lang, comp.name)}</p>
                  <p className="text-white/80 text-[11px] mt-0.5 leading-tight">{L(lang, comp.tip)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Booth Guide */}
      {activeSection === 'booth' && (
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-gray-900">
            {L(lang, { ko: '인생네컷 & 포토이즘 이용법', zh: '人生四格 & Photoism使用方法', en: 'Life4Cuts & Photoism Guide' })}
          </h3>

          {/* Steps */}
          <div className="space-y-2">
            {PHOTO_BOOTH_STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-800 pt-1">{L(lang, step)}</p>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="p-3 bg-amber-50 rounded-xl">
            <p className="text-sm font-medium text-amber-800">
              {L(lang, { ko: '가격: 4,000~6,000원', zh: '价格：4,000~6,000韩元', en: 'Price: ₩4,000~6,000' })}
            </p>
          </div>

          {/* Brands */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">
              {L(lang, { ko: '주요 브랜드', zh: '主要品牌', en: 'Major Brands' })}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {PHOTO_BOOTH_BRANDS.map((brand, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl">
                  <p className="font-medium text-sm text-gray-900">{lang === 'zh' ? brand.zh : brand.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{L(lang, brand.locations)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Photo Spots TOP 10 */}
      {activeSection === 'spots' && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {L(lang, { ko: '서울 포토스팟 TOP 10', zh: '首尔拍照景点 TOP 10', en: 'Seoul Photo Spots TOP 10' })}
          </h3>
          <div className="space-y-2">
            {PHOTO_SPOTS_SEOUL.map((spot) => (
              <div key={spot.rank} className="p-3 bg-gray-50 rounded-xl active:scale-[0.98] transition-transform">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {spot.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{L(lang, spot.name)}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={10} />
                        {L(lang, spot.bestTime)}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">{L(lang, spot.tip)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Tips */}
      {activeSection === 'tips' && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {L(lang, { ko: '촬영 팁', zh: '拍照技巧', en: 'Photo Tips' })}
          </h3>
          {PHOTO_TIPS.map((group, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenTipIdx(openTipIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-3 active:scale-[0.98] transition-transform"
              >
                <span className="font-semibold text-sm text-gray-900">{L(lang, group.category)}</span>
                {openTipIdx === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openTipIdx === idx && (
                <div className="px-3 pb-3 space-y-2">
                  {group.tips.map((tip, i) => (
                    <div key={i} className="p-2 bg-white rounded-lg">
                      <p className="text-sm text-gray-700">{L(lang, tip)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
