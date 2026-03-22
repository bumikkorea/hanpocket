/**
 * CourseListPage — 여행코스 리스트 풀스크린 페이지
 * 5개 여행 모드 탭 + 각 4개 큐레이션 코스 + 내 서울 담기 + 내 코스
 */
import { useState } from 'react'
import { Clock, MapPin, X, ChevronRight, Plus } from 'lucide-react'
import { useLanguage } from '../i18n/index.jsx'
import { tLang } from '../locales/index.js'
import { addBulkPins, getMySeoul, deleteMyCourse } from '../utils/mySeoul.js'
import { useToast } from './Toast.jsx'
import NearPageHeader from './NearPageHeader.jsx'
import CourseCreatorPage from './CourseCreatorPage.jsx'
import { CreateCourse } from './CourseTab.jsx'

function L(lang, d) { if (typeof d === 'string') return d; return d?.[lang] || d?.zh || d?.ko || d?.en || '' }

// ─── 5개 여행 모드 + 각 4개 코스 ───
const TRAVEL_MODES = [
  {
    id: 'first_visit',
    label: { zh: '初访首尔', ko: '처음 만나는 서울', en: 'First Visit' },
    copy: { zh: '慢慢地感受这座城市，那些未曾见过的美好。', ko: '아직 모르는 도시를, 천천히 걸어보고 싶어.', en: 'Slowly discover a city you\'ve never known.' },
    courses: [
      {
        id: 'fv_1',
        title: { zh: '首尔经典半日游', ko: '서울 클래식 반나절', en: 'Seoul Classic Half Day' },
        hours: 4,
        stops: [
          { id: 'fv1s1', name_zh: '景福宫', name_ko: '경복궁', name_en: 'Gyeongbokgung', lat: 37.5796, lng: 126.9770, category: 'utility' },
          { id: 'fv1s2', name_zh: '北村韩屋村', name_ko: '북촌한옥마을', name_en: 'Bukchon Hanok Village', lat: 37.5824, lng: 126.9849, category: 'utility' },
          { id: 'fv1s3', name_zh: '仁寺洞', name_ko: '인사동', name_en: 'Insadong', lat: 37.5741, lng: 126.9858, category: 'popup' },
          { id: 'fv1s4', name_zh: '广藏市场', name_ko: '광장시장', name_en: 'Gwangjang Market', lat: 37.5701, lng: 126.9995, category: 'food' },
        ],
      },
      {
        id: 'fv_2',
        title: { zh: '明洞购物+南山夜景', ko: '명동 쇼핑 + 남산 야경', en: 'Myeongdong + Namsan Night' },
        hours: 4,
        stops: [
          { id: 'fv2s1', name_zh: '明洞街', name_ko: '명동거리', name_en: 'Myeongdong Street', lat: 37.5636, lng: 126.9860, category: 'fashion' },
          { id: 'fv2s2', name_zh: '明洞圣堂', name_ko: '명동성당', name_en: 'Myeongdong Cathedral', lat: 37.5633, lng: 126.9873, category: 'utility' },
          { id: 'fv2s3', name_zh: '南山塔', name_ko: '남산타워', name_en: 'N Seoul Tower', lat: 37.5512, lng: 126.9882, category: 'utility' },
        ],
      },
      {
        id: 'fv_3',
        title: { zh: '弘大MZ入门', ko: '홍대 MZ 입문', en: 'Hongdae MZ Starter' },
        hours: 5,
        stops: [
          { id: 'fv3s1', name_zh: '弘大街', name_ko: '홍대거리', name_en: 'Hongdae Street', lat: 37.5563, lng: 126.9234, category: 'popup' },
          { id: 'fv3s2', name_zh: '延南洞咖啡', name_ko: '연남동카페', name_en: 'Yeonnam Cafe', lat: 37.5616, lng: 126.9250, category: 'cafe' },
          { id: 'fv3s3', name_zh: '汉江炸鸡', name_ko: '한강치맥', name_en: 'Han River Chimaek', lat: 37.5470, lng: 126.9220, category: 'food' },
        ],
      },
      {
        id: 'fv_4',
        title: { zh: '都心横穿：光化门→DDP', ko: '도심 횡단: 광화문→DDP', en: 'Gwanghwamun → DDP' },
        hours: 4,
        stops: [
          { id: 'fv4s1', name_zh: '光化门', name_ko: '광화문', name_en: 'Gwanghwamun', lat: 37.5760, lng: 126.9769, category: 'utility' },
          { id: 'fv4s2', name_zh: '清溪川', name_ko: '청계천', name_en: 'Cheonggyecheon', lat: 37.5695, lng: 126.9782, category: 'utility' },
          { id: 'fv4s3', name_zh: '乙支路小巷', name_ko: '을지로골목', name_en: 'Euljiro Alley', lat: 37.5660, lng: 126.9920, category: 'cafe' },
          { id: 'fv4s4', name_zh: 'DDP', name_ko: 'DDP', name_en: 'DDP', lat: 37.5674, lng: 127.0095, category: 'popup' },
        ],
      },
    ],
  },
  {
    id: 'aesthetic',
    label: { zh: '感性漫步', ko: '감각이 이끄는 대로', en: 'Aesthetic Wandering' },
    copy: { zh: '想在有着美丽光线的小巷里停下脚步。', ko: '예쁜 빛이 떨어지는 골목에서 멈추고 싶어.', en: 'Where beautiful light falls on quiet alleys.' },
    courses: [
      {
        id: 'ae_1',
        title: { zh: '圣水感性全程', ko: '성수 감성 풀코스', en: 'Seongsu Full Aesthetic' },
        hours: 4,
        stops: [
          { id: 'ae1s1', name_zh: '圣水编辑店', name_ko: '성수편집샵', name_en: 'Seongsu Select Shop', lat: 37.5445, lng: 127.0567, category: 'fashion' },
          { id: 'ae1s2', name_zh: '大林仓库', name_ko: '대림창고', name_en: 'Daelim Warehouse', lat: 37.5440, lng: 127.0540, category: 'popup' },
          { id: 'ae1s3', name_zh: '首尔林', name_ko: '서울숲', name_en: 'Seoul Forest', lat: 37.5444, lng: 127.0374, category: 'utility' },
          { id: 'ae1s4', name_zh: '纛岛咖啡', name_ko: '뚝섬카페', name_en: 'Ttukseom Cafe', lat: 37.5475, lng: 127.0440, category: 'cafe' },
        ],
      },
      {
        id: 'ae_2',
        title: { zh: '汉南画廊+梨泰院夜色', ko: '한남 갤러리 + 이태원 야경', en: 'Hannam Gallery + Itaewon Night' },
        hours: 4,
        stops: [
          { id: 'ae2s1', name_zh: '汉南画廊', name_ko: '한남갤러리', name_en: 'Hannam Gallery', lat: 37.5340, lng: 126.9970, category: 'popup' },
          { id: 'ae2s2', name_zh: '梨泰院小巷', name_ko: '이태원골목', name_en: 'Itaewon Alley', lat: 37.5340, lng: 126.9940, category: 'utility' },
          { id: 'ae2s3', name_zh: '解放村夜景', name_ko: '해방촌야경', name_en: 'Haebangchon Night', lat: 37.5410, lng: 126.9870, category: 'utility' },
        ],
      },
      {
        id: 'ae_3',
        title: { zh: '北村+西村传统感性', ko: '북촌+서촌 전통 감성', en: 'Bukchon+Seochon Vibes' },
        hours: 3,
        stops: [
          { id: 'ae3s1', name_zh: '北村韩屋', name_ko: '북촌한옥', name_en: 'Bukchon Hanok', lat: 37.5824, lng: 126.9849, category: 'utility' },
          { id: 'ae3s2', name_zh: '西村小巷', name_ko: '서촌골목', name_en: 'Seochon Alley', lat: 37.5790, lng: 126.9710, category: 'cafe' },
          { id: 'ae3s3', name_zh: '通仁市场', name_ko: '통인시장', name_en: 'Tongin Market', lat: 37.5795, lng: 126.9700, category: 'food' },
        ],
      },
      {
        id: 'ae_4',
        title: { zh: '延南咖啡+延禧面包', ko: '연남 카페 + 연희 빵집', en: 'Yeonnam Cafe + Yeonhui Bakery' },
        hours: 3,
        stops: [
          { id: 'ae4s1', name_zh: '延南洞咖啡', name_ko: '연남동카페', name_en: 'Yeonnam Cafe', lat: 37.5616, lng: 126.9250, category: 'cafe' },
          { id: 'ae4s2', name_zh: '延南洞公园', name_ko: '연남동공원', name_en: 'Yeonnam Park', lat: 37.5630, lng: 126.9240, category: 'utility' },
          { id: 'ae4s3', name_zh: '延禧洞面包店', name_ko: '연희동빵집', name_en: 'Yeonhui Bakery', lat: 37.5680, lng: 126.9290, category: 'cafe' },
        ],
      },
    ],
  },
  {
    id: 'kpop',
    label: { zh: 'K-POP 追星', ko: '심장이 뛰는 곳으로', en: 'K-POP Pilgrimage' },
    copy: { zh: '想沿着喜欢的人留下的痕迹去走一走。', ko: '좋아하는 사람들의 흔적을 따라가고 싶어.', en: 'Follow the traces of the ones you love.' },
    courses: [
      {
        id: 'kp_1',
        title: { zh: 'BTS圣地巡礼', ko: 'BTS 성지순례', en: 'BTS Pilgrimage' },
        hours: 4,
        stops: [
          { id: 'kp1s1', name_zh: 'HYBE大楼', name_ko: '하이브사옥', name_en: 'HYBE Building', lat: 37.5283, lng: 126.9654, category: 'popup' },
          { id: 'kp1s2', name_zh: '龙山小卡店', name_ko: '용산포카샵', name_en: 'Yongsan Poca Shop', lat: 37.5300, lng: 126.9660, category: 'fashion' },
          { id: 'kp1s3', name_zh: 'BTS壁画', name_ko: 'BTS벽화', name_en: 'BTS Mural', lat: 37.5320, lng: 126.9640, category: 'utility' },
          { id: 'kp1s4', name_zh: '汉江公园', name_ko: '한강공원', name_en: 'Han River Park', lat: 37.5270, lng: 126.9340, category: 'utility' },
        ],
      },
      {
        id: 'kp_2',
        title: { zh: 'SM+清潭K-Star Road', ko: 'SM + 청담 K-Star Road', en: 'SM + Cheongdam K-Star Road' },
        hours: 3,
        stops: [
          { id: 'kp2s1', name_zh: 'SM大楼', name_ko: 'SM사옥', name_en: 'SM Building', lat: 37.5244, lng: 127.0390, category: 'popup' },
          { id: 'kp2s2', name_zh: 'COEX Artium', name_ko: '코엑스아티움', name_en: 'COEX Artium', lat: 37.5120, lng: 127.0590, category: 'popup' },
          { id: 'kp2s3', name_zh: '清潭K-Star路', name_ko: '청담KStarRoad', name_en: 'Cheongdam K-Star Road', lat: 37.5210, lng: 127.0440, category: 'utility' },
        ],
      },
      {
        id: 'kp_3',
        title: { zh: 'JYP+弘大练习生', ko: 'JYP + 홍대 연습생', en: 'JYP + Hongdae Trainee' },
        hours: 4,
        stops: [
          { id: 'kp3s1', name_zh: 'JYP大楼', name_ko: 'JYP사옥', name_en: 'JYP Building', lat: 37.5240, lng: 127.0100, category: 'popup' },
          { id: 'kp3s2', name_zh: '弘大练习生咖啡', name_ko: '홍대연습생카페', name_en: 'Hongdae Trainee Cafe', lat: 37.5563, lng: 126.9234, category: 'cafe' },
          { id: 'kp3s3', name_zh: '建大星路', name_ko: '건대스타로드', name_en: 'Konkuk Star Road', lat: 37.5407, lng: 127.0700, category: 'popup' },
        ],
      },
      {
        id: 'kp_4',
        title: { zh: '音乐银行上班路', ko: '뮤직뱅크 출근길', en: 'Music Bank Route' },
        hours: 3,
        stops: [
          { id: 'kp4s1', name_zh: 'KBS本馆', name_ko: 'KBS', name_en: 'KBS', lat: 37.5245, lng: 126.9178, category: 'utility' },
          { id: 'kp4s2', name_zh: '汝矣岛公园', name_ko: '여의도공원', name_en: 'Yeouido Park', lat: 37.5260, lng: 126.9230, category: 'utility' },
          { id: 'kp4s3', name_zh: '粉丝咖啡', name_ko: '팬카페', name_en: 'Fan Cafe', lat: 37.5280, lng: 126.9250, category: 'cafe' },
        ],
      },
    ],
  },
  {
    id: 'beauty',
    label: { zh: '为了自己', ko: '나를 위한 시간', en: 'Time for Me' },
    copy: { zh: '想在首尔，好好关注一下自己。', ko: '서울에서 한 번쯤, 나한테 집중하고 싶어.', en: 'In Seoul, this time is just for you.' },
    courses: [
      {
        id: 'bt_1',
        title: { zh: '江南美丽全程', ko: '강남 뷰티 풀코스', en: 'Gangnam Beauty Full' },
        hours: 5,
        stops: [
          { id: 'bt1s1', name_zh: '江南护肤店', name_ko: '강남피부관리', name_en: 'Gangnam Skin Care', lat: 37.5172, lng: 127.0286, category: 'utility' },
          { id: 'bt1s2', name_zh: '清潭美发', name_ko: '청담헤어', name_en: 'Cheongdam Hair', lat: 37.5210, lng: 127.0440, category: 'fashion' },
          { id: 'bt1s3', name_zh: '狎鸥亭美甲', name_ko: '압구정네일', name_en: 'Apgujeong Nail', lat: 37.5270, lng: 127.0370, category: 'utility' },
        ],
      },
      {
        id: 'bt_2',
        title: { zh: '明洞美妆购物', ko: '명동 뷰티 쇼핑', en: 'Myeongdong Beauty Shopping' },
        hours: 3,
        stops: [
          { id: 'bt2s1', name_zh: 'Olive Young明洞', name_ko: '올리브영명동', name_en: 'Olive Young Myeongdong', lat: 37.5636, lng: 126.9860, category: 'fashion' },
          { id: 'bt2s2', name_zh: '化妆品街', name_ko: '화장품거리', name_en: 'Cosmetics Street', lat: 37.5630, lng: 126.9850, category: 'fashion' },
          { id: 'bt2s3', name_zh: '明洞美食', name_ko: '명동맛집', name_en: 'Myeongdong Food', lat: 37.5640, lng: 126.9870, category: 'food' },
        ],
      },
      {
        id: 'bt_3',
        title: { zh: '圣水感性自我护理', ko: '성수 감성 셀프케어', en: 'Seongsu Self-Care' },
        hours: 4,
        stops: [
          { id: 'bt3s1', name_zh: '圣水美甲', name_ko: '성수네일', name_en: 'Seongsu Nail', lat: 37.5448, lng: 127.0560, category: 'utility' },
          { id: 'bt3s2', name_zh: '圣水咖啡', name_ko: '성수카페', name_en: 'Seongsu Cafe', lat: 37.5445, lng: 127.0567, category: 'cafe' },
          { id: 'bt3s3', name_zh: '弘大睫毛店', name_ko: '홍대속눈썹', name_en: 'Hongdae Lash', lat: 37.5563, lng: 126.9234, category: 'utility' },
        ],
      },
      {
        id: 'bt_4',
        title: { zh: '清潭形象打造', ko: '청담 이미지 메이킹', en: 'Cheongdam Image Making' },
        hours: 4,
        stops: [
          { id: 'bt4s1', name_zh: '个人色彩诊断', name_ko: '퍼스널컬러', name_en: 'Personal Color', lat: 37.5210, lng: 127.0440, category: 'utility' },
          { id: 'bt4s2', name_zh: '清潭购物', name_ko: '청담쇼핑', name_en: 'Cheongdam Shopping', lat: 37.5220, lng: 127.0430, category: 'fashion' },
          { id: 'bt4s3', name_zh: '狎鸥亭证件照', name_ko: '압구정증명사진', name_en: 'Apgujeong Photo Studio', lat: 37.5270, lng: 127.0370, category: 'utility' },
        ],
      },
    ],
  },
  {
    id: 'local',
    label: { zh: '像首尔人一样', ko: '서울 사람처럼', en: 'Like a Local' },
    copy: { zh: '不是游客，而是想像生活在这座城市里一样走一走。', ko: '관광객이 아니라, 이 도시에 사는 것처럼 걷고 싶어.', en: 'Not as a tourist, but as someone who lives here.' },
    courses: [
      {
        id: 'lo_1',
        title: { zh: '乙支路深度游', ko: '을지로 딥다이브', en: 'Euljiro Deep Dive' },
        hours: 4,
        stops: [
          { id: 'lo1s1', name_zh: '乙支路老店', name_ko: '을지로노포', name_en: 'Euljiro Old Shop', lat: 37.5660, lng: 126.9920, category: 'food' },
          { id: 'lo1s2', name_zh: '忠武路小巷', name_ko: '충무로골목', name_en: 'Chungmuro Alley', lat: 37.5610, lng: 126.9940, category: 'cafe' },
          { id: 'lo1s3', name_zh: '东大门夜市', name_ko: '동대문야시장', name_en: 'Dongdaemun Night Market', lat: 37.5710, lng: 127.0090, category: 'popup' },
        ],
      },
      {
        id: 'lo_2',
        title: { zh: '麻浦当地人的夜晚', ko: '마포 로컬 밤', en: 'Mapo Local Night' },
        hours: 4,
        stops: [
          { id: 'lo2s1', name_zh: '麻浦烤肉', name_ko: '마포고깃집', name_en: 'Mapo BBQ', lat: 37.5530, lng: 126.9200, category: 'food' },
          { id: 'lo2s2', name_zh: '延南洞红酒吧', name_ko: '연남와인바', name_en: 'Yeonnam Wine Bar', lat: 37.5616, lng: 126.9250, category: 'cafe' },
          { id: 'lo2s3', name_zh: '弘大现场音乐', name_ko: '홍대라이브클럽', name_en: 'Hongdae Live Club', lat: 37.5563, lng: 126.9234, category: 'popup' },
        ],
      },
      {
        id: 'lo_3',
        title: { zh: '钟路当地人路线', ko: '종로 로컬 코스', en: 'Jongno Local Route' },
        hours: 4,
        stops: [
          { id: 'lo3s1', name_zh: '广藏市场', name_ko: '광장시장', name_en: 'Gwangjang Market', lat: 37.5701, lng: 126.9995, category: 'food' },
          { id: 'lo3s2', name_zh: '钟路小巷', name_ko: '종로골목', name_en: 'Jongno Alley', lat: 37.5720, lng: 126.9900, category: 'cafe' },
          { id: 'lo3s3', name_zh: '益善洞', name_ko: '익선동', name_en: 'Ikseon-dong', lat: 37.5740, lng: 126.9880, category: 'cafe' },
          { id: 'lo3s4', name_zh: '昌信洞', name_ko: '창신동', name_en: 'Changsin-dong', lat: 37.5760, lng: 127.0100, category: 'utility' },
        ],
      },
      {
        id: 'lo_4',
        title: { zh: '梨泰院一日游', ko: '이태원 하루', en: 'Itaewon Full Day' },
        hours: 5,
        stops: [
          { id: 'lo4s1', name_zh: '梨泰院早午餐', name_ko: '이태원브런치', name_en: 'Itaewon Brunch', lat: 37.5340, lng: 126.9940, category: 'food' },
          { id: 'lo4s2', name_zh: '经理团路', name_ko: '경리단길', name_en: 'Gyeongridan-gil', lat: 37.5370, lng: 126.9900, category: 'cafe' },
          { id: 'lo4s3', name_zh: '解放村天台', name_ko: '해방촌루프탑', name_en: 'Haebangchon Rooftop', lat: 37.5410, lng: 126.9870, category: 'cafe' },
          { id: 'lo4s4', name_zh: '南山散步', name_ko: '남산산책', name_en: 'Namsan Walk', lat: 37.5512, lng: 126.9882, category: 'utility' },
        ],
      },
    ],
  },
]

const MODE_COLORS = {
  first_visit: '#3B82F6',
  aesthetic:   '#EC4899',
  kpop:        '#8B5CF6',
  beauty:      '#F59E0B',
  local:       '#10B981',
}

function CuratedCourseCard({ course, modeId, lang, onAddToMySeoul, onCourseClick }) {
  const color = MODE_COLORS[modeId] || '#C4725A'
  return (
    <div style={{ position: 'relative', borderRadius: 16, background: color + '10', border: `1px solid ${color}22`, overflow: 'hidden', marginBottom: 12 }}>
      <button
        onClick={() => onCourseClick(course)}
        style={{ width: '100%', padding: '16px 16px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        onTouchStart={e => e.currentTarget.style.opacity = '0.8'}
        onTouchEnd={e => e.currentTarget.style.opacity = '1'}
      >
        {/* 타입 뱃지 */}
        <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, color, background: color + '22', borderRadius: 8, padding: '2px 8px', marginBottom: 6 }}>
          {course.stops.length} {L(lang, { zh: '个景点', ko: '개 경유지', en: 'stops' })}
        </span>
        {/* 제목 */}
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>
          {L(lang, course.title)}
        </div>
        {/* 소요시간 + 경유지 */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#777' }}>
            <Clock size={11} color="#999" />
            {course.hours}{L(lang, { zh: '小时', ko: '시간', en: 'h' })}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#777' }}>
            <MapPin size={11} color="#999" />
            {course.stops.map(s => L(lang, { zh: s.name_zh, ko: s.name_ko, en: s.name_en })).join(' → ')}
          </span>
        </div>
      </button>
      {/* 내 서울에 담기 버튼 */}
      <button
        onClick={() => onAddToMySeoul(course)}
        style={{
          margin: '0 16px 14px', padding: '8px 0', width: 'calc(100% - 32px)',
          borderRadius: 10, border: `1.5px solid ${color}`,
          background: 'transparent', color, fontSize: 13, fontWeight: 700,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
        onTouchStart={e => { e.currentTarget.style.background = color + '15' }}
        onTouchEnd={e => { e.currentTarget.style.background = 'transparent' }}
      >
        <span style={{ fontSize: 15 }}>+</span>
        {tLang('course.addToMySeoul', lang)}
      </button>
    </div>
  )
}

function loadCustomCourses() {
  try { return JSON.parse(localStorage.getItem('near_custom_courses') || '[]') } catch { return [] }
}

export default function CourseListPage({ onClose, setTab }) {
  const { lang } = useLanguage()
  const { showToast } = useToast()
  const [selectedMode, setSelectedMode] = useState('first_visit')
  const [showCreator, setShowCreator] = useState(false)
  const [showLegacyCreator, setShowLegacyCreator] = useState(false)
  const [customCourses, setCustomCourses] = useState(() => loadCustomCourses())
  const [mySeoulCourses, setMySeoulCourses] = useState(() => getMySeoul().courses)

  const currentMode = TRAVEL_MODES.find(m => m.id === selectedMode) || TRAVEL_MODES[0]
  const color = MODE_COLORS[selectedMode] || '#C4725A'

  const handleAddToMySeoul = (course) => {
    const added = addBulkPins(course.stops)
    const msg = tLang('course.bulkAdded', lang).replace('{n}', added)
    showToast({ type: 'success', message: msg })
    setMySeoulCourses(getMySeoul().courses)
  }

  const handleCourseClick = (course) => {
    onClose()
    setTab('near-map')
  }

  const handleCreatorClose = (result) => {
    if (result === 'saved') {
      setCustomCourses(loadCustomCourses())
      setMySeoulCourses(getMySeoul().courses)
    }
    setShowCreator(false)
  }

  const handleDeleteMyCourse = (courseId) => {
    deleteMyCourse(courseId)
    setMySeoulCourses(getMySeoul().courses)
    setCustomCourses(loadCustomCourses())
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9500, background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: '"Noto Sans SC", Pretendard, Inter, sans-serif' }}>

      <NearPageHeader onBack={onClose} setTab={setTab} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 48px' }}>

        {/* ─── 타이틀 ─── */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {L(lang, { zh: '旅行路线', ko: '여행코스', en: 'Travel Courses' })}
          </div>
        </div>

        {/* ─── 여행 모드 칩 (수평 스크롤) ─── */}
        <div style={{ padding: '14px 20px 0', overflowX: 'auto', display: 'flex', gap: 8, scrollbarWidth: 'none' }}>
          {TRAVEL_MODES.map(mode => {
            const mcolor = MODE_COLORS[mode.id]
            const isSelected = selectedMode === mode.id
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                style={{
                  flexShrink: 0, padding: '8px 16px', borderRadius: 20,
                  border: isSelected ? 'none' : `1.5px solid ${mcolor}55`,
                  background: isSelected ? mcolor : 'transparent',
                  color: isSelected ? 'white' : mcolor,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {L(lang, mode.label)}
              </button>
            )
          })}
        </div>

        {/* ─── 모드 카피 ─── */}
        <div style={{ padding: '10px 20px 16px' }}>
          <div style={{ fontSize: 13, color: color, fontStyle: 'italic' }}>
            "{L(lang, currentMode.copy)}"
          </div>
        </div>

        {/* ─── 선택된 모드의 코스 4개 ─── */}
        <div style={{ padding: '0 20px' }}>
          {currentMode.courses.map(course => (
            <CuratedCourseCard
              key={course.id}
              course={course}
              modeId={selectedMode}
              lang={lang}
              onAddToMySeoul={handleAddToMySeoul}
              onCourseClick={handleCourseClick}
            />
          ))}
        </div>

        {/* ─── 내 코스 섹션 (mySeoul.courses) ─── */}
        {mySeoulCourses.length > 0 && (
          <div style={{ padding: '0 20px', marginTop: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: '0.02em' }}>
              {L(lang, { zh: '我的路线', ko: '내 코스', en: 'My Courses' })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mySeoulCourses.map(course => (
                <div key={course.id} style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      sessionStorage.setItem('near_pending_course', course.id)
                      onClose()
                      setTab('near-map')
                    }}
                    style={{ width: '100%', padding: '14px 44px 14px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{course.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {course.pinIds?.length || 0}
                      {L(lang, { zh: '个景点', ko: '개 경유지', en: ' stops' })}
                    </div>
                  </button>
                  <button
                    onClick={() => handleDeleteMyCourse(course.id)}
                    style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={12} color="#555" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── 커스텀 코스 만들기 (구/신버전) ─── */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: '0.02em' }}>
            {L(lang, { zh: '自定义路线', ko: '코스 직접 만들기', en: 'Create Your Own' })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {customCourses.map((course, idx) => (
              <div key={course.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => { sessionStorage.setItem('near_pending_course', course.id); onClose(); setTab('near-map') }}
                  style={{ width: '100%', height: 72, borderRadius: 14, background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0 44px 0 16px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>
                      {L(lang, { zh: course.title_zh, ko: course.title_ko, en: course.title_en })}
                    </div>
                    <div style={{ fontSize: 11, color: '#777', marginTop: 2 }}>
                      {course.stop_count || 0} {L(lang, { zh: '个景点', ko: '개 경유지', en: 'stops' })} · {course.estimated_hours || 0}{L(lang, { zh: '小时', ko: '시간', en: 'h' })}
                    </div>
                  </div>
                  <ChevronRight size={14} color="#333" style={{ position: 'absolute', right: 16 }} />
                </button>
                <button
                  onClick={() => {
                    const updated = customCourses.filter(c => c.id !== course.id)
                    localStorage.setItem('near_custom_courses', JSON.stringify(updated))
                    setCustomCourses(updated)
                  }}
                  style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
                >
                  <X size={10} color="#333" />
                </button>
              </div>
            ))}

            <button
              onClick={() => setShowCreator(true)}
              style={{ width: '100%', height: 72, borderRadius: 14, border: '2px dashed #D1D5DB', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              onTouchStart={e => { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.background = 'rgba(0,0,0,0.02)' }}
              onTouchEnd={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={14} color="#6B7280" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>
                  {L(lang, { zh: '创建我的路线', ko: '내 코스 만들기', en: 'Create My Course' })}
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                  {L(lang, { zh: '自定义行程，随时导航', ko: '장소 추가하고 지도에서 탐색', en: 'Add stops and navigate on map' })}
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowLegacyCreator(true)}
              style={{ width: '100%', height: 72, borderRadius: 14, border: '2px dashed #C4B5FD', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              onTouchStart={e => { e.currentTarget.style.borderColor = '#A78BFA'; e.currentTarget.style.background = 'rgba(167,139,250,0.04)' }}
              onTouchEnd={e => { e.currentTarget.style.borderColor = '#C4B5FD'; e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={14} color="#9B51E0" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#7C3AED' }}>
                  {L(lang, { zh: '创建路线（地图版）', ko: '코스 만들기 (지도)', en: 'Create Course (Map)' })}
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                  {L(lang, { zh: '出发·经停·目的地 + 地图预览', ko: '출발·경유·도착 + 미니맵', en: 'Stops + minimap + navigation' })}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 하단 힌트 */}
        <div style={{ margin: '20px 20px 0', padding: '12px 16px', borderRadius: 12, background: 'var(--surface)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, textAlign: 'center' }}>
            {L(lang, { zh: '点击路线，在地图上查看详细停靠点', ko: '코스를 클릭하면 지도에서 탐색할 수 있어요', en: 'Tap a course to explore it on the map' })}
          </p>
        </div>
      </div>

      {/* 코스 만들기 페이지 (신버전) */}
      {showCreator && (
        <CourseCreatorPage onClose={handleCreatorClose} setTab={setTab} />
      )}

      {/* 코스 만들기 (구버전) */}
      {showLegacyCreator && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9700, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
          <CreateCourse
            lang={lang}
            onBack={() => setShowLegacyCreator(false)}
            onSave={(course) => {
              try {
                const existing = JSON.parse(localStorage.getItem('near_custom_courses') || '[]')
                localStorage.setItem('near_custom_courses', JSON.stringify([{ ...course, type: 'custom', title_zh: course.name, title_ko: course.name, title_en: course.name, stop_count: course.stops?.length || 0, estimated_hours: +((course.stops?.length || 0) * 0.5).toFixed(1) }, ...existing]))
                setCustomCourses(JSON.parse(localStorage.getItem('near_custom_courses') || '[]'))
              } catch {}
              setShowLegacyCreator(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
