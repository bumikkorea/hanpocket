// 한국 vs 중국 문화 차이 50가지
export const CULTURE_DIFFS = [
  // 식사/음식 (1-10)
  { id: 1, cat: 'food', icon: '🍚',
    ko: { title: '밥그릇을 들지 않는다', desc: '한국에서는 밥그릇을 테이블에 놓고 숟가락으로 먹어요. 그릇을 들면 예의 없다고 생각해요.' },
    zh: { title: '不端碗吃饭', desc: '在韩国，碗放在桌上用勺子吃。端碗吃饭被认为不礼貌。' },
    en: { title: "Don't lift rice bowl", desc: 'In Korea, keep the bowl on the table and eat with a spoon. Lifting it is considered rude.' }
  },
  { id: 2, cat: 'food', icon: '🥢',
    ko: { title: '젓가락이 금속이다', desc: '중국은 나무/대나무 젓가락이지만, 한국은 스테인리스 금속 젓가락을 써요. 처음에는 미끄러울 수 있어요!' },
    zh: { title: '筷子是金属的', desc: '中国用木/竹筷，韩国用不锈钢筷子。一开始可能会觉得滑！' },
    en: { title: 'Metal chopsticks', desc: 'Unlike wooden chopsticks in China, Korea uses stainless steel. They can be slippery at first!' }
  },
  { id: 3, cat: 'food', icon: '🍺',
    ko: { title: '어른 앞에서 고개 돌려 마신다', desc: '술자리에서 연장자와 함께 마실 때, 고개를 옆으로 돌려서 마시는 것이 예의에요.' },
    zh: { title: '喝酒要侧过头', desc: '和长辈一起喝酒时，要把头侧过去喝，这是韩国的礼貌。' },
    en: { title: 'Turn head when drinking', desc: 'When drinking with elders, turn your head to the side as a sign of respect.' }
  },
  { id: 4, cat: 'food', icon: '🥄',
    ko: { title: '밥은 숟가락, 반찬은 젓가락', desc: '한국은 밥과 국은 숟가락, 반찬은 젓가락으로 먹어요. 중국처럼 젓가락만 쓰지 않아요.' },
    zh: { title: '饭用勺，菜用筷', desc: '韩国吃饭和汤用勺子，吃菜用筷子。不像中国只用筷子。' },
    en: { title: 'Spoon for rice, chopsticks for sides', desc: 'Korea uses spoon for rice/soup and chopsticks for side dishes.' }
  },
  { id: 5, cat: 'food', icon: '💰',
    ko: { title: '더치페이보다 한 사람이 쏜다', desc: '한국에서는 보통 한 명이 전체 식사비를 내요. "내가 쏠게"가 일반적이에요. 중국의 AA와 달라요.' },
    zh: { title: '一个人请客而非AA', desc: '韩国通常一个人付全部餐费。"我请"是常见的。和中国的AA制不同。' },
    en: { title: 'One person pays for all', desc: 'In Korea, usually one person covers the whole bill. "I\'ll treat" is common culture.' }
  },
  { id: 6, cat: 'food', icon: '🫗',
    ko: { title: '물은 셀프, 무료', desc: '한국 식당에서 물은 셀프서비스이고 무료에요. 정수기에서 직접 따라 마셔요.' },
    zh: { title: '水是自助免费的', desc: '韩国餐厅的水是自助且免费的。在饮水机自己倒。' },
    en: { title: 'Water is self-serve and free', desc: 'In Korean restaurants, water is self-service and free from the water dispenser.' }
  },
  { id: 7, cat: 'food', icon: '🥬',
    ko: { title: '반찬 무한 리필', desc: '한국 식당의 반찬(김치, 나물 등)은 무료이고, 다 먹으면 더 달라고 할 수 있어요!' },
    zh: { title: '小菜无限续', desc: '韩国餐厅的小菜（泡菜、菜等）是免费的，吃完可以再要！' },
    en: { title: 'Free side dish refills', desc: 'Korean restaurant side dishes (kimchi, etc.) are free and can be refilled!' }
  },
  { id: 8, cat: 'food', icon: '🍜',
    ko: { title: '면을 후루룩 소리내며 먹는다', desc: '한국에서 면 먹을 때 소리 내는 것은 맛있다는 표현이에요. 무례한 것이 아니에요.' },
    zh: { title: '吃面条可以出声', desc: '在韩国吃面条时发出声音表示好吃，不是不礼貌。' },
    en: { title: 'Slurping noodles is OK', desc: 'Making noise while eating noodles in Korea means it\'s delicious. Not rude!' }
  },
  { id: 9, cat: 'food', icon: '🍖',
    ko: { title: '고기는 가위로 자른다', desc: '한국 고기집에서는 가위로 고기를 잘라요. 처음 보면 신기할 거예요!' },
    zh: { title: '用剪刀剪肉', desc: '韩国烤肉店用剪刀剪肉。第一次看到会觉得很新奇！' },
    en: { title: 'Cutting meat with scissors', desc: 'Korean BBQ uses scissors to cut meat. It might seem unusual at first!' }
  },
  { id: 10, cat: 'food', icon: '🧊',
    ko: { title: '찬 음료를 많이 마신다', desc: '한국에서는 겨울에도 아이스 아메리카노를 마셔요. 중국의 따뜻한 물 문화와 달라요.' },
    zh: { title: '爱喝冰饮', desc: '韩国人冬天也喝冰美式咖啡。和中国喝热水的文化不同。' },
    en: { title: 'Ice drinks even in winter', desc: 'Koreans drink iced Americano even in winter. Unlike China\'s hot water culture.' }
  },

  // 일상생활 (11-20)
  { id: 11, cat: 'daily', icon: '👟',
    ko: { title: '실내에서 신발을 벗는다', desc: '한국 가정집, 일부 식당, 사찰에서는 신발을 벗어요. 깨끗한 양말을 신으세요!' },
    zh: { title: '室内脱鞋', desc: '韩国家庭、部分餐厅、寺庙要脱鞋。请穿干净的袜子！' },
    en: { title: 'Remove shoes indoors', desc: 'Remove shoes in Korean homes, some restaurants, and temples. Wear clean socks!' }
  },
  { id: 12, cat: 'daily', icon: '🚽',
    ko: { title: '화장지를 변기에 넣는다', desc: '최근 한국은 화장지를 변기에 버려도 돼요. 하지만 옛날 건물에서는 휴지통에 넣어야 할 수도 있어요.' },
    zh: { title: '卫生纸扔马桶', desc: '现在韩国厕纸可以扔马桶里。但老建筑可能需要扔垃圾桶。' },
    en: { title: 'Flush toilet paper', desc: 'Modern Korean toilets can flush paper. Older buildings may have a bin.' }
  },
  { id: 13, cat: 'daily', icon: '🚇',
    ko: { title: '지하철에서 통화하지 않는다', desc: '한국 지하철에서는 전화 통화를 자제해요. 조용한 환경을 지키는 문화에요.' },
    zh: { title: '地铁里不打电话', desc: '韩国地铁里尽量不打电话。保持安静是一种文化。' },
    en: { title: 'No phone calls in subway', desc: 'Koreans avoid phone calls on the subway. Keeping quiet is the norm.' }
  },
  { id: 14, cat: 'daily', icon: '🗑',
    ko: { title: '쓰레기 분리수거가 엄격하다', desc: '한국은 일반/음식물/재활용 쓰레기를 반드시 분리해요. 지정 봉투를 사야 해요.' },
    zh: { title: '垃圾分类很严格', desc: '韩国必须把普通/厨余/可回收垃圾分开。需要买指定垃圾袋。' },
    en: { title: 'Strict recycling rules', desc: 'Korea strictly separates general/food/recyclable waste. Must buy designated bags.' }
  },
  { id: 15, cat: 'daily', icon: '🔢',
    ko: { title: '4층이 없는 건물이 있다', desc: '숫자 4가 "죽을 사(死)"와 발음이 같아서, 엘리베이터에서 4 대신 F로 표시하는 곳이 있어요.' },
    zh: { title: '有些楼没有4层', desc: '数字4的发音和"死"一样，有些电梯用F代替4。和中国类似！' },
    en: { title: 'Some buildings skip floor 4', desc: 'Number 4 sounds like "death" in Korean, so some elevators show F instead of 4.' }
  },
  { id: 16, cat: 'daily', icon: '📱',
    ko: { title: '카카오톡 = 국민 메신저', desc: '한국에서는 위챗 대신 카카오톡을 써요. 거의 모든 한국인이 사용해요.' },
    zh: { title: 'KakaoTalk = 国民聊天软件', desc: '韩国用KakaoTalk而非微信。几乎所有韩国人都用。' },
    en: { title: 'KakaoTalk is the main messenger', desc: 'Korea uses KakaoTalk instead of WeChat. Almost every Korean uses it.' }
  },
  { id: 17, cat: 'daily', icon: '💳',
    ko: { title: '현금을 거의 안 쓴다', desc: '한국은 카드결제 비율이 세계 1위에요. 작은 가게도 카드가 돼요. 현금 필요 없어요!' },
    zh: { title: '几乎不用现金', desc: '韩国信用卡使用率世界第一。小店也能刷卡。不需要现金！' },
    en: { title: 'Almost cashless', desc: 'Korea has the world\'s highest card usage. Even small shops take cards!' }
  },
  { id: 18, cat: 'daily', icon: '🏃',
    ko: { title: '빨리빨리 문화', desc: '"빨리빨리"는 한국의 핵심 문화에요. 배달, 서비스, 인터넷 — 모든 것이 빠르게 진행돼요.' },
    zh: { title: '"快快快"文化', desc: '"빨리빨리(快快)"是韩国核心文化。外卖、服务、网络——一切都很快。' },
    en: { title: '"Ppalli ppalli" (hurry) culture', desc: 'Speed is key in Korean culture. Delivery, service, internet — everything is fast.' }
  },
  { id: 19, cat: 'daily', icon: '🛁',
    ko: { title: '찜질방 문화', desc: '한국의 대중 사우나(찜질방)에서는 벗은 채로 목욕해요. 매우 인기 있는 문화에요.' },
    zh: { title: '汗蒸房文化', desc: '韩国大众浴池（汗蒸房）裸体洗浴。是非常流行的文化。' },
    en: { title: 'Jjimjilbang (bathhouse) culture', desc: 'Korean bathhouses (jjimjilbang) involve nude bathing. Very popular social activity.' }
  },
  { id: 20, cat: 'daily', icon: '📦',
    ko: { title: '배달이 미친듯이 빠르다', desc: '한국 배달은 보통 30분 이내! 새벽배송(쿠팡 로켓배송)은 자정에 주문하면 아침에 와요.' },
    zh: { title: '外卖快到离谱', desc: '韩国外卖通常30分钟内送达！凌晨快递（Coupang）零点下单早上就到。' },
    en: { title: 'Insanely fast delivery', desc: 'Korean delivery usually arrives in 30 min! Dawn delivery: order at midnight, arrive by morning.' }
  },

  // 사회/문화 (21-35)
  { id: 21, cat: 'social', icon: '🎂',
    ko: { title: '나이를 바로 물어본다', desc: '한국에서는 만나자마자 나이를 물어봐요. 존댓말 결정을 위해서에요. 무례한 것이 아니에요.' },
    zh: { title: '马上问年龄', desc: '韩国人见面就问年龄，是为了决定用敬语。不是不礼貌。' },
    en: { title: 'Asking age right away', desc: 'Koreans ask age upon meeting to determine speech formality. Not rude, it\'s cultural.' }
  },
  { id: 22, cat: 'social', icon: '🙇',
    ko: { title: '인사할 때 고개를 숙인다', desc: '한국에서는 악수 대신 고개 숙여 인사해요. 나이 많은 사람에게는 더 깊이 숙여요.' },
    zh: { title: '鞠躬打招呼', desc: '韩国用鞠躬代替握手。对年长者要鞠得更深。' },
    en: { title: 'Bowing as greeting', desc: 'Koreans bow instead of shaking hands. Bow deeper for older people.' }
  },
  { id: 23, cat: 'social', icon: '🤝',
    ko: { title: '물건을 양손으로 주고받는다', desc: '돈, 명함, 선물 등을 주고받을 때 양손을 사용하는 것이 예의에요.' },
    zh: { title: '双手递接物品', desc: '递接钱、名片、礼物等时用双手是礼貌。' },
    en: { title: 'Give/receive with both hands', desc: 'Using both hands when giving/receiving money, cards, or gifts is polite.' }
  },
  { id: 24, cat: 'social', icon: '❤️',
    ko: { title: '커플 문화가 강하다', desc: '한국은 커플 옷, 커플 반지, 100일/200일/300일 기념일 문화가 있어요.' },
    zh: { title: '情侣文化很浓', desc: '韩国有情侣装、情侣戒指、纪念100天/200天/300天的文化。' },
    en: { title: 'Strong couple culture', desc: 'Korea has matching outfits, couple rings, and celebrates 100/200/300 day anniversaries.' }
  },
  { id: 25, cat: 'social', icon: '🎓',
    ko: { title: '존댓말/반말 체계', desc: '한국어에는 나이/관계에 따라 말을 다르게 해야 해요. 처음 만나면 항상 존댓말을 써요.' },
    zh: { title: '敬语/非敬语体系', desc: '韩语要根据年龄/关系使用不同说话方式。初次见面一定用敬语。' },
    en: { title: 'Formal/informal speech levels', desc: 'Korean has different speech levels based on age/relationship. Always use formal with strangers.' }
  },
  { id: 26, cat: 'social', icon: '🎁',
    ko: { title: '선물 포장을 중시한다', desc: '한국에서는 선물의 포장이 매우 중요해요. 심지어 과일도 예쁘게 포장해서 팔아요.' },
    zh: { title: '重视礼物包装', desc: '韩国非常重视礼物包装。连水果都包装得很漂亮。' },
    en: { title: 'Gift wrapping is important', desc: 'Korea values gift presentation. Even fruit is beautifully wrapped for gifting.' }
  },
  { id: 27, cat: 'social', icon: '🧓',
    ko: { title: '지하철 노약자석은 절대 안 앉는다', desc: '한국 젊은이는 노약자석(분홍색 좌석)에 절대 앉지 않아요. 비어 있어도요.' },
    zh: { title: '绝不坐老弱病残座', desc: '韩国年轻人绝不坐老弱病残座（粉色座位）。即使空着也不坐。' },
    en: { title: 'Never sit in priority seats', desc: 'Young Koreans never sit in priority seats (pink seats), even if empty.' }
  },
  { id: 28, cat: 'social', icon: '🎤',
    ko: { title: '노래방 문화', desc: '한국의 노래방(KTV)은 저렴하고 어디에나 있어요. 친구들끼리 자주 가요.' },
    zh: { title: 'KTV文化', desc: '韩国的KTV便宜又到处都有。朋友之间经常去。' },
    en: { title: 'Noraebang (karaoke) culture', desc: 'Korean karaoke rooms are cheap and everywhere. A popular social activity.' }
  },
  { id: 29, cat: 'social', icon: '📸',
    ko: { title: '셀카/사진 문화', desc: '한국은 사진/셀카 문화가 매우 강해요. 포토부스(인생네컷)가 곳곳에 있어요.' },
    zh: { title: '自拍/拍照文化', desc: '韩国自拍/拍照文化很强。大头贴机（人生四格）到处都有。' },
    en: { title: 'Selfie/photo culture', desc: 'Korea loves photos. Photo booths (Life Four Cuts) are everywhere.' }
  },
  { id: 30, cat: 'social', icon: '💅',
    ko: { title: '외모 관리 문화', desc: '한국은 남녀 모두 외모 관리에 매우 신경 써요. 스킨케어, 패션, 헤어스타일이 중요해요.' },
    zh: { title: '外貌管理文化', desc: '韩国男女都很注重外貌管理。护肤、时尚、发型都很重要。' },
    en: { title: 'Appearance-conscious culture', desc: 'Both men and women in Korea care deeply about skincare, fashion, and appearance.' }
  },
  { id: 31, cat: 'social', icon: '🏢',
    ko: { title: '회식 문화 (직장인)', desc: '한국 직장에서는 퇴근 후 같이 술 마시는 "회식" 문화가 있어요.' },
    zh: { title: '聚餐文化（上班族）', desc: '韩国职场有下班后一起喝酒的"聚餐"文化。' },
    en: { title: 'Hoesik (company dinner) culture', desc: 'Korean workplaces have after-work drinking gatherings called "hoesik".' }
  },
  { id: 32, cat: 'social', icon: '🪖',
    ko: { title: '군대 경험 공유', desc: '한국 남자는 모두 군대를 다녀와요. "군대 어디 갔다 왔어?"는 흔한 대화 주제에요.' },
    zh: { title: '军队经历', desc: '韩国男人都服过兵役。"你在哪里当的兵？"是常见话题。' },
    en: { title: 'Military service experience', desc: 'All Korean men serve in the military. "Where did you serve?" is a common topic.' }
  },
  { id: 33, cat: 'social', icon: '🏫',
    ko: { title: '학원(과외) 문화', desc: '한국 학생들은 학교 후에 학원(과외학교)에 가요. 교육열이 매우 높아요.' },
    zh: { title: '补习班文化', desc: '韩国学生放学后去补习班（学院）。教育热情非常高。' },
    en: { title: 'Hagwon (cram school) culture', desc: 'Korean students attend cram schools after school. Education fever is intense.' }
  },
  { id: 34, cat: 'social', icon: '🧸',
    ko: { title: '"오빠" 문화', desc: '한국 여성이 남자 친구나 가까운 남성에게 "오빠"라고 불러요. 중국의 "哥哥"와 비슷하지만 더 친밀해요.' },
    zh: { title: '"欧巴"文化', desc: '韩国女性称男朋友或亲近男性为"오빠(欧巴)"。类似"哥哥"但更亲密。' },
    en: { title: '"Oppa" culture', desc: 'Korean women call boyfriends or close older males "oppa". An intimate form of address.' }
  },
  { id: 35, cat: 'social', icon: '🎊',
    ko: { title: '명절에 세뱃돈', desc: '설날에 어른에게 절을 하면 세뱃돈을 받아요. 중국의 红包와 비슷해요!' },
    zh: { title: '过年磕头拿压岁钱', desc: '春节向长辈磕头拜年会收到压岁钱。和中国红包类似！' },
    en: { title: 'New Year money for bowing', desc: "Bow to elders on New Year's to receive money. Similar to Chinese hongbao!" }
  },

  // 비즈니스/쇼핑 (36-42)
  { id: 36, cat: 'business', icon: '🛒',
    ko: { title: '무인 매장이 많다', desc: '한국에는 직원 없는 무인 카페, 무인 편의점, 무인 아이스크림 가게가 많아요.' },
    zh: { title: '无人店很多', desc: '韩国有很多无人咖啡厅、无人便利店、无人冰淇淋店。' },
    en: { title: 'Many unmanned stores', desc: 'Korea has many staff-less cafes, convenience stores, and ice cream shops.' }
  },
  { id: 37, cat: 'business', icon: '🔔',
    ko: { title: '식당 호출벨이 있다', desc: '한국 식당에서는 테이블 위 벨을 눌러 직원을 불러요. "여기요~" 대신 벨을 누르세요.' },
    zh: { title: '餐厅有呼叫铃', desc: '韩国餐厅按桌上的铃叫服务员。按铃代替喊"这里～"。' },
    en: { title: 'Restaurant call bells', desc: 'Korean restaurants have table bells to call staff. Press instead of calling out.' }
  },
  { id: 38, cat: 'business', icon: '🧾',
    ko: { title: '영수증을 잘 안 준다', desc: '한국 편의점/카페에서는 물어봐야 영수증을 줘요. 자동으로 안 줘요.' },
    zh: { title: '不主动给收据', desc: '韩国便利店/咖啡厅需要主动要才给收据。不会自动给。' },
    en: { title: 'Must ask for receipts', desc: 'Korean stores don\'t automatically give receipts. You need to ask.' }
  },
  { id: 39, cat: 'business', icon: '🏪',
    ko: { title: '편의점이 매우 많다', desc: '한국은 편의점 밀도가 세계 최고에요. 50m마다 하나씩 있어요. 거의 모든 것을 살 수 있어요.' },
    zh: { title: '便利店超级多', desc: '韩国便利店密度世界最高。每50米就有一家。几乎什么都能买到。' },
    en: { title: 'Convenience stores everywhere', desc: 'Korea has the highest density of convenience stores. One every 50m!' }
  },
  { id: 40, cat: 'business', icon: '💸',
    ko: { title: '팁 문화가 없다', desc: '한국에서는 팁을 주지 않아요. 음식점, 택시, 호텔 — 팁이 필요 없어요!' },
    zh: { title: '没有小费文化', desc: '韩国不给小费。餐厅、出租车、酒店——不需要小费！' },
    en: { title: 'No tipping culture', desc: 'Korea has no tipping. Restaurants, taxis, hotels — no tips needed!' }
  },
  { id: 41, cat: 'business', icon: '📱',
    ko: { title: '키오스크 주문이 기본', desc: '많은 한국 식당/카페에서는 키오스크(무인 주문기)로 주문해요. 현금보다 카드가 편해요.' },
    zh: { title: '自助点餐机很常见', desc: '很多韩国餐厅/咖啡厅用自助点餐机点餐。刷卡比现金方便。' },
    en: { title: 'Kiosk ordering is standard', desc: 'Many Korean restaurants/cafes use kiosk machines. Card is easier than cash.' }
  },
  { id: 42, cat: 'business', icon: '🛍',
    ko: { title: '세일 시즌이 다르다', desc: '한국의 주요 세일: 설(1-2월), 정기세일(6월/12월), 코리아세일페스타(11월).' },
    zh: { title: '打折季不同', desc: '韩国主要打折季：春节(1-2月)、换季折扣(6/12月)、韩国购物节(11月)。' },
    en: { title: 'Different sale seasons', desc: 'Korea sales: Lunar New Year (Jan-Feb), seasonal (Jun/Dec), Korea Sale Festa (Nov).' }
  },

  // 교통/이동 (43-47)
  { id: 43, cat: 'transport', icon: '🚌',
    ko: { title: '버스에서 현금이 안 된다', desc: '한국 버스 대부분은 현금을 안 받아요. 반드시 교통카드(T-money)가 필요해요.' },
    zh: { title: '公交不收现金', desc: '韩国大部分公交不收现金。必须有交通卡(T-money)。' },
    en: { title: 'Buses don\'t take cash', desc: 'Most Korean buses don\'t accept cash. You need a T-money transit card.' }
  },
  { id: 44, cat: 'transport', icon: '🚕',
    ko: { title: '택시가 저렴하다', desc: '한국 택시는 중국 대도시와 비교하면 비슷하거나 저렴해요. 기본요금 4,800원(약 25위안).' },
    zh: { title: '出租车相对便宜', desc: '韩国出租车和中国大城市差不多或更便宜。起步价4800韩元(约25元)。' },
    en: { title: 'Taxis are affordable', desc: 'Korean taxis are similar to or cheaper than Chinese cities. Base fare ₩4,800 (~¥25).' }
  },
  { id: 45, cat: 'transport', icon: '🚶',
    ko: { title: '에스컬레이터 오른쪽 서기', desc: '한국에서 에스컬레이터를 탈 때 오른쪽에 서고 왼쪽은 걷는 사람을 위해 비워둬요.' },
    zh: { title: '扶梯靠右站', desc: '在韩国乘扶梯要靠右站，左边留给走的人。' },
    en: { title: 'Stand right on escalators', desc: 'In Korea, stand on the right of escalators. Left side is for walking.' }
  },
  { id: 46, cat: 'transport', icon: '🚇',
    ko: { title: '지하철이 매우 깨끗하다', desc: '한국 지하철은 세계에서 가장 깨끗하고 안전해요. 와이파이도 무료!' },
    zh: { title: '地铁非常干净', desc: '韩国地铁是世界上最干净和安全的。WiFi还免费！' },
    en: { title: 'Super clean subway', desc: 'Korean subway is among the world\'s cleanest and safest. Free WiFi too!' }
  },
  { id: 47, cat: 'transport', icon: '🛴',
    ko: { title: '전동킥보드 어디서나', desc: '한국 도시에는 공유 전동킥보드가 곳곳에 있어요. 앱으로 쉽게 이용 가능해요.' },
    zh: { title: '电动滑板车随处可见', desc: '韩国城市到处有共享电动滑板车。用APP很容易使用。' },
    en: { title: 'E-scooters everywhere', desc: 'Korean cities have shared e-scooters everywhere. Easy to use via app.' }
  },

  // 기타 독특한 문화 (48-50)
  { id: 48, cat: 'unique', icon: '🔴',
    ko: { title: '빨간색 이름 금지', desc: '한국에서는 살아있는 사람의 이름을 빨간색으로 쓰지 않아요. 죽은 사람에게만 써요.' },
    zh: { title: '不用红色写名字', desc: '韩国不用红色写活人的名字。只有写死人名字才用红色。' },
    en: { title: 'Never write names in red', desc: 'In Korea, writing a living person\'s name in red ink is taboo — reserved for the dead.' }
  },
  { id: 49, cat: 'unique', icon: '🩸',
    ko: { title: '혈액형 성격론', desc: '한국에서는 혈액형으로 성격을 판단해요. "혈액형이 뭐에요?"는 흔한 질문이에요.' },
    zh: { title: '血型性格论', desc: '韩国用血型判断性格。"你什么血型？"是常见问题。' },
    en: { title: 'Blood type personality', desc: 'Koreans believe blood type determines personality. "What\'s your blood type?" is common.' }
  },
  { id: 50, cat: 'unique', icon: '🏠',
    ko: { title: '전세 제도', desc: '한국에만 있는 "전세" — 큰 보증금을 맡기고 월세 없이 살아요. 세계 어디에도 없는 제도에요.' },
    zh: { title: '全租制度', desc: '韩国独有的"全租"——交大额押金，不用交月租。全世界独一无二的制度。' },
    en: { title: 'Jeonse (key money) system', desc: 'Korea\'s unique rental: pay large deposit, no monthly rent. Exists nowhere else in the world.' }
  },
]

export const CULTURE_CATEGORIES = [
  { id: 'food', icon: '🍽', label: { ko: '식사/음식', zh: '饮食', en: 'Food' } },
  { id: 'daily', icon: '🏠', label: { ko: '일상생활', zh: '日常生活', en: 'Daily Life' } },
  { id: 'social', icon: '🤝', label: { ko: '사회/문화', zh: '社会文化', en: 'Social' } },
  { id: 'business', icon: '🛒', label: { ko: '비즈니스/쇼핑', zh: '商业/购物', en: 'Business' } },
  { id: 'transport', icon: '🚇', label: { ko: '교통', zh: '交通', en: 'Transport' } },
  { id: 'unique', icon: '🔴', label: { ko: '독특한 문화', zh: '独特文化', en: 'Unique' } },
]
