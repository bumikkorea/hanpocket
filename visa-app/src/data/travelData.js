export const CITIES = [
  {
    id: 'seoul',
    name: { ko: '서울', zh: '首尔', en: 'Seoul' },
    image: 'https://images.unsplash.com/photo-1583167625297-fe5e39ebb0f5?w=400&h=300&fit=crop',
    description: { 
      ko: '대한민국의 수도, K-문화의 중심지. 전통과 현대가 어우러진 매력적인 도시', 
      zh: '韩国首都，K文化的中心。传统与现代交融的魅力城市', 
      en: 'Capital of Korea, the heart of K-culture. A charming city where tradition meets modernity' 
    },
    areas: [
      {
        id: 'myeongdong',
        name: { ko: '명동', zh: '明洞', en: 'Myeongdong' },
        image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
        description: { 
          ko: '쇼핑과 길거리 음식의 메카', 
          zh: '购物和街头美食的圣地', 
          en: 'Mecca of shopping and street food' 
        },
        tags: ['shopping', 'food', 'kbeauty'],
      },
      {
        id: 'gangnam',
        name: { ko: '강남', zh: '江南', en: 'Gangnam' },
        image: 'https://images.unsplash.com/photo-1598374213491-1dfbe28b1b9c?w=400&h=300&fit=crop',
        description: { 
          ko: '세련된 쇼핑과 카페의 거리', 
          zh: '时尚购物和咖啡街', 
          en: 'Stylish shopping and cafe streets' 
        },
        tags: ['shopping', 'cafe', 'fashion'],
      },
      {
        id: 'hongdae',
        name: { ko: '홍대', zh: '弘大', en: 'Hongdae' },
        image: 'https://images.unsplash.com/photo-1583167625297-fe5e39ebb0f5?w=400&h=300&fit=crop',
        description: { 
          ko: '젊음과 예술이 살아있는 클럽 문화의 중심', 
          zh: '青春艺术与夜生活文化的中心', 
          en: 'Center of youthful art and nightlife culture' 
        },
        tags: ['nightlife', 'art', 'music'],
      },
      {
        id: 'itaewon',
        name: { ko: '이태원', zh: '梨泰院', en: 'Itaewon' },
        image: 'https://images.unsplash.com/photo-1578037571214-25e07a2bfb89?w=400&h=300&fit=crop',
        description: { 
          ko: '세계 각국의 음식과 문화가 만나는 곳', 
          zh: '世界各国美食与文化交汇的地方', 
          en: 'Where global cuisine and culture meet' 
        },
        tags: ['international', 'food', 'culture'],
      },
      {
        id: 'seongsu',
        name: { ko: '성수', zh: '圣水', en: 'Seongsu' },
        image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
        description: { 
          ko: '힙한 카페와 갤러리가 즐비한 문화 공간', 
          zh: '时尚咖啡厅和画廊聚集的文化空间', 
          en: 'Cultural space filled with hip cafes and galleries' 
        },
        tags: ['cafe', 'art', 'culture'],
      },
      {
        id: 'bukchon',
        name: { ko: '북촌', zh: '北村', en: 'Bukchon' },
        image: 'https://images.unsplash.com/photo-1578037571214-25e07a2bfb89?w=400&h=300&fit=crop',
        description: { 
          ko: '전통 한옥과 현대 문화가 조화된 역사적 공간', 
          zh: '传统韩屋与现代文化和谐共存的历史空间', 
          en: 'Historic space where traditional hanok meets modern culture' 
        },
        tags: ['traditional', 'hanok', 'history'],
      },
    ],
    spots: [
      // 명동 스팟
      {
        id: 'myeonggyoja',
        name: { ko: '명동교자', zh: '明洞饺子', en: 'Myeongdong Kyoja' },
        area: 'myeongdong',
        category: 'food',
        image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop'
        ],
        rating: 4.5,
        reviewCount: 2340,
        priceRange: 1,
        price: '₩10,000~',
        address: { ko: '서울 중구 명동10길 29', zh: '首尔市中区明洞10街29号', en: '29, Myeongdong 10-gil, Jung-gu, Seoul' },
        hours: '10:30 - 21:00',
        description: { 
          ko: '1966년 개업한 칼국수와 만두 맛집. 깔끔한 육수와 쫄깃한 면발로 유명', 
          zh: '1966年开业的刀削面和饺子名店。以清爽的汤头和劲道的面条闻名', 
          en: 'Famous noodle and dumpling restaurant established in 1966. Known for clear broth and chewy noodles' 
        },
        tags: ['미슐랭빕', '칼국수', '만두'],
        kakaoMapUrl: 'https://place.map.kakao.com/8393463',
        relatedPhrases: 'restaurant',
      },
      {
        id: 'nseoultower',
        name: { ko: 'N서울타워', zh: 'N首尔塔', en: 'N Seoul Tower' },
        area: 'myeongdong',
        category: 'attraction',
        image: 'https://images.unsplash.com/photo-1583167625297-fe5e39ebb0f5?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1583167625297-fe5e39ebb0f5?w=400&h=300&fit=crop'
        ],
        rating: 4.2,
        reviewCount: 8520,
        priceRange: 2,
        price: '₩16,000~',
        address: { ko: '서울 용산구 남산공원길 105', zh: '首尔市龙山区南山公园路105号', en: '105, Namsangongwon-gil, Yongsan-gu, Seoul' },
        hours: '10:00 - 23:00',
        description: { 
          ko: '서울의 대표 랜드마크. 360도 서울 시내 전망을 감상할 수 있는 전망대', 
          zh: '首尔的代表性地标。可以360度俯瞰首尔市区的观景台', 
          en: 'Seoul\'s iconic landmark. Observatory offering 360-degree views of Seoul' 
        },
        tags: ['랜드마크', '전망대', '야경'],
        kakaoMapUrl: 'https://place.map.kakao.com/7886717',
        relatedPhrases: 'tourist',
      },
      
      // 강남 스팟
      {
        id: 'garosugil',
        name: { ko: '가로수길', zh: '林荫大道', en: 'Garosu-gil' },
        area: 'gangnam',
        category: 'shopping',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'
        ],
        rating: 4.3,
        reviewCount: 1850,
        priceRange: 3,
        price: '₩50,000~',
        address: { ko: '서울 강남구 신사동 가로수길', zh: '首尔市江南区新沙洞林荫大道', en: 'Garosu-gil, Sinsa-dong, Gangnam-gu, Seoul' },
        hours: '11:00 - 22:00',
        description: { 
          ko: '트렌디한 패션 부티크와 카페가 즐비한 쇼핑 거리', 
          zh: '汇聚时尚精品店和咖啡厅的购物街', 
          en: 'Shopping street lined with trendy fashion boutiques and cafes' 
        },
        tags: ['패션', '쇼핑', '카페'],
        kakaoMapUrl: 'https://place.map.kakao.com/26910191',
        relatedPhrases: 'shopping',
      },
      {
        id: 'coex',
        name: { ko: '코엑스', zh: 'COEX', en: 'COEX' },
        area: 'gangnam',
        category: 'experience',
        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
        ],
        rating: 4.1,
        reviewCount: 3240,
        priceRange: 2,
        price: '₩5,000~',
        address: { ko: '서울 강남구 영동대로 513', zh: '首尔市江南区永东大路513号', en: '513, Yeongdong-daero, Gangnam-gu, Seoul' },
        hours: '10:00 - 22:00',
        description: { 
          ko: '아시아 최대 지하 쇼핑몰과 수족관, 전시장이 한곳에', 
          zh: '亚洲最大地下购物中心，集水族馆和展览场所于一体', 
          en: 'Asia\'s largest underground shopping mall with aquarium and exhibition spaces' 
        },
        tags: ['쇼핑몰', '수족관', '전시'],
        kakaoMapUrl: 'https://place.map.kakao.com/7891572',
        relatedPhrases: 'tourist',
      },

      // 홍대 스팟
      {
        id: 'yeonnamdong-cafe',
        name: { ko: '연남동 카페거리', zh: '延南洞咖啡街', en: 'Yeonnam-dong Cafe Street' },
        area: 'hongdae',
        category: 'cafe',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop'
        ],
        rating: 4.4,
        reviewCount: 920,
        priceRange: 2,
        price: '₩6,000~',
        address: { ko: '서울 마포구 연남동', zh: '首尔市麻浦区延南洞', en: 'Yeonnam-dong, Mapo-gu, Seoul' },
        hours: '09:00 - 22:00',
        description: { 
          ko: '감성적인 인디카페들이 모여있는 연남동의 대표 카페거리', 
          zh: '聚集了感性独立咖啡厅的延南洞代表咖啡街', 
          en: 'Representative cafe street in Yeonnam-dong with emotional indie cafes' 
        },
        tags: ['카페', '감성', '인디'],
        kakaoMapUrl: 'https://place.map.kakao.com/1450287307',
        relatedPhrases: 'cafe',
      },
      {
        id: 'hongdae-playground',
        name: { ko: '홍대놀이터', zh: '弘大游乐场', en: 'Hongdae Playground' },
        area: 'hongdae',
        category: 'experience',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop'
        ],
        rating: 4.0,
        reviewCount: 1560,
        priceRange: 1,
        price: '무료',
        address: { ko: '서울 마포구 와우산로 홍대놀이터', zh: '首尔市麻浦区卧牛山路弘大游乐场', en: 'Hongdae Playground, Wausan-ro, Mapo-gu, Seoul' },
        hours: '24시간',
        description: { 
          ko: '대학생들의 만남의 장소이자 버스킹과 클럽 문화의 중심지', 
          zh: '大学生聚会场所，街头表演和俱乐部文化的中心地', 
          en: 'Meeting place for students and center of busking and club culture' 
        },
        tags: ['버스킹', '클럽', '대학가'],
        kakaoMapUrl: 'https://place.map.kakao.com/21736023',
        relatedPhrases: 'tourist',
      },

      // 이태원 스팟
      {
        id: 'gyeongridan-gil',
        name: { ko: '경리단길', zh: '经理团路', en: 'Gyeongridan-gil' },
        area: 'itaewon',
        category: 'food',
        image: 'https://images.unsplash.com/photo-1540914124281-342587941389?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1540914124281-342587941389?w=400&h=300&fit=crop'
        ],
        rating: 4.5,
        reviewCount: 2180,
        priceRange: 3,
        price: '₩25,000~',
        address: { ko: '서울 용산구 경리단길', zh: '首尔市龙山区经理团路', en: 'Gyeongridan-gil, Yongsan-gu, Seoul' },
        hours: '11:00 - 24:00',
        description: { 
          ko: '세계 각국의 맛있는 음식과 트렌디한 바가 모여있는 맛집 거리', 
          zh: '汇聚世界各国美食和时尚酒吧的美食街', 
          en: 'Gourmet street with delicious international cuisine and trendy bars' 
        },
        tags: ['세계음식', '바', '분위기'],
        kakaoMapUrl: 'https://place.map.kakao.com/2088849642',
        relatedPhrases: 'restaurant',
      },
      {
        id: 'itaewon-antique',
        name: { ko: '이태원 앤틱거리', zh: '梨泰院古董街', en: 'Itaewon Antique Street' },
        area: 'itaewon',
        category: 'shopping',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
        ],
        rating: 4.2,
        reviewCount: 680,
        priceRange: 3,
        price: '₩20,000~',
        address: { ko: '서울 용산구 이태원로', zh: '首尔市龙山区梨泰院路', en: 'Itaewon-ro, Yongsan-gu, Seoul' },
        hours: '10:00 - 20:00',
        description: { 
          ko: '독특한 앤틱 소품과 빈티지 아이템을 찾을 수 있는 쇼핑 거리', 
          zh: '可以找到独特古董小饰品和复古物品的购物街', 
          en: 'Shopping street where you can find unique antique accessories and vintage items' 
        },
        tags: ['앤틱', '빈티지', '소품'],
        kakaoMapUrl: 'https://place.map.kakao.com/2088849642',
        relatedPhrases: 'shopping',
      },

      // 성수 스팟
      {
        id: 'seongsu-union',
        name: { ko: '성수연방', zh: '圣水联邦', en: 'Seongsu Union' },
        area: 'seongsu',
        category: 'cafe',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop'
        ],
        rating: 4.3,
        reviewCount: 1240,
        priceRange: 2,
        price: '₩7,000~',
        address: { ko: '서울 성동구 성수동2가', zh: '首尔市城东区圣水洞2街', en: 'Seongsu-dong 2-ga, Seongdong-gu, Seoul' },
        hours: '08:00 - 22:00',
        description: { 
          ko: '공장을 개조한 독특한 인테리어의 대형 카페', 
          zh: '改造工厂的独特内装大型咖啡厅', 
          en: 'Large cafe with unique interior design converted from a factory' 
        },
        tags: ['공장카페', '인테리어', '대형'],
        kakaoMapUrl: 'https://place.map.kakao.com/1026854675',
        relatedPhrases: 'cafe',
      },
      {
        id: 'daelim-warehouse',
        name: { ko: '대림창고갤러리', zh: '大林仓库画廊', en: 'Daelim Warehouse Gallery' },
        area: 'seongsu',
        category: 'attraction',
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop'
        ],
        rating: 4.6,
        reviewCount: 890,
        priceRange: 2,
        price: '₩12,000~',
        address: { ko: '서울 종로구 자하문로4길 21', zh: '首尔市钟路区紫霞门路4街21号', en: '21, Jahamun-ro 4-gil, Jongno-gu, Seoul' },
        hours: '10:00 - 19:00',
        description: { 
          ko: '현대미술 전시와 사진 전시로 유명한 갤러리', 
          zh: '以现代美术展和摄影展闻名的画廊', 
          en: 'Gallery famous for contemporary art and photography exhibitions' 
        },
        tags: ['갤러리', '현대미술', '사진'],
        kakaoMapUrl: 'https://place.map.kakao.com/27240264',
        relatedPhrases: 'tourist',
      },

      // 북촌 스팟
      {
        id: 'bukchon-hanok',
        name: { ko: '북촌한옥마을', zh: '北村韩屋村', en: 'Bukchon Hanok Village' },
        area: 'bukchon',
        category: 'attraction',
        image: 'https://images.unsplash.com/photo-1578037571214-25e07a2bfb89?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1578037571214-25e07a2bfb89?w=400&h=300&fit=crop'
        ],
        rating: 4.4,
        reviewCount: 5620,
        priceRange: 1,
        price: '무료',
        address: { ko: '서울 종로구 계동길', zh: '首尔市钟路区桂洞路', en: 'Gyedong-gil, Jongno-gu, Seoul' },
        hours: '24시간',
        description: { 
          ko: '조선시대 한옥이 그대로 보존된 전통 마을. 한복을 입고 산책하기 좋은 곳', 
          zh: '保存完好的朝鲜时代韩屋传统村落。适合穿韩服散步的地方', 
          en: 'Traditional village where Joseon-era hanok are preserved. Perfect for strolling in hanbok' 
        },
        tags: ['한옥', '전통', '한복'],
        kakaoMapUrl: 'https://place.map.kakao.com/8051099',
        relatedPhrases: 'tourist',
      },
      {
        id: 'changdeokgung',
        name: { ko: '창덕궁', zh: '昌德宫', en: 'Changdeokgung Palace' },
        area: 'bukchon',
        category: 'attraction',
        image: 'https://images.unsplash.com/photo-1578037571214-25e07a2bfb89?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1578037571214-25e07a2bfb89?w=400&h=300&fit=crop'
        ],
        rating: 4.5,
        reviewCount: 3850,
        priceRange: 1,
        price: '₩3,000~',
        address: { ko: '서울 종로구 율곡로 99', zh: '首尔市钟路区栗谷路99号', en: '99, Yulgok-ro, Jongno-gu, Seoul' },
        hours: '09:00 - 18:00',
        description: { 
          ko: '유네스코 세계문화유산으로 지정된 조선시대 궁궐. 비원이 특히 아름다움', 
          zh: '被联合国教科文组织指定为世界文化遗产的朝鲜时代宫殿。后苑尤其美丽', 
          en: 'Joseon Dynasty palace designated as UNESCO World Heritage. The Secret Garden is especially beautiful' 
        },
        tags: ['궁궐', '유네스코', '비원'],
        kakaoMapUrl: 'https://place.map.kakao.com/8140855',
        relatedPhrases: 'tourist',
      },
    ],
  },
  // 추후 부산, 제주 등 다른 도시 추가 예정
]

export default CITIES