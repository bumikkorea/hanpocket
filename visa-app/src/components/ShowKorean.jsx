import { useState } from 'react'
import { ChevronLeft, Volume2, Copy, Check, Search } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

// 상황/장소별 한국어 카드 데이터
const SCENES = [
  {
    id: 'restaurant',
    icon: '🍽',
    title: { ko: '식당', zh: '餐厅', en: 'Restaurant' },
    phrases: [
      { ko: '메뉴판 주세요', zh: '请给我菜单', en: 'Menu please', pron: 'me-nyu-pan ju-se-yo' },
      { ko: '이거 주세요', zh: '请给我这个', en: 'This one please', pron: 'i-geo ju-se-yo' },
      { ko: '물 주세요', zh: '请给我水', en: 'Water please', pron: 'mul ju-se-yo' },
      { ko: '계산해 주세요', zh: '请结账', en: 'Check please', pron: 'gye-san-hae ju-se-yo' },
      { ko: '맵지 않게 해주세요', zh: '请不要太辣', en: 'Not spicy please', pron: 'maep-ji an-ke hae-ju-se-yo' },
      { ko: '포장해 주세요', zh: '请打包', en: 'To go please', pron: 'po-jang-hae ju-se-yo' },
      { ko: '알레르기가 있어요', zh: '我有过敏', en: 'I have allergies', pron: 'al-le-reu-gi-ga is-seo-yo' },
      { ko: '채식이에요', zh: '我吃素', en: "I'm vegetarian", pron: 'chae-sig-i-e-yo' },
    ]
  },
  {
    id: 'cafe',
    icon: '☕',
    title: { ko: '카페', zh: '咖啡厅', en: 'Cafe' },
    phrases: [
      { ko: '아메리카노 한 잔 주세요', zh: '请给我一杯美式咖啡', en: 'One Americano please', pron: 'a-me-ri-ka-no han jan ju-se-yo' },
      { ko: '뜨거운/차가운 걸로요', zh: '要热的/冷的', en: 'Hot/Iced', pron: 'tteu-geo-un/cha-ga-un geol-lo-yo' },
      { ko: '사이즈 업 해주세요', zh: '请加大杯', en: 'Size up please', pron: 'sa-i-jeu eop hae-ju-se-yo' },
      { ko: '여기서 먹을게요', zh: '在这里喝', en: 'For here', pron: 'yeo-gi-seo meog-eul-ge-yo' },
      { ko: '와이파이 비밀번호 뭐에요?', zh: 'WiFi密码是什么？', en: 'WiFi password?', pron: 'wa-i-pa-i bi-mil-beon-ho mwo-e-yo' },
    ]
  },
  {
    id: 'shopping',
    icon: '🛍',
    title: { ko: '쇼핑', zh: '购物', en: 'Shopping' },
    phrases: [
      { ko: '이거 얼마예요?', zh: '这个多少钱？', en: 'How much is this?', pron: 'i-geo eol-ma-ye-yo' },
      { ko: '카드 돼요?', zh: '可以刷卡吗？', en: 'Card OK?', pron: 'ka-deu dwae-yo' },
      { ko: '알리페이 돼요?', zh: '可以支付宝吗？', en: 'Alipay OK?', pron: 'al-li-pe-i dwae-yo' },
      { ko: '다른 색 있어요?', zh: '有其他颜色吗？', en: 'Other colors?', pron: 'da-reun saek is-seo-yo' },
      { ko: '입어볼 수 있어요?', zh: '可以试穿吗？', en: 'Can I try it on?', pron: 'ib-eo-bol su is-seo-yo' },
      { ko: '세금 환급 돼요?', zh: '可以退税吗？', en: 'Tax refund?', pron: 'se-geum hwan-geup dwae-yo' },
      { ko: '봉투 주세요', zh: '请给我袋子', en: 'Bag please', pron: 'bong-tu ju-se-yo' },
    ]
  },
  {
    id: 'taxi',
    icon: '🚕',
    title: { ko: '택시/교통', zh: '出租车/交通', en: 'Taxi/Transport' },
    phrases: [
      { ko: '여기로 가주세요', zh: '请去这里', en: 'Please go here', pron: 'yeo-gi-ro ga-ju-se-yo' },
      { ko: '얼마나 걸려요?', zh: '需要多久？', en: 'How long?', pron: 'eol-ma-na geol-lyeo-yo' },
      { ko: '여기서 내려주세요', zh: '请在这里停', en: 'Stop here please', pron: 'yeo-gi-seo nae-ryeo-ju-se-yo' },
      { ko: '카드로 해주세요', zh: '请刷卡', en: 'Card please', pron: 'ka-deu-ro hae-ju-se-yo' },
      { ko: '영수증 주세요', zh: '请给我收据', en: 'Receipt please', pron: 'yeong-su-jeung ju-se-yo' },
      { ko: '트렁크 열어주세요', zh: '请打开后备箱', en: 'Open trunk please', pron: 'teu-reong-keu yeol-eo-ju-se-yo' },
    ]
  },
  {
    id: 'hotel',
    icon: '🏨',
    title: { ko: '호텔/숙소', zh: '酒店/住宿', en: 'Hotel' },
    phrases: [
      { ko: '체크인 해주세요', zh: '请办理入住', en: 'Check-in please', pron: 'che-keu-in hae-ju-se-yo' },
      { ko: '체크아웃 해주세요', zh: '请办理退房', en: 'Check-out please', pron: 'che-keu-a-ut hae-ju-se-yo' },
      { ko: '짐 맡길 수 있어요?', zh: '可以寄存行李吗？', en: 'Can I store luggage?', pron: 'jim mat-gil su is-seo-yo' },
      { ko: '수건 더 주세요', zh: '请多给毛巾', en: 'More towels please', pron: 'su-geon deo ju-se-yo' },
      { ko: '에어컨이 안 돼요', zh: '空调坏了', en: 'AC not working', pron: 'e-eo-keon-i an dwae-yo' },
    ]
  },
  {
    id: 'convenience',
    icon: '🏪',
    title: { ko: '편의점', zh: '便利店', en: 'Convenience Store' },
    phrases: [
      { ko: '이거 데워주세요', zh: '请加热这个', en: 'Heat this please', pron: 'i-geo de-wo-ju-se-yo' },
      { ko: '충전 해주세요', zh: '请充值', en: 'Please recharge', pron: 'chung-jeon hae-ju-se-yo' },
      { ko: '담배 주세요', zh: '请给我烟', en: 'Cigarettes please', pron: 'dam-bae ju-se-yo' },
      { ko: '택배 보내고 싶어요', zh: '想寄快递', en: 'Want to send package', pron: 'taek-bae bo-nae-go sip-eo-yo' },
    ]
  },
  {
    id: 'emergency',
    icon: '🚨',
    title: { ko: '긴급상황', zh: '紧急情况', en: 'Emergency' },
    color: '#D4574E',
    phrases: [
      { ko: '도와주세요!', zh: '请帮帮我！', en: 'Help me!', pron: 'do-wa-ju-se-yo' },
      { ko: '경찰 불러주세요', zh: '请叫警察', en: 'Call the police', pron: 'gyeong-chal bul-leo-ju-se-yo' },
      { ko: '구급차 불러주세요', zh: '请叫救护车', en: 'Call ambulance', pron: 'gu-geup-cha bul-leo-ju-se-yo' },
      { ko: '저는 중국인입니다', zh: '我是中国人', en: "I'm Chinese", pron: 'jeo-neun jung-gug-in-im-ni-da' },
      { ko: '한국어를 못합니다', zh: '我不会韩语', en: "I don't speak Korean", pron: 'han-gug-eo-reul mot-ham-ni-da' },
      { ko: '여기가 어디예요?', zh: '这是哪里？', en: 'Where am I?', pron: 'yeo-gi-ga eo-di-ye-yo' },
      { ko: '병원에 가야 해요', zh: '我需要去医院', en: 'I need a hospital', pron: 'byeong-won-e ga-ya hae-yo' },
      { ko: '여권을 잃어버렸어요', zh: '我的护照丢了', en: 'I lost my passport', pron: 'yeo-gwon-eul ilh-eo-beo-ryeoss-eo-yo' },
      { ko: '대사관에 연락해주세요', zh: '请联系大使馆', en: 'Contact embassy', pron: 'dae-sa-gwan-e yeol-lak-hae-ju-se-yo' },
      { ko: '머리가 아파요', zh: '头痛', en: 'Headache', pron: 'meo-ri-ga a-pa-yo' },
      { ko: '배가 아파요', zh: '肚子痛', en: 'Stomachache', pron: 'bae-ga a-pa-yo' },
      { ko: '열이 나요', zh: '发烧', en: 'I have a fever', pron: 'yeol-i na-yo' },
      { ko: '약이 필요해요', zh: '需要药物', en: 'I need medicine', pron: 'yag-i pil-yo-hae-yo' },
    ]
  },
  {
    id: 'directions',
    icon: '🗺',
    title: { ko: '길찾기', zh: '问路', en: 'Directions' },
    phrases: [
      { ko: '화장실 어디예요?', zh: '厕所在哪？', en: 'Where is restroom?', pron: 'hwa-jang-sil eo-di-ye-yo' },
      { ko: '지하철역 어디예요?', zh: '地铁站在哪？', en: 'Where is subway?', pron: 'ji-ha-cheol-yeok eo-di-ye-yo' },
      { ko: '이 근처에 편의점 있어요?', zh: '附近有便利店吗？', en: 'Convenience store nearby?', pron: 'i geun-cheo-e pyeon-ui-jeom is-seo-yo' },
      { ko: '걸어서 얼마나 걸려요?', zh: '走路需要多久？', en: 'How far by walk?', pron: 'geol-eo-seo eol-ma-na geol-lyeo-yo' },
      { ko: '오른쪽/왼쪽이에요?', zh: '右边/左边？', en: 'Right/Left?', pron: 'o-reun-jjok/oen-jjog-i-e-yo' },
    ]
  },
]

function PhraseCard({ phrase, lang }) {
  const [copied, setCopied] = useState(false)

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'ko-KR'
      u.rate = 0.8
      speechSynthesis.speak(u)
    }
  }

  const copy = () => {
    navigator.clipboard?.writeText(phrase.ko)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="bg-white rounded-[16px] p-4 active:scale-[0.98] transition-all" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <p className="text-[17px] font-bold text-[#1A1A1A] mb-1">{phrase.ko}</p>
      <p className="text-[13px] text-[#888] mb-0.5">{phrase.pron}</p>
      <p className="text-[13px] text-[#555]">{lang === 'en' ? phrase.en : phrase.zh}</p>
      <div className="flex gap-2 mt-3">
        <button onClick={() => speak(phrase.ko)} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F7F3EF] text-[#8B6F5C] text-xs font-medium active:scale-95 transition-transform">
          <Volume2 size={14} /> {lang === 'ko' ? '듣기' : lang === 'zh' ? '听' : 'Listen'}
        </button>
        <button onClick={copy} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F7F3EF] text-[#8B6F5C] text-xs font-medium active:scale-95 transition-transform">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? (lang === 'ko' ? '복사됨' : lang === 'zh' ? '已复制' : 'Copied') : (lang === 'ko' ? '복사' : lang === 'zh' ? '复制' : 'Copy')}
        </button>
      </div>
    </div>
  )
}

export default function ShowKorean({ lang, onBack }) {
  const [activeScene, setActiveScene] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredScenes = searchQuery
    ? SCENES.map(s => ({
        ...s,
        phrases: s.phrases.filter(p =>
          p.ko.includes(searchQuery) || p.zh.includes(searchQuery) || p.en.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(s => s.phrases.length > 0)
    : SCENES

  if (activeScene) {
    const scene = SCENES.find(s => s.id === activeScene)
    return (
      <div className="px-1 pt-2 pb-4 animate-fade-up">
        <button onClick={() => setActiveScene(null)} className="flex items-center gap-1 text-[#888] mb-4">
          <ChevronLeft size={20} />
          <span className="text-sm">{lang === 'ko' ? '전체 상황' : lang === 'zh' ? '全部场景' : 'All Scenes'}</span>
        </button>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[32px]">{scene.icon}</span>
          <div>
            <p className="typo-title">{L(lang, scene.title)}</p>
            <p className="typo-caption">{scene.phrases.length} {lang === 'ko' ? '문장' : lang === 'zh' ? '句' : 'phrases'}</p>
          </div>
        </div>
        <div className="space-y-3">
          {scene.phrases.map((p, i) => <PhraseCard key={i} phrase={p} lang={lang} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="px-1 pt-2 pb-4 animate-fade-up">
      {/* 헤더 */}
      <div className="mb-6">
        <p className="typo-whisper mb-1">SHOW & SPEAK</p>
        <p className="typo-hero">{L(lang, { ko: '보여주는 한국어', zh: '展示韩语', en: 'Show Korean' })}</p>
        <p className="typo-body mt-2">{L(lang, { ko: '화면을 보여주세요. 한국어를 몰라도 괜찮아요.', zh: '给对方看屏幕就好。不会韩语也没关系。', en: 'Just show the screen. No Korean needed.' })}</p>
      </div>

      {/* 검색 */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={lang === 'ko' ? '문장 검색...' : lang === 'zh' ? '搜索句子...' : 'Search phrases...'}
          className="w-full pl-10 pr-4 py-2.5 bg-[#F7F3EF] rounded-xl text-sm text-[#1A1A1A] placeholder-[#999] outline-none"
        />
      </div>

      {/* 상황별 카테고리 그리드 */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {SCENES.map(scene => (
          <button
            key={scene.id}
            onClick={() => setActiveScene(scene.id)}
            className="flex flex-col items-center gap-2 py-4 rounded-[16px] bg-white active:scale-[0.96] transition-all"
            style={{
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              borderLeft: scene.color ? `3px solid ${scene.color}` : 'none'
            }}
          >
            <span className="text-[24px]">{scene.icon}</span>
            <span className="text-[11px] font-medium text-[#555]">{L(lang, scene.title)}</span>
            <span className="text-[10px] text-[#ABABAB]">{scene.phrases.length}</span>
          </button>
        ))}
      </div>

      {/* 검색 결과 또는 인기 문장 */}
      {searchQuery ? (
        <div className="space-y-3">
          {filteredScenes.map(scene => scene.phrases.map((p, i) => (
            <PhraseCard key={`${scene.id}-${i}`} phrase={p} lang={lang} />
          )))}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="typo-whisper mb-1">MOST USED</p>
            <p className="typo-title">{L(lang, { ko: '자주 쓰는 문장', zh: '常用句子', en: 'Most Used' })}</p>
          </div>
          <div className="space-y-3">
            {[
              SCENES[0].phrases[1], // 이거 주세요
              SCENES[0].phrases[3], // 계산해 주세요
              SCENES[2].phrases[0], // 이거 얼마예요?
              SCENES[7].phrases[0], // 화장실 어디예요?
              SCENES[3].phrases[0], // 여기로 가주세요
              SCENES[6].phrases[0], // 도와주세요!
            ].map((p, i) => <PhraseCard key={i} phrase={p} lang={lang} />)}
          </div>
        </>
      )}
    </div>
  )
}
