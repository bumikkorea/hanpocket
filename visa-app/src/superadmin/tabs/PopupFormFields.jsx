/**
 * PopupFormFields — 팝업 등록/편집 공용 폼 필드
 * ManualRegister + NearManage 편집 모달에서 공유
 */
export const CATEGORIES = [
  'popup','fashion','kpop','beauty','food','cafe','bar',
  'nail','medical','shopping','hotel','pharmacy','character','game','exhibition','luxury','other'
]

export const DISTRICTS = [
  'seongsu','hannam','itaewon','myeongdong','cheongdam','hongdae',
  'bukchon','gangnam','yeouido','jamsil','yeonnam','seochon',
  'euljiro','ikseon','haebangchon','mangwon','sinchon','apgujeong','other'
]

export function emptyForm() {
  return {
    name_ko:'', name_zh:'', name_en:'',
    category:'popup', district:'other',
    address_ko:'', address_zh:'',
    lat:'', lng:'',
    start_date:'', end_date:'',
    open_time:'', close_time:'',
    image_url:'', description_zh:'',
    is_temporary:true,
    has_reservation:false, has_alipay:false, has_wechat_pay:false,
    has_union_pay:false, has_visa:false, has_tax_refund:false,
    has_chinese_staff:false, has_chinese_menu:false,
  }
}

export function formToInsert(form) {
  return {
    name_ko:           form.name_ko || null,
    name_zh:           form.name_zh || form.name_ko || '',
    name_en:           form.name_en || null,
    category:          form.category,
    district:          form.district || null,
    address_ko:        form.address_ko || null,
    address_zh:        form.address_zh || null,
    lat:               form.lat  ? parseFloat(form.lat)  : null,
    lng:               form.lng  ? parseFloat(form.lng)  : null,
    start_date:        form.start_date  || null,
    end_date:          form.end_date    || null,
    open_time:         form.open_time   || null,
    close_time:        form.close_time  || null,
    image_url:         form.image_url   || null,
    description_zh:    form.description_zh || null,
    is_temporary:      form.is_temporary,
    has_reservation:   form.has_reservation,
    has_alipay:        form.has_alipay,
    has_wechat_pay:    form.has_wechat_pay,
    has_union_pay:     form.has_union_pay,
    has_visa:          form.has_visa,
    has_tax_refund:    form.has_tax_refund,
    has_chinese_staff: form.has_chinese_staff,
    has_chinese_menu:  form.has_chinese_menu,
  }
}

const inputCls  = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
const selectCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"

function FF({ label, required, children }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function PopupFormFields({ form, onChange }) {
  const set = (k, v) => onChange({ ...form, [k]: v })

  return (
    <div>
      {/* 매장명 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-1">
        <FF label="name_ko" required>
          <input className={inputCls} value={form.name_ko} onChange={e => set('name_ko', e.target.value)} placeholder="한국어 매장명" />
        </FF>
        <FF label="name_zh">
          <input className={inputCls} value={form.name_zh} onChange={e => set('name_zh', e.target.value)} placeholder="中文名称" />
        </FF>
        <FF label="name_en">
          <input className={inputCls} value={form.name_en} onChange={e => set('name_en', e.target.value)} placeholder="English name" />
        </FF>
      </div>

      {/* 분류 */}
      <div className="grid grid-cols-2 gap-2 mb-1">
        <FF label="category" required>
          <select className={selectCls} value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FF>
        <FF label="district">
          <select className={selectCls} value={form.district} onChange={e => set('district', e.target.value)}>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </FF>
      </div>

      {/* 주소 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-1">
        <FF label="address_ko">
          <input className={inputCls} value={form.address_ko} onChange={e => set('address_ko', e.target.value)} placeholder="한국어 주소" />
        </FF>
        <FF label="address_zh">
          <input className={inputCls} value={form.address_zh} onChange={e => set('address_zh', e.target.value)} placeholder="中文地址" />
        </FF>
      </div>

      {/* 좌표 */}
      <div className="grid grid-cols-2 gap-2 mb-1">
        <FF label="lat">
          <input className={inputCls} value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="37.5443" type="number" step="any" />
        </FF>
        <FF label="lng">
          <input className={inputCls} value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="127.0563" type="number" step="any" />
        </FF>
      </div>

      {/* 기간 */}
      <div className="grid grid-cols-2 gap-2 mb-1">
        <FF label="start_date">
          <input className={inputCls} value={form.start_date} onChange={e => set('start_date', e.target.value)} type="date" />
        </FF>
        <FF label="end_date">
          <input className={inputCls} value={form.end_date} onChange={e => set('end_date', e.target.value)} type="date" />
        </FF>
      </div>

      {/* 영업시간 */}
      <div className="grid grid-cols-2 gap-2 mb-1">
        <FF label="open_time">
          <input className={inputCls} value={form.open_time} onChange={e => set('open_time', e.target.value)} type="time" />
        </FF>
        <FF label="close_time">
          <input className={inputCls} value={form.close_time} onChange={e => set('close_time', e.target.value)} type="time" />
        </FF>
      </div>

      {/* 이미지 */}
      <FF label="image_url">
        <input className={inputCls} value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />
      </FF>

      {/* 체크박스 */}
      <div className="mt-1">
        <p className="text-xs font-medium text-gray-500 mb-2">특성</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            ['is_temporary',    '임시 팝업'],
            ['has_reservation', '예약 필요'],
            ['has_alipay',      '알리페이'],
            ['has_wechat_pay',  '위챗페이'],
            ['has_union_pay',   '유니온페이'],
            ['has_visa',        'VISA'],
            ['has_tax_refund',  '세금환급'],
            ['has_chinese_staff','중국어 스태프'],
            ['has_chinese_menu', '중국어 메뉴'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={!!form[key]} onChange={e => set(key, e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
