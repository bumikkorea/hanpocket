import { useState, useEffect, useRef } from 'react'
import { X, MapPin, Clock, Plane, Train, Car, Bus, Bike, Navigation, Trash2, Save } from 'lucide-react'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const CATEGORIES = [
  { id: 'flight', icon: Plane, color: '#3B82F6', label: { ko: '비행기', zh: '飞机', en: 'Flight' } },
  { id: 'transport', icon: Train, color: '#10B981', label: { ko: '이동', zh: '交通', en: 'Transport' } },
  { id: 'accommodation', icon: 'bed', color: '#8B5CF6', label: { ko: '숙소', zh: '住宿', en: 'Accommodation' } },
  { id: 'food', icon: 'utensils', color: '#F59E0B', label: { ko: '식사', zh: '餐饮', en: 'Food' } },
  { id: 'tourism', icon: 'camera', color: '#EF4444', label: { ko: '관광', zh: '观光', en: 'Tourism' } },
  { id: 'shopping', icon: 'shopping-bag', color: '#EC4899', label: { ko: '쇼핑', zh: '购物', en: 'Shopping' } },
  { id: 'free', icon: 'coffee', color: '#6B7280', label: { ko: '자유시간', zh: '自由时间', en: 'Free Time' } }
]

const TRANSPORTS = [
  { id: 'walk', icon: Navigation, label: { ko: '도보', zh: '步行', en: 'Walk' } },
  { id: 'subway', icon: Train, label: { ko: '지하철', zh: '地铁', en: 'Subway' } },
  { id: 'bus', icon: Bus, label: { ko: '버스', zh: '公交', en: 'Bus' } },
  { id: 'taxi', icon: Car, label: { ko: '택시', zh: '出租车', en: 'Taxi' } },
  { id: 'flight', icon: Plane, label: { ko: '비행기', zh: '飞机', en: 'Flight' } },
  { id: 'ktx', icon: Train, label: { ko: 'KTX', zh: 'KTX', en: 'KTX' } },
  { id: 'arex', icon: Train, label: { ko: '공항철도', zh: '机场铁路', en: 'AREX' } },
  { id: 'bike', icon: Bike, label: { ko: '자전거', zh: '自行车', en: 'Bike' } },
  { id: 'cable_car', icon: Navigation, label: { ko: '케이블카', zh: '缆车', en: 'Cable Car' } }
]

const TEMPLATE_SCHEDULES = [
  // Departure day templates
  {
    category: 'departure',
    templates: [
      { title: { ko: '기상 및 준비', zh: '起床准备', en: 'Wake up & Prepare' }, duration: 120, category: 'free' },
      { title: { ko: '공항 이동', zh: '前往机场', en: 'To Airport' }, duration: 120, category: 'transport', transport: 'taxi' },
      { title: { ko: '체크인 및 출국', zh: '办理登机及出境', en: 'Check-in & Departure' }, duration: 120, category: 'flight' },
      { title: { ko: '한국행 항공편', zh: '飞往韩国', en: 'Flight to Korea' }, duration: 150, category: 'flight', transport: 'flight' },
      { title: { ko: '인천공항 도착 입국', zh: '到达仁川机场入境', en: 'Arrive ICN Immigration' }, duration: 90, category: 'transport' },
      { title: { ko: '숙소 이동', zh: '前往酒店', en: 'To Accommodation' }, duration: 90, category: 'transport', transport: 'arex' },
      { title: { ko: '체크인', zh: '办理入住', en: 'Check-in' }, duration: 30, category: 'accommodation' },
      { title: { ko: '저녁식사', zh: '晚餐', en: 'Dinner' }, duration: 120, category: 'food' },
      { title: { ko: '자유시간 및 휴식', zh: '自由时间及休息', en: 'Free Time & Rest' }, duration: 120, category: 'free' }
    ]
  },
  // Travel day templates
  {
    category: 'travel',
    templates: [
      { title: { ko: '기상 및 준비', zh: '起床准备', en: 'Wake up & Prepare' }, duration: 60, category: 'free' },
      { title: { ko: '조식', zh: '早餐', en: 'Breakfast' }, duration: 60, category: 'food' },
      { title: { ko: '관광지 이동', zh: '前往景点', en: 'To Tourist Site' }, duration: 60, category: 'transport', transport: 'subway' },
      { title: { ko: '관광/체험', zh: '观光/体验', en: 'Sightseeing' }, duration: 120, category: 'tourism' },
      { title: { ko: '점심식사', zh: '午餐', en: 'Lunch' }, duration: 90, category: 'food' },
      { title: { ko: '쇼핑/구경', zh: '购物/逛街', en: 'Shopping' }, duration: 120, category: 'shopping' },
      { title: { ko: '카페/휴식', zh: '咖啡/休息', en: 'Cafe Break' }, duration: 60, category: 'free' },
      { title: { ko: '저녁식사', zh: '晚餐', en: 'Dinner' }, duration: 120, category: 'food' },
      { title: { ko: '야경/산책', zh: '夜景/散步', en: 'Night View' }, duration: 90, category: 'tourism' },
      { title: { ko: '숙소 복귀', zh: '返回酒店', en: 'Back to Hotel' }, duration: 60, category: 'transport' }
    ]
  },
  // Return day templates
  {
    category: 'return',
    templates: [
      { title: { ko: '체크아웃 및 짐 정리', zh: '退房及整理行李', en: 'Check-out & Pack' }, duration: 60, category: 'accommodation' },
      { title: { ko: '공항 이동', zh: '前往机场', en: 'To Airport' }, duration: 120, category: 'transport', transport: 'arex' },
      { title: { ko: '면세점 쇼핑', zh: '免税店购物', en: 'Duty-free Shopping' }, duration: 90, category: 'shopping' },
      { title: { ko: '출국 수속', zh: '出境手续', en: 'Departure Procedures' }, duration: 60, category: 'flight' },
      { title: { ko: '중국행 항공편', zh: '飞往中国', en: 'Flight to China' }, duration: 150, category: 'flight', transport: 'flight' },
      { title: { ko: '중국 도착 입국', zh: '到达中国入境', en: 'Arrive China Immigration' }, duration: 60, category: 'transport' },
      { title: { ko: '집으로 이동', zh: '回家', en: 'Go Home' }, duration: 120, category: 'transport', transport: 'taxi' }
    ]
  }
]

export default function ScheduleModal({ lang, schedule, onSave, onDelete, onClose }) {
  const modalRef = useRef(null)
  const [formData, setFormData] = useState({
    title: { ko: '', zh: '', en: '' },
    startTime: '09:00',
    endTime: '10:00',
    category: 'free',
    location: { ko: '', zh: '', en: '' },
    transport: 'walk',
    notes: { ko: '', zh: '', en: '' }
  })
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState('travel')

  useEffect(() => {
    if (schedule) {
      setFormData({
        title: schedule.title || { ko: '', zh: '', en: '' },
        startTime: schedule.startTime || '09:00',
        endTime: schedule.endTime || '10:00',
        category: schedule.category || 'free',
        location: schedule.location || { ko: '', zh: '', en: '' },
        transport: schedule.transport || 'walk',
        notes: schedule.notes || { ko: '', zh: '', en: '' }
      })
    }
  }, [schedule])

  // Close modal on backdrop click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title[lang] && !formData.title.ko && !formData.title.zh && !formData.title.en) {
      alert(L(lang, { ko: '일정 제목을 입력해주세요', zh: '请输入行程标题', en: 'Please enter schedule title' }))
      return
    }

    if (!formData.startTime || !formData.endTime) {
      alert(L(lang, { ko: '시간을 선택해주세요', zh: '请选择时间', en: 'Please select time' }))
      return
    }

    onSave({
      ...schedule,
      ...formData,
      id: schedule?.id
    })
  }

  const handleTemplateSelect = (template) => {
    const startTime = formData.startTime
    const [hours, minutes] = startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + template.duration
    const endHours = Math.floor(endMinutes / 60) % 24
    const endMins = endMinutes % 60

    setFormData(prev => ({
      ...prev,
      title: template.title,
      endTime: `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`,
      category: template.category,
      transport: template.transport || prev.transport
    }))
    setShowTemplates(false)
  }

  const CategoryIcon = ({ category }) => {
    const cat = CATEGORIES.find(c => c.id === category)
    if (!cat) return null
    
    const IconComponent = cat.icon === 'bed' ? 'div' :
                          cat.icon === 'utensils' ? 'div' :
                          cat.icon === 'camera' ? 'div' :
                          cat.icon === 'shopping-bag' ? 'div' :
                          cat.icon === 'coffee' ? 'div' : cat.icon
    
    if (typeof IconComponent === 'string') {
      return <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: cat.color }} />
    }
    
    return <IconComponent size={16} />
  }

  const TransportIcon = ({ transport }) => {
    const trans = TRANSPORTS.find(t => t.id === transport)
    if (!trans) return <Navigation size={16} />
    const IconComponent = trans.icon
    return <IconComponent size={16} />
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
          <h2 className="text-lg font-bold text-[#111827]">
            {schedule ? 
              L(lang, { ko: '일정 수정', zh: '编辑行程', en: 'Edit Schedule' }) :
              L(lang, { ko: '일정 추가', zh: '添加行程', en: 'Add Schedule' })
            }
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <X size={20} className="text-[#6B7280]" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          <div className="p-4 space-y-4">
            {/* Templates */}
            <div className="bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB]">
              <button 
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center justify-between w-full text-sm font-semibold text-[#111827]"
              >
                {L(lang, { ko: '템플릿으로 빠른 추가', zh: '使用模板快速添加', en: 'Quick Add with Templates' })}
                <span className={`transform transition-transform ${showTemplates ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {showTemplates && (
                <div className="mt-3 space-y-2">
                  {/* Template categories */}
                  <div className="flex gap-2">
                    {TEMPLATE_SCHEDULES.map(cat => (
                      <button
                        key={cat.category}
                        onClick={() => setSelectedTemplateCategory(cat.category)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedTemplateCategory === cat.category
                            ? 'bg-[#111827] text-white'
                            : 'bg-white text-[#6B7280] hover:bg-[#F3F4F6]'
                        }`}
                      >
                        {L(lang, {
                          departure: { ko: '출국일', zh: '出发日', en: 'Departure' },
                          travel: { ko: '여행일', zh: '旅行日', en: 'Travel' },
                          return: { ko: '귀국일', zh: '回国日', en: 'Return' }
                        }[cat.category])}
                      </button>
                    ))}
                  </div>

                  {/* Template items */}
                  <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                    {TEMPLATE_SCHEDULES
                      .find(cat => cat.category === selectedTemplateCategory)
                      ?.templates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => handleTemplateSelect(template)}
                        className="flex items-center gap-2 p-2 text-xs text-left hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#E5E7EB]"
                      >
                        <CategoryIcon category={template.category} />
                        <span className="flex-1">{L(lang, template.title)}</span>
                        <span className="text-[#9CA3AF]">{template.duration}분</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  {L(lang, { ko: '일정 제목', zh: '行程标题', en: 'Schedule Title' })} *
                </label>
                <input
                  type="text"
                  value={formData.title[lang] || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    title: { ...prev.title, [lang]: e.target.value }
                  }))}
                  placeholder={L(lang, { ko: '예: 경복궁 관람', zh: '例：参观景福宫', en: 'e.g. Visit Gyeongbokgung' })}
                  className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                  required
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    {L(lang, { ko: '시작 시간', zh: '开始时间', en: 'Start Time' })} *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    {L(lang, { ko: '종료 시간', zh: '结束时间', en: 'End Time' })} *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  {L(lang, { ko: '카테고리', zh: '类别', en: 'Category' })}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        formData.category === cat.id
                          ? 'border-current shadow-sm'
                          : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
                      }`}
                      style={{ 
                        color: formData.category === cat.id ? cat.color : '#6B7280',
                        backgroundColor: formData.category === cat.id ? `${cat.color}10` : 'white'
                      }}
                    >
                      <CategoryIcon category={cat.id} />
                      <span className="text-xs font-medium">{L(lang, cat.label)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  <MapPin size={14} className="inline mr-1" />
                  {L(lang, { ko: '장소', zh: '地点', en: 'Location' })}
                </label>
                <input
                  type="text"
                  value={formData.location[lang] || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, [lang]: e.target.value }
                  }))}
                  placeholder={L(lang, { ko: '예: 종로구 경복궁', zh: '例：钟路区景福宫', en: 'e.g. Gyeongbokgung Palace' })}
                  className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                />
              </div>

              {/* Transport */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  {L(lang, { ko: '이동 수단', zh: '交通方式', en: 'Transportation' })}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TRANSPORTS.map(trans => (
                    <button
                      key={trans.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, transport: trans.id }))}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                        formData.transport === trans.id
                          ? 'border-[#111827] bg-[#111827] text-white shadow-sm'
                          : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
                      }`}
                    >
                      <TransportIcon transport={trans.id} />
                      <span className="text-xs font-medium">{L(lang, trans.label)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  {L(lang, { ko: '메모', zh: '备注', en: 'Notes' })}
                </label>
                <textarea
                  value={formData.notes[lang] || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notes: { ...prev.notes, [lang]: e.target.value }
                  }))}
                  placeholder={L(lang, { ko: '추가 정보나 메모를 입력하세요', zh: '输入额外信息或备注', en: 'Enter additional info or notes' })}
                  className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent resize-none"
                  rows="3"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <div>
            {schedule && onDelete && (
              <button
                onClick={() => {
                  if (confirm(L(lang, { ko: '정말 삭제하시겠습니까?', zh: '确定要删除吗？', en: 'Are you sure to delete?' }))) {
                    onDelete(schedule.id)
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold"
              >
                <Trash2 size={16} />
                {L(lang, { ko: '삭제', zh: '删除', en: 'Delete' })}
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E5E7EB] text-[#6B7280] rounded-lg font-semibold hover:bg-[#F3F4F6] transition-colors"
            >
              {L(lang, { ko: '취소', zh: '取消', en: 'Cancel' })}
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white rounded-lg font-semibold hover:bg-[#1F2937] transition-colors"
            >
              <Save size={16} />
              {L(lang, { ko: '저장', zh: '保存', en: 'Save' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}