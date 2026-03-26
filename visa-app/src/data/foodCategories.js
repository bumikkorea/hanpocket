/**
 * 음식 카테고리 계층 구조
 * Main Category → Subcategory → Items
 * 모든 레벨에 ko/zh/en 번역 포함
 */

export const FOOD_CATEGORIES = [
  {
    id: 'korean',
    icon: '🇰🇷',
    label: { ko: '한식', zh: '韩餐', en: 'Korean' },
    subcategories: [
      { id: 'bbq', label: { ko: 'BBQ/구이', zh: '烤肉', en: 'BBQ' }, items: [
        { id: 'samgyeopsal', label: { ko: '삼겹살', zh: '五花肉', en: 'Pork Belly' } },
        { id: 'galbi', label: { ko: '갈비', zh: '排骨', en: 'Galbi' } },
        { id: 'beef-gui', label: { ko: '소고기구이', zh: '烤牛肉', en: 'Beef BBQ' } },
        { id: 'dakgalbi', label: { ko: '닭갈비', zh: '辣炒鸡排', en: 'Dakgalbi' } },
        { id: 'gopchang', label: { ko: '곱창', zh: '烤肠', en: 'Gopchang' } },
      ]},
      { id: 'hanjeongsik', label: { ko: '한정식', zh: '韩定食', en: 'Korean Course' }, items: [
        { id: 'hanjeongsik-item', label: { ko: '한정식', zh: '韩定食', en: 'Hanjeongsik' } },
        { id: 'gungjung', label: { ko: '궁중요리', zh: '宫廷料理', en: 'Royal Cuisine' } },
      ]},
      { id: 'tang-jjigae', label: { ko: '탕/찌개', zh: '汤/锅', en: 'Soup/Stew' }, items: [
        { id: 'seolleongtang', label: { ko: '설렁탕', zh: '雪浓汤', en: 'Seolleongtang' } },
        { id: 'gomtang', label: { ko: '곰탕', zh: '牛骨汤', en: 'Gomtang' } },
        { id: 'gamjatang', label: { ko: '감자탕', zh: '土豆汤', en: 'Gamjatang' } },
        { id: 'budae-jjigae', label: { ko: '부대찌개', zh: '部队锅', en: 'Budae Jjigae' } },
        { id: 'kimchi-jjigae', label: { ko: '김치찌개', zh: '泡菜锅', en: 'Kimchi Jjigae' } },
        { id: 'sundubu', label: { ko: '순두부', zh: '嫩豆腐锅', en: 'Sundubu' } },
      ]},
      { id: 'noodle-kr', label: { ko: '국수/면', zh: '面条', en: 'Noodles' }, items: [
        { id: 'naengmyeon', label: { ko: '냉면', zh: '冷面', en: 'Naengmyeon' } },
        { id: 'kalguksu', label: { ko: '칼국수', zh: '刀切面', en: 'Kalguksu' } },
        { id: 'janchi-guksu', label: { ko: '잔치국수', zh: '宴会面', en: 'Janchi Guksu' } },
        { id: 'sujebi', label: { ko: '수제비', zh: '面片汤', en: 'Sujebi' } },
      ]},
      { id: 'seafood-kr', label: { ko: '해물', zh: '海鲜', en: 'Seafood' }, items: [
        { id: 'hoe', label: { ko: '회/초밥', zh: '生鱼片/寿司', en: 'Raw Fish/Sushi' } },
        { id: 'jogae-gui', label: { ko: '조개구이', zh: '烤贝壳', en: 'Grilled Shellfish' } },
        { id: 'maeuntang', label: { ko: '매운탕', zh: '辣鱼汤', en: 'Maeuntang' } },
        { id: 'agujjim', label: { ko: '아구찜', zh: '炖鮟鱇鱼', en: 'Agujjim' } },
        { id: 'ganjang-gejang', label: { ko: '간장게장', zh: '酱油蟹', en: 'Soy Crab' } },
      ]},
      { id: 'jjim-jokbal', label: { ko: '찜/족발', zh: '蒸菜/猪蹄', en: 'Braised' }, items: [
        { id: 'jokbal', label: { ko: '족발', zh: '猪蹄', en: 'Jokbal' } },
        { id: 'bossam', label: { ko: '보쌈', zh: '菜包肉', en: 'Bossam' } },
        { id: 'jjimdak', label: { ko: '찜닭', zh: '炖鸡', en: 'Jjimdak' } },
      ]},
      { id: 'juk-baekban', label: { ko: '죽/백반', zh: '粥/套餐', en: 'Porridge/Set Meal' }, items: [
        { id: 'juk', label: { ko: '죽', zh: '粥', en: 'Porridge' } },
        { id: 'baekban', label: { ko: '백반', zh: '家常饭', en: 'Baekban' } },
        { id: 'bibimbap', label: { ko: '비빔밥', zh: '拌饭', en: 'Bibimbap' } },
        { id: 'ssambap', label: { ko: '쌈밥', zh: '菜包饭', en: 'Ssambap' } },
      ]},
      { id: 'chicken', label: { ko: '치킨', zh: '炸鸡', en: 'Fried Chicken' }, items: [
        { id: 'fried', label: { ko: '후라이드', zh: '原味炸鸡', en: 'Original Fried' } },
        { id: 'yangnyeom', label: { ko: '양념', zh: '调味炸鸡', en: 'Seasoned' } },
        { id: 'ganjang-ck', label: { ko: '간장', zh: '酱油炸鸡', en: 'Soy Sauce' } },
        { id: 'charcoal', label: { ko: '숯불', zh: '炭烤鸡', en: 'Charcoal Grilled' } },
      ]},
    ],
  },
  {
    id: 'chinese',
    icon: '🥟',
    label: { ko: '중식', zh: '中餐', en: 'Chinese' },
    subcategories: [
      { id: 'junghwa', label: { ko: '중화요리', zh: '中华料理', en: 'Chinese Classic' }, items: [
        { id: 'jajangmyeon', label: { ko: '짜장면', zh: '炸酱面', en: 'Jajangmyeon' } },
        { id: 'jjamppong', label: { ko: '짬뽕', zh: '海鲜辣面', en: 'Jjamppong' } },
        { id: 'tangsuyuk', label: { ko: '탕수육', zh: '糖醋肉', en: 'Sweet & Sour Pork' } },
      ]},
      { id: 'mala', label: { ko: '마라', zh: '麻辣', en: 'Mala' }, items: [
        { id: 'malatang', label: { ko: '마라탕', zh: '麻辣烫', en: 'Malatang' } },
        { id: 'malaxiangguo', label: { ko: '마라샹궈', zh: '麻辣香锅', en: 'Mala Xiangguo' } },
      ]},
      { id: 'hotpot', label: { ko: '훠궈', zh: '火锅', en: 'Hot Pot' }, items: [
        { id: 'huoguo', label: { ko: '훠궈', zh: '火锅', en: 'Hot Pot' } },
        { id: 'shabu', label: { ko: '샤브샤브', zh: '涮锅', en: 'Shabu-shabu' } },
      ]},
      { id: 'yanggochi', label: { ko: '양꼬치', zh: '羊肉串', en: 'Lamb Skewers' }, items: [
        { id: 'yanggochi-item', label: { ko: '양꼬치', zh: '羊肉串', en: 'Lamb Skewers' } },
        { id: 'yanggalbi', label: { ko: '양갈비', zh: '羊排', en: 'Lamb Ribs' } },
        { id: 'skewer', label: { ko: '꼬치구이', zh: '烤串', en: 'Grilled Skewers' } },
      ]},
      { id: 'dimsum', label: { ko: '딤섬', zh: '点心', en: 'Dim Sum' }, items: [
        { id: 'dimsum-item', label: { ko: '딤섬', zh: '点心', en: 'Dim Sum' } },
        { id: 'mandu', label: { ko: '만두', zh: '饺子', en: 'Dumplings' } },
        { id: 'xiaolongbao', label: { ko: '샤오롱바오', zh: '小笼包', en: 'Xiaolongbao' } },
      ]},
    ],
  },
  {
    id: 'japanese',
    icon: '🍣',
    label: { ko: '일식', zh: '日料', en: 'Japanese' },
    subcategories: [
      { id: 'ramen', label: { ko: '라멘', zh: '拉面', en: 'Ramen' }, items: [
        { id: 'ramen-item', label: { ko: '라멘', zh: '拉面', en: 'Ramen' } },
        { id: 'tsukemen', label: { ko: '츠케멘', zh: '蘸面', en: 'Tsukemen' } },
        { id: 'udon', label: { ko: '우동', zh: '乌冬面', en: 'Udon' } },
      ]},
      { id: 'sushi-omakase', label: { ko: '초밥/오마카세', zh: '寿司/Omakase', en: 'Sushi/Omakase' }, items: [
        { id: 'sushi', label: { ko: '스시', zh: '寿司', en: 'Sushi' } },
        { id: 'omakase', label: { ko: '오마카세', zh: 'Omakase', en: 'Omakase' } },
      ]},
      { id: 'donkatsu', label: { ko: '돈카츠', zh: '炸猪排', en: 'Tonkatsu' }, items: [
        { id: 'donkatsu-item', label: { ko: '돈카츠', zh: '炸猪排', en: 'Tonkatsu' } },
        { id: 'curry', label: { ko: '카레', zh: '咖喱', en: 'Curry' } },
      ]},
      { id: 'izakaya', label: { ko: '이자카야', zh: '居酒屋', en: 'Izakaya' }, items: [
        { id: 'izakaya-item', label: { ko: '이자카야', zh: '居酒屋', en: 'Izakaya' } },
        { id: 'yakitori', label: { ko: '야키토리', zh: '烤鸡串', en: 'Yakitori' } },
        { id: 'yakiniku', label: { ko: '야키니쿠', zh: '烤肉', en: 'Yakiniku' } },
      ]},
    ],
  },
  {
    id: 'western',
    icon: '🥩',
    label: { ko: '양식', zh: '西餐', en: 'Western' },
    subcategories: [
      { id: 'italian', label: { ko: '이탈리안', zh: '意餐', en: 'Italian' }, items: [
        { id: 'pasta', label: { ko: '파스타', zh: '意面', en: 'Pasta' } },
        { id: 'pizza', label: { ko: '피자', zh: '披萨', en: 'Pizza' } },
        { id: 'risotto', label: { ko: '리조또', zh: '烩饭', en: 'Risotto' } },
      ]},
      { id: 'steak', label: { ko: '스테이크', zh: '牛排', en: 'Steak' }, items: [
        { id: 'steak-item', label: { ko: '스테이크', zh: '牛排', en: 'Steak' } },
        { id: 'ribs', label: { ko: '립', zh: '肋排', en: 'Ribs' } },
        { id: 'bbq-western', label: { ko: '바비큐', zh: '烧烤', en: 'BBQ' } },
      ]},
      { id: 'brunch', label: { ko: '브런치', zh: '早午餐', en: 'Brunch' }, items: [
        { id: 'brunch-item', label: { ko: '브런치', zh: '早午餐', en: 'Brunch' } },
        { id: 'omelette', label: { ko: '오믈렛', zh: '煎蛋卷', en: 'Omelette' } },
        { id: 'pancake', label: { ko: '팬케이크', zh: '松饼', en: 'Pancake' } },
      ]},
      { id: 'burger', label: { ko: '햄버거', zh: '汉堡', en: 'Burger' }, items: [
        { id: 'craft-burger', label: { ko: '수제버거', zh: '手工汉堡', en: 'Craft Burger' } },
        { id: 'smash-burger', label: { ko: '스매시버거', zh: 'Smash汉堡', en: 'Smash Burger' } },
      ]},
      { id: 'mexican', label: { ko: '멕시칸', zh: '墨西哥菜', en: 'Mexican' }, items: [
        { id: 'taco', label: { ko: '타코', zh: '塔可', en: 'Taco' } },
        { id: 'burrito', label: { ko: '부리또', zh: '卷饼', en: 'Burrito' } },
        { id: 'nacho', label: { ko: '나초', zh: '玉米片', en: 'Nachos' } },
      ]},
      { id: 'brazilian', label: { ko: '브라질', zh: '巴西菜', en: 'Brazilian' }, items: [
        { id: 'churrasco', label: { ko: '슈하스코', zh: '巴西烤肉', en: 'Churrasco' } },
      ]},
      { id: 'spanish', label: { ko: '스페인', zh: '西班牙菜', en: 'Spanish' }, items: [
        { id: 'tapas', label: { ko: '타파스', zh: '小食', en: 'Tapas' } },
        { id: 'paella', label: { ko: '빠에야', zh: '海鲜饭', en: 'Paella' } },
      ]},
      { id: 'french', label: { ko: '프렌치', zh: '法餐', en: 'French' }, items: [
        { id: 'french-item', label: { ko: '프렌치', zh: '法餐', en: 'French' } },
        { id: 'bistro', label: { ko: '비스트로', zh: '小酒馆', en: 'Bistro' } },
      ]},
    ],
  },
  {
    id: 'asian',
    icon: '🍜',
    label: { ko: '아시안', zh: '亚洲菜', en: 'Asian' },
    subcategories: [
      { id: 'southeast', label: { ko: '동남아', zh: '东南亚', en: 'Southeast Asian' }, items: [
        { id: 'pho', label: { ko: '쌀국수', zh: '米粉', en: 'Pho' } },
        { id: 'padthai', label: { ko: '팟타이', zh: '泰式炒面', en: 'Pad Thai' } },
        { id: 'curry-asian', label: { ko: '카레', zh: '咖喱', en: 'Curry' } },
      ]},
      { id: 'indian', label: { ko: '인도', zh: '印度菜', en: 'Indian' }, items: [
        { id: 'curry-indian', label: { ko: '커리', zh: '咖喱', en: 'Curry' } },
        { id: 'naan', label: { ko: '난', zh: '馕', en: 'Naan' } },
        { id: 'tandoori', label: { ko: '탄두리', zh: '坦都里', en: 'Tandoori' } },
      ]},
      { id: 'turkish', label: { ko: '터키/중동', zh: '土耳其/中东', en: 'Turkish/Middle Eastern' }, items: [
        { id: 'kebab', label: { ko: '케밥', zh: '烤肉串', en: 'Kebab' } },
        { id: 'falafel', label: { ko: '팔라펠', zh: '炸鹰嘴豆丸', en: 'Falafel' } },
      ]},
    ],
  },
  {
    id: 'bunsik',
    icon: '🍢',
    label: { ko: '분식', zh: '小吃', en: 'Snack Bar' },
    subcategories: [
      { id: 'tteokbokki', label: { ko: '떡볶이', zh: '炒年糕', en: 'Tteokbokki' }, items: [
        { id: 'tteokbokki-item', label: { ko: '떡볶이', zh: '炒年糕', en: 'Tteokbokki' } },
        { id: 'rabokki', label: { ko: '라볶이', zh: '拉面炒年糕', en: 'Rabokki' } },
      ]},
      { id: 'gimbap', label: { ko: '김밥/만두', zh: '紫菜卷/饺子', en: 'Gimbap/Dumplings' }, items: [
        { id: 'gimbap-item', label: { ko: '김밥', zh: '紫菜卷', en: 'Gimbap' } },
        { id: 'twigim', label: { ko: '튀김', zh: '炸物', en: 'Tempura' } },
        { id: 'mandu-bunsik', label: { ko: '만두', zh: '饺子', en: 'Dumplings' } },
        { id: 'sundae', label: { ko: '순대', zh: '血肠', en: 'Sundae' } },
      ]},
    ],
  },
  {
    id: 'snack',
    icon: '🥐',
    label: { ko: '간식', zh: '零食', en: 'Snacks' },
    subcategories: [
      { id: 'bakery', label: { ko: '빵/베이커리', zh: '面包/烘焙', en: 'Bakery' }, items: [
        { id: 'bread', label: { ko: '빵', zh: '面包', en: 'Bread' } },
        { id: 'croissant', label: { ko: '크로와상', zh: '牛角包', en: 'Croissant' } },
        { id: 'salt-bread', label: { ko: '소금빵', zh: '盐面包', en: 'Salt Bread' } },
        { id: 'bagel', label: { ko: '베이글', zh: '贝果', en: 'Bagel' } },
      ]},
      { id: 'donut', label: { ko: '도넛', zh: '甜甜圈', en: 'Donut' }, items: [
        { id: 'donut-item', label: { ko: '도넛', zh: '甜甜圈', en: 'Donut' } },
        { id: 'churros', label: { ko: '츄러스', zh: '吉拿棒', en: 'Churros' } },
      ]},
      { id: 'icecream', label: { ko: '아이스크림', zh: '冰淇淋', en: 'Ice Cream' }, items: [
        { id: 'icecream-item', label: { ko: '아이스크림', zh: '冰淇淋', en: 'Ice Cream' } },
        { id: 'gelato', label: { ko: '젤라또', zh: '意式冰淇淋', en: 'Gelato' } },
        { id: 'bingsu', label: { ko: '빙수', zh: '刨冰', en: 'Bingsu' } },
      ]},
      { id: 'toast-sandwich', label: { ko: '토스트/샌드위치', zh: '吐司/三明治', en: 'Toast/Sandwich' }, items: [
        { id: 'toast', label: { ko: '토스트', zh: '吐司', en: 'Toast' } },
        { id: 'sandwich', label: { ko: '샌드위치', zh: '三明治', en: 'Sandwich' } },
      ]},
      { id: 'tteok-traditional', label: { ko: '떡/전통', zh: '年糕/传统', en: 'Rice Cake/Traditional' }, items: [
        { id: 'tteok', label: { ko: '떡', zh: '年糕', en: 'Rice Cake' } },
        { id: 'hotteok', label: { ko: '호떡', zh: '糖饼', en: 'Hotteok' } },
        { id: 'bungeoppang', label: { ko: '붕어빵', zh: '鲫鱼饼', en: 'Fish Bread' } },
        { id: 'yakgwa', label: { ko: '약과', zh: '药果', en: 'Yakgwa' } },
      ]},
      { id: 'hotdog', label: { ko: '핫도그', zh: '热狗', en: 'Hot Dog' }, items: [
        { id: 'myeongrang', label: { ko: '명랑핫도그', zh: '明朗热狗', en: 'Myeongrang Hot Dog' } },
        { id: 'corndog', label: { ko: '콘도그', zh: '玉米热狗', en: 'Corn Dog' } },
      ]},
      { id: 'waffle', label: { ko: '와플/크레이프', zh: '华夫饼/可丽饼', en: 'Waffle/Crepe' }, items: [
        { id: 'waffle-item', label: { ko: '와플', zh: '华夫饼', en: 'Waffle' } },
        { id: 'crepe', label: { ko: '크레이프', zh: '可丽饼', en: 'Crepe' } },
        { id: 'takoyaki', label: { ko: '타코야끼', zh: '章鱼小丸子', en: 'Takoyaki' } },
      ]},
    ],
  },
  {
    id: 'fastfood',
    icon: '🍔',
    label: { ko: '패스트푸드', zh: '快餐', en: 'Fast Food' },
    subcategories: [
      { id: 'burger-ff', label: { ko: '버거', zh: '汉堡', en: 'Burger' }, items: [
        { id: 'mcdonalds', label: { ko: '맥도날드', zh: '麦当劳', en: "McDonald's" } },
        { id: 'burgerking', label: { ko: '버거킹', zh: '汉堡王', en: 'Burger King' } },
        { id: 'lotteria', label: { ko: '롯데리아', zh: '乐天利', en: 'Lotteria' } },
        { id: 'shakeshack', label: { ko: '쉐이크쉑', zh: 'Shake Shack', en: 'Shake Shack' } },
        { id: 'fiveguys', label: { ko: '파이브가이즈', zh: 'Five Guys', en: 'Five Guys' } },
      ]},
      { id: 'chicken-ff', label: { ko: '치킨', zh: '炸鸡', en: 'Chicken' }, items: [
        { id: 'kfc', label: { ko: 'KFC', zh: 'KFC', en: 'KFC' } },
        { id: 'popeyes', label: { ko: '파파이스', zh: 'Popeyes', en: 'Popeyes' } },
      ]},
      { id: 'pizza-ff', label: { ko: '피자', zh: '披萨', en: 'Pizza' }, items: [
        { id: 'dominos', label: { ko: '도미노', zh: '达美乐', en: "Domino's" } },
        { id: 'pizzahut', label: { ko: '피자헛', zh: '必胜客', en: 'Pizza Hut' } },
      ]},
      { id: 'sandwich-ff', label: { ko: '샌드위치', zh: '三明治', en: 'Sandwich' }, items: [
        { id: 'subway', label: { ko: '서브웨이', zh: '赛百味', en: 'Subway' } },
      ]},
    ],
  },
  {
    id: 'cafe',
    icon: '☕',
    label: { ko: '카페/디저트', zh: '咖啡/甜点', en: 'Cafe/Dessert' },
    subcategories: [
      { id: 'cafe-sub', label: { ko: '카페', zh: '咖啡店', en: 'Cafe' }, items: [
        { id: 'coffee', label: { ko: '커피', zh: '咖啡', en: 'Coffee' } },
        { id: 'tea', label: { ko: '차', zh: '茶', en: 'Tea' } },
        { id: 'juice', label: { ko: '주스', zh: '果汁', en: 'Juice' } },
      ]},
      { id: 'dessert', label: { ko: '디저트', zh: '甜点', en: 'Dessert' }, items: [
        { id: 'cake', label: { ko: '케이크', zh: '蛋糕', en: 'Cake' } },
        { id: 'macaron', label: { ko: '마카롱', zh: '马卡龙', en: 'Macaron' } },
        { id: 'tart', label: { ko: '타르트', zh: '挞', en: 'Tart' } },
      ]},
    ],
  },
  {
    id: 'buffet',
    icon: '🍽️',
    label: { ko: '뷔페', zh: '自助餐', en: 'Buffet' },
    subcategories: [
      { id: 'hotel-buffet', label: { ko: '호텔뷔페', zh: '酒店自助', en: 'Hotel Buffet' }, items: [
        { id: 'hotel-buffet-item', label: { ko: '호텔뷔페', zh: '酒店自助', en: 'Hotel Buffet' } },
        { id: 'seafood-buffet', label: { ko: '해산물뷔페', zh: '海鲜自助', en: 'Seafood Buffet' } },
      ]},
      { id: 'meat-buffet', label: { ko: '고기뷔페', zh: '烤肉自助', en: 'Meat Buffet' }, items: [
        { id: 'meat-buffet-item', label: { ko: '고기뷔페', zh: '烤肉自助', en: 'Meat Buffet' } },
        { id: 'salad-bar', label: { ko: '샐러드바', zh: '沙拉吧', en: 'Salad Bar' } },
      ]},
    ],
  },
  {
    id: 'bar',
    icon: '🍺',
    label: { ko: '술집/바', zh: '酒吧', en: 'Bar/Pub' },
    subcategories: [
      { id: 'hof', label: { ko: '호프', zh: '啤酒屋', en: 'Beer Pub' }, items: [
        { id: 'hof-item', label: { ko: '호프', zh: '啤酒屋', en: 'Beer Pub' } },
        { id: 'chimaek', label: { ko: '치맥', zh: '炸鸡啤酒', en: 'Chimaek' } },
      ]},
      { id: 'wine-bar', label: { ko: '와인바', zh: '红酒吧', en: 'Wine Bar' }, items: [
        { id: 'wine-bar-item', label: { ko: '와인바', zh: '红酒吧', en: 'Wine Bar' } },
      ]},
      { id: 'traditional-liquor', label: { ko: '전통주', zh: '传统酒', en: 'Traditional' }, items: [
        { id: 'makgeolli', label: { ko: '막걸리', zh: '米酒', en: 'Makgeolli' } },
        { id: 'traditional-bar', label: { ko: '전통주바', zh: '传统酒吧', en: 'Traditional Bar' } },
      ]},
      { id: 'cocktail', label: { ko: '칵테일', zh: '鸡尾酒', en: 'Cocktail' }, items: [
        { id: 'cocktail-bar', label: { ko: '칵테일바', zh: '鸡尾酒吧', en: 'Cocktail Bar' } },
        { id: 'rooftop', label: { ko: '루프탑바', zh: '天台酒吧', en: 'Rooftop Bar' } },
      ]},
    ],
  },
]

/**
 * TV 맛집 채널 정보
 */
export const TV_CHANNELS = [
  {
    id: 'netflix',
    label: { ko: '넷플릭스', zh: 'Netflix', en: 'Netflix' },
    icon: '🎬',
    shows: [
      { id: 'black-white-chef', label: { ko: '흑백요리사', zh: '黑白大厨', en: 'Culinary Class Wars' } },
      { id: 'chefs-table', label: { ko: '셰프의테이블', zh: '主厨的餐桌', en: "Chef's Table" } },
    ],
  },
  {
    id: 'tvn',
    label: { ko: 'tvN', zh: 'tvN', en: 'tvN' },
    icon: '📺',
    shows: [
      { id: 'wednesday-food', label: { ko: '수요미식회', zh: '周三美食汇', en: 'Wednesday Food Talk' } },
      { id: 'line-up', label: { ko: '줄서는식당', zh: '排队餐厅', en: 'Line Up Restaurant' } },
      { id: 'amazing-sat', label: { ko: '놀라운토요일', zh: '惊人的周六', en: 'Amazing Saturday' } },
    ],
  },
  {
    id: 'sbs',
    label: { ko: 'SBS', zh: 'SBS', en: 'SBS' },
    icon: '📺',
    shows: [
      { id: 'master-life', label: { ko: '생활의달인', zh: '生活达人', en: 'Master of Living' } },
      { id: 'baek-alley', label: { ko: '백종원의골목식당', zh: '白钟元胡同餐馆', en: "Baek's Alley Restaurant" } },
      { id: 'tasty-square', label: { ko: '맛남의광장', zh: '美味广场', en: 'Tasty Square' } },
    ],
  },
  {
    id: 'kbs',
    label: { ko: 'KBS', zh: 'KBS', en: 'KBS' },
    icon: '📺',
    shows: [
      { id: 'pyeonstorang', label: { ko: '편스토랑', zh: '便餐厅', en: 'Stars Top Recipe' } },
      { id: 'live-info', label: { ko: '2TV생생정보', zh: '2TV生活信息', en: '2TV Live Info' } },
    ],
  },
  {
    id: 'mbc',
    label: { ko: 'MBC', zh: 'MBC', en: 'MBC' },
    icon: '📺',
    shows: [
      { id: 'i-live-alone', label: { ko: '나혼자산다', zh: '我独自生活', en: 'I Live Alone' } },
      { id: 'point-of-view', label: { ko: '전지적참견시점', zh: '全知干预视角', en: 'Point of Omniscient Interfere' } },
    ],
  },
  {
    id: 'youtube',
    label: { ko: '유튜브', zh: 'YouTube', en: 'YouTube' },
    icon: '▶️',
    shows: [
      { id: 'mukbang', label: { ko: '먹방크리에이터', zh: '吃播创作者', en: 'Mukbang Creator' } },
    ],
  },
]

/**
 * 카테고리 ID로 빠른 조회를 위한 flat map
 */
export const FOOD_CATEGORY_MAP = Object.fromEntries(
  FOOD_CATEGORIES.map(cat => [cat.id, cat])
)

/**
 * 기존 restaurantData의 FOOD_CATEGORIES와 호환되는 flat 리스트
 * FoodTab 드롭다운에서 사용
 */
export const FOOD_CATEGORIES_FLAT = [
  { id: 'all', label: { ko: '전체', zh: '全部', en: 'All' } },
  ...FOOD_CATEGORIES.map(cat => ({ id: cat.id, label: cat.label, icon: cat.icon })),
]
