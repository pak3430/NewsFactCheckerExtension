// 백그라운드 스크립트: 확장 프로그램의 전반적인 동작을 관리합니다.
// 여기서는 초기 설정이나 메시지 라우팅 등을 할 수 있습니다.

// Google Gemini API 키 저장 및 가져오기 함수
async function getApiKey() {
    const result = await chrome.storage.local.get(['geminiApiKey']);
    return result.geminiApiKey;
}

async function setApiKey(apiKey) {
    await chrome.storage.local.set({ geminiApiKey: apiKey });
}

// 캐시 관리
const newsCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

function getCachedResult(url) {
    const cached = newsCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.result;
    }
    return null;
}

function setCacheResult(url, result) {
    newsCache.set(url, {
        result,
        timestamp: Date.now()
    });
    // 캐시 크기 제한 (최대 100개)
    if (newsCache.size > 100) {
        const oldestKey = newsCache.keys().next().value;
        newsCache.delete(oldestKey);
    }
}

// Google Gemini API를 사용하여 뉴스 내용 분석
async function analyzeNewsWithGemini(newsData) {
    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error('Google Gemini API 키가 설정되지 않았습니다.');
    }

    // 캐시된 결과가 있는지 확인
    const cachedResult = getCachedResult(newsData.url);
    if (cachedResult) {
        return { result: cachedResult, cached: true };
    }

    try {
        const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
        const prompt = `다음 뉴스 기사의 사실 여부를 검증하고 분석해주세요:\n\n제목: ${newsData.title}\n출처: ${newsData.source}\nURL: ${newsData.url}\n\n내용:\n${newsData.content}\n\n다음 형식으로 분석 결과를 JSON으로 반환해주세요:\n{\n    \"isFact\": true/false,\n    \"koreanNewsMatch\": \"한국 뉴스와의 일치성 분석\",\n    \"foreignNewsMatch\": \"해외 뉴스와의 일치성 분석\",\n    \"factAnalysis\": {\n        \"summary\": \"전체 분석 요약\",\n        \"objectivity\": \"객관성 점수(백분율)\",\n        \"bias\": \"편향성 분석\"\n    },\n    \"confidenceScore\": 0-100,\n    \"verificationSources\": [\"검증에 사용된 출처 목록\"]\n}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`분석 요청 실패: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        // Gemini 응답에서 JSON 추출
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('JSON 응답을 찾을 수 없습니다.');
        }
        const analysisResult = JSON.parse(jsonMatch[0]);
        setCacheResult(newsData.url, analysisResult);
        return { result: analysisResult, cached: false };
    } catch (error) {
        console.error('뉴스 분석 중 오류 발생:', error);
        throw error;
    }
}

// 히스토리 관리
async function getHistory() {
    const result = await chrome.storage.local.get(['newsHistory']);
    return result.newsHistory || [];
}

async function addToHistory(newsData, analysisResult) {
    const history = await getHistory();
    history.unshift({
        url: newsData.url,
        title: newsData.title,
        source: newsData.hostname,
        timestamp: Date.now(),
        result: analysisResult
    });
    if (history.length > 100) {
        history.pop();
    }
    await chrome.storage.local.set({ newsHistory: history });
}

async function clearHistory() {
    await chrome.storage.local.remove(['newsHistory']);
    return { success: true };
}

// 확장 프로그램 설치/업데이트 시 실행
chrome.runtime.onInstalled.addListener(() => {
    console.log('뉴스 팩트 체커 확장 프로그램이 설치되었습니다.');
});

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "sendToRAGModel") {
        analyzeNewsWithGemini(request.content)
            .then(async result => {
                if (!result.cached) {
                    await addToHistory(request.content, result.result);
                }
                sendResponse(result);
            })
            .catch(error => {
                sendResponse({ 
                    error: true, 
                    message: error.message 
                });
            });
        return true;
    } else if (request.action === "setApiKey") {
        setApiKey(request.apiKey)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch(error => {
                sendResponse({ 
                    error: true, 
                    message: error.message 
                });
            });
        return true;
    } else if (request.action === "getHistory") {
        getHistory()
            .then(history => {
                sendResponse({ history });
            })
            .catch(error => {
                sendResponse({ 
                    error: true, 
                    message: error.message 
                });
            });
        return true;
    } else if (request.action === "clearHistory") {
        clearHistory()
            .then(() => {
                sendResponse({ success: true });
            })
            .catch(error => {
                sendResponse({ 
                    error: true, 
                    message: error.message 
                });
            });
        return true;
    }
});