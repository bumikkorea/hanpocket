import { useState } from 'react'
import { Home, MapPin, DollarSign, Calendar, Key, AlertTriangle, ExternalLink, Phone, FileText, Info, Star, Building2 } from 'lucide-react'

const T = (lang, obj) => obj[lang] || obj.en || ''

const HOUSING_AREAS = [
  { id: 'all', label: { ko: '전체', zh: '全部', en: 'All' } },
  { id: 'seoul', label: { ko: '서울', zh: '首尔', en: 'Seoul' } },
  { id: 'incheon', label: { ko: '인천', zh: '仁川', en: 'Incheon' } },
  { id: 'gyeonggi', label: { ko: '경기', zh: '京畿', en: 'Gyeonggi' } },
  { id: 'other', label: { ko: '기타', zh: '其他', en: 'Other' } },
]

const ROOMS = [
  { id: 1, type: { ko: '원룸', zh: '单间', en: 'Studio' }, area: 'seoul', areaName: '서울 신림', deposit: 500, rent: 45, size: 19.8, available: '2026-03-01', features: ['가구포함', '역세권'], date: '2026-02-18' },
  { id: 2, type: { ko: '투룸', zh: '两室', en: '2-Room' }, area: 'seoul', areaName: '서울 건대', deposit: 1000, rent: 65, available: '2026-03-15', size: 33, features: ['풀옵션', '주차가능'], date: '2026-02-17' },
  { id: 3, type: { ko: '오피스텔', zh: '公寓', en: 'Officetel' }, area: 'seoul', areaName: '서울 강남', deposit: 2000, rent: 90, size: 26.4, available: '2026-04-01', features: ['신축', '역세권', '보안'], date: '2026-02-17' },
  { id: 4, type: { ko: '원룸', zh: '单间', en: 'Studio' }, area: 'incheon', areaName: '인천 부평', deposit: 300, rent: 35, size: 16.5, available: '2026-03-01', features: ['가구포함', '저렴'], date: '2026-02-16' },
  { id: 5, type: { ko: '투룸', zh: '两室', en: '2-Room' }, area: 'gyeonggi', areaName: '경기 수원', deposit: 500, rent: 50, size: 29.7, available: '2026-03-10', features: ['주차가능', '역세권'], date: '2026-02-16' },
  { id: 6, type: { ko: '원룸', zh: '单间', en: 'Studio' }, area: 'seoul', areaName: '서울 혜화', deposit: 700, rent: 50, size: 21, available: '2026-03-05', features: ['풀옵션', '대학가'], date: '2026-02-15' },
  { id: 7, type: { ko: '오피스텔', zh: '公寓', en: 'Officetel' }, area: 'incheon', areaName: '인천 송도', deposit: 1000, rent: 55, size: 23.1, available: '2026-04-01', features: ['신축', '보안', '역세권'], date: '2026-02-14' },
  { id: 8, type: { ko: '원룸', zh: '单间', en: 'Studio' }, area: 'gyeonggi', areaName: '경기 안산', deposit: 200, rent: 30, size: 16.5, available: '2026-03-01', features: ['가구포함', '저렴'], date: '2026-02-13' },
]

const HOUSING_GUIDE = [
  { icon: Key, title: { ko: '보증금/월세 시스템', zh: '押金/月租制度', en: 'Deposit/Rent System' }, desc: { ko: '보증금(전세/월세)은 계약 종료 시 반환됩니다. 월세는 매월 납부하며, 보증금이 클수록 월세가 낮아집니다.', zh: '押金（全租/月租）在合同结束时退还。月租每月支付，押金越高月租越低。', en: 'Deposit is returned at contract end. Monthly rent is paid each month. Higher deposit means lower monthly rent.' } },
  { icon: FileText, title: { ko: '계약 시 주의사항', zh: '签约注意事项', en: 'Contract Tips' }, desc: { ko: '등기부등본 확인, 집주인 신분 확인, 특약사항 꼼꼼히 확인. 계약서는 반드시 한국어+모국어 함께 준비.', zh: '确认登记簿、房东身份、特约事项。合同务必准备韩语+母语版本。', en: 'Check registry, landlord ID, special terms. Prepare contract in Korean + your language.' } },
  { icon: AlertTriangle, title: { ko: '부동산 사기 방지', zh: '房产诈骗防范', en: 'Scam Prevention' }, desc: { ko: '등기부등본 직접 확인, 계약금은 집주인 명의 계좌로만, 공인중개사 확인. 의심 시 1332 신고.', zh: '亲自确认登记簿，定金只汇入房东账户，确认持证中介。可疑时拨打1332。', en: 'Verify registry yourself, deposit only to landlord account, check licensed agent. Report suspicious cases: 1332.' } },
  { icon: Home, title: { ko: '전입신고 방법', zh: '迁入申报方法', en: 'Resident Registration' }, desc: { ko: '이사 후 14일 이내 주민센터에서 전입신고. 여권, 외국인등록증, 임대차계약서 지참.', zh: '搬家后14天内到居民中心申报。携带护照、外国人登录证、租赁合同。', en: 'Report within 14 days at community center. Bring passport, ARC, lease contract.' } },
]

const AVG_RENT = [
  { area: { ko: '서울 강남', zh: '首尔江南', en: 'Seoul Gangnam' }, deposit: '1000~3000', rent: '60~120' },
  { area: { ko: '서울 신림/관악', zh: '首尔新林/冠岳', en: 'Seoul Sillim/Gwanak' }, deposit: '300~700', rent: '35~55' },
  { area: { ko: '인천 부평', zh: '仁川富平', en: 'Incheon Bupyeong' }, deposit: '200~500', rent: '25~40' },
  { area: { ko: '경기 수원', zh: '京畿水原', en: 'Gyeonggi Suwon' }, deposit: '300~700', rent: '35~50' },
  { area: { ko: '경기 안산', zh: '京畿安山', en: 'Gyeonggi Ansan' }, deposit: '200~500', rent: '25~40' },
]

const UTILITY_COSTS = [
  { item: { ko: '전기', zh: '电费', en: 'Electricity' }, cost: '3~8만원/월' },
  { item: { ko: '가스', zh: '燃气', en: 'Gas' }, cost: '1~5만원/월' },
  { item: { ko: '수도', zh: '水费', en: 'Water' }, cost: '1~2만원/월' },
  { item: { ko: '인터넷', zh: '网络', en: 'Internet' }, cost: '2~3만원/월' },
]

function Badge({ children, className = '' }) {
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${className}`}>{children}</span>
}

function SectionCard({ children, className = '' }) {
  return <div className={`bg-white border border-[#E5E7EB] shadow-sm rounded-2xl p-4 ${className}`}>{children}</div>
}

export default function HousingTab({ lang }) {
  const [housingArea, setHousingArea] = useState('all')
  const filteredRooms = housingArea === 'all' ? ROOMS : ROOMS.filter(r => r.area === housingArea)

  const featureLabel = (f) => {
    const map = {
      '가구포함': { ko: '가구포함', zh: '含家具', en: 'Furnished' },
      '역세권': { ko: '역세권', zh: '近地铁', en: 'Near Station' },
      '풀옵션': { ko: '풀옵션', zh: '全配', en: 'Full Option' },
      '주차가능': { ko: '주차가능', zh: '可停车', en: 'Parking' },
      '신축': { ko: '신축', zh: '新建', en: 'New Build' },
      '보안': { ko: '보안', zh: '安保', en: 'Security' },
      '저렴': { ko: '저렴', zh: '便宜', en: 'Affordable' },
      '대학가': { ko: '대학가', zh: '大学区', en: 'Uni Area' },
    }
    return map[f] ? T(lang, map[f]) : f
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Room Listings */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
          <Building2 size={18} className="text-[#6B7280]" />
          {T(lang, { ko: '방 구하기', zh: '找房', en: 'Room Listings' })}
        </h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {HOUSING_AREAS.map(area => (
            <button key={area.id} onClick={() => setHousingArea(area.id)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition-all ${
                housingArea === area.id ? 'bg-[#D4A574] text-[#1A0A0F] font-semibold' : 'bg-white border border-[#E5E7EB] shadow-sm text-[#6B7280]'
              }`}>
              {T(lang, area.label)}
            </button>
          ))}
        </div>
        {filteredRooms.map(room => (
          <SectionCard key={room.id}>
            <div className="flex items-start justify-between mb-2">
              <Badge className="bg-[#8B1D2E]/50 text-[#111827]">{T(lang, room.type)}</Badge>
              <span className="text-[10px] text-[#6B7280] flex items-center gap-1"><Calendar size={10} />{room.date}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#6B7280] mb-2">
              <MapPin size={12} />{room.areaName}
            </div>
            <div className="mb-2">
              <p className="text-sm font-bold text-[#111827]">
                {T(lang, { ko: '보증금', zh: '押金', en: 'Deposit' })} {room.deposit}{T(lang, { ko: '만', zh: '万', en: '0k' })} / {T(lang, { ko: '월세', zh: '月租', en: 'Rent' })} {room.rent}{T(lang, { ko: '만원', zh: '万韩元', en: '0k KRW' })}
              </p>
              <p className="text-xs text-[#6B7280]">{room.size}m² · {T(lang, { ko: '입주', zh: '入住', en: 'Available' })} {room.available}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {room.features.map(f => (
                <Badge key={f} className="bg-[#D4A574]/10 text-[#6B7280] border border-[#D4A574]/20">{featureLabel(f)}</Badge>
              ))}
            </div>
            <button onClick={() => alert(T(lang, { ko: '연락 기능은 준비 중입니다.', zh: '联系功能正在准备中。', en: 'Contact feature coming soon.' }))}
              className="w-full py-2 text-xs font-semibold rounded-xl bg-[#8B1D2E] text-white hover:bg-[#6B2035] transition-all">
              {T(lang, { ko: '연락하기', zh: '联系', en: 'Contact' })}
            </button>
          </SectionCard>
        ))}
      </div>

      {/* Housing Guide */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
          <FileText size={18} className="text-[#6B7280]" />
          {T(lang, { ko: '집 구하기 가이드', zh: '找房指南', en: 'Housing Guide' })}
        </h2>
        {HOUSING_GUIDE.map((guide, i) => (
          <SectionCard key={i}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#D4A574]/10 rounded-full flex items-center justify-center shrink-0">
                <guide.icon size={16} className="text-[#6B7280]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827] mb-1">{T(lang, guide.title)}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{T(lang, guide.desc)}</p>
              </div>
            </div>
          </SectionCard>
        ))}
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: { ko: '직방', zh: 'Zigbang', en: 'Zigbang' }, url: 'https://www.zigbang.com' },
            { name: { ko: '다방', zh: 'Dabang', en: 'Dabang' }, url: 'https://www.dabangapp.com' },
            { name: { ko: '피터팬', zh: 'PeterPan', en: 'PeterPan' }, url: 'https://www.peterpanz.com' },
          ].map(link => (
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
              <SectionCard className="text-center hover:border-[#D4A574]/50 transition-all py-3">
                <ExternalLink size={14} className="text-[#6B7280] mx-auto mb-1" />
                <p className="text-xs font-bold text-[#6B7280]">{T(lang, link.name)}</p>
              </SectionCard>
            </a>
          ))}
        </div>
      </div>

      {/* Useful Info */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
          <Info size={18} className="text-[#6B7280]" />
          {T(lang, { ko: '유용한 정보', zh: '实用信息', en: 'Useful Info' })}
        </h2>
        <SectionCard>
          <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
            <DollarSign size={14} className="text-[#6B7280]" />
            {T(lang, { ko: '지역별 평균 월세 (원룸)', zh: '各地区平均月租（单间）', en: 'Avg. Rent by Area (Studio)' })}
          </h3>
          <div className="space-y-2">
            {AVG_RENT.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-[#111827]">{T(lang, r.area)}</span>
                <span className="text-[#6B7280]">
                  {T(lang, { ko: '보증금', zh: '押金', en: 'Dep.' })} {r.deposit} / {T(lang, { ko: '월', zh: '月', en: 'Mo.' })} {r.rent}{T(lang, { ko: '만원', zh: '万', en: '0k' })}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard>
          <h3 className="text-sm font-bold text-[#111827] mb-3 flex items-center gap-2">
            <Star size={14} className="text-[#6B7280]" />
            {T(lang, { ko: '월 평균 공과금', zh: '月均公用费用', en: 'Avg. Monthly Utilities' })}
          </h3>
          <div className="space-y-2">
            {UTILITY_COSTS.map((u, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-[#111827]">{T(lang, u.item)}</span>
                <span className="text-[#6B7280]">{u.cost}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard className="border-[#D4A574]/30">
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-[#6B7280]" />
            <div>
              <p className="text-sm font-bold text-[#111827]">{T(lang, { ko: '전세사기 신고', zh: '全租诈骗举报', en: 'Jeonse Fraud Report' })}</p>
              <p className="text-lg font-bold text-[#6B7280]">1332</p>
              <p className="text-[10px] text-[#6B7280]">{T(lang, { ko: '금융감독원 다국어 상담', zh: '金融监督院多语言咨询', en: 'FSS Multilingual Hotline' })}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
