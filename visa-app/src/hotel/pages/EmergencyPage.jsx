import { Phone, AlertTriangle, BookOpen } from 'lucide-react'

export default function EmergencyPage({ hotel, language, L }) {
  const emergencyNumbers = [
    {
      emoji: '🚨',
      label: { ko: '경찰', zh: '警察', en: 'Police' },
      number: '112',
      desc: { ko: '범죄 신고', zh: '举报犯罪', en: 'Crime Report' },
    },
    {
      emoji: '🚒',
      label: { ko: '소방', zh: '消防', en: 'Fire' },
      number: '119',
      desc: { ko: '화재·구조', zh: '火灾救援', en: 'Fire & Rescue' },
    },
    {
      emoji: '🏥',
      label: { ko: '관광 지원', zh: '游客援助', en: 'Tourist Info' },
      number: '1330',
      desc: { ko: '관광 관련 문의', zh: '旅游问题咨询', en: 'Tourism Help' },
    },
    {
      emoji: '🏛',
      label: { ko: '중국 대사관', zh: '中国使馆', en: 'Chinese Embassy' },
      number: '02-3455-0100',
      desc: { ko: '영사 관련 지원', zh: '领事协助', en: 'Consular Aid' },
    },
  ]

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Emergency Alert */}
      <div className="bg-red-50 border-l-4 border-red-500 px-4 py-4">
        <div className="flex gap-2">
          <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900">긴급 상황</h3>
            <p className="text-sm text-red-800">즉시 아래 번호로 신고하세요 / 立即拨打以下号码 / Call immediately</p>
          </div>
        </div>
      </div>

      {/* Emergency Buttons */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-3">
          {emergencyNumbers.map((item, idx) => (
            <a
              key={idx}
              href={`tel:${item.number}`}
              className="bg-white rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow active:scale-95"
            >
              {/* Number */}
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">{item.number}</span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{L(language, item.label)}</h3>
                <p className="text-sm text-gray-500">{L(language, item.desc)}</p>
              </div>

              {/* Call Icon */}
              <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg text-red-600">
                <Phone size={20} />
              </div>
            </a>
          ))}
        </div>

        {/* Useful Resources */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen size={18} />
            {L(language, { ko: '유용한 정보', zh: '有用的信息', en: 'Useful Info' })}
          </h3>

          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">
                {L(language, { ko: '약물 알레르기 정보', zh: '药物过敏信息', en: 'Allergy Info' })}
              </h4>
              <p className="text-xs text-gray-600">
                {L(language, {
                  ko: '약국에서 약을 살 때 아래 영어/한국어 카드를 보여주세요',
                  zh: '在药店购药时请出示英文/韩文卡片',
                  en: 'Show this card when buying medicines',
                })}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">
                {L(language, { ko: '병원 찾기', zh: '找医院', en: 'Find Hospital' })}
              </h4>
              <button className="text-sm text-blue-600 hover:underline font-semibold">
                → {L(language, { ko: '외국인 진료 병원 목록', zh: '外国人就诊医院列表', en: 'English-speaking hospitals' })}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
