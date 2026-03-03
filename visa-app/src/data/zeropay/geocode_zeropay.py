#!/usr/bin/env python3
"""
제로페이 가맹점 지오코딩 스크립트
카카오 API를 사용하여 주소를 위도/경도로 변환
"""

import json
import requests
import time
import os
from urllib.parse import quote

# 카카오 API 설정
KAKAO_API_KEY = "6afa9f63ce3a224ae93a8f315248d98a"
KAKAO_API_URL = "https://dapi.kakao.com/v2/local/search/address.json"

# 제한 설정
MAX_DAILY_REQUESTS = 80000
REQUESTS_PER_SECOND = 10
SLEEP_TIME = 0.11  # 초당 10건 제한을 위한 대기 시간

def geocode_address(address):
    """카카오 API로 주소를 지오코딩"""
    try:
        headers = {
            "Authorization": f"KakaoAK {KAKAO_API_KEY}"
        }
        
        params = {
            "query": address
        }
        
        response = requests.get(KAKAO_API_URL, headers=headers, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        if data["documents"]:
            # 첫 번째 결과 사용
            doc = data["documents"][0]
            lat = float(doc["y"])
            lng = float(doc["x"])
            return lat, lng
        else:
            print(f"⚠️  주소를 찾을 수 없음: {address}")
            return None, None
            
    except Exception as e:
        print(f"❌ API 오류 ({address}): {str(e)}")
        return None, None

def is_seoul_address(address):
    """서울 주소인지 확인"""
    return address.startswith("서울특별시") or address.startswith("서울시")

def main():
    print("🗺️  제로페이 가맹점 지오코딩 시작")
    
    # 원본 데이터 로드
    input_file = "/home/theredboat_ai/.openclaw/workspace/visa-app/src/data/zeropay/zeropay_all_raw.json"
    
    with open(input_file, 'r', encoding='utf-8') as f:
        stores = json.load(f)
    
    print(f"📊 총 {len(stores)}개 가맹점 로드")
    
    # 결과 저장용 리스트
    geocoded_all = []
    geocoded_seoul = []
    
    # API 요청 카운터
    request_count = 0
    success_count = 0
    fail_count = 0
    
    for i, store in enumerate(stores):
        # 일일 요청 한도 체크
        if request_count >= MAX_DAILY_REQUESTS:
            print(f"💰 일일 요청 한도 {MAX_DAILY_REQUESTS}건 도달! 중단합니다.")
            break
            
        address = store.get("BZPL_ADDR", "").strip()
        if not address:
            print(f"⚠️  주소 누락: {store.get('FRCS_KORN_NM', 'Unknown')}")
            continue
        
        print(f"[{i+1}/{len(stores)}] {store.get('FRCS_KORN_NM', 'Unknown')} - {address}")
        
        # 지오코딩 수행
        lat, lng = geocode_address(address)
        request_count += 1
        
        # 결과 객체 생성
        result_store = {
            "name": store.get("FRCS_KORN_NM", ""),
            "address": address,
            "lat": lat,
            "lng": lng,
            "phone": f"{store.get('FRCS_TELNO1', '')}-{store.get('FRCS_TELNO2', '')}-{store.get('FRCS_TELNO3', '')}".replace("--", ""),
            "biz_type": store.get("BZCDT_NM", ""),
            "reg_date": store.get("REG_YMD", ""),
            "is_seoul": is_seoul_address(address)
        }
        
        if lat is not None and lng is not None:
            success_count += 1
        else:
            fail_count += 1
        
        geocoded_all.append(result_store)
        
        # 서울 가맹점만 따로 저장
        if result_store["is_seoul"]:
            geocoded_seoul.append(result_store)
        
        # 속도 제한 (초당 10건)
        time.sleep(SLEEP_TIME)
        
        # 진행 상황 출력 (100건마다)
        if (i + 1) % 100 == 0:
            print(f"📍 진행: {i+1}/{len(stores)}, 성공: {success_count}, 실패: {fail_count}, API 요청: {request_count}")
    
    # 결과 파일 저장
    output_dir = "/home/theredboat_ai/.openclaw/workspace/visa-app/src/data/zeropay/"
    
    # 1. 전체 결과 저장
    all_file = os.path.join(output_dir, "zeropay_geocoded_all.json")
    with open(all_file, 'w', encoding='utf-8') as f:
        json.dump(geocoded_all, f, ensure_ascii=False, indent=2)
    
    # 2. 서울만 저장
    seoul_file = os.path.join(output_dir, "zeropay_geocoded_seoul.json")
    with open(seoul_file, 'w', encoding='utf-8') as f:
        json.dump(geocoded_seoul, f, ensure_ascii=False, indent=2)
    
    # 3. JavaScript 파일 생성
    js_file = os.path.join(output_dir, "zeropayData.js")
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write("// 제로페이 가맹점 데이터 (지오코딩 완료)\n")
        f.write("// 자동 생성됨 - 수정하지 마세요\n\n")
        f.write(f"export const zeropayStores = {json.dumps(geocoded_all, ensure_ascii=False, indent=2)};\n\n")
        f.write(f"export const zeropaySeoul = {json.dumps(geocoded_seoul, ensure_ascii=False, indent=2)};\n")
    
    # 최종 결과 출력
    seoul_count = len(geocoded_seoul)
    total_count = len(geocoded_all)
    
    print("\n🎉 지오코딩 완료!")
    print(f"📊 총 처리: {total_count}개")
    print(f"📊 성공: {success_count}개")
    print(f"📊 실패: {fail_count}개")
    print(f"📊 서울 가맹점: {seoul_count}개")
    print(f"📊 API 요청 수: {request_count}개")
    print("\n📁 생성된 파일:")
    print(f"   - {all_file}")
    print(f"   - {seoul_file}")
    print(f"   - {js_file}")

if __name__ == "__main__":
    main()