# HanPocket 배포 가이드 (5분)

## 1단계: GitHub 저장소 만들기 (2분)
1. https://github.com/new 접속
2. Repository name: `hanpocket`
3. Private 선택
4. Create repository 클릭
5. 나온 화면에서 HTTPS 주소 복사 (https://github.com/범범뻠아이디/hanpocket.git)

## 2단계: 코드 푸시 (1분)
터미널에서 (구월이 대신 해줄 수 있음):
```bash
cd /home/theredboat_ai/.openclaw/workspace/visa-app
git remote add origin https://github.com/범범뻠아이디/hanpocket.git
git branch -M main
git push -u origin main
```
GitHub 로그인 팝업 뜨면 로그인

## 3단계: Cloudflare Pages 연결 (2분)
1. https://dash.cloudflare.com 접속
2. Workers & Pages → Create → Pages → Connect to Git
3. GitHub 계정 연결 → hanpocket 저장소 선택
4. 빌드 설정:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Save and Deploy 클릭

## 완료!
- 주소: `hanpocket.pages.dev` (영구 고정)
- 이후: 코드 수정 → git push → 자동 배포
