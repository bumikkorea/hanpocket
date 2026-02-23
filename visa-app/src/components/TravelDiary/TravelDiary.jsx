import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Calendar, MapPin, Share2, Clock, Users, Settings } from 'lucide-react'
import CircularSchedule from './CircularSchedule'
import DailyScheduleList from './DailyScheduleList'
import ScheduleModal from './ScheduleModal'
import TravelShareCard from './TravelShareCard'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const TEMPLATE_TRIPS = [
  {
    id: 'seoul-3days',
    name: { ko: '서울 3일 여행', zh: '首尔3天旅行', en: 'Seoul 3-Day Trip' },
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    days: 3
  },
  {
    id: 'busan-seoul-5days', 
    name: { ko: '부산-서울 5일', zh: '釜山-首尔5天', en: 'Busan-Seoul 5 Days' },
    startDate: '2024-03-20',
    endDate: '2024-03-24',
    days: 5
  },
  {
    id: 'korea-tour-7days',
    name: { ko: '한국 전국일주 7일', zh: '韩国全国环游7天', en: 'Korea Tour 7 Days' },
    startDate: '2024-04-01',
    endDate: '2024-04-07',
    days: 7
  }
]

const SAMPLE_SCHEDULES = {
  'seoul-3days': {
    '2024-03-15': [
      { id: 1, startTime: '06:00', endTime: '08:00', title: { ko: '기상 및 준비', zh: '起床准备', en: 'Wake up & Prepare' }, category: 'free', location: { ko: '집', zh: '家', en: 'Home' }, transport: 'walk' },
      { id: 2, startTime: '08:00', endTime: '10:00', title: { ko: '공항 이동', zh: '前往机场', en: 'To Airport' }, category: 'transport', location: { ko: '공항', zh: '机场', en: 'Airport' }, transport: 'taxi' },
      { id: 3, startTime: '10:00', endTime: '12:00', title: { ko: '체크인 및 출국', zh: '办理登机及出境', en: 'Check-in & Departure' }, category: 'flight', location: { ko: '공항 출국장', zh: '机场出境大厅', en: 'Departure Hall' }, transport: 'walk' },
      { id: 4, startTime: '12:00', endTime: '14:30', title: { ko: '한국행 항공편', zh: '飞往韩国', en: 'Flight to Korea' }, category: 'flight', location: { ko: '기내', zh: '飞机上', en: 'In Flight' }, transport: 'flight' },
      { id: 5, startTime: '14:30', endTime: '16:00', title: { ko: '인천공항 도착 입국', zh: '到达仁川机场入境', en: 'Arrive ICN Immigration' }, category: 'transport', location: { ko: '인천국제공항', zh: '仁川国际机场', en: 'Incheon Intl Airport' }, transport: 'walk' },
      { id: 6, startTime: '16:00', endTime: '17:30', title: { ko: '숙소 이동', zh: '前往酒店', en: 'To Accommodation' }, category: 'transport', location: { ko: '명동', zh: '明洞', en: 'Myeongdong' }, transport: 'arex' },
      { id: 7, startTime: '17:30', endTime: '18:00', title: { ko: '체크인', zh: '办理入住', en: 'Check-in' }, category: 'accommodation', location: { ko: '명동 호텔', zh: '明洞酒店', en: 'Myeongdong Hotel' }, transport: 'walk' },
      { id: 8, startTime: '18:00', endTime: '20:00', title: { ko: '명동 저녁식사', zh: '明洞晚餐', en: 'Dinner in Myeongdong' }, category: 'food', location: { ko: '명동 맛집', zh: '明洞美食', en: 'Myeongdong Restaurant' }, transport: 'walk' },
      { id: 9, startTime: '20:00', endTime: '22:00', title: { ko: 'N서울타워 야경', zh: 'N首尔塔夜景', en: 'N Seoul Tower Night View' }, category: 'tourism', location: { ko: 'N서울타워', zh: 'N首尔塔', en: 'N Seoul Tower' }, transport: 'cable_car' },
      { id: 10, startTime: '22:00', endTime: '24:00', title: { ko: '자유시간 및 휴식', zh: '自由时间及休息', en: 'Free Time & Rest' }, category: 'free', location: { ko: '호텔', zh: '酒店', en: 'Hotel' }, transport: 'walk' }
    ]
  }
}

export default function TravelDiary({ lang, onBack }) {
  const [view, setView] = useState('list') // 'list', 'create', 'diary', 'schedule', 'share'
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [scheduleView, setScheduleView] = useState('circular') // 'circular', 'list'

  // Load trips from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('travel_diary_trips')
      if (saved) {
        setTrips(JSON.parse(saved))
      } else {
        // Initialize with template data
        const initialTrips = TEMPLATE_TRIPS.map(t => ({
          ...t,
          schedules: SAMPLE_SCHEDULES[t.id] || {}
        }))
        setTrips(initialTrips)
        localStorage.setItem('travel_diary_trips', JSON.stringify(initialTrips))
      }
    } catch (error) {
      console.error('Failed to load trips:', error)
      setTrips([])
    }
  }, [])

  const saveTrips = (updatedTrips) => {
    setTrips(updatedTrips)
    localStorage.setItem('travel_diary_trips', JSON.stringify(updatedTrips))
  }

  const createTrip = (tripData) => {
    const newTrip = {
      id: Date.now().toString(),
      ...tripData,
      schedules: {}
    }
    const updatedTrips = [...trips, newTrip]
    saveTrips(updatedTrips)
    setView('list')
  }

  const updateTripSchedule = (tripId, date, schedules) => {
    const updatedTrips = trips.map(trip => {
      if (trip.id === tripId) {
        return {
          ...trip,
          schedules: {
            ...trip.schedules,
            [date]: schedules
          }
        }
      }
      return trip
    })
    saveTrips(updatedTrips)
  }

  const openTrip = (trip) => {
    setSelectedTrip(trip)
    const firstDate = trip.startDate
    setSelectedDate(firstDate)
    setView('diary')
  }

  const openScheduleDetail = (schedule) => {
    setSelectedSchedule(schedule)
    setShowModal(true)
  }

  const saveSchedule = (scheduleData) => {
    if (!selectedTrip || !selectedDate) return

    const currentSchedules = selectedTrip.schedules[selectedDate] || []
    let updatedSchedules

    if (scheduleData.id) {
      // Edit existing
      updatedSchedules = currentSchedules.map(s => 
        s.id === scheduleData.id ? scheduleData : s
      )
    } else {
      // Add new
      const newSchedule = {
        ...scheduleData,
        id: Date.now()
      }
      updatedSchedules = [...currentSchedules, newSchedule].sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      )
    }

    updateTripSchedule(selectedTrip.id, selectedDate, updatedSchedules)
    
    // Update selectedTrip state
    setSelectedTrip(prev => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [selectedDate]: updatedSchedules
      }
    }))

    setShowModal(false)
    setSelectedSchedule(null)
  }

  const deleteSchedule = (scheduleId) => {
    if (!selectedTrip || !selectedDate) return

    const currentSchedules = selectedTrip.schedules[selectedDate] || []
    const updatedSchedules = currentSchedules.filter(s => s.id !== scheduleId)

    updateTripSchedule(selectedTrip.id, selectedDate, updatedSchedules)
    
    setSelectedTrip(prev => ({
      ...prev,
      schedules: {
        ...prev.schedules,
        [selectedDate]: updatedSchedules
      }
    }))

    setShowModal(false)
    setSelectedSchedule(null)
  }

  // Generate date range for selected trip
  const getTripDates = (trip) => {
    if (!trip) return []
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    const dates = []
    
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0])
    }
    return dates
  }

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr)
    const days = ['일', '월', '화', '수', '목', '금', '토']
    const daysCh = ['日', '一', '二', '三', '四', '五', '六']
    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    const dayName = lang === 'ko' ? days[date.getDay()] : 
                    lang === 'zh' ? daysCh[date.getDay()] :
                    daysEn[date.getDay()]
    
    return `${date.getMonth() + 1}/${date.getDate()} (${dayName})`
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 hover:bg-[#F3F4F6] rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-[#6B7280]" />
            </button>
            <h1 className="text-lg font-bold text-[#111827]">
              {L(lang, { ko: '여행 다이어리', zh: '旅行日记', en: 'Travel Diary' })}
            </h1>
          </div>
          
          {view === 'list' && (
            <button 
              onClick={() => setView('create')}
              className="flex items-center gap-2 px-3 py-2 bg-[#111827] text-white rounded-lg text-sm font-semibold hover:bg-[#1F2937] transition-colors"
            >
              <Plus size={16} />
              {L(lang, { ko: '새 여행', zh: '新旅行', en: 'New Trip' })}
            </button>
          )}

          {view === 'diary' && selectedTrip && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setView('share')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Share2 size={16} />
                {L(lang, { ko: '공유', zh: '分享', en: 'Share' })}
              </button>
              <button className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <Settings size={18} className="text-[#6B7280]" />
              </button>
            </div>
          )}
        </div>

        {/* Trip info when in diary view */}
        {view === 'diary' && selectedTrip && (
          <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
            <h2 className="font-semibold text-[#111827] text-base">{L(lang, selectedTrip.name)}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-[#6B7280]">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {selectedTrip.startDate} ~ {selectedTrip.endDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {selectedTrip.days}
                {L(lang, { ko: '일', zh: '天', en: ' days' })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Trip List */}
        {view === 'list' && (
          <div className="space-y-3">
            {trips.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-[#9CA3AF] mb-4" />
                <h3 className="text-lg font-semibold text-[#111827] mb-2">
                  {L(lang, { ko: '첫 여행을 계획해보세요!', zh: '开始计划您的第一次旅行！', en: 'Plan your first trip!' })}
                </h3>
                <p className="text-sm text-[#6B7280] mb-4">
                  {L(lang, { ko: '출국부터 귀국까지 모든 일정을 체계적으로 관리할 수 있습니다.', zh: '可以系统地管理从出境到回国的所有行程。', en: 'Systematically manage all schedules from departure to return.' })}
                </p>
                <button 
                  onClick={() => setView('create')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white rounded-lg font-semibold hover:bg-[#1F2937] transition-colors mx-auto"
                >
                  <Plus size={16} />
                  {L(lang, { ko: '새 여행 만들기', zh: '创建新旅行', en: 'Create New Trip' })}
                </button>
              </div>
            ) : (
              trips.map(trip => (
                <div key={trip.id} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] hover:shadow-md transition-all cursor-pointer" onClick={() => openTrip(trip)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#111827] mb-1">{L(lang, trip.name)}</h3>
                      <div className="flex items-center gap-3 text-sm text-[#6B7280]">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {trip.startDate} ~ {trip.endDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {trip.days}{L(lang, { ko: '일', zh: '天', en: ' days' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className="px-2 py-1 bg-[#F3F4F6] rounded-full text-[#6B7280]">
                          {L(lang, { ko: '일정', zh: '行程', en: 'Schedule' })}: {Object.keys(trip.schedules || {}).length}/{trip.days}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#9CA3AF]">
                      <Users size={16} />
                      <span className="text-xs">1</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Trip */}
        {view === 'create' && <CreateTripForm lang={lang} onSave={createTrip} onCancel={() => setView('list')} />}

        {/* Diary View */}
        {view === 'diary' && selectedTrip && (
          <div className="space-y-4">
            {/* Date selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {getTripDates(selectedTrip).map((date, index) => (
                <button 
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-all ${
                    selectedDate === date 
                      ? 'bg-[#111827] text-white shadow-md' 
                      : 'bg-white text-[#6B7280] hover:bg-[#F3F4F6] border border-[#E5E7EB]'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xs opacity-75">Day {index + 1}</div>
                    <div>{formatDateDisplay(date)}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-[#E5E7EB]">
                <button 
                  onClick={() => setScheduleView('circular')}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    scheduleView === 'circular' 
                      ? 'bg-[#111827] text-white' 
                      : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {L(lang, { ko: '시계형', zh: '时钟型', en: 'Clock' })}
                </button>
                <button 
                  onClick={() => setScheduleView('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    scheduleView === 'list' 
                      ? 'bg-[#111827] text-white' 
                      : 'text-[#6B7280] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {L(lang, { ko: '리스트', zh: '列表', en: 'List' })}
                </button>
              </div>

              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#111827] text-white rounded-lg text-sm font-semibold hover:bg-[#1F2937] transition-colors"
              >
                <Plus size={16} />
                {L(lang, { ko: '일정 추가', zh: '添加行程', en: 'Add Schedule' })}
              </button>
            </div>

            {/* Schedule view */}
            {selectedDate && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
                {scheduleView === 'circular' ? (
                  <CircularSchedule 
                    lang={lang}
                    schedules={selectedTrip.schedules[selectedDate] || []}
                    onScheduleClick={openScheduleDetail}
                  />
                ) : (
                  <DailyScheduleList 
                    lang={lang}
                    schedules={selectedTrip.schedules[selectedDate] || []}
                    onScheduleClick={openScheduleDetail}
                    onScheduleUpdate={(schedules) => updateTripSchedule(selectedTrip.id, selectedDate, schedules)}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Share View */}
        {view === 'share' && selectedTrip && (
          <TravelShareCard 
            lang={lang}
            trip={selectedTrip}
            onBack={() => setView('diary')}
          />
        )}
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <ScheduleModal 
          lang={lang}
          schedule={selectedSchedule}
          onSave={saveSchedule}
          onDelete={selectedSchedule ? deleteSchedule : null}
          onClose={() => {
            setShowModal(false)
            setSelectedSchedule(null)
          }}
        />
      )}
    </div>
  )
}

// Create Trip Form Component
function CreateTripForm({ lang, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: { ko: '', zh: '', en: '' },
    startDate: '',
    endDate: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.ko && !formData.name.zh && !formData.name.en) {
      alert(L(lang, { ko: '여행 이름을 입력해주세요', zh: '请输入旅行名称', en: 'Please enter trip name' }))
      return
    }
    
    if (!formData.startDate || !formData.endDate) {
      alert(L(lang, { ko: '날짜를 선택해주세요', zh: '请选择日期', en: 'Please select dates' }))
      return
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert(L(lang, { ko: '종료일이 시작일보다 빠릅니다', zh: '结束日期早于开始日期', en: 'End date is before start date' }))
      return
    }

    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

    onSave({
      ...formData,
      days
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <h2 className="text-lg font-bold text-[#111827] mb-4">
        {L(lang, { ko: '새 여행 만들기', zh: '创建新旅行', en: 'Create New Trip' })}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#111827] mb-2">
            {L(lang, { ko: '여행 이름', zh: '旅行名称', en: 'Trip Name' })}
          </label>
          <input
            type="text"
            value={formData.name[lang]}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              name: { ...prev.name, [lang]: e.target.value }
            }))}
            placeholder={L(lang, { ko: '예: 서울 3일 여행', zh: '例：首尔3天旅行', en: 'e.g. Seoul 3-Day Trip' })}
            className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">
              {L(lang, { ko: '출발일', zh: '出发日', en: 'Start Date' })}
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">
              {L(lang, { ko: '귀국일', zh: '回国日', en: 'End Date' })}
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full p-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border border-[#E5E7EB] text-[#6B7280] rounded-lg font-semibold hover:bg-[#F3F4F6] transition-colors"
          >
            {L(lang, { ko: '취소', zh: '取消', en: 'Cancel' })}
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-[#111827] text-white rounded-lg font-semibold hover:bg-[#1F2937] transition-colors"
          >
            {L(lang, { ko: '만들기', zh: '创建', en: 'Create' })}
          </button>
        </div>
      </form>
    </div>
  )
}