let currentLang = 'en-US';
let translations = {};
const supportedLanguages = ['en-US', 'ru-RU'];
const cisLanguages = ['ru', 'ru-RU', 'uk', 'be'];

// Загрузка перевода
async function loadTranslations(lang) {
    try {
        const response = await fetch(`languages/${lang}.json`);
        translations = await response.json();
        updateContent();
    } catch (error) {
        console.error("Ошибка загрузки перевода:", error);
    }
}

// Обновление содержимого страницы
function updateContent() {
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[key] || translations[key + '_pc']) {
            if (element.tagName === 'IMG') {
                const userAgent = navigator.userAgent.toLowerCase();
                const isAndroid = userAgent.includes("android");
                element.src = isAndroid ? translations[key + '_mobile'] : translations[key + '_pc'];
            } else {
                element.textContent = translations[key];
            }
        }
    });

    const flagElement = document.getElementById('language-flag');
    if (flagElement) {
        flagElement.src = `languages/${currentLang}.png`;
    }
}

// Смена языка
function switchLanguage(lang) {
    if (supportedLanguages.includes(lang)) {
        currentLang = lang;
        loadTranslations(currentLang);
    }
}

// Обнаружение языка браузера
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.languages[0];
    return cisLanguages.some(lang => browserLang.startsWith(lang)) ? 'ru-RU' : 'en-US';
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const initialLang = detectBrowserLanguage();
    switchLanguage(initialLang);

    document.getElementById('language-button').addEventListener('click', () => {
        const newLang = currentLang === 'ru-RU' ? 'en-US' : 'ru-RU';
        switchLanguage(newLang);
    });
});