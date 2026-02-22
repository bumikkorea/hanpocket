import { useState } from 'react'
import { Package, TrendingUp, X, ArrowLeftRight } from 'lucide-react'

// ─── Package/Delivery Widget ───

const SEND_COURIERS = [
  { name: 'CU 편의점택배', zh: 'CU便利店快递', en: 'CU Convenience', url: 'https://www.cupost.co.kr/', badge: '' },
  { name: 'GS25 반값택배', zh: 'GS25半价快递', en: 'GS25 Half-price', url: 'https://www.cvsnet.co.kr/', badge: '' },
  { name: '세븐일레븐 택배', zh: '7-11快递', en: '7-Eleven Parcel', url: 'https://www.7-eleven.co.kr/', badge: '' },
  { name: '이마트24 택배', zh: 'emart24快递', en: 'emart24 Parcel', url: 'https://www.emart24.co.kr/', badge: '' },
  { name: '가까운 편의점 찾기', zh: '查找附近便利店', en: 'Find nearby store', url: 'https://map.kakao.com/link/search/편의점택배', badge: '' },
]

const TRACK_COURIERS = [
  { name: '우체국택배', zh: '邮局快递', en: 'Korea Post', url: 'https://service.epost.go.kr/iservice/usr/trace/usrtrc001k01.jsp', badge: 'API' },
  { name: 'CJ대한통운', zh: 'CJ大韩通运', en: 'CJ Logistics', url: 'https://www.cjlogistics.com/ko/tool/parcel/tracking', badge: '' },
  { name: '한진택배', zh: '韩进快递', en: 'Hanjin', url: 'https://www.hanjin.com/kor/CMS/DeliveryMgr/inquiry.do', badge: '' },
  { name: '롯데택배', zh: '乐天快递', en: 'Lotte', url: 'https://www.lotteglogis.com/home/reservation/tracking/index', badge: '' },
  { name: '로젠택배', zh: '路仁快递', en: 'Logen', url: 'https://www.ilogen.com/', badge: '' },
  { name: 'SF Express', zh: '顺丰快递', en: 'SF Express', url: 'https://www.sf-express.com/kr/ko/dynamic_function/waybill', badge: '' },
  { name: '圆通快递', zh: '圆通快递', en: 'YTO Express', url: 'https://www.yto.net.cn/', badge: '' },
  { name: '中通快递', zh: '中通快递', en: 'ZTO Express', url: 'https://www.zto.com/', badge: '' },
  { name: '韵达快递', zh: '韵达快递', en: 'Yunda Express', url: 'https://www.yundaex.com/', badge: '' },
]

export default function ParcelWidget({ lang }) {
  const [popup, setPopup] = useState(null)

  const couriers = popup === 'send' ? SEND_COURIERS : TRACK_COURIERS

  return (
    <div>
      {!popup && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setPopup('send')}
            className="flex flex-col items-center gap-2 p-4 bg-blue-900/20 rounded-lg hover:bg-blue-900/30 transition-all btn-press border border-blue-800/30">
            <Package size={28} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-700">
              {lang === 'ko' ? '택배 보내기' : lang === 'zh' ? '寄快递' : 'Send Package'}
            </span>
          </button>
          <button onClick={() => setPopup('track')}
            className="flex flex-col items-center gap-2 p-4 bg-green-900/20 rounded-lg hover:bg-green-900/30 transition-all btn-press border border-green-800/30">
            <TrendingUp size={28} className="text-green-600" />
            <span className="text-xs font-bold text-green-700">
              {lang === 'ko' ? '택배 조회' : lang === 'zh' ? '查快递' : 'Track Package'}
            </span>
          </button>
        </div>
      )}
      {popup && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#111827]">
              {popup === 'send'
                ? (lang === 'ko' ? '어떤 택배로 보낼래?' : lang === 'zh' ? '选择快递公司寄送' : 'Choose courier to send')
                : (lang === 'ko' ? '어떤 택배를 조회할래?' : lang === 'zh' ? '选择快递公司查询' : 'Choose courier to track')
              }
            </span>
            <button onClick={() => setPopup(null)} className="text-[10px] text-[#6B7280] px-2 py-1 rounded-full bg-[#F3F4F6]">
              <X size={10} />
            </button>
          </div>
          <div className="space-y-1.5">
            {couriers.map((c, i) => (
              <a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F3F4F6] hover:bg-[#F3F4F6] transition-all">
                <span className="text-xs text-[#6B7280]">{lang === 'zh' ? c.zh : lang === 'en' ? (c.en || c.name) : c.name}</span>
                <span className="flex items-center gap-1.5">
                  {c.badge && <span className="text-[10px] text-[#111827] font-bold">{c.badge}</span>}
                  <ArrowLeftRight size={10} className="text-[#111827]" />
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}