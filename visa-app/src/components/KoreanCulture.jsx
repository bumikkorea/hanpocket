import { useState, Suspense, lazy } from 'react'
import { ChevronLeft, MessageSquare, ThumbsUp, Send } from 'lucide-react'
import { CULTURE_DIFFS, CULTURE_CATEGORIES } from '../data/cultureDifferences'

const ShowKorean = lazy(() => import('./ShowKorean'))

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

function CultureCard({ item, lang }) {
  const [liked, setLiked] = useState(false)
  const data = item[lang] || item.zh
  return (
    <div className="bg-white rounded-[16px] p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="flex items-start gap-3">
        <span className="text-[28px] mt-0.5">{item.icon}</span>
        <div className="flex-1">
          <p className="font-bold text-[15px] text-[#1A1A1A] mb-1">#{item.id} {data.title}</p>
          <p className="text-[13px] text-[#555] leading-relaxed">{data.desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[#F0ECE8]">
        <button
          onClick={() => setLiked(!liked)}
          className="flex items-center gap-1 text-xs"
          style={{ color: liked ? '#3182F6' : '#ABABAB' }}
        >
          <ThumbsUp size={14} fill={liked ? '#3182F6' : 'none'} />
          {liked ? (lang === 'ko' ? '공감' : lang === 'zh' ? '共鸣' : 'Relatable') : (lang === 'ko' ? '공감해요' : lang === 'zh' ? '有共鸣' : 'Relatable')}
        </button>
      </div>
    </div>
  )
}

// 간이 게시판
function CultureBoard({ lang }) {
  const [posts, setPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('culture_posts') || '[]') } catch { return [] }
  })
  const [newPost, setNewPost] = useState('')

  const addPost = () => {
    if (!newPost.trim()) return
    const updated = [{ id: Date.now(), text: newPost.trim(), time: new Date().toLocaleString(), likes: 0 }, ...posts]
    setPosts(updated)
    localStorage.setItem('culture_posts', JSON.stringify(updated))
    setNewPost('')
  }

  return (
    <div>
      <div className="mb-4">
        <p className="typo-whisper mb-1">COMMUNITY</p>
        <p className="typo-title">{L(lang, { ko: '문화 토크', zh: '文化讨论', en: 'Culture Talk' })}</p>
        <p className="typo-caption mt-1">{L(lang, { ko: '한국에서 겪은 문화 차이를 공유해보세요', zh: '分享你在韩国遇到的文化差异', en: 'Share your cultural experiences in Korea' })}</p>
      </div>

      {/* 글쓰기 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addPost()}
          placeholder={lang === 'ko' ? '한국에서 놀란 문화 차이는?' : lang === 'zh' ? '在韩国让你惊讶的文化差异？' : 'What cultural difference surprised you?'}
          className="flex-1 px-4 py-2.5 bg-[#F2F4F6] rounded-xl text-sm text-[#1A1A1A] placeholder-[#999] outline-none"
        />
        <button onClick={addPost} className="px-3 py-2.5 bg-[#3182F6] rounded-xl text-white active:scale-95 transition-transform">
          <Send size={18} />
        </button>
      </div>

      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare size={32} className="text-[#D4D4D4] mx-auto mb-2" />
          <p className="text-sm text-[#ABABAB]">{L(lang, { ko: '첫 번째 글을 남겨보세요!', zh: '写下第一条吧！', en: 'Be the first to post!' })}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-[12px] p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p className="text-sm text-[#333]">{post.text}</p>
              <p className="text-[10px] text-[#ABABAB] mt-2">{post.time}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function KoreanCulture({ lang, onBack }) {
  const [activeCat, setActiveCat] = useState(null)
  const [activeTab, setActiveTab] = useState('list') // list | korean

  const filtered = activeCat ? CULTURE_DIFFS.filter(d => d.cat === activeCat) : CULTURE_DIFFS

  return (
    <div className="px-1 pt-2 pb-4 animate-fade-up">
      {/* 헤더 */}
      <div className="mb-6">
        <p className="typo-whisper mb-1">CULTURE GUIDE</p>
        <p className="typo-hero">{L(lang, { ko: '한국 문화 50', zh: '韩国文化50', en: '50 Korean Culture Tips' })}</p>
        <p className="typo-body mt-2">{L(lang, { ko: '한국 vs 중국, 이런 차이가 있어요', zh: '韩国vs中国，有这些差异', en: 'Korea vs China cultural differences' })}</p>
      </div>

      {/* 탭 스위처: 리스트 / 게시판 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('list')}
          className="flex-1 py-2 rounded-full text-sm font-medium transition-all"
          style={{ backgroundColor: activeTab === 'list' ? '#3182F6' : '#F3F4F6', color: activeTab === 'list' ? '#FFF' : '#666' }}
        >
          {L(lang, { ko: '문화 차이 50', zh: '文化差异50', en: '50 Differences' })}
        </button>
        <button
          onClick={() => setActiveTab('korean')}
          className="flex-1 py-2 rounded-full text-sm font-medium transition-all"
          style={{ backgroundColor: activeTab === 'korean' ? '#3182F6' : '#F3F4F6', color: activeTab === 'korean' ? '#FFF' : '#666' }}
        >
          {L(lang, { ko: '한국어', zh: '韩语', en: 'Korean' })}
        </button>
      </div>

      {activeTab === 'korean' ? (
        <Suspense fallback={<div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-gray-200 rounded-full border-t-[#111827] animate-spin" /></div>}>
          <ShowKorean lang={lang} onBack={() => setActiveTab('list')} embedded />
        </Suspense>
      ) : (
        <>
          {/* 카테고리 필터 */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setActiveCat(null)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
              style={{ backgroundColor: !activeCat ? '#3182F6' : '#F2F4F6', color: !activeCat ? '#FFF' : '#8B95A1' }}
            >
              {L(lang, { ko: '전체', zh: '全部', en: 'All' })} (50)
            </button>
            {CULTURE_CATEGORIES.map(cat => {
              const count = CULTURE_DIFFS.filter(d => d.cat === cat.id).length
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                  style={{ backgroundColor: activeCat === cat.id ? '#3182F6' : '#F2F4F6', color: activeCat === cat.id ? '#FFF' : '#8B95A1' }}
                >
                  {cat.icon} {L(lang, cat.label)} ({count})
                </button>
              )
            })}
          </div>

          {/* 카드 리스트 */}
          <div className="space-y-3">
            {filtered.map(item => <CultureCard key={item.id} item={item} lang={lang} />)}
          </div>
        </>
      )}
    </div>
  )
}
