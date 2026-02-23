import { useState, useEffect, useRef } from 'react'
import { Heart, MessageSquare, Plus, ChevronLeft, Send, Image as ImageIcon, X, Clock, Tag, User, Briefcase, Home, FileText, ExternalLink, Phone, MapPin, Calendar, Users, Search, MoreVertical, Trash2, Edit3, DollarSign, Camera, ChevronDown, Filter, TrendingUp, Bookmark, BookmarkCheck, Share2, AlertCircle } from 'lucide-react'
import JobsTab from './JobsTab'
import HousingTab from './HousingTab'
import ResumeTab from './ResumeTab'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.en || d?.zh || d?.ko || '' }

const communityCategories = [
  { id: 'free', label: { ko: '자유', zh: '自由', en: 'Free' }, color: '#6B7280' },
  { id: 'info', label: { ko: '정보', zh: '信息', en: 'Info' }, color: '#2563EB' },
  { id: 'question', label: { ko: '질문', zh: '提问', en: 'Q&A' }, color: '#D97706' },
  { id: 'food', label: { ko: '맛집', zh: '美食', en: 'Food' }, color: '#DC2626' },
  { id: 'travel', label: { ko: '여행', zh: '旅行', en: 'Travel' }, color: '#059669' },
  { id: 'daily', label: { ko: '일상', zh: '日常', en: 'Daily' }, color: '#7C3AED' },
]

const marketCategories = [
  { id: 'furniture', label: { ko: '가구', zh: '家具', en: 'Furniture' } },
  { id: 'electronics', label: { ko: '가전', zh: '家电', en: 'Electronics' } },
  { id: 'clothing', label: { ko: '의류', zh: '服装', en: 'Clothing' } },
  { id: 'daily', label: { ko: '생활용품', zh: '生活用品', en: 'Daily Items' } },
  { id: 'other', label: { ko: '기타', zh: '其他', en: 'Other' } },
]

const locationOptions = [
  { id: 'seoul', label: { ko: '서울', zh: '首尔', en: 'Seoul' } },
  { id: 'gyeonggi', label: { ko: '경기', zh: '京畿', en: 'Gyeonggi' } },
  { id: 'incheon', label: { ko: '인천', zh: '仁川', en: 'Incheon' } },
  { id: 'busan', label: { ko: '부산', zh: '釜山', en: 'Busan' } },
  { id: 'daegu', label: { ko: '대구', zh: '大邱', en: 'Daegu' } },
  { id: 'daejeon', label: { ko: '대전', zh: '大田', en: 'Daejeon' } },
  { id: 'gwangju', label: { ko: '광주', zh: '光州', en: 'Gwangju' } },
  { id: 'jeju', label: { ko: '제주', zh: '济州', en: 'Jeju' } },
  { id: 'other', label: { ko: '기타', zh: '其他', en: 'Other' } },
]

const samplePosts = [
  { id: '1', type: 'community', category: 'info', title: { ko: '외국인등록증 발급 후기', zh: '外国人登录证办理后记', en: 'ARC Application Review' }, content: { ko: '안산 출입국관리사무소에서 외국인등록증을 발급받았습니다. 약 2주 소요되었고, 필요한 서류는 여권, 사진 1장, 수수료 3만원입니다. 오전 일찍 가면 대기시간이 짧습니다.', zh: '在安山出入境管理事务所办理了外国人登录证。大约花了2周时间，需要护照、1张照片、3万韩元手续费。早上早点去等待时间较短。', en: 'Got my ARC at Ansan Immigration. Took about 2 weeks. Need passport, 1 photo, 30,000 KRW fee. Go early to avoid long waits.' }, author: 'Zhang_Wei', authorId: 'u1', location: 'gyeonggi', time: '2026-02-20T10:30:00', likes: 12, bookmarks: 5, images: [], comments: [{ id: 'c1', author: 'Li_Na', authorId: 'u2', text: { ko: '감사합니다! 저도 다음 주에 가려고요.', zh: '谢谢！我下周也打算去。', en: 'Thanks! I plan to go next week.' }, time: '2026-02-20T11:00:00', likes: 3 }] },
  { id: '2', type: 'community', category: 'food', title: { ko: '대림동 중국음식 맛집 추천', zh: '大林洞中国美食推荐', en: 'Chinese Food in Daerim' }, content: { ko: '대림역 근처 "동북인가" 추천합니다. 마라탕, 양꼬치, 훠궈 다 맛있어요. 가격도 합리적이고 중국어 메뉴판도 있습니다.\n\n주소: 서울 영등포구 대림동 1004-15\n영업시간: 11:00~23:00\n추천메뉴: 마라탕(₩12,000), 양꼬치(₩15,000)', zh: '推荐大림站附近的"东北人家"。麻辣烫、羊肉串、火锅都很好吃。价格合理，还有中文菜单。\n\n地址：首尔永登浦区大林洞1004-15\n营业时间：11:00~23:00\n推荐：麻辣烫(₩12,000)、羊肉串(₩15,000)', en: 'Recommend "Dongbei Renjia" near Daerim station. Great hotpot, skewers, and malatang.\n\nAddress: 1004-15 Daerim-dong, Yeongdeungpo\nHours: 11:00~23:00' }, author: 'Wang_Fang', authorId: 'u3', location: 'seoul', time: '2026-02-19T15:20:00', likes: 28, bookmarks: 14, images: [], comments: [{ id: 'c2', author: 'Chen_Yu', authorId: 'u4', text: { ko: '가봤는데 진짜 맛있어요!', zh: '去过，真的很好吃！', en: 'Went there, really good!' }, time: '2026-02-19T16:00:00', likes: 5 }, { id: 'c3', author: 'Park_Min', authorId: 'u5', text: { ko: '주소 감사합니다. 이번 주말에 가볼게요.', zh: '谢谢地址。这周末去试试。', en: 'Thanks for the address. Will visit this weekend.' }, time: '2026-02-19T17:30:00', likes: 2 }] },
  { id: '3', type: 'community', category: 'question', title: { ko: '건강보험 가입 질문', zh: '健康保险加入咨询', en: 'Health Insurance Question' }, content: { ko: 'D-2 비자인데 건강보험 의무가입인가요? 가입하면 얼마 정도인지, 직장보험이랑 지역보험 차이가 뭔지 궁금합니다.\n\n현재 상황:\n- D-2 비자 (대학교 재학)\n- 아르바이트 주 20시간\n- 6개월 이상 체류 예정', zh: 'D-2签证需要强制加入健康保险吗？大概多少钱？职场保险和地区保险有什么区别？\n\n当前情况：\n- D-2签证（大学在读）\n- 兼职每周20小时\n- 预计停留6个月以上', en: 'Is health insurance mandatory on D-2 visa? How much? What is the difference between workplace and regional insurance?' }, author: 'Liu_Chen', authorId: 'u6', location: 'seoul', time: '2026-02-18T09:00:00', likes: 8, bookmarks: 3, images: [], comments: [] },
  { id: '4', type: 'marketplace', category: 'furniture', title: { ko: '이사로 책상+의자 팝니다', zh: '搬家出售桌子+椅子', en: 'Moving sale: desk+chair' }, content: { ko: '서울 관악구. 이케아 말름 책상 + 의자 세트.\n\n상태: 양호 (1년 사용)\n구매가: 15만원 → 판매가: 5만원\n거래방법: 직거래만\n위치: 서울대입구역 도보 5분', zh: '首尔冠岳区。宜家MALM桌子+椅子套装。\n\n状态：良好（使用1年）\n原价：15万→售价：5万韩元\n交易方式：仅当面\n位置：首尔大入口站步行5分', en: 'Gwanak-gu Seoul. IKEA MALM desk + chair set. 1 year used. 50,000 KRW. Meet only.' }, author: 'Zhao_Li', authorId: 'u7', location: 'seoul', price: 50000, time: '2026-02-17T14:00:00', likes: 5, bookmarks: 2, images: [], comments: [{ id: 'c4', author: 'Sun_Qi', authorId: 'u8', text: { ko: '아직 있나요? 내일 가능할까요?', zh: '还有吗？明天可以吗？', en: 'Still available? Can I come tomorrow?' }, time: '2026-02-17T15:00:00', likes: 0 }] },
  { id: '5', type: 'marketplace', category: 'electronics', title: { ko: '갤럭시 S24 중고 판매', zh: '三星Galaxy S24二手出售', en: 'Used Galaxy S24 for sale' }, content: { ko: '갤럭시 S24 256GB 크림 색상.\n\n사용기간: 6개월\n상태: S급 (기스 없음)\n구성: 본체+케이스+충전기+박스\n가격: 55만원 (네고X)\n거래: 강남역 직거래', zh: 'Galaxy S24 256GB 奶油色。\n\n使用时间：6个月\n状态：S级（无划痕）\n配置：主机+手机壳+充电器+包装盒\n价格：55万韩元（不议价）\n交易：江南站当面', en: 'Galaxy S24 256GB Cream. 6 months. S-grade. With case+charger+box. 550K KRW. Gangnam station.' }, author: 'Huang_Wei', authorId: 'u9', location: 'seoul', price: 550000, time: '2026-02-16T18:00:00', likes: 15, bookmarks: 8, images: [], comments: [] },
  { id: '6', type: 'community', category: 'travel', title: { ko: '제주도 3박4일 여행 후기', zh: '济州岛3天4夜旅行后记', en: 'Jeju 3N4D Trip Review' }, content: { ko: '제주도 다녀왔습니다!\n\nDay 1: 성산일출봉 + 우도\nDay 2: 한라산 등반 (영실코스)\nDay 3: 서귀포 + 중문관광단지\nDay 4: 동문시장 + 공항\n\n총 비용: 약 50만원 (2인)\n- 항공: 15만원\n- 숙소: 12만원 (3박)\n- 렌트카: 10만원\n- 식비+입장료: 13만원\n\n팁: 렌트카 필수! 흑돼지 꼭 드세요.', zh: '去了济州岛！\n\nDay 1: 城山日出峰 + 牛岛\nDay 2: 汉拿山登山\nDay 3: 西归浦 + 中文观光园地\nDay 4: 东门市场 + 机场\n\n总费用：约50万韩元(2人)', en: 'Visited Jeju! 3N4D trip. Total ~500K KRW for 2. Rent a car!' }, author: 'Yang_Mei', authorId: 'u10', location: 'jeju', time: '2026-02-15T20:00:00', likes: 34, bookmarks: 21, images: [], comments: [{ id: 'c5', author: 'Wu_Jie', authorId: 'u11', text: { ko: '우도 진짜 예뻐요! 사진 더 있으면 올려주세요', zh: '牛岛真的很美！有更多照片的话请上传', en: 'Udo is so beautiful! Share more photos please' }, time: '2026-02-15T21:00:00', likes: 4 }] },
  { id: '7', type: 'sharing', category: 'free', title: { ko: '한국어 교재 나눔합니다', zh: '韩语教材免费赠送', en: 'Free Korean textbooks' }, content: { ko: '서강 한국어 1~3급 교재 나눔합니다.\n\n교재 목록:\n- 서강 한국어 1A, 1B\n- 서강 한국어 2A, 2B  \n- 서강 한국어 3A\n- 워크북 포함\n\n수령: 서울 혜화역 근처\n조건: 선착순, 직접 수령만\n\n연락 주세요!', zh: '西江韩语1~3级教材免费赠送。\n\n教材列表：\n- 西江韩语 1A, 1B\n- 西江韩语 2A, 2B\n- 西江韩语 3A\n- 含练习册\n\n领取：首尔惠化站附近\n条件：先到先得', en: 'Giving away Sogang Korean level 1-3 textbooks. Pick up near Hyehwa station.' }, author: 'Kim_Su', authorId: 'u12', location: 'seoul', time: '2026-02-14T12:00:00', likes: 22, bookmarks: 9, images: [], comments: [] },
]

function timeAgo(timeStr, lang) {
  const diff = Date.now() - new Date(timeStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return L(lang, { ko: '방금 전', zh: '刚刚', en: 'Just now' })
  if (m < 60) return `${m}${L(lang, { ko: '분 전', zh: '分钟前', en: 'm ago' })}`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}${L(lang, { ko: '시간 전', zh: '小时前', en: 'h ago' })}`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}${L(lang, { ko: '일 전', zh: '天前', en: 'd ago' })}`
  const mo = Math.floor(d / 30)
  return `${mo}${L(lang, { ko: '개월 전', zh: '个月前', en: 'mo ago' })}`
}

function formatPrice(price) {
  if (!price) return ''
  if (price >= 10000) return `${(price / 10000).toFixed(price % 10000 === 0 ? 0 : 1)}만원`
  return `${price.toLocaleString()}원`
}

const STORAGE_KEY = 'hp_community_posts_v2'
const BOOKMARKS_KEY = 'hp_bookmarks'
const LIKED_KEY = 'hp_liked_v2'

function loadPosts() {
  try { const s = JSON.parse(localStorage.getItem(STORAGE_KEY)); return s && s.length ? s : samplePosts }
  catch { return samplePosts }
}

export default function CommunityTab({ lang, profile }) {
  const [communitySection, setCommunitySection] = useState('board')
  const [subTab, setSubTab] = useState('community')
  const [posts, setPosts] = useState(() => loadPosts())
  const [selectedPost, setSelectedPost] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [filterCat, setFilterCat] = useState(null)
  const [filterLocation, setFilterLocation] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [sortBy, setSortBy] = useState('latest') // latest | popular | comments
  const [editingPost, setEditingPost] = useState(null)
  const [showMenu, setShowMenu] = useState(null)
  const [showLocationFilter, setShowLocationFilter] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formImages, setFormImages] = useState([])
  const [formContact, setFormContact] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    try {
      // Strip images before saving to avoid localStorage quota
      const lite = posts.map(p => ({ ...p, images: (p.images || []).length > 0 ? [`img_placeholder_${p.images.length}`] : [] }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lite))
    } catch (e) {
      console.warn('localStorage quota exceeded, clearing old posts')
      try { const keep = posts.slice(0, 20).map(p => ({ ...p, images: [] })); localStorage.setItem(STORAGE_KEY, JSON.stringify(keep)) } catch {}
    }
  }, [posts])

  // Bookmarks
  const getBookmarks = () => { try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]') } catch { return [] } }
  const isBookmarked = (id) => getBookmarks().includes(id)
  const toggleBookmark = (id) => {
    const bm = getBookmarks()
    const next = bm.includes(id) ? bm.filter(x => x !== id) : [...bm, id]
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next))
    setPosts(p => [...p]) // force re-render
  }

  // Likes
  const getLiked = () => { try { return JSON.parse(localStorage.getItem(LIKED_KEY) || '[]') } catch { return [] } }
  const isLiked = (id) => getLiked().includes(id)
  const toggleLike = (id) => {
    const liked = getLiked()
    if (liked.includes(id)) {
      localStorage.setItem(LIKED_KEY, JSON.stringify(liked.filter(x => x !== id)))
      setPosts(p => p.map(x => x.id === id ? { ...x, likes: Math.max(0, x.likes - 1) } : x))
    } else {
      localStorage.setItem(LIKED_KEY, JSON.stringify([...liked, id]))
      setPosts(p => p.map(x => x.id === id ? { ...x, likes: x.likes + 1 } : x))
    }
  }

  // Comment likes
  const toggleCommentLike = (postId, commentId) => {
    const key = `cl_${commentId}`
    const liked = getLiked()
    if (liked.includes(key)) {
      localStorage.setItem(LIKED_KEY, JSON.stringify(liked.filter(x => x !== key)))
      setPosts(p => p.map(x => x.id === postId ? { ...x, comments: x.comments.map(c => c.id === commentId ? { ...c, likes: Math.max(0, c.likes - 1) } : c) } : x))
    } else {
      localStorage.setItem(LIKED_KEY, JSON.stringify([...liked, key]))
      setPosts(p => p.map(x => x.id === postId ? { ...x, comments: x.comments.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c) } : x))
    }
  }

  // Image handling — compress to max 200KB each
  const compressImage = (file, maxW = 800, quality = 0.6) => new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(maxW / img.width, maxW / img.height, 1)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  })

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (formImages.length + files.length > 5) return
    for (const file of files) {
      const compressed = await compressImage(file)
      setFormImages(prev => [...prev, compressed])
    }
  }
  const removeImage = (idx) => setFormImages(prev => prev.filter((_, i) => i !== idx))

  // Filter + sort
  const filteredPosts = posts
    .filter(p => {
      if (subTab === 'community') return p.type === 'community' && p.category !== 'travel'
      if (subTab === 'travelreview') return p.type === 'community' && p.category === 'travel'
      if (subTab === 'marketplace') return p.type === 'marketplace'
      return true
    })
    .filter(p => !filterCat || p.category === filterCat)
    .filter(p => !filterLocation || p.location === filterLocation)
    .filter(p => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return L(lang, p.title).toLowerCase().includes(q) || L(lang, p.content).toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.likes - a.likes
      if (sortBy === 'comments') return b.comments.length - a.comments.length
      return new Date(b.time) - new Date(a.time)
    })

  const travelReviewCategories = [
    { id: 'travel', label: { ko: '여행', zh: '旅行', en: 'Travel' }, color: '#059669' },
    { id: 'food', label: { ko: '맛집', zh: '美食', en: 'Food' }, color: '#DC2626' },
    { id: 'hotel', label: { ko: '숙소', zh: '住宿', en: 'Hotel' }, color: '#2563EB' },
    { id: 'tip', label: { ko: '꿀팁', zh: '攻略', en: 'Tips' }, color: '#D97706' },
  ]
  const cats = subTab === 'community' ? communityCategories.filter(c => c.id !== 'travel') : subTab === 'travelreview' ? travelReviewCategories : subTab === 'marketplace' ? marketCategories : []

  // Create / Edit post
  const submitPost = () => {
    if (!formTitle.trim() || !formContent.trim()) return
    const postData = {
      id: editingPost ? editingPost.id : Date.now().toString(),
      type: subTab === 'travelreview' ? 'community' : subTab,
      category: formCategory || (cats[0]?.id || 'free'),
      title: { ko: formTitle, zh: formTitle, en: formTitle },
      content: { ko: formContent, zh: formContent, en: formContent },
      author: profile?.name || L(lang, { ko: '나', zh: '我', en: 'Me' }),
      authorId: 'me',
      location: formLocation || '',
      price: subTab === 'marketplace' ? parseInt(formPrice) || 0 : undefined,
      contact: formContact || '',
      time: editingPost ? editingPost.time : new Date().toISOString(),
      updatedAt: editingPost ? new Date().toISOString() : undefined,
      likes: editingPost ? editingPost.likes : 0,
      bookmarks: editingPost ? editingPost.bookmarks : 0,
      images: formImages,
      comments: editingPost ? editingPost.comments : [],
    }
    if (editingPost) {
      setPosts(prev => prev.map(p => p.id === editingPost.id ? postData : p))
    } else {
      setPosts(prev => [postData, ...prev])
    }
    resetForm()
  }

  const resetForm = () => {
    setFormTitle(''); setFormContent(''); setFormCategory(''); setFormLocation('')
    setFormPrice(''); setFormImages([]); setFormContact('')
    setShowCreate(false); setEditingPost(null)
  }

  const startEdit = (post) => {
    setEditingPost(post)
    setFormTitle(L(lang, post.title))
    setFormContent(L(lang, post.content))
    setFormCategory(post.category)
    setFormLocation(post.location || '')
    setFormPrice(post.price ? post.price.toString() : '')
    setFormImages(post.images || [])
    setFormContact(post.contact || '')
    setShowCreate(true)
    setShowMenu(null)
  }

  const deletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
    setSelectedPost(null)
    setShowMenu(null)
  }

  const deleteComment = (postId, commentId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments.filter(c => c.id !== commentId) } : p))
  }

  const addComment = (postId) => {
    if (!newComment.trim()) return
    const comment = {
      id: `c_${Date.now()}`,
      author: profile?.name || L(lang, { ko: '나', zh: '我', en: 'Me' }),
      authorId: 'me',
      text: { ko: newComment, zh: newComment, en: newComment },
      time: new Date().toISOString(),
      likes: 0,
    }
    setPosts(prev => {
      const next = prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)
      // Sync selectedPost so detail view updates immediately
      const updated = next.find(p => p.id === postId)
      if (updated) setSelectedPost(updated)
      return next
    })
    setNewComment('')
  }

  const getCatInfo = (catId) => [...communityCategories, ...marketCategories].find(c => c.id === catId)
  const getLocationLabel = (locId) => locationOptions.find(l => l.id === locId)

  // Keep selectedPost in sync with posts state
  const currentPost = selectedPost ? (posts.find(p => p.id === selectedPost.id) || selectedPost) : null

  // ========== Detail View ==========
  if (currentPost) {
    const post = currentPost
    return (
      <div className="space-y-3 animate-fade-up">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedPost(null)} className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
            <ChevronLeft size={16} /> {L(lang, { ko: '목록', zh: '列表', en: 'List' })}
          </button>
          {post.authorId === 'me' && (
            <div className="relative">
              <button onClick={() => setShowMenu(showMenu === post.id ? null : post.id)} className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <MoreVertical size={16} className="text-[#6B7280]" />
              </button>
              {showMenu === post.id && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1 z-50 min-w-[120px]">
                  <button onClick={() => startEdit(post)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#111827] hover:bg-[#F3F4F6]">
                    <Edit3 size={14} /> {L(lang, { ko: '수정', zh: '编辑', en: 'Edit' })}
                  </button>
                  <button onClick={() => deletePost(post.id)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                    <Trash2 size={14} /> {L(lang, { ko: '삭제', zh: '删除', en: 'Delete' })}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            {post.category && (() => {
              const cat = getCatInfo(post.category)
              return cat ? <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${cat.color || '#6B7280'}15`, color: cat.color || '#6B7280' }}>{L(lang, cat.label)}</span> : null
            })()}
            {post.location && (() => {
              const loc = getLocationLabel(post.location)
              return loc ? <span className="text-[10px] px-2 py-0.5 bg-[#F3F4F6] rounded-full text-[#6B7280] flex items-center gap-0.5"><MapPin size={8} />{L(lang, loc.label)}</span> : null
            })()}
          </div>

          <h2 className="font-bold text-[#111827] text-lg leading-tight">{L(lang, post.title)}</h2>

          {/* Price for marketplace */}
          {post.price > 0 && (
            <div className="mt-2 text-xl font-bold text-[#111827]">{formatPrice(post.price)}</div>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-[#9CA3AF]">
            <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(post.time, lang)}</span>
            {post.updatedAt && <span className="text-[10px]">({L(lang, { ko: '수정됨', zh: '已编辑', en: 'edited' })})</span>}
          </div>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {post.images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-48 h-48 object-cover rounded-xl shrink-0 border border-[#E5E7EB]" />
              ))}
            </div>
          )}

          <p className="text-sm text-[#374151] mt-4 leading-relaxed whitespace-pre-line">{L(lang, post.content)}</p>

          {/* Contact info */}
          {post.contact && (
            <div className="mt-4 p-3 bg-[#F8F9FA] rounded-xl flex items-center gap-2">
              <Phone size={14} className="text-[#6B7280]" />
              <span className="text-sm text-[#374151]">{post.contact}</span>
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-[#E5E7EB]">
            <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${isLiked(post.id) ? 'text-red-500 bg-red-50' : 'text-[#6B7280] hover:bg-[#F3F4F6]'}`}>
              <Heart size={16} fill={isLiked(post.id) ? 'currentColor' : 'none'} /> {post.likes}
            </button>
            <span className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#6B7280]">
              <MessageSquare size={16} /> {post.comments.length}
            </span>
            <button onClick={() => toggleBookmark(post.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${isBookmarked(post.id) ? 'text-[#111827] bg-[#F3F4F6]' : 'text-[#6B7280] hover:bg-[#F3F4F6]'}`}>
              {isBookmarked(post.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
            <button onClick={() => { if (navigator.share) navigator.share({ title: L(lang, post.title), text: L(lang, post.content) }) }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#6B7280] hover:bg-[#F3F4F6] transition-colors ml-auto">
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <h3 className="font-bold text-[#111827] text-sm px-1">
            {L(lang, { ko: '댓글', zh: '评论', en: 'Comments' })} ({post.comments.length})
          </h3>
          {post.comments.length === 0 && (
            <div className="text-center py-6 text-[#9CA3AF] text-xs">
              {L(lang, { ko: '첫 번째 댓글을 남겨보세요', zh: '来写第一条评论吧', en: 'Be the first to comment' })}
            </div>
          )}
          {post.comments.map((c) => (
            <div key={c.id} className="bg-white rounded-xl p-3 border border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                  <div className="w-6 h-6 bg-[#F3F4F6] rounded-full flex items-center justify-center"><User size={12} /></div>
                  <span className="font-medium text-[#374151]">{c.author}</span>
                  <span>{timeAgo(c.time, lang)}</span>
                </div>
                {c.authorId === 'me' && (
                  <button onClick={() => deleteComment(post.id, c.id)} className="p-1 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={12} className="text-[#9CA3AF] hover:text-red-500" />
                  </button>
                )}
              </div>
              <p className="text-sm text-[#374151] mt-1.5 ml-8">{L(lang, c.text)}</p>
              <div className="ml-8 mt-1.5">
                <button onClick={() => toggleCommentLike(post.id, c.id)} className={`flex items-center gap-1 text-xs transition-colors ${isLiked(`cl_${c.id}`) ? 'text-red-500' : 'text-[#9CA3AF]'}`}>
                  <Heart size={12} fill={isLiked(`cl_${c.id}`) ? 'currentColor' : 'none'} /> {c.likes > 0 && c.likes}
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-2 sticky bottom-16 bg-[#FAFAF8] pt-2 pb-1">
            <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
              placeholder={L(lang, { ko: '댓글을 입력하세요...', zh: '输入评论...', en: 'Write a comment...' })}
              className="flex-1 bg-white rounded-xl px-4 py-2.5 text-sm outline-none border border-[#E5E7EB] focus:border-[#111827] transition-colors" />
            <button onClick={() => addComment(post.id)} disabled={!newComment.trim()} className="bg-[#111827] text-white p-2.5 rounded-xl disabled:opacity-30 transition-opacity">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ========== Create / Edit Form ==========
  if (showCreate) {
    return (
      <div className="space-y-4 animate-fade-up">
        <button onClick={resetForm} className="flex items-center gap-1 text-sm text-[#6B7280]">
          <ChevronLeft size={16} /> {L(lang, { ko: '뒤로', zh: '返回', en: 'Back' })}
        </button>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] card-glow space-y-4">
          <h2 className="font-bold text-[#111827] text-lg">
            {editingPost ? L(lang, { ko: '글 수정', zh: '编辑帖子', en: 'Edit Post' }) : L(lang, { ko: '글쓰기', zh: '发帖', en: 'New Post' })}
          </h2>

          {/* Category */}
          {cats.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-2 block">{L(lang, { ko: '카테고리', zh: '分类', en: 'Category' })}</label>
              <div className="flex flex-wrap gap-2">
                {cats.map(c => (
                  <button key={c.id} onClick={() => setFormCategory(c.id)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all font-medium ${formCategory === c.id ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'}`}>
                    {L(lang, c.label)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1 block">{L(lang, { ko: '제목', zh: '标题', en: 'Title' })}</label>
            <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} maxLength={100}
              placeholder={L(lang, { ko: '제목을 입력하세요', zh: '请输入标题', en: 'Enter title' })}
              className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm outline-none border border-[#E5E7EB] focus:border-[#111827] transition-colors" />
            <span className="text-[10px] text-[#9CA3AF] mt-1 block text-right">{formTitle.length}/100</span>
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1 block">{L(lang, { ko: '내용', zh: '内容', en: 'Content' })}</label>
            <textarea value={formContent} onChange={e => setFormContent(e.target.value)} maxLength={2000}
              placeholder={L(lang, { ko: '내용을 입력하세요...', zh: '请输入内容...', en: 'Write your post...' })}
              className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm outline-none border border-[#E5E7EB] focus:border-[#111827] transition-colors resize-none h-40" />
            <span className="text-[10px] text-[#9CA3AF] mt-1 block text-right">{formContent.length}/2000</span>
          </div>

          {/* Price (marketplace only) */}
          {subTab === 'marketplace' && (
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">{L(lang, { ko: '가격 (원)', zh: '价格 (韩元)', en: 'Price (KRW)' })}</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-[#F8F9FA] rounded-xl pl-10 pr-4 py-3 text-sm outline-none border border-[#E5E7EB] focus:border-[#111827] transition-colors" />
              </div>
              {formPrice && <span className="text-xs text-[#6B7280] mt-1 block">{formatPrice(parseInt(formPrice))}</span>}
            </div>
          )}

          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-2 block">{L(lang, { ko: '지역', zh: '地区', en: 'Location' })}</label>
            <div className="flex flex-wrap gap-2">
              {locationOptions.map(loc => (
                <button key={loc.id} onClick={() => setFormLocation(formLocation === loc.id ? '' : loc.id)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${formLocation === loc.id ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'}`}>
                  {L(lang, loc.label)}
                </button>
              ))}
            </div>
          </div>

          {/* Contact (marketplace/sharing) */}
          {(subTab === 'marketplace' || subTab === 'sharing') && (
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1 block">{L(lang, { ko: '연락처 (선택)', zh: '联系方式 (可选)', en: 'Contact (optional)' })}</label>
              <input type="text" value={formContact} onChange={e => setFormContact(e.target.value)}
                placeholder={L(lang, { ko: '카카오톡 ID, 전화번호 등', zh: 'KakaoTalk ID, 电话号码等', en: 'KakaoTalk ID, phone, etc.' })}
                className="w-full bg-[#F8F9FA] rounded-xl px-4 py-3 text-sm outline-none border border-[#E5E7EB] focus:border-[#111827] transition-colors" />
            </div>
          )}

          {/* Images */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-2 block">
              {L(lang, { ko: '사진', zh: '照片', en: 'Photos' })} ({formImages.length}/5)
            </label>
            <div className="flex gap-2 flex-wrap">
              {formImages.map((img, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={img} alt="" className="w-20 h-20 object-cover rounded-xl border border-[#E5E7EB]" />
                  <button onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#111827] text-white rounded-full flex items-center justify-center">
                    <X size={10} />
                  </button>
                </div>
              ))}
              {formImages.length < 5 && (
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center gap-1 text-[#9CA3AF] hover:border-[#111827] hover:text-[#111827] transition-colors">
                  <Camera size={18} />
                  <span className="text-[9px]">{L(lang, { ko: '추가', zh: '添加', en: 'Add' })}</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </div>

          {/* Submit */}
          <button onClick={submitPost} disabled={!formTitle.trim() || !formContent.trim()}
            className="w-full bg-[#111827] text-white font-semibold py-3.5 rounded-xl text-sm disabled:opacity-30 transition-opacity">
            {editingPost ? L(lang, { ko: '수정 완료', zh: '完成编辑', en: 'Save Changes' }) : L(lang, { ko: '게시하기', zh: '发布', en: 'Post' })}
          </button>
        </div>
      </div>
    )
  }

  // ========== Main List ==========
  return (
    <div className="space-y-3 animate-fade-up">
      {/* Section navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {[
          { id: 'board', label: { ko: '게시판', zh: '论坛', en: 'Board' } },
          { id: 'jobs', label: { ko: '구직/이력서', zh: '求职/简历', en: 'Jobs/Resume' } },
          { id: 'housing', label: { ko: '부동산', zh: '房产', en: 'Housing' } },
        ].map(s => (
          <button key={s.id} onClick={() => setCommunitySection(s.id)}
            className={`shrink-0 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${communitySection === s.id ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
            {L(lang, s.label)}
          </button>
        ))}
      </div>

      {communitySection === 'jobs' && <div className="space-y-6"><JobsTab lang={lang} profile={profile} /><div className="border-t border-gray-200 pt-4"><h3 className="text-sm font-bold text-[#111827] mb-3">{L(lang, { ko: '이력서 작성', zh: '制作简历', en: 'Build Resume' })}</h3><ResumeTab lang={lang} profile={profile} /></div></div>}
      {communitySection === 'housing' && <HousingTab lang={lang} profile={profile} />}

      {communitySection === 'board' && <>
        {/* Demo notice */}
        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={14} className="text-[#9CA3AF] mt-0.5 shrink-0" />
          <span className="text-xs text-[#6B7280]">
            {L(lang, { ko: '데모 버전입니다. 게시글은 이 기기에서만 보입니다.', zh: '演示版本。帖子仅在此设备上可见。', en: 'Demo mode. Posts are only visible on this device.' })}
          </span>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1.5 bg-[#F3F4F6] p-1 rounded-xl">
          {[
            { id: 'community', label: { ko: '커뮤니티', zh: '社区', en: 'Community' } },
            { id: 'travelreview', label: { ko: '여행후기', zh: '旅行后记', en: 'Travel Review' } },
            { id: 'marketplace', label: { ko: '중고거래', zh: '二手', en: 'Market' } },
          ].map(t => (
            <button key={t.id} onClick={() => { setSubTab(t.id); setFilterCat(null); setFilterLocation(null) }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${subTab === t.id ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280]'}`}>
              {L(lang, t.label)}
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder={L(lang, { ko: '검색...', zh: '搜索...', en: 'Search...' })}
              className="w-full bg-[#F8F9FA] rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none border border-[#E5E7EB] focus:border-[#111827] transition-colors" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} className="text-[#9CA3AF]" /></button>}
          </div>
          <div className="relative">
            <button onClick={() => setShowLocationFilter(!showLocationFilter)} className={`h-full px-3 rounded-xl border transition-colors flex items-center gap-1 ${filterLocation ? 'bg-[#111827] text-white border-[#111827]' : 'bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7280]'}`}>
              <MapPin size={14} />
            </button>
            {showLocationFilter && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1 z-50 min-w-[100px]">
                <button onClick={() => { setFilterLocation(null); setShowLocationFilter(false) }} className={`w-full text-left px-3 py-2 text-xs ${!filterLocation ? 'font-bold text-[#111827]' : 'text-[#6B7280]'} hover:bg-[#F3F4F6]`}>
                  {L(lang, { ko: '전체', zh: '全部', en: 'All' })}
                </button>
                {locationOptions.map(loc => (
                  <button key={loc.id} onClick={() => { setFilterLocation(loc.id); setShowLocationFilter(false) }}
                    className={`w-full text-left px-3 py-2 text-xs ${filterLocation === loc.id ? 'font-bold text-[#111827]' : 'text-[#6B7280]'} hover:bg-[#F3F4F6]`}>
                    {L(lang, loc.label)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Categories + Sort */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 overflow-x-auto flex-1">
            <button onClick={() => setFilterCat(null)}
              className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${!filterCat ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
              {L(lang, { ko: '전체', zh: '全部', en: 'All' })}
            </button>
            {cats.map(c => (
              <button key={c.id} onClick={() => setFilterCat(filterCat === c.id ? null : c.id)}
                className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${filterCat === c.id ? 'text-white' : 'text-[#6B7280] bg-[#F3F4F6]'}`}
                style={filterCat === c.id ? { background: c.color || '#111827' } : {}}>
                {L(lang, c.label)}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="text-[11px] bg-transparent text-[#6B7280] outline-none cursor-pointer ml-2 shrink-0">
            <option value="latest">{L(lang, { ko: '최신순', zh: '最新', en: 'Latest' })}</option>
            <option value="popular">{L(lang, { ko: '인기순', zh: '热门', en: 'Popular' })}</option>
            <option value="comments">{L(lang, { ko: '댓글순', zh: '评论', en: 'Comments' })}</option>
          </select>
        </div>

        {/* Create button */}
        <button onClick={() => { setEditingPost(null); setShowCreate(true) }}
          className="w-full bg-[#111827] text-white rounded-xl py-3.5 flex items-center justify-center gap-2 font-semibold text-sm active:scale-[0.98] transition-transform">
          <Plus size={18} />
          {L(lang, { ko: '글쓰기', zh: '发帖', en: 'New Post' })}
        </button>

        {/* Posts */}
        <div className="space-y-2.5">
          {filteredPosts.map(post => (
            <button key={post.id} onClick={() => setSelectedPost(post)}
              className="w-full text-left bg-white rounded-2xl p-4 border border-[#E5E7EB] hover:border-[#111827]/10 transition-all active:scale-[0.99]">
              <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                  {/* Category + Location badges */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {post.category && (() => {
                      const cat = getCatInfo(post.category)
                      return cat ? <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${cat.color || '#6B7280'}15`, color: cat.color || '#6B7280' }}>{L(lang, cat.label)}</span> : null
                    })()}
                    {post.location && (() => {
                      const loc = getLocationLabel(post.location)
                      return loc ? <span className="text-[10px] text-[#9CA3AF] flex items-center gap-0.5"><MapPin size={8} />{L(lang, loc.label)}</span> : null
                    })()}
                    <span className="text-[10px] text-[#9CA3AF] ml-auto">{timeAgo(post.time, lang)}</span>
                  </div>

                  <h3 className="font-semibold text-[#111827] text-sm leading-tight truncate">{L(lang, post.title)}</h3>

                  {/* Price for marketplace */}
                  {post.price > 0 && (
                    <div className="text-sm font-bold text-[#111827] mt-1">{formatPrice(post.price)}</div>
                  )}

                  <p className="text-xs text-[#6B7280] mt-1 line-clamp-2 leading-relaxed">{L(lang, post.content)}</p>

                  <div className="flex items-center gap-3 mt-2.5 text-[11px] text-[#9CA3AF]">
                    <span className={`flex items-center gap-1 ${isLiked(post.id) ? 'text-red-400' : ''}`}>
                      <Heart size={12} fill={isLiked(post.id) ? 'currentColor' : 'none'} /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.comments.length}</span>
                    <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                  </div>
                </div>

                {/* Thumbnail */}
                {post.images && post.images.length > 0 && (
                  <img src={post.images[0]} alt="" className="w-16 h-16 object-cover rounded-xl shrink-0 border border-[#E5E7EB]" />
                )}
              </div>
            </button>
          ))}

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <Search size={32} className="mx-auto text-[#E5E7EB] mb-3" />
              <p className="text-sm text-[#9CA3AF]">
                {searchQuery
                  ? L(lang, { ko: '검색 결과가 없습니다', zh: '没有搜索结果', en: 'No results found' })
                  : L(lang, { ko: '게시글이 없습니다', zh: '暂无帖子', en: 'No posts yet' })}
              </p>
            </div>
          )}
        </div>
      </>}
    </div>
  )
}
