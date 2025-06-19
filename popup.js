document.addEventListener('DOMContentLoaded', function() {
    const checkFactsBtn = document.getElementById('checkFacts');
    const resultDiv = document.getElementById('result');
    const historyDiv = document.getElementById('history');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const tabs = document.querySelectorAll('.tab');
    const checkerTab = document.getElementById('checkerTab');
    const historyTab = document.getElementById('historyTab');

    // 현재 탭이 뉴스 분석이 가능한 상태인지 확인
    async function checkCurrentTab() {
        try {
            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            const currentTab = tabs[0];
            
            // about:, chrome:, file: 등의 특수 페이지 체크
            if (!currentTab.url || currentTab.url.startsWith('chrome:') || 
                currentTab.url.startsWith('about:') || currentTab.url.startsWith('file:')) {
                throw new Error('이 페이지에서는 뉴스 분석을 할 수 없습니다.');
            }

            return true;
        } catch (error) {
            resultDiv.innerHTML = `<div class="error">${error.message}</div>`;
            checkFactsBtn.disabled = true;
            return false;
        }
    }

    // 초기 상태 확인
    checkCurrentTab();

    // 탭 전환 처리
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.dataset.tab === 'checker') {
                checkerTab.style.display = 'block';
                historyTab.style.display = 'none';
                checkCurrentTab(); // 탭 전환시 상태 재확인
            } else {
                checkerTab.style.display = 'none';
                historyTab.style.display = 'block';
                loadHistory();
            }
        });
    });

    // 분석 결과 표시 함수
    function displayAnalysisResult(response, cached = false) {
        if (response.error) {
            resultDiv.innerHTML = `<div class="error">오류 발생: ${response.message}</div>`;
            return;
        }

        const r = response.result;
        const confidenceClass = r.confidenceScore >= 70 ? 'fact-true' : 'fact-false';
        
        resultDiv.innerHTML = `
            <div class="result-content">
                <h3>분석 결과 ${cached ? '<span class="cached-badge">캐시됨</span>' : ''}</h3>
                <div class="${confidenceClass}">
                    <strong>사실 여부:</strong> ${r.isFact ? '사실' : '거짓'}
                </div>
                <div class="confidence">
                    신뢰도: ${r.confidenceScore}%
                </div>
                <div class="analysis">
                    <h4>상세 분석</h4>
                    <p><strong>요약:</strong> ${r.factAnalysis.summary}</p>
                    <p><strong>객관성:</strong> ${r.factAnalysis.objectivity}</p>
                    <p><strong>편향성:</strong> ${r.factAnalysis.bias}</p>
                </div>
                <div class="news-comparison">
                    <h4>뉴스 비교</h4>
                    <p><strong>한국 뉴스:</strong> ${r.koreanNewsMatch}</p>
                    <p><strong>해외 뉴스:</strong> ${r.foreignNewsMatch}</p>
                </div>
                <div class="sources">
                    <h4>검증 출처</h4>
                    <ul>
                        ${r.verificationSources.map(source => `<li>${source}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    // 히스토리 로드 함수
    function loadHistory() {
        historyDiv.innerHTML = '<div class="loading">히스토리를 불러오는 중...</div>';
        
        chrome.runtime.sendMessage({ action: "getHistory" }, function(response) {
            if (chrome.runtime.lastError) {
                historyDiv.innerHTML = `<div class="error">히스토리 로드 실패: ${chrome.runtime.lastError.message}</div>`;
                return;
            }

            if (response && response.history && response.history.length > 0) {
                historyDiv.innerHTML = response.history.map(item => `
                    <div class="history-item" data-url="${item.url}">
                        <div class="title">${item.title}</div>
                        <div class="meta">
                            ${new Date(item.timestamp).toLocaleString()} | ${item.source}
                            <span class="${item.result.isFact ? 'fact-true' : 'fact-false'}">
                                ${item.result.isFact ? '사실' : '거짓'}
                            </span>
                        </div>
                        <div class="result-summary">
                            ${item.result.factAnalysis.summary}
                        </div>
                    </div>
                `).join('');

                // 히스토리 아이템 클릭 이벤트
                document.querySelectorAll('.history-item').forEach(item => {
                    item.addEventListener('click', () => {
                        chrome.tabs.create({ url: item.dataset.url });
                    });
                });
            } else {
                historyDiv.innerHTML = '<div class="loading">히스토리가 없습니다.</div>';
            }
        });
    }

    // 히스토리 삭제
    clearHistoryBtn.addEventListener('click', function() {
        if (confirm('모든 히스토리를 삭제하시겠습니까?')) {
            chrome.runtime.sendMessage({ action: "clearHistory" }, function(response) {
                if (chrome.runtime.lastError) {
                    historyDiv.innerHTML = `<div class="error">히스토리 삭제 실패: ${chrome.runtime.lastError.message}</div>`;
                    return;
                }

                if (response && response.success) {
                    loadHistory();
                }
            });
        }
    });

    // 뉴스 검증 시작
    checkFactsBtn.addEventListener('click', async function() {
        if (!await checkCurrentTab()) {
            return;
        }

        resultDiv.innerHTML = '<div class="loading">뉴스 검증 중... 잠시만 기다려 주세요.</div>';
        checkFactsBtn.disabled = true;
        
        try {
            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getNewsContent'}, function(response) {
                if (chrome.runtime.lastError) {
                    resultDiv.innerHTML = `<div class="error">뉴스 내용 추출 실패: ${chrome.runtime.lastError.message}</div>`;
                    checkFactsBtn.disabled = false;
                    return;
                }

                if (response && response.content) {
                    resultDiv.innerHTML = '<div class="loading">뉴스 내용 추출 완료. RAG 분석 시작...</div>';
                    console.log('뉴스 내용 추출 완료:', response);
                    
                    chrome.runtime.sendMessage(
                        { action: 'sendToRAGModel', content: response },
                        function(analysisResponse) {
                            if (chrome.runtime.lastError) {
                                resultDiv.innerHTML = `<div class="error">분석 실패: ${chrome.runtime.lastError.message}</div>`;
                            } else {
                                displayAnalysisResult(analysisResponse, analysisResponse.cached);
                            }
                            checkFactsBtn.disabled = false;
                        }
                    );
                } else {
                    resultDiv.innerHTML = '<div class="error">뉴스 내용을 추출하는데 실패했습니다.</div>';
                    checkFactsBtn.disabled = false;
                }
            });
        } catch (error) {
            resultDiv.innerHTML = `<div class="error">오류 발생: ${error.message}</div>`;
            checkFactsBtn.disabled = false;
        }
    });
});