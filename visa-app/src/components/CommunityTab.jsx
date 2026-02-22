import { useState, useEffect } from 'react'
import { Heart, MessageSquare, Plus, ChevronLeft, Send, Image, X, Clock, Tag, User, Briefcase, Home, FileText, ExternalLink, Phone, MapPin, Calendar, Users } from 'lucide-react'
import JobsTab from './JobsTab'
import HousingTab from './HousingTab'
import ResumeTab from './ResumeTab'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const communityCategories = [
  { id: 'free', label: { ko: '자유게시판', zh: '自由版', en: 'Free Board' } },
  { id: 'info', label: { ko: '정보공유', zh: '信息分享', en: 'Info Share' } },
  { id: 'question', label: { ko: '질문', zh: '提问', en: 'Question' } },
  { id: 'food', label: { ko: '맛집추천', zh: '美食推荐', en: 'Food Picks' } },
  { id: 'travel', label: { ko: '여행후기', zh: '旅行后记', en: 'Travel Review' } },
]

const marketCategories = [
  { id: 'furniture', label: { ko: '가구', zh: '家具', en: 'Furniture' } },
  { id: 'electronics', label: { ko: '가전', zh: '家电', en: 'Electronics' } },
  { id: 'clothing', label: { ko: '의류', zh: '服装', en: 'Clothing' } },
  { id: 'daily', label: { ko: '생활용품', zh: '生活用品', en: 'Daily Items' } },
  { id: 'other', label: { ko: '기타', zh: '其他', en: 'Other' } },
]

const samplePosts = [
  { id: '1', type: 'community', category: 'info', title: { ko: '외국인등록증 발급 후기', zh: '外国人登录证办理后记', en: 'ARC Application Review' }, content: { ko: '안산 출입국관리사무소에서 외국인등록증을 발급받았습니다. 약 2주 소요되었고, 필요한 서류는 여권, 사진 1장, 수수료 3만원입니다. 오전 일찍 가면 대기시간이 짧습니다.', zh: '在安山出入境管理事务所办理了外国人登录证。大约花了2周时间，需要护照、1张照片、3万韩元手续费。早上早点去等待时间较短。', en: 'Got my ARC at Ansan Immigration. Took about 2 weeks. Need passport, 1 photo, 30,000 KRW fee. Go early to avoid long waits.' }, author: 'user_A', time: '2026-02-20T10:30:00', likes: 12, comments: [{ author: 'user_B', text: { ko: '감사합니다! 저도 다음 주에 가려고요.', zh: '谢谢！我下周也打算去。', en: 'Thanks! I plan to go next week.' }, time: '2026-02-20T11:00:00' }], quickActions: [{ type: 'map', label: { ko: '안산 출입국 위치', zh: '安山出入境位置', en: 'Ansan Immigration Location' }, url: 'https://map.naver.com/v5/search/안산출입국관리사무소' }, { type: 'website', label: { ko: '온라인 예약', zh: '在线预约', en: 'Online Reservation' }, url: 'https://www.hikorea.go.kr' }] },
  { id: '2', type: 'community', category: 'food', title: { ko: '대림동 중국음식 맛집 추천', zh: '大林洞中国美食推荐', en: 'Chinese Food in Daerim' }, content: { ko: '대림역 근처 "동북인가" 추천합니다. 마라탕, 양꼬치, 훠궈 다 맛있어요. 가격도 합리적이고 중국어 메뉴판도 있습니다.', zh: '推荐大림站附近的"东北人家"。麻辣烫、羊肉串、火锅都很好吃。价格合理，还有중文菜单。', en: 'Recommend "Dongbei Renjia" near Daerim station. Great hotpot, skewers, and malatang. Reasonable prices, Chinese menu available.' }, author: 'user_C', time: '2026-02-19T15:20:00', likes: 28, comments: [{ author: 'user_D', text: { ko: '가봤는데 진짜 맛있어요!', zh: '去过，真的很好吃！', en: 'Went there, really good!' }, time: '2026-02-19T16:00:00' }, { author: 'user_E', text: { ko: '주소 좀 알려주세요', zh: '请告诉我地址', en: 'Can you share the address?' }, time: '2026-02-19T17:30:00' }], quickActions: [{ type: 'map', label: { ko: '길찾기', zh: '导航', en: 'Directions' }, url: 'https://map.naver.com/v5/search/동북인가 대림동' }, { type: 'phone', label: { ko: '전화하기', zh: '拨打电话', en: 'Call' }, url: 'tel:02-2631-8888' }, { type: 'group', label: { ko: '함께 가기 그룹 참여', zh: '加入同行群', en: 'Join Group Visit' }, participants: 3, maxParticipants: 6 }] },
  { id: '3', type: 'community', category: 'question', title: { ko: '건강보험 가입 질문', zh: '健康保险加入咨询', en: 'Health Insurance Question' }, content: { ko: 'D-2 비자인데 건강보험 의무가입인가요? 가입하면 얼마 정도인지, 직장보험이랑 지역보험 차이가 뭔지 궁금합니다.', zh: 'D-2签证需要强制加入健康保险吗？大概多少钱？职场保险和地区保险有什么区别？', en: 'Is health insurance mandatory on D-2 visa? How much is it? What is the difference between workplace and regional insurance?' }, author: 'user_F', time: '2026-02-18T09:00:00', likes: 8, comments: [] },
  { id: '4', type: 'marketplace', category: 'furniture', title: { ko: '이사로 책상+의자 팝니다', zh: '搬家出售桌子+椅子', en: 'Moving sale: desk+chair' }, content: { ko: '서울 관악구. 이케아 말름 책상 + 의자 세트. 1년 사용. 5만원. 직거래만. 상태 좋습니다.', zh: '首尔冠岳区。宜家MALM桌子+椅子套装。使用1年。5万韩元。当面交易。状态好。', en: 'Gwanak-gu Seoul. IKEA MALM desk + chair set. 1 year used. 50,000 KRW. Meet in person. Good condition.' }, author: 'user_G', time: '2026-02-17T14:00:00', likes: 5, comments: [{ author: 'user_H', text: { ko: '아직 있나요?', zh: '还有吗？', en: 'Still available?' }, time: '2026-02-17T15:00:00' }] },
  { id: '5', type: 'marketplace', category: 'electronics', title: { ko: '갤럭시 S24 중고 판매', zh: '三星Galaxy S24二手出售', en: 'Used Galaxy S24 for sale' }, content: { ko: '갤럭시 S24 256GB. 6개월 사용. 케이스+충전기 포함. 55만원. 서울 강남 직거래.', zh: 'Galaxy S24 256GB。使用6个月。含手机壳+充电器。55万韩元。首尔江南面交。', en: 'Galaxy S24 256GB. 6 months used. With case+charger. 550,000 KRW. Gangnam meet.' }, author: 'user_I', time: '2026-02-16T18:00:00', likes: 15, comments: [] },
  { id: '6', type: 'community', category: 'travel', title: { ko: '제주도 3박4일 여행 후기', zh: '济州岛3天4夜旅行后记', en: 'Jeju 3N4D Trip Review' }, content: { ko: '제주도 다녀왔습니다. 렌트카 필수! 성산일출봉, 우도, 한라산 추천. 흑돼지 꼭 드세요. 총 비용 약 50만원(2인).', zh: '去了济州岛。租车必备！推荐城山日出峰、牛岛、汉拿山。一定要吃黑猪肉。总费用约50万韩元(2人)。', en: 'Visited Jeju. Rent a car! Recommend Seongsan, Udo, Hallasan. Must try black pork. Total ~500K KRW for 2.' }, author: 'user_J', time: '2026-02-15T20:00:00', likes: 34, comments: [{ author: 'user_K', text: { ko: '우도 진짜 예뻐요!', zh: '牛岛真的很美！', en: 'Udo is so beautiful!' }, time: '2026-02-15T21:00:00' }] },
  { id: '7', type: 'sharing', category: 'free', title: { ko: '한국어 교재 나눔합니다', zh: '韩语教材免费赠送', en: 'Free Korean textbooks' }, content: { ko: '서강 한국어 1~3급 교재 나눔합니다. 서울 혜화역 근처에서 수령 가능. 선착순!', zh: '西江韩语1~3级教材免费赠送。首尔惠化站附近领取。先到先得！', en: 'Giving away Sogang Korean level 1-3 textbooks. Pick up near Hyehwa station. First come first served!' }, author: 'user_L', time: '2026-02-14T12:00:00', likes: 22, comments: [] },
]

function timeAgo(timeStr, lang) {
  const diff = Date.now() - new Date(timeStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return L(lang, { ko: '방금 전', zh: '刚刚', en: 'Just now' })
  if (h < 24) return `${h}${L(lang, { ko: '시간 전', zh: '小时前', en: 'h ago' })}`
  const d = Math.floor(h / 24)
  return `${d}${L(lang, { ko: '일 전', zh: '天前', en: 'd ago' })}`
}

const STORAGE_KEY = 'hp_community_posts'

function loadPosts() {
  try { const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)); return stored && stored.length ? stored : samplePosts }
  catch { return samplePosts }
}

export default function CommunityTab({ lang, profile }) {
  const [subTab, setSubTab] = useState('community')
  const [communitySection, setCommunitySection] = useState('board') // board | jobs | housing | resume
  const [posts, setPosts] = useState(() => loadPosts())
  const [selectedPost, setSelectedPost] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [filterCat, setFilterCat] = useState(null)
  const [newComment, setNewComment] = useState('')

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formCategory, setFormCategory] = useState('')

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)) }, [posts])

  const filteredPosts = posts.filter(p => {
    if (subTab === 'community') return p.type === 'community' && (!filterCat || p.category === filterCat)
    if (subTab === 'marketplace') return p.type === 'marketplace' && (!filterCat || p.category === filterCat)
    if (subTab === 'sharing') return p.type === 'sharing'
    return true
  })

  const cats = subTab === 'community' ? communityCategories : subTab === 'marketplace' ? marketCategories : []

  const handleLike = (postId) => {
    const liked = JSON.parse(localStorage.getItem('hp_liked') || '[]')
    if (liked.includes(postId)) return
    liked.push(postId)
    localStorage.setItem('hp_liked', JSON.stringify(liked))
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p))
  }

  const isLiked = (postId) => {
    const liked = JSON.parse(localStorage.getItem('hp_liked') || '[]')
    return liked.includes(postId)
  }

  const createPost = () => {
    if (!formTitle.trim() || !formContent.trim()) return
    const newPost = {
      id: Date.now().toString(),
      type: subTab === 'sharing' ? 'sharing' : subTab,
      category: formCategory || (cats[0]?.id || 'free'),
      title: { ko: formTitle, zh: formTitle, en: formTitle },
      content: { ko: formContent, zh: formContent, en: formContent },
      author: 'me',
      time: new Date().toISOString(),
      likes: 0,
      comments: [],
    }
    setPosts(prev => [newPost, ...prev])
    setFormTitle(''); setFormContent(''); setFormCategory(''); setShowCreate(false)
  }

  const addComment = (postId) => {
    if (!newComment.trim()) return
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      return { ...p, comments: [...p.comments, { author: 'me', text: { ko: newComment, zh: newComment, en: newComment }, time: new Date().toISOString() }] }
    }))
    setNewComment('')
    if (selectedPost) setSelectedPost(posts.find(p => p.id === postId))
  }

  // Detail view
  if (selectedPost) {
    const post = posts.find(p => p.id === selectedPost.id) || selectedPost
    return (
      <div className="space-y-4 animate-fade-up">
        <button onClick={() => setSelectedPost(null)} className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827]">
          <ChevronLeft size={16} /> {L(lang, { ko: '목록', zh: '列表', en: 'List' })}
        </button>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
          <h2 className="font-bold text-[#111827] text-lg">{L(lang, post.title)}</h2>
          <div className="flex items-center gap-3 mt-2 text-xs text-[#9CA3AF]">
            <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(post.time, lang)}</span>
          </div>
          <p className="text-sm text-[#374151] mt-4 leading-relaxed whitespace-pre-line">{L(lang, post.content)}</p>
          
          {/* Quick Actions */}
          {post.quickActions && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-[#6B7280] font-semibold">{L(lang, { ko: '빠른 실행', zh: '快速操作', en: 'Quick Actions' })}</p>
              <div className="flex flex-wrap gap-2">
                {post.quickActions.map((action, i) => (
                  <QuickActionButton key={i} action={action} lang={lang} />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#E5E7EB]">
            <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1 text-sm ${isLiked(post.id) ? 'text-red-500' : 'text-[#9CA3AF]'}`}>
              <Heart size={16} fill={isLiked(post.id) ? 'currentColor' : 'none'} /> {post.likes}
            </button>
            <span className="flex items-center gap-1 text-sm text-[#9CA3AF]">
              <MessageSquare size={16} /> {post.comments.length}
            </span>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <h3 className="font-bold text-[#111827] text-sm">{L(lang, { ko: '댓글', zh: '评论', en: 'Comments' })} ({post.comments.length})</h3>
          {post.comments.map((c, i) => (
            <div key={i} className="bg-[#F8F9FA] rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                <User size={12} /> {c.author} <Clock size={10} /> {timeAgo(c.time, lang)}
              </div>
              <p className="text-sm text-[#374151] mt-1">{L(lang, c.text)}</p>
            </div>
          ))}
          <div className="flex gap-2">
            <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
              placeholder={L(lang, { ko: '댓글을 입력하세요...', zh: '输入评论...', en: 'Write a comment...' })}
              className="flex-1 bg-[#F3F4F6] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#111827]/10" />
            <button onClick={() => addComment(post.id)} className="bg-[#111827] text-white p-2.5 rounded-xl">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Create form
  if (showCreate) {
    return (
      <div className="space-y-4 animate-fade-up">
        <button onClick={() => setShowCreate(false)} className="flex items-center gap-1 text-sm text-[#6B7280]">
          <ChevronLeft size={16} /> {L(lang, { ko: '뒤로', zh: '返回', en: 'Back' })}
        </button>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow space-y-4">
          <h2 className="font-bold text-[#111827]">{L(lang, { ko: '글쓰기', zh: '发帖', en: 'Create Post' })}</h2>
          {cats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cats.map(c => (
                <button key={c.id} onClick={() => setFormCategory(c.id)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${formCategory === c.id ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                  {L(lang, c.label)}
                </button>
              ))}
            </div>
          )}
          <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)}
            placeholder={L(lang, { ko: '제목', zh: '标题', en: 'Title' })}
            className="w-full bg-[#F3F4F6] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#111827]/10" />
          <textarea value={formContent} onChange={e => setFormContent(e.target.value)}
            placeholder={L(lang, { ko: '내용을 입력하세요...', zh: '请输入内容...', en: 'Write your post...' })}
            className="w-full bg-[#F3F4F6] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#111827]/10 resize-none h-32" />
          <button onClick={createPost} className="w-full bg-[#111827] text-white font-semibold py-3 rounded-xl text-sm">
            {L(lang, { ko: '게시하기', zh: '发布', en: 'Post' })}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Section navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'board', label: { ko: '게시판', zh: '论坛', en: 'Board' } },
          { id: 'jobs', label: { ko: '구직', zh: '求职', en: 'Jobs' } },
          { id: 'housing', label: { ko: '부동산', zh: '房产', en: 'Housing' } },
          { id: 'resume', label: { ko: '이력서', zh: '简历', en: 'Resume' } },
        ].map(s => (
          <button key={s.id} onClick={() => setCommunitySection(s.id)}
            className={`shrink-0 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${communitySection === s.id ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
            {L(lang, s.label)}
          </button>
        ))}
      </div>

      {communitySection === 'jobs' && <JobsTab lang={lang} profile={profile} />}
      {communitySection === 'housing' && <HousingTab lang={lang} profile={profile} />}
      {communitySection === 'resume' && <ResumeTab lang={lang} profile={profile} />}

      {communitySection === 'board' && <>
      {/* Demo notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
        {lang === 'ko' ? '현재 데모 버전입니다. 게시글은 이 기기에서만 보입니다.' 
        : lang === 'zh' ? '当前为演示版本。帖子仅在此设备上可见。' 
        : 'Demo mode. Posts are only visible on this device.'}
      </div>
      {/* Sub-tabs */}
      <div className="flex gap-2">
        {[
          { id: 'community', label: { ko: '커뮤니티', zh: '社区', en: 'Community' } },
          { id: 'marketplace', label: { ko: '중고거래', zh: '二手交易', en: 'Market' } },
          { id: 'sharing', label: { ko: '나눔', zh: '分享', en: 'Share' } },
        ].map(t => (
          <button key={t.id} onClick={() => { setSubTab(t.id); setFilterCat(null) }}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${subTab === t.id ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
            {L(lang, t.label)}
          </button>
        ))}
      </div>

      {/* Categories */}
      {cats.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilterCat(null)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full ${!filterCat ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
            {L(lang, { ko: '전체', zh: '全部', en: 'All' })}
          </button>
          {cats.map(c => (
            <button key={c.id} onClick={() => setFilterCat(c.id)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full ${filterCat === c.id ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
              {L(lang, c.label)}
            </button>
          ))}
        </div>
      )}

      {/* Create button */}
      <button onClick={() => setShowCreate(true)}
        className="w-full bg-white rounded-2xl p-4 border border-dashed border-[#E5E7EB] flex items-center justify-center gap-2 text-[#6B7280] hover:text-[#111827] hover:border-[#111827]/20 transition-all">
        <Plus size={18} />
        <span className="text-sm font-semibold">{L(lang, { ko: '글쓰기', zh: '发帖', en: 'Create Post' })}</span>
      </button>

      {/* Posts */}
      <div className="space-y-3">
        {filteredPosts.map(post => (
          <button key={post.id} onClick={() => setSelectedPost(post)}
            className="w-full text-left bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow hover:border-[#111827]/10 transition-all">
            <div className="flex items-center gap-2 mb-1">
              {post.category && <span className="text-[10px] px-2 py-0.5 bg-[#F3F4F6] rounded-full text-[#6B7280]">
                {L(lang, [...communityCategories, ...marketCategories].find(c => c.id === post.category)?.label || { ko: post.category })}
              </span>}
              <span className="text-[10px] text-[#9CA3AF]">{timeAgo(post.time, lang)}</span>
            </div>
            <h3 className="font-bold text-[#111827] text-sm">{L(lang, post.title)}</h3>
            <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">{L(lang, post.content)}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-[#9CA3AF]">
              <span className="flex items-center gap-1"><Heart size={12} /> {post.likes}</span>
              <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.comments.length}</span>
              <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
            </div>
          </button>
        ))}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12 text-[#9CA3AF] text-sm">
            {L(lang, { ko: '게시글이 없습니다', zh: '暂无帖子', en: 'No posts yet' })}
          </div>
        )}
      </div>
      </>}
    </div>
  )
}

// Quick Action Button Component
function QuickActionButton({ action, lang }) {
  if (action.type === 'map') {
    return (
      <a href={action.url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
        <MapPin size={12} /> {L(lang, action.label)}
      </a>
    )
  }
  
  if (action.type === 'website') {
    return (
      <a href={action.url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors">
        <ExternalLink size={12} /> {L(lang, action.label)}
      </a>
    )
  }
  
  if (action.type === 'phone') {
    return (
      <a href={action.url}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors">
        <Phone size={12} /> {L(lang, action.label)}
      </a>
    )
  }
  
  if (action.type === 'group') {
    return (
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-100 transition-colors">
        <Users size={12} /> 
        {L(lang, action.label)} ({action.participants}/{action.maxParticipants})
      </button>
    )
  }
  
  return null
}
