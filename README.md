# 뉴스 팩트 체커 (News Fact Checker)

뉴스 기사의 사실 여부를 자동으로 검증하고 한국/해외 뉴스를 비교 분석하는 Chrome 확장 프로그램입니다.

## 주요 기능

### 1. 뉴스 내용 자동 추출
- 26개 주요 뉴스 사이트 지원 (한국 14개, 해외 12개)
- Mozilla의 Readability.js를 활용한 신뢰성 있는 콘텐츠 추출
- 메타데이터(제목, 작성자, 날짜, 키워드 등) 자동 추출

### 2. RAG 기반 팩트 체크
- Google Gemini API를 활용한 고성능 분석
- 사실 관계 검증
- 객관성 평가
- 한국/해외 뉴스 비교 분석
- 출처 신뢰성 평가
- 편향성 분석

### 3. 스마트 캐싱
- 24시간 유효한 분석 결과 캐싱
- 동일 기사 재분석 방지
- 빠른 결과 제공

### 4. 히스토리 관리
- 최근 100개 분석 결과 저장
- 분석 결과 히스토리 조회
- 원문 기사 바로가기
- 히스토리 전체 삭제 기능

## 지원하는 뉴스 사이트

### 한국 언론사
1. 네이버 뉴스 (news.naver.com)
2. 다음 뉴스 (news.daum.net)
3. 중앙일보 (joins.com)
4. 조선일보 (chosun.com)
5. 동아일보 (donga.com)
6. 한겨레 (hani.co.kr)
7. 경향신문 (khan.co.kr)
8. 매일경제 (mk.co.kr)
9. 한국경제 (hankyung.com)
10. 연합뉴스 (yna.co.kr)
11. YTN (ytn.co.kr)
12. SBS (sbs.co.kr)
13. MBC (mbc.co.kr)
14. KBS (kbs.co.kr)

### 해외 언론사
1. The New York Times (nytimes.com)
2. The Wall Street Journal (wsj.com)
3. Reuters (reuters.com)
4. BBC News (bbc.com)
5. CNN (cnn.com)
6. Fox News (foxnews.com)
7. The Guardian (theguardian.com)
8. The Washington Post (washingtonpost.com)
9. Associated Press (apnews.com)
10. Bloomberg (bloomberg.com)
11. Al Jazeera (aljazeera.com)
12. Financial Times (ft.com)
13. The Economist (economist.com)

## 설치 방법

1. 이 저장소를 클론하거나 다운로드합니다.
```bash
git clone [repository-url]
```

2. Chrome 브라우저에서 `chrome://extensions`로 이동합니다.

3. 우측 상단의 "개발자 모드"를 활성화합니다.

4. "압축해제된 확장 프로그램을 로드합니다" 버튼을 클릭합니다.

5. 다운로드한 프로젝트 폴더를 선택합니다.

## 초기 설정

1. 확장 프로그램 아이콘을 우클릭하고 "옵션"을 선택합니다.

2. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 Gemini API 키를 발급받습니다.

3. 발급받은 API 키를 옵션 페이지에 입력하고 저장합니다.

## 사용 방법

1. 뉴스 기사 페이지에서 확장 프로그램 아이콘을 클릭합니다.

2. "뉴스 검증 시작" 버튼을 클릭합니다.

3. 분석 결과에서 다음 정보를 확인할 수 있습니다:
   - 사실 여부
   - 신뢰도 점수
   - 객관성 평가
   - 편향성 분석
   - 한국/해외 뉴스 비교
   - 검증 출처

4. "히스토리" 탭에서 이전 분석 결과를 확인할 수 있습니다.

## 프로젝트 구조

```
NewsFactCheckerExtension/
├── manifest.json        # 확장 프로그램 설정
├── popup.html          # 팝업 UI
├── popup.js            # 팝업 로직
├── content.js          # 뉴스 크롤링
├── background.js       # 백그라운드 로직
├── options.html        # 설정 페이지
├── options.js          # 설정 로직
├── lib/
│   └── Readability.js  # Mozilla Readability
└── images/
    ├── icon16.png      # 아이콘 (16x16)
    ├── icon48.png      # 아이콘 (48x48)
    └── icon128.png     # 아이콘 (128x128)
```

## 기술 스택

- Chrome Extension Manifest V3
- Google Gemini API
- Mozilla Readability.js
- HTML/CSS/JavaScript

## 주의사항

- API 키는 절대로 공개하거나 공유하지 마세요.
- 일부 뉴스 사이트는 로그인이 필요할 수 있습니다.
- 분석 결과는 참고용으로만 사용하시기 바랍니다.
- 캐시된 결과는 24시간 후 자동으로 만료됩니다.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.

## 기여하기

버그 리포트, 기능 제안, 풀 리퀘스트 모두 환영합니다. 기여하기 전에 CONTRIBUTING.md를 읽어주세요.

## 작성자

[Your Name]

## 감사의 글

- Mozilla Readability.js 팀
- Google Gemini API 팀 # NewsFactCheckerExtension
