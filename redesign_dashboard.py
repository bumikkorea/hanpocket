#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
미국주식 대시보드 HTML 리디자인 스크립트
- 히트맵 테이블을 4컬럼에서 6컬럼으로 확장
- RS 차트를 심플화 (TOP 20 + BOTTOM 5)
- 모바일 CSS 보강
"""

import re
from bs4 import BeautifulSoup
import json

# 한글 회사명 매핑
KOREAN_NAMES = {
    'AAPL': '애플', 'MSFT': '마이크로소프트', 'NVDA': '엔비디아', 'AVGO': '브로드컴', 'AMZN': '아마존',
    'META': '메타', 'GOOGL': '알파벳A', 'GOOG': '알파벳C', 'TSLA': '테슬라', 'COST': '코스트코',
    'NFLX': '넷플릭스', 'TMUS': '티모바일', 'ASML': 'ASML', 'AMD': 'AMD', 'QCOM': '퀄컴',
    'TXN': '텍사스인스트루먼트', 'PEP': '펩시코', 'ADI': '아날로그디바이스', 'INTU': '인튜이트', 'AMAT': '어플라이드머티어리얼즈',
    'ISRG': '인튜이티브서지컬', 'CMCSA': '컴캐스트', 'MU': '마이크론', 'BKNG': '부킹홀딩스', 'LRCX': '램리서치',
    'HON': '허니웰', 'ADBE': '어도비', 'REGN': '리제네론', 'VRTX': '버텍스', 'PANW': '팔로알토네트웍스',
    'SNPS': '시놉시스', 'CDNS': '케이던스', 'MDLZ': '몬데렐즈', 'KLAC': 'KLA', 'ORLY': '오라일리',
    'MELI': '메르카도리브레', 'MAR': '메리어트', 'CTAS': '신타스', 'CRWD': '크라우드스트라이크',
    'ABNB': '에어비앤비', 'DASH': '도어대시', 'WDAY': '워크데이', 'TEAM': '아틀라시안', 'ROP': '로퍼테크놀로지',
    'PAYX': '페이첵스', 'MRVL': '마벨테크놀로지', 'ADSK': '오토데스크', 'PCAR': '파카', 'MNST': '몬스터베버리지',
    'CPRT': '코파트', 'SBUX': '스타벅스', 'FAST': '파스날', 'IDXX': '아이덱스', 'EXC': '엑셀론',
    'AEP': '아메리칸일렉트릭파워', 'CEG': '컨스텔레이션에너지', 'XEL': '엑셀에너지', 'DXCM': '덱스콤', 'BKR': '베이커휴즈',
    'FANG': '다이아몬드백에너지', 'KHC': '크래프트하인즈', 'KDP': '큐릭닥터페퍼', 'ALNY': '알닐람', 'WBD': '워너브라더스',
    'PDD': '핀둬둬', 'PLTR': '팔란티어', 'ARM': '암홀딩스', 'APP': '앱러빈', 'AXON': '액손',
    'DDOG': '데이터독', 'GEHC': 'GE헬스케어', 'STX': '씨게이트', 'VRSK': '베리스크', 'WDC': '웨스턴디지털',
    'ZS': '지스케일러', 'CSX': 'CSX', 'ODFL': '올드도미니언', 'CHTR': '차터커뮤니케이션', 'GILD': '길리어드',
    'CCEP': '코카콜라유로퍼시픽', 'CTSH': '코그니전트'
}

def extract_js_data(html_content):
    """HTML에서 const d = {...} 데이터를 추출"""
    pattern = r'const d = ({.*?});'
    match = re.search(pattern, html_content, re.DOTALL)
    if match:
        try:
            data_str = match.group(1)
            return json.loads(data_str)
        except json.JSONDecodeError:
            print("JSON 파싱 실패")
            return None
    return None

def format_value(value, format_type):
    """값을 포맷에 맞게 변환"""
    if format_type == 'dev':
        return f"+{value:.1f}%" if value >= 0 else f"{value:.1f}%"
    elif format_type == 'pb':
        return f"{value:.2f}"
    elif format_type == 'stoch':
        return f"{int(value)}"
    elif format_type == 'vol_ratio':
        return f"{value:.1f}x"
    elif format_type == 'score':
        return f"{int(value)}/5"
    return str(value)

def get_score_color(score):
    """점수에 따른 색상 클래스 반환"""
    if score >= 4:
        return "tag-danger"
    elif score >= 2:
        return "tag-warn"
    else:
        return "tag-safe"

def update_table_header(soup):
    """테이블 헤더를 6컬럼으로 확장"""
    thead = soup.find('thead')
    if thead:
        tr = thead.find('tr')
        if tr:
            tr.clear()
            # 새 헤더 컬럼들
            columns = ['Ticker', 'RSI', 'DEV', 'BB%', 'STOCH', 'VOL', 'SCORE']
            for col in columns:
                th = soup.new_tag('th')
                th.string = col
                tr.append(th)

def update_stock_rows(soup, stocks_data):
    """기존 stock-row들에 추가 데이터 컬럼 삽입"""
    # 데이터를 ticker로 인덱싱
    data_map = {stock['ticker']: stock for stock in stocks_data}
    
    # 모든 stock-row 찾기
    stock_rows = soup.find_all('tr', class_='stock-row')
    
    for row in stock_rows:
        ticker_elem = row.find('span', class_='stock-ticker')
        if not ticker_elem:
            continue
            
        ticker = ticker_elem.get_text().strip()
        stock_data = data_map.get(ticker)
        
        if not stock_data:
            continue
        
        # 기존 td들 찾기
        tds = row.find_all('td')
        if len(tds) < 4:  # Ticker, RSI, Vol, Score
            continue
        
        # 새로운 행 구성: Ticker, RSI, DEV, BB%, STOCH, VOL, SCORE
        # 기존: Ticker(0), RSI(1), Vol(2), Score(3)
        # 새로운: Ticker(0), RSI(1), DEV, BB%, STOCH, VOL(기존Vol), SCORE(기존Score)
        
        # DEV 컬럼 추가 (RSI 다음)
        dev_td = soup.new_tag('td', **{'class': 'col-num'})
        dev_td.string = format_value(stock_data['dev'], 'dev')
        
        # BB% 컬럼 추가
        pb_td = soup.new_tag('td', **{'class': 'col-num'})
        pb_td.string = format_value(stock_data['pb'], 'pb')
        
        # STOCH 컬럼 추가
        stoch_td = soup.new_tag('td', **{'class': 'col-num'})
        stoch_td.string = format_value(stock_data['stoch'], 'stoch')
        
        # 기존 Vol 컬럼 업데이트 (Vol ratio로)
        vol_td = tds[2]  # 기존 Vol 컬럼
        vol_td.string = format_value(stock_data['vol_ratio'], 'vol_ratio')
        
        # 기존 Score 컬럼 업데이트 (heat로)
        score_td = tds[3]  # 기존 Score 컬럼
        score_span = score_td.find('span')
        if score_span:
            score_span.string = format_value(stock_data['heat'], 'score')
            # 색상 클래스 업데이트
            score_span['class'] = [get_score_color(stock_data['heat'])]
        
        # 새 컬럼들을 RSI 다음에 삽입
        rsi_td = tds[1]
        rsi_td.insert_after(stoch_td)
        rsi_td.insert_after(pb_td)
        rsi_td.insert_after(dev_td)

def update_sector_header_colspan(soup):
    """섹터 헤더의 colspan을 7로 업데이트"""
    sec_rows = soup.find_all('tr', class_='sec-row')
    for row in sec_rows:
        td = row.find('td')
        if td:
            td['colspan'] = '7'

def generate_simple_rs_chart_js(stocks_data):
    """간단화된 RS 차트 생성 JavaScript"""
    # RS 값으로 정렬
    sorted_stocks = sorted(stocks_data, key=lambda x: x['rs_val'], reverse=True)
    
    # TOP 20과 BOTTOM 5 선택
    top_20 = sorted_stocks[:20]
    bottom_5 = sorted_stocks[-5:]
    
    js_code = """
    // RS 차트 심플화
    function updateSimpleRSChart() {
        const rsContainer = document.querySelector('.rs-row').parentElement;
        if (!rsContainer) return;
        
        // 기존 모든 rs-row 제거
        const oldRows = rsContainer.querySelectorAll('.rs-row');
        oldRows.forEach(row => row.remove());
        
        const stocks = """ + json.dumps(stocks_data, ensure_ascii=False) + """;
        const koreanNames = """ + json.dumps(KOREAN_NAMES, ensure_ascii=False) + """;
        
        // RS값으로 정렬
        const sortedStocks = stocks.sort((a, b) => b.rs_val - a.rs_val);
        const top20 = sortedStocks.slice(0, 20);
        const bottom5 = sortedStocks.slice(-5);
        
        // TOP 20 섹션 헤더
        const topHeader = document.createElement('div');
        topHeader.style.cssText = 'font-size: 14px; font-weight: bold; color: var(--up); margin: 15px 0 10px 0; padding: 8px; background: #fff5f5; border-radius: 6px; border-left: 4px solid var(--up);';
        topHeader.innerHTML = '▲ TOP 20 (상대강도 상위)';
        rsContainer.appendChild(topHeader);
        
        // TOP 20 렌더링
        top20.forEach(stock => {
            const row = createSimpleRSRow(stock, koreanNames);
            rsContainer.appendChild(row);
        });
        
        // 구분선
        const divider = document.createElement('div');
        divider.style.cssText = 'margin: 20px 0; border-top: 2px dotted #ccc; position: relative;';
        divider.innerHTML = '<span style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: var(--bg); padding: 0 10px; font-size: 10px; color: var(--text-sub);">• • •</span>';
        rsContainer.appendChild(divider);
        
        // BOTTOM 5 섹션 헤더
        const bottomHeader = document.createElement('div');
        bottomHeader.style.cssText = 'font-size: 14px; font-weight: bold; color: var(--down); margin: 15px 0 10px 0; padding: 8px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid var(--down);';
        bottomHeader.innerHTML = '▼ BOTTOM 5 (상대강도 하위)';
        rsContainer.appendChild(bottomHeader);
        
        // BOTTOM 5 렌더링
        bottom5.forEach(stock => {
            const row = createSimpleRSRow(stock, koreanNames);
            rsContainer.appendChild(row);
        });
    }
    
    function createSimpleRSRow(stock, koreanNames) {
        const row = document.createElement('div');
        row.className = 'rs-row';
        row.style.cssText = 'display: flex; align-items: center; margin-bottom: 8px; font-size: 11px; padding: 6px 0; border-bottom: 1px solid #f5f5f5;';
        
        const koName = koreanNames[stock.ticker] || stock.name;
        const rsVal = stock.rs_val;
        const isPositive = rsVal >= 0;
        const color = isPositive ? 'var(--up)' : 'var(--down)';
        const sign = isPositive ? '+' : '';
        
        // 바 너비 계산 (최대 100px, 최소 5px)
        const maxVal = 40; // 최대 RS 값 추정
        const barWidth = Math.max(5, Math.min(100, Math.abs(rsVal) / maxVal * 100));
        
        row.innerHTML = `
            <div style="width: 140px; flex-shrink: 0;">
                <div style="font-weight: 700; color: #000; font-size: 12px;">${stock.ticker}</div>
                <div style="font-size: 10px; color: ${color}; font-weight: 600;">${koName}</div>
            </div>
            <div style="flex: 1; margin: 0 12px; position: relative;">
                <div style="width: ${barWidth}px; height: 8px; background: ${color}; border-radius: 4px; opacity: 0.8;"></div>
            </div>
            <div style="width: 50px; text-align: right; font-weight: 700; color: ${color}; font-size: 11px;">
                ${sign}${rsVal.toFixed(1)}%
            </div>
        `;
        
        return row;
    }
    
    // 페이지 로드 시 실행
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(updateSimpleRSChart, 100);
    });
    """
    
    return js_code

def add_mobile_css(soup):
    """모바일 CSS 보강"""
    # 기존 style 태그 찾기
    style_tag = soup.find('style')
    if not style_tag:
        return
    
    # 추가 모바일 CSS
    mobile_css = """

/* 테이블 모바일 최적화 */
@media (max-width: 768px) {
    .table-wrap { 
        overflow-x: auto !important; 
        -webkit-overflow-scrolling: touch; 
        max-width: calc(100vw - 36px) !important; 
    }
    .table-wrap table { 
        min-width: 600px !important; /* 6컬럼 대응 */
    }
    
    /* 컬럼 최소 너비 설정 */
    thead th:nth-child(1) { min-width: 80px; } /* Ticker */
    thead th:nth-child(2) { min-width: 50px; } /* RSI */
    thead th:nth-child(3) { min-width: 60px; } /* DEV */
    thead th:nth-child(4) { min-width: 50px; } /* BB% */
    thead th:nth-child(5) { min-width: 60px; } /* STOCH */
    thead th:nth-child(6) { min-width: 50px; } /* VOL */
    thead th:nth-child(7) { min-width: 60px; } /* SCORE */
    
    tbody td:nth-child(1) { min-width: 80px; }
    tbody td:nth-child(2) { min-width: 50px; }
    tbody td:nth-child(3) { min-width: 60px; }
    tbody td:nth-child(4) { min-width: 50px; }
    tbody td:nth-child(5) { min-width: 60px; }
    tbody td:nth-child(6) { min-width: 50px; }
    tbody td:nth-child(7) { min-width: 60px; }
    
    /* RS 차트는 이제 25개뿐이니 스크롤 짧음 */
    .rs-row {
        display: flex !important;
        align-items: center !important;
        margin-bottom: 8px !important;
        padding: 8px !important;
        background: #fafafa !important;
        border-radius: 6px !important;
        border: 1px solid #eee !important;
    }
}

@media (max-width: 480px) {
    .table-wrap { max-width: calc(100vw - 16px) !important; }
    .rs-row { padding: 6px !important; margin-bottom: 6px !important; }
}
"""
    
    # 기존 스타일에 추가
    style_tag.string = style_tag.string + mobile_css

def main():
    """메인 함수"""
    html_file = "/mnt/d/주식분석기/2026년 2월 25일 미국주식 분석 대시보드_260225.html"
    
    print("HTML 파일 읽는 중...")
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # JavaScript 데이터 추출
    print("JavaScript 데이터 추출 중...")
    js_data = extract_js_data(html_content)
    if not js_data or 'stocks' not in js_data:
        print("데이터 추출 실패")
        return
    
    stocks_data = js_data['stocks']
    print(f"종목 데이터 {len(stocks_data)}개 추출 완료")
    
    # HTML 파싱
    print("HTML 파싱 중...")
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # 1. 테이블 헤더 업데이트 (4컬럼 → 6컬럼)
    print("테이블 헤더 업데이트 중...")
    update_table_header(soup)
    
    # 2. 섹터 헤더 colspan 업데이트
    print("섹터 헤더 colspan 업데이트 중...")
    update_sector_header_colspan(soup)
    
    # 3. 기존 stock-row들에 추가 데이터 삽입
    print("종목 행 데이터 업데이트 중...")
    update_stock_rows(soup, stocks_data)
    
    # 4. 모바일 CSS 추가
    print("모바일 CSS 추가 중...")
    add_mobile_css(soup)
    
    # 5. RS 차트 심플화 JavaScript 추가
    print("RS 차트 심플화 JavaScript 추가 중...")
    rs_js = generate_simple_rs_chart_js(stocks_data)
    
    # </script> 태그 바로 전에 새 JS 추가
    script_tag = soup.find('script')
    if script_tag:
        # 새 스크립트 태그 생성
        new_script = soup.new_tag('script')
        new_script.string = rs_js
        script_tag.insert_before(new_script)
    
    # 수정된 HTML 저장
    output_file = html_file.replace('.html', '_redesigned.html')
    print(f"수정된 HTML 저장 중: {output_file}")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(str(soup.prettify()))
    
    print("✅ 리디자인 완료!")
    print(f"📁 출력 파일: {output_file}")
    
    return output_file

if __name__ == "__main__":
    main()