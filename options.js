document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('save');
    const statusDiv = document.getElementById('status');

    // 1. 페이지 로드 시 저장된 API 키 로드
    // chrome.storage.local.get()을 사용하여 로컬 저장소에서 'geminiApiKey'를 가져옵니다.
    chrome.storage.local.get(['geminiApiKey'], function(result) {
        if (result.geminiApiKey) {
            apiKeyInput.value = result.geminiApiKey;
            showStatus('저장된 API 키가 로드되었습니다.', 'success');
        } else {
            showStatus('API 키를 입력하고 저장해 주세요.', 'info');
        }
    });

    // 2. '저장' 버튼 클릭 시 API 키 저장
    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim(); // 입력된 API 키의 앞뒤 공백 제거

        if (apiKey) {
            // chrome.storage.local.set()을 사용하여 'geminiApiKey'를 로컬 저장소에 저장합니다.
            chrome.storage.local.set({geminiApiKey: apiKey}, function() {
                if (chrome.runtime.lastError) {
                    // 저장 중 오류 발생 시
                    console.error("API 키 저장 오류:", chrome.runtime.lastError.message);
                    showStatus('API 키 저장에 실패했습니다: ' + chrome.runtime.lastError.message, 'error');
                } else {
                    // 저장 성공 시
                    showStatus('API 키가 성공적으로 저장되었습니다!', 'success');
                    console.log('API 키 저장됨:', apiKey);
                }
            });
        } else {
            // API 키가 입력되지 않았을 경우
            showStatus('API 키를 입력해 주세요.', 'error');
        }
    });

    // 3. 상태 메시지 표시 함수
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type; // 클래스를 추가하여 스타일 적용
        statusDiv.style.display = 'block'; // 숨겨진 상태를 보이게 함

        // 3초 후 메시지 숨기기
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
});