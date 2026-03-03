import { useState } from 'react'
import { Heart, Shield, AlertTriangle, Truck, Building, Phone, CreditCard, Bookmark } from 'lucide-react'
import KoreanPhraseCard, { useKoreanPocket } from './KoreanPhraseCard'

const L = (lang, text) => text[lang] || text['ko']

export default function EmergencyPocket({ lang }) {
  const [activeTab, setActiveTab] = useState('hospital')
  const { bookmarkedCards, toastMessage, copyToClipboard, speak, toggleBookmark } = useKoreanPocket('emergency_bookmarks')

  const tabs = [
    { id: 'hospital', name: { ko: '병원', zh: '医院', en: 'Hospital' }, icon: Heart },
    { id: 'police', name: { ko: '경찰', zh: '警察', en: 'Police' }, icon: Shield },
    { id: 'lost', name: { ko: '분실', zh: '丢失', en: 'Lost Items' }, icon: AlertTriangle },
    { id: 'fire', name: { ko: '화재', zh: '火灾', en: 'Fire' }, icon: Truck },
    { id: 'disaster', name: { ko: '자연재해', zh: '自然灾害', en: 'Natural Disaster' }, icon: AlertTriangle },
    { id: 'embassy', name: { ko: '대사관', zh: '大使馆', en: 'Embassy' }, icon: Building },
    { id: 'pharmacy', name: { ko: '약국', zh: '药局', en: 'Pharmacy' }, icon: Heart },
    { id: 'insurance', name: { ko: '보험', zh: '保险', en: 'Insurance' }, icon: CreditCard },
    { id: 'numbers', name: { ko: '긴급번호', zh: '紧急号码', en: 'Emergency Numbers' }, icon: Phone },
    { id: 'saved', name: { ko: '저장한 표현', zh: '收藏表达', en: 'Saved' }, icon: Bookmark }
  ]

  const cardData = {
    hospital: [
      {
        id: 'emergency',
        ko: '응급실 어디예요?',
        pronunciation: 'eung-geup-sil eo-di-ye-yo',
        zh: '急诊室在哪里？',
        example_ko: '빨리 응급실로 가야 해요',
        example_zh: '需要快速去急诊室',
        example_pronunciation: 'ppalli eunggeupsiullo gaya haeyo'
      },
      {
        id: 'hurt',
        ko: '아파요',
        pronunciation: 'a-pa-yo',
        zh: '疼',
        example_ko: '배가 너무 아파요',
        example_zh: '肚子很疼',
        example_pronunciation: 'baega neomu apayo'
      },
      {
        id: 'medicine',
        ko: '약이 필요해요',
        pronunciation: 'yag-i pi-ryo-hae-yo',
        zh: '需要药',
        example_ko: '열을 내리는 약이 필요해요',
        example_zh: '需要退烧药',
        example_pronunciation: 'yeoreul naerineun yagi piryohaeyo'
      },
      {
        id: 'insurance_card',
        ko: '보험증 있어요',
        pronunciation: 'bo-heom-jeung iss-eo-yo',
        zh: '我有保险证',
        example_ko: '건강보험증 가져왔어요',
        example_zh: '我带了健康保险证',
        example_pronunciation: 'geongangbohoemjeung gajyeowasseyo'
      },
      {
        id: 'foreigner_hospital',
        ko: '외국인 진료 가능한 병원이에요?',
        pronunciation: 'oe-gug-in jin-ryo ga-neung-han byeong-won-i-e-yo',
        zh: '这家医院可以给外国人看病吗？',
        example_ko: '영어로 진료받을 수 있어요?',
        example_zh: '可以用英语看病吗？',
        example_pronunciation: 'yeongeoro jinyeobadeul su isseoyo?'
      }
    ],
    police: [
      {
        id: 'help_me',
        ko: '도와주세요',
        pronunciation: 'do-wa-ju-se-yo',
        zh: '请帮助我',
        example_ko: '누가 좀 도와주세요',
        example_zh: '请有人帮帮我',
        example_pronunciation: 'nuga jom dowajuseyo'
      },
      {
        id: 'police_station',
        ko: '경찰서 어디예요?',
        pronunciation: 'gyeong-chal-seo eo-di-ye-yo',
        zh: '警察局在哪里？',
        example_ko: '가장 가까운 경찰서 어디예요?',
        example_zh: '最近的警察局在哪里？',
        example_pronunciation: 'gajang gakkaun gyeongchalseo eodiyeyo?'
      },
      {
        id: 'report',
        ko: '신고하고 싶어요',
        pronunciation: 'sin-go-ha-go si-peo-yo',
        zh: '我想报案',
        example_ko: '사기를 당해서 신고하고 싶어요',
        example_zh: '我被骗了想报案',
        example_pronunciation: 'sagireul danghaeseo singohago sipeoyo'
      },
      {
        id: 'passport_problem',
        ko: '여권에 문제가 있어요',
        pronunciation: 'yeo-gwon-e mun-je-ga iss-eo-yo',
        zh: '护照有问题',
        example_ko: '여권을 분실했어요',
        example_zh: '我丢了护照',
        example_pronunciation: 'yeogwoneul bunsilhaesseyo'
      }
    ],
    lost: [
      {
        id: 'lost_something',
        ko: 'OO을 잃어버렸어요',
        pronunciation: 'OO-eul il-eo-beo-ryeoss-eo-yo',
        zh: '我丢了OO',
        example_ko: '핸드폰을 잃어버렸어요',
        example_zh: '我丢了手机',
        example_pronunciation: 'haendeu-poneul ireobeolyeosseyo'
      },
      {
        id: 'where_lost_found',
        ko: '분실물센터 어디예요?',
        pronunciation: 'bun-sil-mul-sen-teo eo-di-ye-yo',
        zh: '失物招领处在哪里？',
        example_ko: '지하철 분실물센터 어디예요?',
        example_zh: '地铁失物招领处在哪里？',
        example_pronunciation: 'jihacheol bunsilmul-senteo eodiyeyo?'
      },
      {
        id: 'when_lost',
        ko: '언제 잃어버렸는지 몰라요',
        pronunciation: 'eon-je il-eo-beo-ryeoss-neun-ji mol-ra-yo',
        zh: '不知道什么时候丢的',
        example_ko: '어디서 잃어버렸는지도 몰라요',
        example_zh: '也不知道在哪里丢的',
        example_pronunciation: 'eodiseo ireobeolyeossneunjido mollayo'
      }
    ],
    fire: [
      {
        id: 'fire',
        ko: '불이야!',
        pronunciation: 'bur-i-ya',
        zh: '着火了！',
        example_ko: '여기 불이 났어요!',
        example_zh: '这里着火了！',
        example_pronunciation: 'yeogi buri nasseyo!'
      },
      {
        id: 'fire_extinguisher',
        ko: '소화기 어디 있어요?',
        pronunciation: 'so-hwa-gi eo-di iss-eo-yo',
        zh: '灭火器在哪里？',
        example_ko: '빨리 소화기 가져와요',
        example_zh: '快拿灭火器来',
        example_pronunciation: 'ppalli sohwagi gajyeowayo'
      },
      {
        id: 'evacuate',
        ko: '대피해야 해요',
        pronunciation: 'dae-pi-hae-ya hae-yo',
        zh: '需要避难',
        example_ko: '모두 건물 밖으로 대피해요',
        example_zh: '所有人都要避难到建筑外',
        example_pronunciation: 'modu geonmul bakkeuro daepihaeyo'
      }
    ],
    disaster: [
      {
        id: 'earthquake',
        ko: '지진이에요',
        pronunciation: 'ji-jin-i-e-yo',
        zh: '地震了',
        example_ko: '지금 지진이 일어나고 있어요',
        example_zh: '现在正在发生地震',
        example_pronunciation: 'jigeum jijini ireonago isseoyo'
      },
      {
        id: 'flood',
        ko: '홍수예요',
        pronunciation: 'hong-su-ye-yo',
        zh: '洪水',
        example_ko: '물이 많이 불어났어요',
        example_zh: '水涨得很高',
        example_pronunciation: 'muri mani bureonnasseyo'
      },
      {
        id: 'safe_place',
        ko: '안전한 곳 어디예요?',
        pronunciation: 'an-jeon-han got eo-di-ye-yo',
        zh: '安全的地方在哪里？',
        example_ko: '대피소 어디예요?',
        example_zh: '避难所在哪里？',
        example_pronunciation: 'daepiso eodiyeyo?'
      }
    ],
    embassy: [
      {
        id: 'chinese_embassy',
        ko: '중국 대사관 어디예요?',
        pronunciation: 'jung-guk dae-sa-gwan eo-di-ye-yo',
        zh: '中国大使馆在哪里？',
        example_ko: '중국 대사관에 가야 해요',
        example_zh: '我需要去中国大使馆',
        example_pronunciation: 'jungguk daesagwane gaya haeyo'
      },
      {
        id: 'passport_reissue',
        ko: '여권 재발급 받고 싶어요',
        pronunciation: 'yeo-gwon jae-bal-geup bad-go si-peo-yo',
        zh: '我想重新办理护照',
        example_ko: '여권을 잃어버려서 재발급 받아야 해요',
        example_zh: '我丢了护照需要重新办理',
        example_pronunciation: 'yeogwoneul ireobeolyeoseo jaebalgeup badaya haeyo'
      },
      {
        id: 'consulate_help',
        ko: '영사 업무 도움이 필요해요',
        pronunciation: 'yeong-sa eop-mu do-um-i pi-ryo-hae-yo',
        zh: '我需要领事业务帮助',
        example_ko: '법적 문제로 도움이 필요해요',
        example_zh: '我需要法律问题的帮助',
        example_pronunciation: 'beopjeok munjero doumi piryohaeyo'
      }
    ],
    pharmacy: [
      {
        id: 'pharmacy_location',
        ko: '약국 어디 있어요?',
        pronunciation: 'yag-guk eo-di iss-eo-yo',
        zh: '药店在哪里？',
        example_ko: '24시간 약국 있어요?',
        example_zh: '有24小时药店吗？',
        example_pronunciation: '24sigan yakguk isseoyo?'
      },
      {
        id: 'fever_medicine',
        ko: '해열제 주세요',
        pronunciation: 'hae-yeol-je ju-se-yo',
        zh: '请给我退烧药',
        example_ko: '열이 나서 해열제가 필요해요',
        example_zh: '我发烧了需要退烧药',
        example_pronunciation: 'yeori naseo haeyeolje-ga piryohaeyo'
      },
      {
        id: 'stomach_medicine',
        ko: '배가 아파요. 소화제 있어요?',
        pronunciation: 'bae-ga a-pa-yo. so-hwa-je iss-eo-yo',
        zh: '肚子疼。有消化药吗？',
        example_ko: '체했을 때 먹는 약 있어요?',
        example_zh: '有消化不良时吃的药吗？',
        example_pronunciation: 'chehaesseul ttae meogneun yak isseoyo?'
      },
      {
        id: 'painkiller',
        ko: '진통제 주세요',
        pronunciation: 'jin-tong-je ju-se-yo',
        zh: '请给我止痛药',
        example_ko: '두통이 심해서 진통제가 필요해요',
        example_zh: '头痛很严重需要止痛药',
        example_pronunciation: 'dutong-i simhaeseo jintongjega piryohaeyo'
      }
    ],
    insurance: [
      {
        id: 'have_insurance',
        ko: '보험 들어있어요',
        pronunciation: 'bo-heom deul-eo-iss-eo-yo',
        zh: '我有保险',
        example_ko: '여행자 보험 들어있어요',
        example_zh: '我有旅行保险',
        example_pronunciation: 'yeohaengja boheom deureoisseoyo'
      },
      {
        id: 'insurance_claim',
        ko: '보험 청구하고 싶어요',
        pronunciation: 'bo-heom cheong-gu-ha-go si-peo-yo',
        zh: '我想申请保险理赔',
        example_ko: '의료비 보험 청구 어떻게 해요?',
        example_zh: '医疗费用保险理赔怎么办？',
        example_pronunciation: 'uiryobi boheom cheonggu eotteoke haeyo?'
      },
      {
        id: 'receipt_need',
        ko: '영수증이 필요해요',
        pronunciation: 'yeong-su-jeung-i pi-ryo-hae-yo',
        zh: '我需要收据',
        example_ko: '보험 청구용 영수증 주세요',
        example_zh: '请给我用于保险理赔的收据',
        example_pronunciation: 'boheom cheongguyong yeongsujeung juseyo'
      }
    ],
    numbers: [
      {
        id: 'police_112',
        ko: '112 (경찰)',
        pronunciation: 'baek-sib-i gyeong-chal',
        zh: '112 (警察)',
        example_ko: '위험할 때 112로 전화하세요',
        example_zh: '危险时请拨打112',
        example_pronunciation: 'wiheomhal ttae 112ro jeonhwahaseyo',
        phoneNumber: '112'
      },
      {
        id: 'fire_119',
        ko: '119 (소방/응급)',
        pronunciation: 'baek-sib-gu so-bang-eung-geup',
        zh: '119 (消防/急救)',
        example_ko: '화재나 응급상황에 119로 전화하세요',
        example_zh: '火灾或紧急情况请拨打119',
        example_pronunciation: 'hwae-na eunggeup-sanghwang-e 119ro jeonhwahaseyo',
        phoneNumber: '119'
      },
      {
        id: 'foreigner_1345',
        ko: '1345 (외국인 종합안내)',
        pronunciation: 'cheon-sam-baek-sa-sib-o oe-gug-in jong-hap-an-nae',
        zh: '1345 (外国人综合咨询)',
        example_ko: '외국인 도움이 필요하면 1345로 전화하세요',
        example_zh: '外国人需要帮助请拨打1345',
        example_pronunciation: 'oegugin doumi piryohamyeon 1345ro jeonhwahaseyo',
        phoneNumber: '1345'
      },
      {
        id: 'chinese_embassy_phone',
        ko: '02-738-1038 (중국대사관)',
        pronunciation: 'gong-i-chil-sam-pal-il-gong-sam-pal jung-guk-dae-sa-gwan',
        zh: '02-738-1038 (中国大使馆)',
        example_ko: '중국 대사관 영사업무는 02-738-1038로 연락하세요',
        example_zh: '中国大使馆领事业务请联系02-738-1038',
        example_pronunciation: 'jungguk daesagwan yeongsa-eopmueun 02-738-1038ro yeollak-haseyo',
        phoneNumber: '02-738-1038'
      }
    ]
  }

  const currentCards = activeTab === 'saved'
    ? Object.values(cardData).flat().filter(c => bookmarkedCards.includes(c.id))
    : cardData[activeTab] || []

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-4 py-2 rounded-full text-sm">
          {toastMessage}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium shrink-0 transition ${
              activeTab === tab.id ? 'bg-[#111827] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <tab.icon size={14} />
            {L(lang, tab.name)}
            {tab.id === 'saved' && bookmarkedCards.length > 0 && (
              <span className="ml-0.5 text-[10px]">({bookmarkedCards.length})</span>
            )}
          </button>
        ))}
      </div>

      {currentCards.length === 0 && activeTab === 'saved' && (
        <div className="text-center py-12 text-sm text-gray-400">
          {L(lang, { ko: '저장한 표현이 없습니다', zh: '暂无收藏', en: 'No saved phrases' })}
        </div>
      )}

      <div className="space-y-3">
        {currentCards.map(card => (
          <KoreanPhraseCard
            key={card.id}
            korean={card.ko}
            romanization={card.pronunciation}
            chinese={card.zh}
            exampleKo={card.example_ko}
            exampleZh={card.example_zh}
            exampleRoman={card.example_pronunciation}
            illustration="emergency"
            onCopy={() => copyToClipboard(card.ko + '\n' + (card.example_ko || ''), lang)}
            onSpeak={() => speak(card.ko)}
            onBookmark={() => toggleBookmark(card.id)}
            bookmarked={bookmarkedCards.includes(card.id)}
            lang={lang}
          />
        ))}
      </div>
    </div>
  )
}
