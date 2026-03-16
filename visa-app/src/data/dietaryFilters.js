// 음식 금기/알레르기 필터 데이터
// 한국 대표 음식의 식이 제한 매핑

export const DIETARY_CATEGORIES = [
  { id: 'halal', label: { ko: '할랄', zh: '清真', en: 'Halal' }, icon: '☪️', description: { ko: '무슬림 식이법 준수', zh: '符合穆斯林饮食规定', en: 'Muslim dietary compliant' } },
  { id: 'vegan', label: { ko: '비건', zh: '纯素', en: 'Vegan' }, icon: '🌱', description: { ko: '동물성 식품 불포함', zh: '不含任何动物成分', en: 'No animal products' } },
  { id: 'vegetarian', label: { ko: '채식', zh: '素食', en: 'Vegetarian' }, icon: '🥬', description: { ko: '고기·생선 불포함 (유제품·계란 가능)', zh: '不含肉类·海鲜（乳制品·鸡蛋可以）', en: 'No meat/fish (dairy & eggs OK)' } },
  { id: 'no-pork', label: { ko: '돼지고기 없음', zh: '无猪肉', en: 'No Pork' }, icon: '🚫🐷', description: { ko: '돼지고기 미포함 요리', zh: '不含猪肉的料理', en: 'Dishes without pork' } },
  { id: 'no-beef', label: { ko: '소고기 없음', zh: '无牛肉', en: 'No Beef' }, icon: '🚫🐄', description: { ko: '소고기 미포함 요리', zh: '不含牛肉的料理', en: 'Dishes without beef' } },
  { id: 'no-seafood', label: { ko: '해산물 없음', zh: '无海鲜', en: 'No Seafood' }, icon: '🚫🦐', description: { ko: '해산물·생선 미포함', zh: '不含海鲜·鱼类', en: 'No seafood or fish' } },
  { id: 'no-spicy', label: { ko: '안 매운', zh: '不辣', en: 'Not Spicy' }, icon: '🌶️❌', description: { ko: '맵지 않은 요리', zh: '不辣的料理', en: 'Non-spicy dishes' } },
  { id: 'gluten-free', label: { ko: '글루텐 프리', zh: '无麸质', en: 'Gluten Free' }, icon: '🌾❌', description: { ko: '밀가루 미포함', zh: '不含面粉', en: 'No wheat/gluten' } },
  { id: 'no-dairy', label: { ko: '유제품 없음', zh: '无乳制品', en: 'No Dairy' }, icon: '🥛❌', description: { ko: '우유·치즈 등 미포함', zh: '不含牛奶·奶酪等', en: 'No milk, cheese, etc.' } },
  { id: 'no-nuts', label: { ko: '견과류 없음', zh: '无坚果', en: 'No Nuts' }, icon: '🥜❌', description: { ko: '견과류·땅콩 미포함', zh: '不含坚果·花生', en: 'No nuts or peanuts' } },
  { id: 'no-egg', label: { ko: '계란 없음', zh: '无鸡蛋', en: 'No Egg' }, icon: '🥚❌', description: { ko: '계란 미포함', zh: '不含鸡蛋', en: 'No eggs' } },
  { id: 'low-sodium', label: { ko: '저염식', zh: '低盐', en: 'Low Sodium' }, icon: '🧂❌', description: { ko: '염분 낮은 요리', zh: '低盐料理', en: 'Low salt dishes' } }
];

// spicy 레벨: 'none' | 'mild' | 'medium' | 'hot' | 'very-hot'
// canBeHalal: 할랄 재료로 조리 가능 여부 (돼지고기/술 미사용 시)
// tags: 해당 식이 제한에 기본 부합하는 항목
// allergens: 일반적으로 포함되는 알레르겐
// mainProtein: 주 단백질 원료

export const FOOD_DIETARY_MAP = {
  // === 밥 / 죽 ===
  'bibimbap': {
    name: { ko: '비빔밥', zh: '拌饭', en: 'Bibimbap' },
    tags: ['vegetarian-possible', 'gluten-free'],
    allergens: ['sesame', 'egg', 'soy'],
    canBeHalal: true,
    spicy: 'mild',
    mainProtein: 'beef',
    notes: { ko: '채소만 비빔밥으로 주문 가능', zh: '可以只点蔬菜拌饭', en: 'Can order vegetable-only version' }
  },
  'kimchi-bokkeumbap': {
    name: { ko: '김치볶음밥', zh: '泡菜炒饭', en: 'Kimchi Fried Rice' },
    tags: [],
    allergens: ['soy', 'sesame', 'egg', 'shellfish'],
    canBeHalal: false,
    spicy: 'medium',
    mainProtein: 'pork',
    notes: { ko: '보통 돼지고기 사용, 젓갈 포함', zh: '通常使用猪肉，含虾酱', en: 'Usually uses pork, contains shrimp paste' }
  },
  'juk': {
    name: { ko: '죽', zh: '粥', en: 'Korean Porridge (Juk)' },
    tags: ['no-spicy', 'gluten-free'],
    allergens: ['sesame'],
    canBeHalal: true,
    spicy: 'none',
    mainProtein: 'varies',
    notes: { ko: '전복죽, 야채죽, 호박죽 등 종류 다양', zh: '有�的鲍鱼粥、蔬菜粥、南瓜粥等多种选择', en: 'Many varieties: abalone, vegetable, pumpkin, etc.' }
  },
  'gimbap': {
    name: { ko: '김밥', zh: '紫菜包饭', en: 'Gimbap' },
    tags: [],
    allergens: ['sesame', 'egg', 'soy'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'varies',
    notes: { ko: '야채김밥으로 채식 가능, 단무지에 인공색소', zh: '可以点蔬菜紫菜包饭，腌萝卜含人工色素', en: 'Veggie gimbap available, pickled radish has artificial coloring' }
  },

  // === 국 / 찌개 ===
  'kimchi-jjigae': {
    name: { ko: '김치찌개', zh: '泡菜汤', en: 'Kimchi Stew' },
    tags: [],
    allergens: ['soy', 'shellfish'],
    canBeHalal: false,
    spicy: 'hot',
    mainProtein: 'pork',
    notes: { ko: '거의 항상 돼지고기 사용, 젓갈 포함', zh: '几乎都使用猪肉，含虾酱', en: 'Almost always uses pork, contains fermented shrimp' }
  },
  'doenjang-jjigae': {
    name: { ko: '된장찌개', zh: '大酱汤', en: 'Soybean Paste Stew' },
    tags: [],
    allergens: ['soy', 'shellfish'],
    canBeHalal: false,
    spicy: 'mild',
    mainProtein: 'varies',
    notes: { ko: '해산물·두부 버전 있음, 젓갈 포함 가능', zh: '有海鲜·豆腐版本，可能含虾酱', en: 'Seafood/tofu versions available, may contain shrimp paste' }
  },
  'sundubu-jjigae': {
    name: { ko: '순두부찌개', zh: '嫩豆腐汤', en: 'Soft Tofu Stew' },
    tags: ['gluten-free'],
    allergens: ['soy', 'shellfish', 'egg'],
    canBeHalal: false,
    spicy: 'hot',
    mainProtein: 'tofu',
    notes: { ko: '해물순두부는 조개·새우 포함', zh: '海鲜嫩豆腐含贝类·虾', en: 'Seafood version contains clams and shrimp' }
  },
  'budae-jjigae': {
    name: { ko: '부대찌개', zh: '部队锅', en: 'Army Stew' },
    tags: [],
    allergens: ['wheat', 'soy', 'dairy'],
    canBeHalal: false,
    spicy: 'hot',
    mainProtein: 'pork',
    notes: { ko: '햄·소시지·라면 포함 — 글루텐, 돼지고기 다량', zh: '含火腿·香肠·方便面——大量面粉和猪肉', en: 'Contains ham, sausage, ramen — lots of gluten and pork' }
  },
  'seolleongtang': {
    name: { ko: '설렁탕', zh: '雪浓汤', en: 'Ox Bone Soup' },
    tags: ['no-spicy', 'gluten-free', 'no-pork'],
    allergens: [],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'beef',
    notes: { ko: '소뼈·소고기 — 순한 맛, 소금으로 간', zh: '牛骨·牛肉——味道清淡，用盐调味', en: 'Beef bone soup — mild, seasoned with salt' }
  },
  'samgyetang': {
    name: { ko: '삼계탕', zh: '参鸡汤', en: 'Ginseng Chicken Soup' },
    tags: ['no-pork', 'no-beef', 'no-spicy', 'gluten-free', 'no-seafood'],
    allergens: ['ginseng'],
    canBeHalal: true,
    spicy: 'none',
    mainProtein: 'chicken',
    notes: { ko: '통닭에 인삼·찹쌀 — 할랄 가능 (닭만 사용)', zh: '整鸡加人参·糯米——可清真（只用鸡肉）', en: 'Whole chicken with ginseng & rice — can be halal' }
  },
  'galbitang': {
    name: { ko: '갈비탕', zh: '排骨汤', en: 'Short Rib Soup' },
    tags: ['no-pork', 'no-spicy', 'gluten-free'],
    allergens: ['soy'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'beef',
    notes: { ko: '소갈비 — 맑은 국물', zh: '牛排骨——清汤', en: 'Beef short ribs in clear broth' }
  },
  'yukgaejang': {
    name: { ko: '육개장', zh: '辣牛肉汤', en: 'Spicy Beef Soup' },
    tags: ['no-pork', 'gluten-free'],
    allergens: ['soy', 'sesame'],
    canBeHalal: false,
    spicy: 'very-hot',
    mainProtein: 'beef',
    notes: { ko: '매우 매움 — 고춧가루 다량', zh: '非常辣——大量辣椒粉', en: 'Very spicy — lots of chili powder' }
  },
  'gamjatang': {
    name: { ko: '감자탕', zh: '脊骨土豆汤', en: 'Pork Bone Soup' },
    tags: [],
    allergens: ['soy'],
    canBeHalal: false,
    spicy: 'medium',
    mainProtein: 'pork',
    notes: { ko: '돼지 등뼈 사용', zh: '使用猪脊骨', en: 'Uses pork spine bones' }
  },
  'tteokguk': {
    name: { ko: '떡국', zh: '年糕汤', en: 'Rice Cake Soup' },
    tags: ['no-spicy'],
    allergens: ['soy', 'egg'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'beef',
    notes: { ko: '소고기 육수 기반, 설날 음식', zh: '牛肉高汤底，春节食物', en: 'Beef broth based, traditional New Year food' }
  },

  // === 고기 ===
  'bulgogi': {
    name: { ko: '불고기', zh: '烤牛肉', en: 'Bulgogi' },
    tags: ['no-pork', 'gluten-free'],
    allergens: ['soy', 'sesame'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'beef',
    notes: { ko: '간장 양념 소고기 — 달콤한 맛', zh: '酱油腌牛肉——偏甜', en: 'Soy-marinated beef — sweet flavor' }
  },
  'galbi': {
    name: { ko: '갈비', zh: '烤排骨', en: 'Grilled Short Ribs' },
    tags: ['no-pork', 'gluten-free'],
    allergens: ['soy', 'sesame'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'beef',
    notes: { ko: '돼지갈비도 있으니 주문 시 확인', zh: '也有猪排骨，点餐时请确认', en: 'Pork ribs also exist — confirm when ordering' }
  },
  'samgyeopsal': {
    name: { ko: '삼겹살', zh: '五花肉', en: 'Grilled Pork Belly' },
    tags: ['gluten-free'],
    allergens: [],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'pork',
    notes: { ko: '100% 돼지고기', zh: '100%猪肉', en: '100% pork' }
  },
  'dakgalbi': {
    name: { ko: '닭갈비', zh: '辣炒鸡排', en: 'Spicy Stir-fried Chicken' },
    tags: ['no-pork', 'no-beef'],
    allergens: ['soy', 'wheat'],
    canBeHalal: true,
    spicy: 'hot',
    mainProtein: 'chicken',
    notes: { ko: '고추장 양념 닭고기, 치즈 추가 시 유제품 포함', zh: '辣酱腌鸡肉，加奶酪时含乳制品', en: 'Chili paste chicken, cheese topping adds dairy' }
  },
  'bossam': {
    name: { ko: '보쌈', zh: '菜包肉', en: 'Boiled Pork Wraps' },
    tags: [],
    allergens: ['soy', 'shellfish'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'pork',
    notes: { ko: '삶은 돼지고기를 쌈채소에 싸서', zh: '用菜叶包着煮猪肉吃', en: 'Boiled pork wrapped in leafy vegetables' }
  },
  'jokbal': {
    name: { ko: '족발', zh: '猪蹄', en: 'Braised Pig Feet' },
    tags: [],
    allergens: ['soy'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'pork',
    notes: { ko: '돼지 족발', zh: '猪脚', en: 'Pig feet/trotters' }
  },

  // === 면 / 분식 ===
  'tteokbokki': {
    name: { ko: '떡볶이', zh: '辣炒年糕', en: 'Spicy Rice Cakes' },
    tags: ['vegetarian-possible'],
    allergens: ['wheat', 'soy'],
    canBeHalal: true,
    spicy: 'very-hot',
    mainProtein: 'none',
    notes: { ko: '어묵 빼면 채식 가능, 매우 매움', zh: '去掉鱼糕可素食，非常辣', en: 'Vegetarian without fish cakes, very spicy' }
  },
  'japchae': {
    name: { ko: '잡채', zh: '杂菜', en: 'Glass Noodles' },
    tags: ['gluten-free'],
    allergens: ['soy', 'sesame'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'beef',
    notes: { ko: '당면(고구마면) 사용 — 글루텐 프리, 소고기 빼면 채식 가능', zh: '用红薯粉丝——无麸质，去掉牛肉可素食', en: 'Sweet potato noodles — GF, vegetarian without beef' }
  },
  'ramyeon': {
    name: { ko: '라면', zh: '方便面/拉面', en: 'Ramyeon (Korean Ramen)' },
    tags: [],
    allergens: ['wheat', 'soy', 'egg'],
    canBeHalal: false,
    spicy: 'hot',
    mainProtein: 'varies',
    notes: { ko: '대부분 소고기/돼지 육수, 매운 맛', zh: '大多是牛肉/猪肉汤底，辣味', en: 'Most have beef/pork broth, spicy' }
  },
  'naengmyeon': {
    name: { ko: '냉면', zh: '冷面', en: 'Cold Noodles' },
    tags: ['no-spicy'],
    allergens: ['wheat', 'egg', 'soy'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'beef',
    notes: { ko: '물냉면(차가운 육수)·비빔냉면(매운 양념)', zh: '水冷面（冷汤）·拌冷面（辣酱）', en: 'Water naengmyeon (cold broth) or bibim (spicy sauce)' }
  },
  'kalguksu': {
    name: { ko: '칼국수', zh: '刀切面', en: 'Knife-cut Noodle Soup' },
    tags: ['no-spicy'],
    allergens: ['wheat', 'soy', 'shellfish'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'varies',
    notes: { ko: '밀가루면 — 해물·닭·멸치 육수 다양', zh: '面粉面条——有海鲜·鸡肉·鳀鱼汤底', en: 'Wheat noodles — seafood, chicken, or anchovy broth' }
  },
  'jajangmyeon': {
    name: { ko: '자장면', zh: '炸酱面', en: 'Black Bean Noodles' },
    tags: ['no-spicy'],
    allergens: ['wheat', 'soy'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'pork',
    notes: { ko: '춘장(검은콩소스)에 돼지고기', zh: '黑豆酱配猪肉', en: 'Black bean sauce with pork' }
  },
  'jjamppong': {
    name: { ko: '짬뽕', zh: '海鲜辣汤面', en: 'Spicy Seafood Noodles' },
    tags: [],
    allergens: ['wheat', 'soy', 'shellfish'],
    canBeHalal: false,
    spicy: 'hot',
    mainProtein: 'seafood',
    notes: { ko: '해산물 다량 — 조개, 새우, 오징어', zh: '大量海鲜——贝类、虾、鱿鱼', en: 'Lots of seafood — clams, shrimp, squid' }
  },

  // === 전 / 튀김 ===
  'pajeon': {
    name: { ko: '파전', zh: '葱饼', en: 'Green Onion Pancake' },
    tags: ['vegetarian-possible'],
    allergens: ['wheat', 'egg', 'shellfish'],
    canBeHalal: true,
    spicy: 'none',
    mainProtein: 'varies',
    notes: { ko: '해물파전은 해산물 포함, 부추전·김치전도 있음', zh: '海鲜葱饼含海鲜，也有韭菜饼·泡菜饼', en: 'Seafood pajeon has shellfish; also available as chive or kimchi' }
  },
  'twigim': {
    name: { ko: '튀김', zh: '天妇罗/油炸', en: 'Korean Tempura' },
    tags: [],
    allergens: ['wheat', 'egg', 'shellfish'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'varies',
    notes: { ko: '야채·새우·오징어·고구마 등 — 밀가루 튀김옷', zh: '蔬菜·虾·鱿鱼·红薯等——面粉裹炸', en: 'Vegetables, shrimp, squid, sweet potato — wheat batter' }
  },

  // === 반찬 / 사이드 ===
  'kimchi': {
    name: { ko: '김치', zh: '泡菜', en: 'Kimchi' },
    tags: ['gluten-free'],
    allergens: ['shellfish'],
    canBeHalal: false,
    spicy: 'medium',
    mainProtein: 'none',
    notes: { ko: '젓갈(새우/멸치) 포함 — 채식·할랄 불가', zh: '含虾酱/鳀鱼酱——素食·清真不可', en: 'Contains fermented shrimp/anchovy — not vegetarian or halal' }
  },
  'japchae-banchan': {
    name: { ko: '잡채 (반찬)', zh: '杂菜（小菜）', en: 'Japchae (Side Dish)' },
    tags: ['gluten-free'],
    allergens: ['soy', 'sesame'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'varies'
  },
  'gyeran-mari': {
    name: { ko: '계란말이', zh: '鸡蛋卷', en: 'Rolled Omelette' },
    tags: ['no-spicy', 'gluten-free', 'no-pork', 'no-beef', 'vegetarian'],
    allergens: ['egg'],
    canBeHalal: true,
    spicy: 'none',
    mainProtein: 'egg'
  },

  // === 해산물 ===
  'haemul-pajeon': {
    name: { ko: '해물파전', zh: '海鲜葱饼', en: 'Seafood Pancake' },
    tags: [],
    allergens: ['wheat', 'egg', 'shellfish'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'seafood',
    notes: { ko: '새우, 오징어, 조개 등 해산물 다수', zh: '含虾、鱿鱼、贝类等多种海鲜', en: 'Contains shrimp, squid, clams, etc.' }
  },
  'ganjang-gejang': {
    name: { ko: '간장게장', zh: '酱油蟹', en: 'Soy Sauce Marinated Crab' },
    tags: ['no-pork', 'no-beef', 'gluten-free'],
    allergens: ['shellfish', 'soy'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'crab',
    notes: { ko: '생게 — 날것 주의', zh: '生螃蟹——注意是生的', en: 'Raw crab — note it is uncooked' }
  },
  'hoe': {
    name: { ko: '회 (생선회)', zh: '生鱼片', en: 'Raw Fish (Hoe)' },
    tags: ['no-pork', 'no-beef', 'gluten-free', 'no-spicy'],
    allergens: ['fish'],
    canBeHalal: true,
    spicy: 'none',
    mainProtein: 'fish',
    notes: { ko: '날생선 — 초장/간장 와사비에 찍어', zh: '生鱼——蘸辣酱/酱油芥末', en: 'Raw fish — dipped in chili paste or soy/wasabi' }
  },
  'grilled-fish': {
    name: { ko: '생선구이', zh: '烤鱼', en: 'Grilled Fish' },
    tags: ['no-pork', 'no-beef', 'gluten-free', 'no-spicy'],
    allergens: ['fish'],
    canBeHalal: true,
    spicy: 'none',
    mainProtein: 'fish',
    notes: { ko: '고등어구이, 갈치구이 등', zh: '烤青花鱼、烤带鱼等', en: 'Grilled mackerel, hairtail, etc.' }
  },

  // === 치킨 ===
  'fried-chicken': {
    name: { ko: '치킨 (프라이드)', zh: '韩式炸鸡', en: 'Korean Fried Chicken' },
    tags: ['no-pork', 'no-beef'],
    allergens: ['wheat', 'soy', 'egg'],
    canBeHalal: true,
    spicy: 'none',
    mainProtein: 'chicken',
    notes: { ko: '양념치킨은 매움, 간장치킨은 안 매움', zh: '调味炸鸡辣，酱油炸鸡不辣', en: 'Yangnyeom is spicy, soy sauce chicken is not' }
  },
  'yangnyeom-chicken': {
    name: { ko: '양념치킨', zh: '调味炸鸡', en: 'Sweet & Spicy Chicken' },
    tags: ['no-pork', 'no-beef'],
    allergens: ['wheat', 'soy', 'egg'],
    canBeHalal: true,
    spicy: 'medium',
    mainProtein: 'chicken',
    notes: { ko: '고추장 기반 달콤매운 소스', zh: '辣酱为底的甜辣酱', en: 'Chili paste based sweet-spicy sauce' }
  },

  // === 디저트 / 간식 ===
  'hotteok': {
    name: { ko: '호떡', zh: '糖饼', en: 'Sweet Pancake (Hotteok)' },
    tags: ['vegetarian', 'no-pork', 'no-beef'],
    allergens: ['wheat', 'nuts'],
    canBeHalal: true,
    spicy: 'none',
    mainProtein: 'none',
    notes: { ko: '밀가루 반죽 + 견과류·흑설탕 속', zh: '面粉皮+坚果·红糖馅', en: 'Wheat dough with nuts & brown sugar filling' }
  },
  'bungeoppang': {
    name: { ko: '붕어빵', zh: '鲫鱼饼', en: 'Fish-shaped Pastry' },
    tags: ['vegetarian', 'no-pork', 'no-beef', 'no-spicy'],
    allergens: ['wheat', 'egg'],
    canBeHalal: true,
    spicy: 'none',
    mainProtein: 'none',
    notes: { ko: '팥소 또는 슈크림 — 생선 안 들어감', zh: '红豆沙或奶油馅——不含鱼', en: 'Red bean or custard filling — no actual fish' }
  },
  'bingsu': {
    name: { ko: '빙수', zh: '刨冰', en: 'Shaved Ice (Bingsu)' },
    tags: ['no-pork', 'no-beef', 'no-spicy', 'vegetarian', 'gluten-free'],
    allergens: ['dairy', 'nuts'],
    canBeHalal: true,
    spicy: 'none',
    mainProtein: 'none',
    notes: { ko: '우유 얼음 사용 — 유제품 포함', zh: '使用牛奶冰——含乳制品', en: 'Uses milk ice — contains dairy' }
  },
  'tteok': {
    name: { ko: '떡', zh: '年糕/糕点', en: 'Rice Cake (Tteok)' },
    tags: ['vegan-possible', 'no-pork', 'no-beef', 'no-spicy', 'gluten-free'],
    allergens: ['nuts', 'sesame'],
    canBeHalal: true,
    spicy: 'none',
    mainProtein: 'none',
    notes: { ko: '쌀가루 기반 — 견과류·콩 토핑 주의', zh: '米粉制——注意坚果·豆类点缀', en: 'Rice flour based — watch for nut/bean toppings' }
  },

  // === 두부 / 콩 ===
  'dubu-kimchi': {
    name: { ko: '두부김치', zh: '豆腐泡菜', en: 'Tofu with Kimchi' },
    tags: [],
    allergens: ['soy', 'shellfish'],
    canBeHalal: false,
    spicy: 'medium',
    mainProtein: 'tofu',
    notes: { ko: '볶은 김치 + 두부, 돼지고기 같이 볶기도 함', zh: '炒泡菜+豆腐，有时也加猪肉一起炒', en: 'Stir-fried kimchi + tofu, sometimes cooked with pork' }
  },

  // === 전골 / 탕 ===
  'shabu-shabu': {
    name: { ko: '샤부샤부', zh: '涮锅', en: 'Shabu-shabu' },
    tags: ['no-spicy'],
    allergens: ['soy', 'shellfish'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'beef',
    notes: { ko: '소고기·해산물·채소 — 뷔페식 다양', zh: '牛肉·海鲜·蔬菜——自助多样', en: 'Beef, seafood, vegetables — often buffet style' }
  },
  'gopchang': {
    name: { ko: '곱창', zh: '烤牛肠', en: 'Grilled Intestines' },
    tags: ['gluten-free'],
    allergens: ['soy'],
    canBeHalal: false,
    spicy: 'medium',
    mainProtein: 'beef-offal',
    notes: { ko: '소곱창·돼지곱창 — 내장 요리', zh: '牛肠·猪肠——内脏料理', en: 'Beef/pork intestines — offal dish' }
  },
  'dakdoritang': {
    name: { ko: '닭도리탕', zh: '辣炖鸡', en: 'Spicy Braised Chicken' },
    tags: ['no-pork', 'no-beef', 'gluten-free'],
    allergens: ['soy'],
    canBeHalal: true,
    spicy: 'hot',
    mainProtein: 'chicken',
    notes: { ko: '감자·당근과 함께 매콤하게 조림', zh: '和土豆·胡萝卜一起辣炖', en: 'Braised with potatoes and carrots, spicy' }
  },

  // === 한정식 / 기타 ===
  'hanjeongsik': {
    name: { ko: '한정식', zh: '韩定食', en: 'Korean Full Course Meal' },
    tags: [],
    allergens: ['soy', 'sesame', 'shellfish', 'egg', 'wheat', 'nuts'],
    canBeHalal: false,
    spicy: 'varies',
    mainProtein: 'varies',
    notes: { ko: '반찬 10-20가지 — 거의 모든 알레르겐 포함 가능', zh: '10-20种小菜——可能含几乎所有过敏原', en: '10-20 side dishes — may contain almost all allergens' }
  },
  'ssambap': {
    name: { ko: '쌈밥', zh: '菜包饭', en: 'Lettuce Wraps with Rice' },
    tags: ['gluten-free'],
    allergens: ['soy', 'sesame'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'varies',
    notes: { ko: '쌈장에 젓갈 포함 가능', zh: '包饭酱可能含虾酱', en: 'Ssamjang sauce may contain fermented shrimp' }
  },
  'kongguksu': {
    name: { ko: '콩국수', zh: '豆浆面', en: 'Cold Soy Milk Noodles' },
    tags: ['no-spicy', 'no-pork', 'no-beef', 'vegetarian'],
    allergens: ['wheat', 'soy', 'nuts'],
    canBeHalal: true,
    spicy: 'none',
    mainProtein: 'soy',
    notes: { ko: '여름 별미 — 콩물에 면, 시원하게', zh: '夏季美食——豆浆配面条，冰凉', en: 'Summer specialty — noodles in cold soy milk' }
  },
  'sundae': {
    name: { ko: '순대', zh: '血肠', en: 'Korean Blood Sausage' },
    tags: [],
    allergens: ['wheat', 'soy'],
    canBeHalal: false,
    spicy: 'none',
    mainProtein: 'pork',
    notes: { ko: '돼지 내장에 당면·선지 — 무슬림/채식 불가', zh: '猪肠灌粉条·猪血——穆斯林/素食不可', en: 'Pork intestine with noodles & blood — not halal/vegetarian' }
  }
};

// 중국인 관광객 특화 팁
export const CHINESE_TOURIST_FOOD_TIPS = {
  ko: [
    '한국 김치는 거의 모든 식사에 나옵니다 (새우젓 포함 → 채식·할랄 불가)',
    '한국에는 할랄 인증 식당이 이태원·서울중앙성원 근처에 집중되어 있습니다',
    '"고기 빼주세요" (gogi ppae-juseyo) = 고기를 빼달라는 표현',
    '"안 맵게 해주세요" (an maepge hae-juseyo) = 안 맵게 해달라는 표현',
    '한국 식당의 반찬은 무료로 리필 가능합니다',
    '편의점(CU, GS25, 세븐일레븐)에서 삼각김밥·도시락 추천 — 성분표 확인',
    '한국 라면은 거의 다 매운맛입니다',
    '소주·맥주 권유 문화가 있으니 음주 금기 시 미리 말씀하세요',
    '한국 빵·과자에 돼지기름(라드) 사용하는 경우가 있습니다'
  ],
  zh: [
    '韩国泡菜几乎每顿饭都会有（含虾酱 → 素食·清真不可）',
    '韩国清真认证餐厅主要集中在梨泰院·首尔中央清真寺附近',
    '"고기 빼주세요"（go-gi ppae-ju-se-yo）= 请不要放肉',
    '"안 맵게 해주세요"（an maep-ge hae-ju-se-yo）= 请做不辣的',
    '韩国餐厅的小菜可以免费续',
    '便利店（CU、GS25、7-11）推荐三角饭团·便当——请查看配料表',
    '韩国方便面几乎都是辣的',
    '韩国有劝酒文化，如果不能喝酒请提前说明',
    '韩国面包·零食有时会使用猪油（拉德）'
  ],
  en: [
    'Kimchi comes with almost every Korean meal (contains shrimp paste → not vegetarian/halal)',
    'Halal-certified restaurants are concentrated around Itaewon & Seoul Central Mosque',
    '"고기 빼주세요" (go-gi ppae-ju-se-yo) = Please remove the meat',
    '"안 맵게 해주세요" (an maep-ge hae-ju-se-yo) = Please make it not spicy',
    'Side dishes (banchan) at Korean restaurants are free and refillable',
    'Convenience stores (CU, GS25, 7-Eleven) — try triangle kimbap & bento boxes, check ingredients',
    'Almost all Korean ramyeon (instant noodles) are spicy',
    'Korea has a drinking culture — if you do not drink alcohol, say so in advance',
    'Korean bread & snacks sometimes use lard (pork fat)'
  ]
};

// 스파이시 레벨 라벨
export const SPICY_LEVEL_LABELS = {
  'none': { ko: '안 매움', zh: '不辣', en: 'Not Spicy', color: '#4CAF50' },
  'mild': { ko: '약간 매움', zh: '微辣', en: 'Mildly Spicy', color: '#FFC107' },
  'medium': { ko: '보통 매움', zh: '中辣', en: 'Medium Spicy', color: '#FF9800' },
  'hot': { ko: '매움', zh: '辣', en: 'Spicy', color: '#FF5722' },
  'very-hot': { ko: '매우 매움', zh: '非常辣', en: 'Very Spicy', color: '#D32F2F' }
};

// 알레르겐 라벨 (한/중/영)
export const ALLERGEN_LABELS = {
  'soy': { ko: '대두(간장)', zh: '大豆（酱油）', en: 'Soy' },
  'sesame': { ko: '참깨', zh: '芝麻', en: 'Sesame' },
  'egg': { ko: '계란', zh: '鸡蛋', en: 'Egg' },
  'wheat': { ko: '밀(글루텐)', zh: '小麦（麸质）', en: 'Wheat (Gluten)' },
  'shellfish': { ko: '갑각류/조개', zh: '甲壳类/贝类', en: 'Shellfish' },
  'fish': { ko: '생선', zh: '鱼类', en: 'Fish' },
  'dairy': { ko: '유제품', zh: '乳制品', en: 'Dairy' },
  'nuts': { ko: '견과류', zh: '坚果', en: 'Tree Nuts' },
  'peanuts': { ko: '땅콩', zh: '花生', en: 'Peanuts' },
  'ginseng': { ko: '인삼', zh: '人参', en: 'Ginseng' }
};
