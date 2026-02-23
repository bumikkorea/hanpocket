import { Flame, ChevronRight } from 'lucide-react'
import { L } from '../utils/helpers'

// TODO: 新红(xh.newrank.cn) API 연동 → Cloudflare Workers로 주간 자동 크롤링
const EDITOR_PICKS = [
  { id: 1, title: { ko: '성수동 카페거리', zh: '圣水洞咖啡街', en: 'Seongsu Cafe Street' }, tag: { ko: '핫플', zh: '热门', en: 'Hot' }, desc: { ko: '요즘 가장 핫한 서울 카페 거리', zh: '最近首尔最火的咖啡街', en: 'Seoul\'s hottest cafe street right now' }, link: 'https://map.naver.com/p/search/성수동카페' },
  { id: 2, title: { ko: '광장시장 먹방', zh: '广藏市场美食', en: 'Gwangjang Market Food' }, tag: { ko: '맛집', zh: '美食', en: 'Food' }, desc: { ko: '외국인 필수코스 전통시장', zh: '外国人必去传统市场', en: 'Must-visit traditional market' }, link: 'https://map.naver.com/p/search/광장시장' },
  { id: 3, title: { ko: '올리브영 2월 세일', zh: 'Olive Young 2月大促', en: 'Olive Young Feb Sale' }, tag: { ko: '뷰티', zh: '美妆', en: 'Beauty' }, desc: { ko: '최대 50% 할인 진행 중', zh: '最高5折优惠进行中', en: 'Up to 50% off now' }, link: 'https://www.oliveyoung.co.kr' },
  { id: 4, title: { ko: '한강 겨울 피크닉', zh: '汉江冬季野餐', en: 'Han River Winter Picnic' }, tag: { ko: '체험', zh: '体验', en: 'Experience' }, desc: { ko: '겨울에도 한강은 핫플', zh: '冬天汉江也是热门地', en: 'Han River stays hot even in winter' }, link: 'https://map.naver.com/p/search/한강공원' },
  { id: 5, title: { ko: '다이소 신상템', zh: 'Daiso新品', en: 'Daiso New Items' }, tag: { ko: '쇼핑', zh: '购物', en: 'Shopping' }, desc: { ko: '1000원으로 득템하는 법', zh: '1000韩元淘好物', en: 'Best finds for 1000 won' }, link: 'https://www.daiso.co.kr' },
]

const TAG_COLORS = {
  '핫플': 'bg-red-50 text-red-600', '热门': 'bg-red-50 text-red-600', 'Hot': 'bg-red-50 text-red-600',
  '맛집': 'bg-orange-50 text-orange-600', '美食': 'bg-orange-50 text-orange-600', 'Food': 'bg-orange-50 text-orange-600',
  '뷰티': 'bg-pink-50 text-pink-600', '美妆': 'bg-pink-50 text-pink-600', 'Beauty': 'bg-pink-50 text-pink-600',
  '체험': 'bg-blue-50 text-blue-600', '体验': 'bg-blue-50 text-blue-600', 'Experience': 'bg-blue-50 text-blue-600',
  '쇼핑': 'bg-purple-50 text-purple-600', '购物': 'bg-purple-50 text-purple-600', 'Shopping': 'bg-purple-50 text-purple-600',
}

export default function EditorPickWidget({ lang }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <Flame size={14} className="text-[#111827]" />
        <span className="text-xs font-bold text-[#111827]">TODAY'S SPOT</span>
      </div>
      <div className="space-y-2.5">
        {EDITOR_PICKS.map((item, i) => {
          const tag = L(lang, item.tag)
          return (
            <a 
              key={item.id} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#F9FAFB] transition-colors group"
            >
              <span className="text-sm font-bold text-[#D1D5DB] mt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${TAG_COLORS[tag] || 'bg-gray-50 text-gray-600'}`}>
                    {tag}
                  </span>
                  <span className="text-xs font-semibold text-[#111827] truncate">{L(lang, item.title)}</span>
                </div>
                <p className="text-[10px] text-[#6B7280] truncate">{L(lang, item.desc)}</p>
              </div>
              <ChevronRight size={14} className="text-[#D1D5DB] mt-1 shrink-0 group-hover:text-[#111827] transition-colors" />
            </a>
          )
        })}
      </div>
    </div>
  )
}