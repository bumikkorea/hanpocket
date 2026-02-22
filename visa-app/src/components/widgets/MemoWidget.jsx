import { useState } from 'react'
import { Plus, X, Check } from 'lucide-react'

// ─── Memo Card ───

export default function MemoWidget({ lang }) {
  const MAX_MEMOS = 5
  const MAX_CHARS = 30
  const [memos, setMemos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hp_memos')) || [] } catch { return [] }
  })
  const [editing, setEditing] = useState(null) // index being edited
  const [draft, setDraft] = useState('')

  const save = (updated) => {
    setMemos(updated)
    localStorage.setItem('hp_memos', JSON.stringify(updated))
  }

  const addMemo = () => {
    if (memos.length >= MAX_MEMOS) return
    setEditing(memos.length)
    setDraft('')
  }

  const confirmMemo = () => {
    if (!draft.trim()) { setEditing(null); return }
    const updated = [...memos]
    if (editing === memos.length) updated.push(draft.trim().slice(0, MAX_CHARS))
    else updated[editing] = draft.trim().slice(0, MAX_CHARS)
    save(updated)

    setEditing(null)
    setDraft('')
  }

  const deleteMemo = (idx) => {
    save(memos.filter((_, i) => i !== idx))
  }

  return (
    <div className="w-[220px] min-h-[220px] shrink-0 bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-col card-glow" style={{ scrollSnapAlign: 'start' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-[#6B7280] font-medium">{lang === 'ko' ? '오늘의 계획' : lang === 'zh' ? '今日计划' : "Today's Plan"}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] text-[#9CA3AF]">({memos.length}/{MAX_MEMOS})</span>
          {memos.length < MAX_MEMOS && (
            <button onClick={addMemo}
              className="w-5 h-5 rounded-md bg-[#111827]/10 text-[#111827] flex items-center justify-center hover:bg-[#111827]/20 transition-all">
              <Plus size={12} />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {memos.length === 0 && editing === null && (
          <p className="text-[10px] text-[#9CA3AF] text-center mt-4">{lang === 'ko' ? '+ 버튼으로 메모 추가' : lang === 'zh' ? '点击+添加备忘' : 'Tap + to add memo'}</p>
        )}
        {memos.map((memo, i) => (
          <div key={i} className="flex items-center gap-1.5 group">
            {editing === i ? (
              <div className="flex items-center gap-1 flex-1">
                <input type="text" value={draft} onChange={e => setDraft(e.target.value.slice(0, MAX_CHARS))}
                  onKeyDown={e => e.key === 'Enter' && confirmMemo()}
                  autoFocus
                  className="flex-1 text-[10px] text-[#111827] bg-[#F3F4F6] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#111827]/50"
                  placeholder={`${MAX_CHARS}${lang === 'ko' ? '자 이내' : lang === 'zh' ? '字以内' : ' chars'}`}
                />
                <button onClick={confirmMemo} className="text-[#111827]"><Check size={12} /></button>
              </div>
            ) : (
              <>
                <span className="text-[10px] text-[#111827] font-mono w-3 shrink-0">{i + 1}</span>
                <span className="text-[10px] text-[#111827] flex-1 truncate cursor-pointer"
                  onClick={() => { setEditing(i); setDraft(memo) }}>{memo}</span>
                <button onClick={() => deleteMemo(i)}
                  className="opacity-0 group-hover:opacity-100 text-[#9CA3AF] hover:text-red-400 transition-all">
                  <X size={10} />
                </button>
              </>
            )}
          </div>
        ))}
        {editing === memos.length && (
          <div className="flex items-center gap-1">
            <input type="text" value={draft} onChange={e => setDraft(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={e => e.key === 'Enter' && confirmMemo()}
              autoFocus
              className="flex-1 text-[10px] text-[#111827] bg-[#F3F4F6] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#111827]/50"
              placeholder={`${MAX_CHARS}${lang === 'ko' ? '자 이내' : lang === 'zh' ? '字以内' : ' chars'}`}
            />
            <button onClick={confirmMemo} className="text-[#111827]"><Check size={12} /></button>
          </div>
        )}
      </div>
      <p className="text-[7px] text-[#9CA3AF] text-right mt-1">
        {memos.length === MAX_MEMOS
          ? (lang === 'ko' ? '메모 가득 참' : lang === 'zh' ? '备忘已满' : 'Memos full')
          : `${MAX_MEMOS - memos.length}${lang === 'ko' ? '개 추가 가능' : lang === 'zh' ? '个可添加' : ' slots left'}`
        }
      </p>
    </div>
  )
}