import RestaurantPocket from './RestaurantPocket'
import TransportPocket from './TransportPocket'
import ConveniencePocket from './ConveniencePocket'
import EmergencyPocket from './EmergencyPocket'
import CafePocket from './CafePocket'
import ShoppingPocket from './ShoppingPocket'
import AccommodationPocket from './AccommodationPocket'
import WidgetContent from '../home/common/WidgetContent'

export default function PocketContent({ pocketId, lang, setTab }) {
  switch (pocketId) {
    case 'restaurant': return <RestaurantPocket lang={lang} />
    case 'transport': return <TransportPocket lang={lang} />
    case 'convenience': return <ConveniencePocket lang={lang} />
    case 'emergency': return <EmergencyPocket lang={lang} />
    case 'cafe': return <CafePocket lang={lang} />
    case 'shopping': return <ShoppingPocket lang={lang} />
    case 'accommodation': return <AccommodationPocket lang={lang} />
    default:
      // 기존 위젯 콘텐츠 폴백
      return <WidgetContent widgetId={pocketId} lang={lang} setTab={setTab} />
  }
}
