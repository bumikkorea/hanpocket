/**
 * PopupManualRegister — 팝업 수동 등록
 * NEAR DB popups 테이블에 직접 INSERT
 */
import { useState } from 'react'
import { PlusCircle, RotateCcw } from 'lucide-react'
import PopupFormFields, { emptyForm, formToInsert } from './PopupFormFields'

export default function PopupManualRegister({ supabaseNear }) {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800) }

  const handleSubmit = async () => {
    if (!form.name_ko && !form.name_zh) { showToast('❌ 매장명(한국어 또는 중국어)을 입력하세요'); return }
    if (!form.category) { showToast('❌ 카테고리를 선택하세요'); return }
    setLoading(true)
    const { error } = await supabaseNear.from('popups').insert(formToInsert(form))
    setLoading(false)
    if (error) { showToast(`❌ 저장 실패: ${error.message}`); return }
    showToast('✅ 등록 완료!')
    setForm(emptyForm())
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">팝업 수동 등록</h2>
          <p className="text-sm text-gray-500 mt-0.5">NEAR DB popups 테이블에 직접 추가</p>
        </div>
        <button
          onClick={() => setForm(emptyForm())}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <RotateCcw size={14} /> 초기화
        </button>
      </div>

      {/* 폼 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <PopupFormFields form={form} onChange={setForm} />
      </div>

      {/* 등록 버튼 */}
      <div className="mt-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-bold"
        >
          <PlusCircle size={16} />
          {loading ? '저장 중...' : 'NEAR DB에 등록'}
        </button>
      </div>

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-full text-sm shadow-xl z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}
