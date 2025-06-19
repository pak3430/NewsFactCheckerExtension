// Mozilla의 Readability.js를 사용하여 뉴스 기사 내용을 추출
function extractNewsContent() {
    // 현재 URL을 기반으로 뉴스 사이트 식별
    const currentUrl = window.location.hostname;
    let articleContent = '';

    // 뉴스 사이트별 크롤링 규칙
    const NEWS_SELECTORS = {
        // 한국 주요 언론사
        'naver.com': {
            title: ['#title_area h2', '#articleTitle', '.media_end_head_headline'],
            content: ['#dic_area', '#articleBodyContents', '#newsEndContents'],
            author: ['.byline_s', '.author_info', '.media_end_head_journalist'],
            date: ['.media_end_head_info_datestamp', '.article_info .date', '[data-date-time]'],
        },
        'daum.net': {
            title: ['.tit_view', '.tit_news'],
            content: ['.article_view', '#harmonyContainer'],
            author: ['.info_view .txt_info', '.info_reporter'],
            date: ['.info_view .num_date', '.news_view .num_date'],
        },
        'joins.com': {
            title: ['h1.headline', '.article_head h1'],
            content: ['.article_body', '#article_body'],
            author: ['.author .name', '.report_list'],
            date: ['.dateWrap .date', '.article_head .date'],
        },
        'chosun.com': {
            title: ['h1.news_title', '#news_title_text_id'],
            content: ['.article-body', '#news_body_id'],
            author: ['.author', '.writer'],
            date: ['.news_date', '.date'],
        },
        'donga.com': {
            title: ['.title', 'h1.title'],
            content: ['.article_txt', '#content'],
            author: ['.report_name', '.writer_info'],
            date: ['.date01', '.article_date'],
        },
        'hani.co.kr': {
            title: ['.title', '.article_title'],
            content: ['.text', '.article-text'],
            author: ['.author', '.writer'],
            date: ['.date', '.published'],
        },
        'khan.co.kr': {
            title: ['h1.headline', '.art_tit'],
            content: ['#articleBody', '.art_body'],
            author: ['.author_info', '.write_info'],
            date: ['.date_time', '.art_time'],
        },
        'mk.co.kr': {
            title: ['.top_title', 'h1.news_ttl'],
            content: ['#article_body', '.article_content'],
            author: ['.author_name', '.art_reporter'],
            date: ['.author_data', '.time_info'],
        },
        'hankyung.com': {
            title: ['.title', 'h1.article-title'],
            content: ['.article-body', '#articletxt'],
            author: ['.author-info', '.article-author'],
            date: ['.date-time', '.article-timestamp'],
        },
        'yna.co.kr': {
            title: ['h1.headline-title', '#articleTitle'],
            content: ['.article', '#articleBody'],
            author: ['.reporter-name', '.author-info'],
            date: ['.update-time', '.article-timestamp'],
        },
        'ytn.co.kr': {
            title: ['.article_tit', 'h1.title'],
            content: ['.article_content', '#newsContent'],
            author: ['.reporter', '.article_info_text'],
            date: ['.article_info .date', '.article_date'],
        },
        'sbs.co.kr': {
            title: ['.news_title', 'h1.title'],
            content: ['.news_text', '#article_content'],
            author: ['.name_mail', '.reporter_area'],
            date: ['.date_time', '.article_date_time'],
        },
        'mbc.co.kr': {
            title: ['.title', 'h1.article-title'],
            content: ['.article_content', '#content'],
            author: ['.reporter', '.writer'],
            date: ['.date', '.article-time'],
        },
        'kbs.co.kr': {
            title: ['.title_news', 'h1.tit_news'],
            content: ['.news_cont', '#cont_newstext'],
            author: ['.reporter', '.writer_info'],
            date: ['.date_time', '.time_news'],
        },

        // 해외 주요 언론사
        'nytimes.com': {
            title: ['h1[data-testid="headline"]', '.main-heading'],
            content: ['article[data-testid="the-body"]', '.story-body'],
            author: ['.byline-author', '.last-byline'],
            date: ['time', '.publish-date'],
        },
        'wsj.com': {
            title: ['h1[data-component="headline"]', '.article-header h1'],
            content: ['article[data-component="body"]', '.article-content'],
            author: ['.author', '.byline'],
            date: ['time', '.timestamp'],
        },
        'reuters.com': {
            title: ['h1[data-testid="Heading"]', '.article-header'],
            content: ['[data-testid="article-body"]', '.article-body'],
            author: ['.author-name', '.byline'],
            date: ['time', '.date-line'],
        },
        'bbc.com': {
            title: ['h1[data-component="text-block"]', '.story-body__h1'],
            content: ['article[data-component="text-block"]', '.story-body__inner'],
            author: ['.byline__name', '.byline'],
            date: ['time', '.date'],
        },
        'cnn.com': {
            title: ['h1.headline', '.article__title'],
            content: ['.article__content', '.body-text'],
            author: ['.byline__names', '.metadata__byline'],
            date: ['time.update-time', '.metadata__date'],
        },
        'foxnews.com': {
            title: ['.headline', 'h1.headline', '.headline__title'],
            content: ['.article-body', '.article-text', '.article__content'],
            author: ['.author-byline', '.author-bio__name', '.article-meta .author'],
            date: ['.article-date', 'time.article-timestamp', '.article-meta time'],
        },
        'theguardian.com': {
            title: ['h1.content__headline', '.content__header'],
            content: ['.content__article-body', '.article-body-commercial-selector'],
            author: ['.byline__name', '.contributor-list'],
            date: ['time.content-timestamps__publish', '.content-timestamps__updated'],
        },
        'washingtonpost.com': {
            title: ['h1[data-qa="headline"]', '.headline'],
            content: ['article[data-qa="article-body"]', '.article-body'],
            author: ['.author-name', '.author-link'],
            date: ['time.display-date', '.publication-date'],
        },
        'apnews.com': {
            title: ['.Page-headline', 'h1.headline'],
            content: ['.Article', '.article-body'],
            author: ['.author', '.Component-signature'],
            date: ['time', '.Timestamp'],
        },
        'bloomberg.com': {
            title: ['.article-headline', 'h1.headline'],
            content: ['.body-content', '.body-copy'],
            author: ['.author-name', '.author-link'],
            date: ['time', '.article-timestamp'],
        },
        'aljazeera.com': {
            title: ['.article-header h1', '.article__title'],
            content: ['.article__content', '.wysiwyg'],
            author: ['.article-author__name', '.author-name'],
            date: ['.article-dates', '.date-simple'],
        },
        'ft.com': {
            title: ['.article-header__title', '.o-topper__headline'],
            content: ['.article-body', '.article__content-body'],
            author: ['.article-author__name', '.n-content-tag--author'],
            date: ['time.article__timestamp', '.o-date'],
        },
        'economist.com': {
            title: ['.article__headline', '.article-headline'],
            content: ['.article__body-text', '.article__content'],
            author: ['.author-name', '.byline'],
            date: ['time', '.article__dateline'],
        }
    };

    // 메타데이터 추출 함수
    function extractMetadata() {
        const metadata = {
            title: '',
            author: '',
            date: '',
            keywords: [],
            description: ''
        };

        // Open Graph 태그에서 메타데이터 추출
        metadata.title = document.querySelector('meta[property="og:title"]')?.content || '';
        metadata.description = document.querySelector('meta[property="og:description"]')?.content || '';

        // 키워드 추출
        const keywordsMeta = document.querySelector('meta[name="keywords"]')?.content || '';
        metadata.keywords = keywordsMeta.split(',').map(k => k.trim()).filter(k => k);

        // Schema.org 구조화된 데이터 추출
        const schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (schemaScript) {
            try {
                const schemaData = JSON.parse(schemaScript.textContent);
                if (schemaData['@type'] === 'NewsArticle') {
                    metadata.author = schemaData.author?.name || '';
                    metadata.date = schemaData.datePublished || '';
                }
            } catch (e) {
                console.error('Schema.org 데이터 파싱 실패:', e);
            }
        }

        return metadata;
    }

    // 사이트별 규칙 찾기
    const siteRules = Object.entries(NEWS_SELECTORS).find(([domain]) => currentUrl.includes(domain))?.[1] || {};

    let title = '';
    let author = '';
    let date = '';

    if (siteRules && Object.keys(siteRules).length > 0) {
        // 제목 추출
        for (const selector of siteRules.title || []) {
            const titleElement = document.querySelector(selector);
            if (titleElement && titleElement.textContent) {
                title = titleElement.textContent.trim();
                break;
            }
        }
        // 본문 추출
        for (const selector of siteRules.content || []) {
            const contentElement = document.querySelector(selector);
            if (contentElement && contentElement.innerText) {
                articleContent = contentElement.innerText;
                break;
            }
        }
        // 작성자 추출
        for (const selector of siteRules.author || []) {
            const authorElement = document.querySelector(selector);
            if (authorElement && authorElement.textContent) {
                author = authorElement.textContent.trim();
                break;
            }
        }
        // 날짜 추출
        for (const selector of siteRules.date || []) {
            const dateElement = document.querySelector(selector);
            if (dateElement && dateElement.textContent) {
                date = dateElement.textContent.trim();
                break;
            }
        }
    }

    // 사이트별 규칙으로 추출 실패시 Readability 사용
    if (!articleContent) {
        try {
            const documentClone = document.cloneNode(true);
            const article = new Readability(documentClone).parse();
            if (article) {
                articleContent = article.textContent || '';
                if (!title) title = article.title || '';
            }
        } catch (error) {
            console.error('Readability parsing failed:', error);
            // 폴백: 기본 article 또는 main 콘텐츠 추출
            const fallbackContent = document.querySelector('article, [role="main"], .article-body, .news_content, #content');
            if (fallbackContent && fallbackContent.innerText) {
                articleContent = fallbackContent.innerText;
            } else {
                articleContent = '';
            }
        }
    }

    // 내용 정제
    articleContent = (articleContent || '')
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .replace(/^광고$|^sponsored$|^promoted$|^advertisement$/gmi, '')
        .replace(/\[.*?\]|\(.*?\)/g, '')
        .trim();

    let metadata = extractMetadata();

    return {
        url: window.location.href,
        hostname: currentUrl,
        title: title || metadata.title || '',
        content: articleContent || '',
        author: author || metadata.author || '',
        date: date || metadata.date || '',
        keywords: metadata.keywords || [],
        description: metadata.description || ''
    };
}

// Readability.js 라이브러리 동적 로드
function loadReadability() {
    return new Promise((resolve, reject) => {
        if (window.Readability) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('lib/Readability.js');
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// 메시지 리스너 초기화
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getNewsContent') {
        try {
            const content = extractNewsContent();
            sendResponse(content);
        } catch (error) {
            console.error('뉴스 내용 추출 중 오류:', error);
            sendResponse({ error: true, message: error.message });
        }
        return true; // 비동기 응답을 위해 true 반환
    }
});

// 페이지 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('뉴스 팩트 체커 content script 로드됨');
});