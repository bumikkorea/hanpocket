import { Flame, Zap } from 'lucide-react'

export default function StreakBanner({ lang, streak, todayDone }) {
  if (todayDone && streak > 0) {
    return (
      <div className="mx-5 mb-4 px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-orange-700">
            {lang === 'ko' ? `연속 ${streak}일!` : lang === 'en' ? `${streak}-day streak!` : `连续${streak}天！`}
          </p>
          <p className="text-xs text-orange-500">
            {lang === 'ko' ? '오늘 학습 완료' : lang === 'en' ? 'Studied today' : '今天已学习'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-5 mb-4 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <Zap className="w-5 h-5 text-blue-500" />
      </div>
      <div>
        <p className="text-sm font-bold text-blue-700">
          {lang === 'ko' ? '오늘의 학습을 시작하세요!' : lang === 'en' ? 'Start today\'s lesson!' : '开始今天的学习吧！'}
        </p>
        {streak > 0 && (
          <p className="text-xs text-blue-500">
            {lang === 'ko' ? `현재 ${streak}일 연속` : lang === 'en' ? `Current ${streak}-day streak` : `当前连续${streak}天`}
          </p>
        )}
      </div>
    </div>
  )
}
