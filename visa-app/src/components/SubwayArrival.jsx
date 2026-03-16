import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, RefreshCw, Train, ArrowUp, ArrowDown, Clock, AlertCircle } from 'lucide-react';
import { fetchSubwayArrival, SUBWAY_LINE_COLORS, POPULAR_STATIONS } from '../api/subwayApi';

function L(lang, d) {
  if (!d) return '';
  if (typeof d === 'string') return d;
  return d[lang] || d.ko || d.zh || d.en || '';
}

const i18n = {
  title: { ko: '실시간 지하철', zh: '实时地铁', en: 'Live Subway' },
  searchPlaceholder: { ko: '역 이름 검색', zh: '搜索站名', en: 'Search station' },
  popularStations: { ko: '인기역', zh: '热门站', en: 'Popular' },
  upbound: { ko: '상행', zh: '上行', en: 'Upbound' },
  downbound: { ko: '하행', zh: '下行', en: 'Downbound' },
  innerLoop: { ko: '내선', zh: '内环', en: 'Inner' },
  outerLoop: { ko: '외선', zh: '外环', en: 'Outer' },
  destination: { ko: '행', zh: '方向', en: 'bound' },
  noData: { ko: '도착 정보가 없습니다', zh: '暂无到站信息', en: 'No arrival info' },
  error: { ko: '정보를 불러올 수 없습니다', zh: '无法加载信息', en: 'Failed to load info' },
  refreshing: { ko: '새로고침 중...', zh: '刷新中...', en: 'Refreshing...' },
  autoRefresh: { ko: '30초마다 자동 새로고침', zh: '每30秒自动刷新', en: 'Auto-refresh every 30s' },
  seconds: { ko: '초', zh: '秒', en: 's' },
  minutes: { ko: '분', zh: '分', en: 'm' },
  selectStation: { ko: '역을 검색하거나 인기역을 선택하세요', zh: '请搜索车站或选择热门站', en: 'Search or select a popular station' },
};

export default function SubwayArrival({ lang = 'zh' }) {
  const [query, setQuery] = useState('');
  const [station, setStation] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const loadData = useCallback(async (name) => {
    if (!name) return;
    setLoading(true);
    const result = await fetchSubwayArrival(name);
    setData(result);
    setLoading(false);
  }, []);

  // 역 선택
  const selectStation = useCallback((stationObj) => {
    const name = stationObj.ko; // API는 한글 역명 필요
    setStation(name);
    setQuery(L(lang, stationObj));
    setShowSuggestions(false);
    loadData(name);
  }, [lang, loadData]);

  // 30초 자동 새로고침
  useEffect(() => {
    if (!station) return;
    timerRef.current = setInterval(() => {
      loadData(station);
    }, 30000);
    return () => clearInterval(timerRef.current);
  }, [station, loadData]);

  // 수동 새로고침
  const handleRefresh = () => {
    if (station) loadData(station);
  };

  // 검색 제출
  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    // 인기역에서 매칭 시도
    const match = POPULAR_STATIONS.find(
      (s) => s.ko === query.trim() || s.zh === query.trim() || s.en.toLowerCase() === query.trim().toLowerCase()
    );
    const name = match ? match.ko : query.trim();
    setStation(name);
    setShowSuggestions(false);
    loadData(name);
  };

  // 자동완성 필터
  const filtered = query.trim()
    ? POPULAR_STATIONS.filter((s) => {
        const q = query.trim().toLowerCase();
        return s.ko.includes(q) || s.zh.includes(q) || s.en.toLowerCase().includes(q);
      })
    : [];

  // 도착시간 포맷
  const formatTime = (seconds) => {
    if (seconds <= 0) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) {
      return `${m}${L(lang, i18n.minutes)} ${s}${L(lang, i18n.seconds)}`;
    }
    return `${s}${L(lang, i18n.seconds)}`;
  };

  // 방면 라벨
  const directionLabel = (dir) => {
    if (dir === '상행' || dir === '내선') return L(lang, dir === '내선' ? i18n.innerLoop : i18n.upbound);
    if (dir === '하행' || dir === '외선') return L(lang, dir === '외선' ? i18n.outerLoop : i18n.downbound);
    return dir;
  };

  // 호선별 그룹핑
  const groupByLine = (arrivals) => {
    const groups = {};
    arrivals.forEach((a) => {
      const key = a.subwayId;
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return groups;
  };

  const lineGroups = data?.arrivals ? groupByLine(data.arrivals) : {};

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#111827] tracking-[-0.3px]">
            <Train className="inline-block w-5 h-5 mr-1.5 -mt-0.5" />
            {L(lang, i18n.title)}
          </h1>
          {station && (
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1 text-[13px] text-[#6B7280] active:text-[#111827]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* 검색 */}
        <form onSubmit={handleSearch} className="relative mb-4">
          <div className="flex items-center border border-[#E5E7EB] rounded-[8px] bg-[#F9FAFB] px-3 py-2.5">
            <Search className="w-4 h-4 text-[#9CA3AF] mr-2 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder={L(lang, i18n.searchPlaceholder)}
              className="flex-1 bg-transparent text-[14px] text-[#111827] placeholder-[#9CA3AF] outline-none"
            />
          </div>

          {/* 자동완성 드롭다운 */}
          {showSuggestions && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-[8px] shadow-sm z-10 overflow-hidden">
              {filtered.map((s) => (
                <button
                  key={s.ko}
                  type="button"
                  onClick={() => selectStation(s)}
                  className="w-full text-left px-4 py-2.5 text-[14px] text-[#111827] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] border-b border-[#F3F4F6] last:border-b-0"
                >
                  {L(lang, s)}
                  {lang !== 'ko' && <span className="text-[#9CA3AF] ml-2 text-[12px]">{s.ko}</span>}
                </button>
              ))}
            </div>
          )}
        </form>

        {/* 인기역 칩 */}
        <div className="mb-2">
          <p className="text-[11px] text-[#9CA3AF] mb-2 font-medium tracking-wide uppercase">
            {L(lang, i18n.popularStations)}
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_STATIONS.map((s) => (
              <button
                key={s.ko}
                onClick={() => selectStation(s)}
                className={`px-3 py-1.5 text-[13px] rounded-full border transition-colors ${
                  station === s.ko
                    ? 'bg-[#111827] text-white border-[#111827]'
                    : 'bg-white text-[#374151] border-[#E5E7EB] active:bg-[#F3F4F6]'
                }`}
              >
                {L(lang, s)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 영역 */}
      <div className="px-5 pb-8">
        {/* 초기 상태 */}
        {!station && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Train className="w-10 h-10 text-[#D1D5DB] mb-3" />
            <p className="text-[14px] text-[#9CA3AF]">{L(lang, i18n.selectStation)}</p>
          </div>
        )}

        {/* 로딩 */}
        {loading && !data && (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-5 h-5 text-[#9CA3AF] animate-spin" />
            <span className="ml-2 text-[14px] text-[#9CA3AF]">{L(lang, i18n.refreshing)}</span>
          </div>
        )}

        {/* 에러 */}
        {data?.error && (
          <div className="flex flex-col items-center py-12 text-center">
            <AlertCircle className="w-8 h-8 text-[#EF4444] mb-2" />
            <p className="text-[14px] text-[#6B7280]">{L(lang, i18n.error)}</p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">{data.error}</p>
          </div>
        )}

        {/* 데이터 없음 */}
        {data && !data.error && data.empty && (
          <div className="flex flex-col items-center py-12 text-center">
            <Clock className="w-8 h-8 text-[#D1D5DB] mb-2" />
            <p className="text-[14px] text-[#6B7280]">{L(lang, i18n.noData)}</p>
          </div>
        )}

        {/* 도착 정보 */}
        {data && !data.error && !data.empty && Object.keys(lineGroups).length > 0 && (
          <div className="space-y-4">
            {Object.entries(lineGroups).map(([lineId, arrivals]) => {
              const color = SUBWAY_LINE_COLORS[Number(lineId)] || '#888';
              const lineName = arrivals[0]?.lineName;

              // 방면별 분리
              const byDirection = {};
              arrivals.forEach((a) => {
                const dir = a.direction || 'etc';
                if (!byDirection[dir]) byDirection[dir] = [];
                byDirection[dir].push(a);
              });

              return (
                <div key={lineId} className="border border-[#E5E7EB] rounded-[8px] overflow-hidden">
                  {/* 호선 헤더 */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {String(lineId).slice(-1)}
                    </span>
                    <span className="text-[14px] font-medium text-[#111827]">
                      {L(lang, lineName)}
                    </span>
                  </div>

                  {/* 방면별 열차 */}
                  {Object.entries(byDirection).map(([dir, trains]) => (
                    <div key={dir}>
                      {/* 방면 라벨 */}
                      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[#FAFAFA]">
                        {dir === '상행' || dir === '내선' ? (
                          <ArrowUp className="w-3 h-3 text-[#6B7280]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#6B7280]" />
                        )}
                        <span className="text-[12px] text-[#6B7280] font-medium">
                          {directionLabel(dir)}
                        </span>
                      </div>

                      {/* 열차 카드들 */}
                      {trains.map((train, idx) => (
                        <div
                          key={`${train.subwayId}-${dir}-${idx}`}
                          className="flex items-center justify-between px-4 py-3 border-t border-[#F3F4F6]"
                        >
                          <div className="flex-1 min-w-0">
                            {/* 종착역 방면 */}
                            <p className="text-[14px] text-[#111827] font-medium truncate">
                              {train.destination && (
                                <span>
                                  {train.destination}
                                  <span className="text-[#9CA3AF]">{L(lang, i18n.destination)}</span>
                                </span>
                              )}
                            </p>
                            {/* 도착 메시지 */}
                            <p className="text-[12px] text-[#6B7280] mt-0.5 truncate">
                              {train.arrivalMessage}
                            </p>
                          </div>

                          {/* 도착 시간 */}
                          <div className="flex-shrink-0 ml-3 text-right">
                            {train.arrivalSeconds > 0 ? (
                              <span
                                className="text-[15px] font-semibold tabular-nums"
                                style={{ color }}
                              >
                                {formatTime(train.arrivalSeconds)}
                              </span>
                            ) : (
                              <span className="text-[13px] text-[#9CA3AF]">
                                {train.arrivalMessage}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })}

            {/* 자동 새로고침 안내 */}
            <p className="text-center text-[11px] text-[#9CA3AF] pt-2">
              <Clock className="inline-block w-3 h-3 mr-1 -mt-px" />
              {L(lang, i18n.autoRefresh)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
