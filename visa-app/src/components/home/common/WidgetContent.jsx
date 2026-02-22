// 위젯 컴포넌트 import
import ExchangeRateCard from '../widgets/ExchangeRateCard'
import TimezoneWidget from '../widgets/TimezoneWidget'
import HolidayCalendarWidget from '../widgets/HolidayCalendarWidget'
import ParcelWidget from '../widgets/ParcelWidget'
import EditorPickWidget from '../widgets/EditorPickWidget'
import NewsWidget from '../widgets/NewsWidget'
import { widgetMockData } from '../../../data/widgets'
import { trackActivity } from '../utils/helpers'

export default function WidgetContent({ widgetId, lang, setTab }) {
  // 활동 트래킹
  const handleActivity = (type, data) => {
    trackActivity(type, { widget: widgetId, ...data })
  }

  switch (widgetId) {
    case 'currency':
      return <ExchangeRateCard exchangeRate={null} lang={lang} />

    case 'timezone':
      return <TimezoneWidget lang={lang} />

    case 'holiday':
      return <HolidayCalendarWidget lang={lang} />

    case 'parcel':
      return <ParcelWidget lang={lang} />

    case 'editorpick':
      return <EditorPickWidget lang={lang} />

    case 'news':
      return <NewsWidget data={widgetMockData.news} lang={lang} />

    case 'weather':
      return <div className="p-4 text-center text-sm text-gray-500">날씨 위젯 (분리 예정)</div>

    case 'calendar':
      return <div className="p-4 text-center text-sm text-gray-500">달력 위젯 (분리 예정)</div>

    case 'memo':
      return <div className="p-4 text-center text-sm text-gray-500">메모 위젯 (분리 예정)</div>

    // TODO: 나머지 위젯들도 개별 파일로 분리 예정
    case 'trip':
      return <div className="p-4 text-center text-sm text-gray-500">여행 위젯 (분리 예정)</div>

    case 'festival':
      return <div className="p-4 text-center text-sm text-gray-500">축제 위젯 (분리 예정)</div>

    case 'cvsnew':
      return <div className="p-4 text-center text-sm text-gray-500">편의점 신상 위젯 (분리 예정)</div>

    case 'beautynew':
      return <div className="p-4 text-center text-sm text-gray-500">뷰티 신상 위젯 (분리 예정)</div>

    case 'kpop':
      return <div className="p-4 text-center text-sm text-gray-500">K-POP 차트 위젯 (분리 예정)</div>

    case 'fanevent':
      return <div className="p-4 text-center text-sm text-gray-500">팬 이벤트 위젯 (분리 예정)</div>

    case 'restaurant':
      return <div className="p-4 text-center text-sm text-gray-500">맛집 위젯 (분리 예정)</div>

    case 'oliveyoung':
      return <div className="p-4 text-center text-sm text-gray-500">올리브영 세일 위젯 (분리 예정)</div>

    case 'themepark':
      return <div className="p-4 text-center text-sm text-gray-500">테마파크 할인 위젯 (분리 예정)</div>

    case 'beauty':
      return <div className="p-4 text-center text-sm text-gray-500">뷰티 위젯 (분리 예정)</div>

    case 'fashiontrend':
      return <div className="p-4 text-center text-sm text-gray-500">패션 트렌드 위젯 (분리 예정)</div>

    case 'tradition':
      return <div className="p-4 text-center text-sm text-gray-500">전통 체험 위젯 (분리 예정)</div>

    case 'delivery':
      return <div className="p-4 text-center text-sm text-gray-500">배달 위젯 (분리 예정)</div>

    case 'accommodation':
      return <div className="p-4 text-center text-sm text-gray-500">숙박 위젯 (분리 예정)</div>

    case 'taxrefund':
      return <div className="p-4 text-center text-sm text-gray-500">세금 환급 위젯 (분리 예정)</div>

    case 'translator':
      return <div className="p-4 text-center text-sm text-gray-500">번역기 위젯 (분리 예정)</div>

    default:
      return (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500">알 수 없는 위젯: {widgetId}</p>
        </div>
      )
  }
}