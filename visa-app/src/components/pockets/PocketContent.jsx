import KoreanFoodPocket from './KoreanFoodPocket'
import RestaurantPocket from './RestaurantPocket'
import TransportPocket from './TransportPocket'
import ConveniencePocket from './ConveniencePocket'
import EmergencyPocket from './EmergencyPocket'
import CafePocket from './CafePocket'
import ShoppingPocket from './ShoppingPocket'
import AccommodationPocket from './AccommodationPocket'
import MedicalPocket from './MedicalPocket'
import PhotoGuidePocket from './PhotoGuidePocket'
import KoreanGameMain from '../korean-game/KoreanGameMain'
import WidgetContent from '../home/common/WidgetContent'
import { IMPLEMENTED_POCKETS } from '../../data/pockets'

function ComingSoonPlaceholder({ lang }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-4xl mb-4">🚧</div>
      <p className="text-base font-semibold text-gray-700 mb-2">
        {lang === 'ko' ? '곧 업데이트됩니다' : lang === 'en' ? 'Coming soon' : '即将更新，敬请期待'}
      </p>
      <p className="text-sm text-gray-400">
        {lang === 'ko' ? '더 나은 서비스를 준비하고 있어요' : lang === 'en' ? 'We\'re preparing a better experience' : '我们正在准备更好的服务'}
      </p>
    </div>
  )
}

export default function PocketContent({ pocketId, lang, setTab }) {
  switch (pocketId) {
    case 'koreanfood': return <KoreanFoodPocket lang={lang} />
    case 'restaurant': return <RestaurantPocket lang={lang} />
    case 'transport': return <TransportPocket lang={lang} />
    case 'convenience': return <ConveniencePocket lang={lang} />
    case 'emergency': return <EmergencyPocket lang={lang} />
    case 'cafe': return <CafePocket lang={lang} />
    case 'shopping': return <ShoppingPocket lang={lang} />
    case 'accommodation': return <AccommodationPocket lang={lang} />
    case 'medical': return <MedicalPocket lang={lang} />
    case 'photoguide': return <PhotoGuidePocket lang={lang} />
    case 'koreangame': return <KoreanGameMain lang={lang} onBack={() => setTab && setTab(null)} />
    default:
      // 구현된 위젯은 WidgetContent로, 미구현은 coming-soon 표시
      if (IMPLEMENTED_POCKETS.has(pocketId)) {
        return <WidgetContent widgetId={pocketId} lang={lang} setTab={setTab} />
      }
      return <ComingSoonPlaceholder lang={lang} />
  }
}
