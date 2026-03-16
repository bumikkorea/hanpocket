/**
 * 긴급 한국어 카드 — 더보기 > 긴급 정보 > 긴급 한국어 카드
 * 증상 표현 + 긴급 문장 + 상황별 표현을 한 곳에
 */
import { useState } from 'react'
import {
  Volume2, Brain, Activity, Thermometer, Wind, Pill, Heart, User, Zap, 
  Bandage, Baby, Eye, Flame, ChevronRight, AlertTriangle, Car, 
  Search as SearchIcon, Shield, Stethoscope, Navigation, HelpCircle, Copy, Check
} from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const medicalCards = [
  { id: 'headache', ko: '머리가 아파요', zh: '头痛', pinyin: 'tóu tòng', pron: 'meo-ri-ga a-pa-yo', icon: Brain },
  { id: 'stomachache', ko: '배가 아파요', zh: '肚子痛', pinyin: 'dù zi tòng', pron: 'bae-ga a-pa-yo', icon: Activity },
  { id: 'fever', ko: '열이 나요', zh: '发烧', pinyin: 'fā shāo', pron: 'yeol-i na-yo', icon: Thermometer },
  { id: 'breathing', ko: '숨이 차요', zh: '呼吸困难', pinyin: 'hū xī kùn nán', pron: 'sum-i cha-yo', icon: Wind },
  { id: 'allergy', ko: '알레르기가 있어요', zh: '我有过敏', pinyin: 'wǒ yǒu guò mǐn', pron: 'al-le-reu-gi-ga is-seo-yo', icon: Pill },
  { id: 'chest', ko: '가슴이 아파요', zh: '胸痛', pinyin: 'xiōng tòng', pron: 'ga-seum-i a-pa-yo', icon: Heart },
  { id: 'back', ko: '허리가 아파요', zh: '腰痛', pinyin: 'yāo tòng', pron: 'heo-ri-ga a-pa-yo', icon: User },
  { id: 'dizzy', ko: '어지러워요', zh: '头晕', pinyin: 'tóu yūn', pron: 'eo-ji-reo-wo-yo', icon: Zap },
  { id: 'nausea', ko: '구역질이 나요', zh: '恶心', pinyin: 'ě xīn', pron: 'gu-yeok-jil-i na-yo', icon: Activity },
  { id: 'diarrhea', ko: '설사를 해요', zh: '腹泻', pinyin: 'fù xiè', pron: 'seol-sa-reul hae-yo', icon: Activity },
  { id: 'vomit', ko: '토해요', zh: '呕吐', pinyin: 'ǒu tù', pron: 'to-hae-yo', icon: Activity },
  { id: 'sore_throat', ko: '목이 아파요', zh: '嗓子疼', pinyin: 'sǎng zi téng', pron: 'mog-i a-pa-yo', icon: Activity },
  { id: 'cough', ko: '기침이 나요', zh: '咳嗽', pinyin: 'ké sòu', pron: 'gi-chim-i na-yo', icon: Wind },
  { id: 'tooth', ko: '이가 아파요', zh: '牙疼', pinyin: 'yá téng', pron: 'i-ga a-pa-yo', icon: Activity },
  { id: 'eye', ko: '눈이 아파요', zh: '眼睛疼', pinyin: 'yǎn jīng téng', pron: 'nun-i a-pa-yo', icon: Eye },
  { id: 'ear', ko: '귀가 아파요', zh: '耳朵疼', pinyin: 'ěr duǒ téng', pron: 'gwi-ga a-pa-yo', icon: Activity },
  { id: 'leg', ko: '다리가 아파요', zh: '腿疼', pinyin: 'tuǐ téng', pron: 'da-ri-ga a-pa-yo', icon: User },
  { id: 'arm', ko: '팔이 아파요', zh: '胳膊疼', pinyin: 'gē bó téng', pron: 'pal-i a-pa-yo', icon: User },
  { id: 'skin', ko: '피부가 가려워요', zh: '皮肤痒', pinyin: 'pí fū yǎng', pron: 'pi-bu-ga ga-ryeo-wo-yo', icon: User },
  { id: 'cut', ko: '상처가 났어요', zh: '受伤了', pinyin: 'shòu shāng le', pron: 'sang-cheo-ga nas-seo-yo', icon: Bandage },
  { id: 'burn', ko: '화상을 입었어요', zh: '烫伤了', pinyin: 'tàng shāng le', pron: 'hwa-sang-eul ib-eoss-eo-yo', icon: Flame },
  { id: 'faint', ko: '기절할 것 같아요', zh: '要昏倒了', pinyin: 'yào hūn dǎo le', pron: 'gi-jeol-hal geot gat-a-yo', icon: Zap },
  { id: 'pregnant', ko: '임신했어요', zh: '我怀孕了', pinyin: 'wǒ huái yùn le', pron: 'im-sin-hae-sseo-yo', icon: Baby },
  { id: 'medicine', ko: '약이 필요해요', zh: '需要药物', pinyin: 'xū yào yào wù', pron: 'yag-i pil-yo-hae-yo', icon: Pill },
]

const emergencyPhrases = [
  { ko: '도와주세요', zh: '请帮助我', pinyin: 'qǐng bāng zhù wǒ', pron: 'do-wa-ju-se-yo' },
  { ko: '저는 중국인입니다', zh: '我是中国人', pinyin: 'wǒ shì zhōng guó rén', pron: 'jeo-neun jung-gug-in-im-ni-da' },
  { ko: '한국어를 못합니다', zh: '我不会韩语', pinyin: 'wǒ bù huì hán yǔ', pron: 'han-gug-eo-reul mot-ham-ni-da' },
  { ko: '여기가 어디예요?', zh: '这是哪里？', pinyin: 'zhè shì nǎ lǐ', pron: 'yeo-gi-ga eo-di-ye-yo' },
  { ko: '병원에 가야 해요', zh: '我需要去医院', pinyin: 'wǒ xū yào qù yī yuán', pron: 'byeong-won-e ga-ya hae-yo' },
  { ko: '응급실이 어디예요?', zh: '急诊室在哪里？', pinyin: 'jí zhěn shì zài nǎ lǐ', pron: 'eung-geup-sil-i eo-di-ye-yo' },
  { ko: '경찰을 불러주세요', zh: '请叫警察', pinyin: 'qǐng jiào jǐng chá', pron: 'gyeong-chal-eul bul-leo-ju-se-yo' },
  { ko: '구급차를 불러주세요', zh: '请叫救护车', pinyin: 'qǐng jiào jiù hù chē', pron: 'gu-geup-cha-reul bul-leo-ju-se-yo' },
  { ko: '통역이 필요합니다', zh: '需要翻译', pinyin: 'xū yào fān yì', pron: 'tong-yeog-i pil-yo-ham-ni-da' },
  { ko: '여권을 잃어버렸어요', zh: '护照丢了', pinyin: 'hù zhào diū le', pron: 'yeo-gwon-eul il-eo-beo-ryeoss-eo-yo' },
]

const situations = [
  { id: 'accident', label: { ko: '교통사고', zh: '交通事故', en: 'Traffic Accident' }, icon: Car,
    ko: '교통사고가 발생했습니다.', pron: 'gyo-tong-sa-go-ga bal-saeng-hae-sseum-ni-da' },
  { id: 'theft', label: { ko: '도난/분실', zh: '盗窃/遗失', en: 'Theft/Lost' }, icon: SearchIcon,
    ko: '도난/분실 사건이 발생했습니다.', pron: 'do-nan/bun-sil sa-geon-i bal-saeng-hae-sseum-ni-da' },
  { id: 'assault', label: { ko: '폭행', zh: '暴力', en: 'Assault' }, icon: AlertTriangle,
    ko: '폭행을 당했습니다.', pron: 'pok-haeng-eul dang-hae-sseum-ni-da' },
  { id: 'fire', label: { ko: '화재', zh: '火灾', en: 'Fire' }, icon: Flame,
    ko: '화재가 발생했습니다.', pron: 'hwa-jae-ga bal-saeng-hae-sseum-ni-da' },
  { id: 'medical', label: { ko: '의료 응급', zh: '医疗急救', en: 'Medical Emergency' }, icon: Stethoscope,
    ko: '의료 응급 상황입니다.', pron: 'ui-ryo eung-geup sang-hwang-im-ni-da' },
  { id: 'lost', label: { ko: '길을 잃음', zh: '迷路', en: 'Lost' }, icon: Navigation,
    ko: '길을 잃었습니다.', pron: 'gil-eul il-eo-sseum-ni-da' },
]

export default function SOSLanguageCard({ lang }) {
  const [section, setSection] = useState('main') // main | symptoms | phrases | situations
  const [copied, setCopied] = useState(null)

  const speakKorean = (text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'ko-KR'
      u.rate = 0.8
      speechSynthesis.speak(u)
    }
  }

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  // 메인 메뉴
  if (section === 'main') {
    return (
      <div className="px-4 pt-3 pb-24 animate-fade-up">
        <h2 className="text-xl font-black text-red-600 mb-4 flex items-center gap-2">
          🗣️ {L(lang, { ko: '긴급 한국어 카드', zh: '紧急韩语卡', en: 'Emergency Korean Card' })}
        </h2>
        <p className="text-sm text-gray-500 mb-6">{L(lang, { ko: '한국인에게 화면을 보여주세요', zh: '请给韩国人看屏幕', en: 'Show the screen to a Korean person' })}</p>

        <div className="space-y-3">
          {/* 긴급 문장 */}
          <button onClick={() => setSection('phrases')} className="w-full bg-red-50 border-2 border-red-200 rounded-2xl p-5 text-left hover:bg-red-100 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <Volume2 size={24} className="text-white" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="font-black text-red-700 text-base">{L(lang, { ko: '긴급 문장', zh: '紧急句子', en: 'Emergency Phrases' })}</p>
                <p className="text-xs text-red-500 mt-0.5">{L(lang, { ko: '"도와주세요" "경찰을 불러주세요" 등 10개 + TTS', zh: '"请帮助我" "请叫警察" 等10句 + TTS', en: '"Help me" "Call the police" etc. 10 phrases + TTS' })}</p>
              </div>
              <ChevronRight size={20} className="text-red-400" />
            </div>
          </button>

          {/* 증상 카드 */}
          <button onClick={() => setSection('symptoms')} className="w-full bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 text-left hover:bg-orange-100 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Stethoscope size={24} className="text-white" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="font-black text-orange-700 text-base">{L(lang, { ko: '증상 표현 카드', zh: '症状表达卡', en: 'Symptom Cards' })}</p>
                <p className="text-xs text-orange-500 mt-0.5">{L(lang, { ko: '24개 증상 — 병원에서 보여주세요', zh: '24种症状 — 在医院出示', en: '24 symptoms — show at hospital' })}</p>
              </div>
              <ChevronRight size={20} className="text-orange-400" />
            </div>
          </button>

          {/* 상황별 표현 */}
          <button onClick={() => setSection('situations')} className="w-full bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 text-left hover:bg-blue-100 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield size={24} className="text-white" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="font-black text-blue-700 text-base">{L(lang, { ko: '상황별 표현', zh: '场景表达', en: 'Situation Phrases' })}</p>
                <p className="text-xs text-blue-500 mt-0.5">{L(lang, { ko: '교통사고, 도난, 화재 등 6가지 상황', zh: '交通事故、盗窃、火灾等6种场景', en: '6 situations: accident, theft, fire, etc.' })}</p>
              </div>
              <ChevronRight size={20} className="text-blue-400" />
            </div>
          </button>
        </div>

        {/* 빠른 전화 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
          <p className="text-xs font-bold text-gray-500 mb-3">{L(lang, { ko: '긴급 전화', zh: '紧急电话', en: 'Emergency Calls' })}</p>
          <div className="grid grid-cols-3 gap-2">
            <a href="tel:112" className="text-center p-3 bg-white rounded-xl border border-gray-200">
              <p className="font-black text-lg text-blue-600">112</p>
              <p className="text-[10px] text-gray-500">{L(lang, { ko: '경찰', zh: '警察', en: 'Police' })}</p>
            </a>
            <a href="tel:119" className="text-center p-3 bg-white rounded-xl border border-gray-200">
              <p className="font-black text-lg text-red-600">119</p>
              <p className="text-[10px] text-gray-500">{L(lang, { ko: '소방/구급', zh: '消防/急救', en: 'Fire/EMT' })}</p>
            </a>
            <a href="tel:1345" className="text-center p-3 bg-white rounded-xl border border-gray-200">
              <p className="font-black text-lg text-green-600">1345</p>
              <p className="text-[10px] text-gray-500">{L(lang, { ko: '외국인안내', zh: '外国人咨询', en: 'Foreigner' })}</p>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // 긴급 문장
  if (section === 'phrases') {
    return (
      <div className="px-4 pt-3 pb-24 animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setSection('main')} className="text-red-600"><ChevronRight size={20} className="rotate-180" /></button>
          <h2 className="text-xl font-black text-red-600">{L(lang, { ko: '긴급 문장', zh: '紧急句子', en: 'Emergency Phrases' })}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">{L(lang, { ko: '🔊 버튼을 누르면 한국어로 읽어줍니다', zh: '🔊 点击按钮用韩语朗读', en: '🔊 Press to hear in Korean' })}</p>
        <div className="space-y-3">
          {emergencyPhrases.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border-2 border-red-100 hover:border-red-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-2xl font-black text-gray-900">{p.ko}</p>
                  <p className="text-lg text-red-600 font-bold mt-1">{p.zh}</p>
                  <p className="text-sm text-gray-500 mt-1">[{p.pron}]</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => speakKorean(p.ko)} className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center">
                    <Volume2 size={20} />
                  </button>
                  <button onClick={() => copyText(p.ko, `phrase-${i}`)} className="w-12 h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center">
                    {copied === `phrase-${i}` ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 증상 카드
  if (section === 'symptoms') {
    return (
      <div className="px-4 pt-3 pb-24 animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setSection('main')} className="text-orange-600"><ChevronRight size={20} className="rotate-180" /></button>
          <h2 className="text-xl font-black text-orange-600">{L(lang, { ko: '증상 표현 카드', zh: '症状表达卡', en: 'Symptom Cards' })}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">{L(lang, { ko: '병원에서 해당 카드를 보여주세요', zh: '在医院出示此卡片', en: 'Show this card at the hospital' })}</p>
        <div className="space-y-3">
          {medicalCards.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-4 border-2 border-orange-100 hover:border-orange-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <s.icon size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-black text-gray-900">{s.ko}</p>
                  <p className="text-base text-orange-600 font-bold">{s.zh}</p>
                  <p className="text-xs text-gray-500 mt-0.5">[{s.pron}]</p>
                </div>
                <button onClick={() => speakKorean(s.ko)} className="w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center">
                  <Volume2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 상황별 표현
  if (section === 'situations') {
    return (
      <div className="px-4 pt-3 pb-24 animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setSection('main')} className="text-blue-600"><ChevronRight size={20} className="rotate-180" /></button>
          <h2 className="text-xl font-black text-blue-600">{L(lang, { ko: '상황별 표현', zh: '场景表达', en: 'Situation Phrases' })}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">{L(lang, { ko: '상황을 선택하고 한국인에게 보여주세요', zh: '选择情况并出示给韩国人', en: 'Select a situation and show to a Korean person' })}</p>
        <div className="space-y-3">
          {situations.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-5 border-2 border-blue-100 hover:border-blue-300 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <s.icon size={20} className="text-blue-600" />
                </div>
                <p className="font-black text-blue-700 text-base">{L(lang, s.label)}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xl font-black text-gray-900 mb-1">{s.ko}</p>
                <p className="text-sm text-gray-500">[{s.pron}]</p>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => speakKorean(s.ko)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                  <Volume2 size={16} /> <span className="text-sm font-bold">{L(lang, { ko: '읽어주기', zh: '朗读', en: 'Speak' })}</span>
                </button>
                <button onClick={() => copyText(s.ko, s.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                  {copied === s.id ? <Check size={16} /> : <Copy size={16} />}
                  <span className="text-sm font-bold">{copied === s.id ? L(lang, { ko: '복사됨', zh: '已复制', en: 'Copied' }) : L(lang, { ko: '복사', zh: '复制', en: 'Copy' })}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}
