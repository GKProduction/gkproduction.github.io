let currentLang = 'en-US';
let translations = {};
const supportedLanguages = ['en-US', 'ru-RU'];
const cisLanguages = ['ru', 'ru-RU', 'uk', 'be'];
const GIST_URL = 'https://gist.githubusercontent.com/veselchakhappy/03b29d06ca5eea5813257c5a6918bce1/raw/gk-bot-version';

// Загрузка версии и даты
async function fetchGistData() {
	try {
        const response = await fetch(`${GIST_URL}?t=${new Date().getTime()}`);
        
        if (!response.ok) {
			return;
		}

        const text = await response.text();
        const lines = text.trim().split('\n');
        
        if (lines.length < 2) {
			return;
		}

        const version = lines[0].trim();
        const rawDate = lines[1].trim();

        if (currentLang === 'ru-RU') {
            translations['update_info1'] = `Версия бота: ${version}`;
            translations['update_info2'] = `Последнее обновление: ${rawDate}`;
        } else {
            const parts = rawDate.split('.');
            const formattedDate = (parts.length === 3) 
                ? `${parts[2]}.${parts[1]}.${parts[0]}` 
                : rawDate;

            translations['update_info1'] = `Bot version: ${version}`;
            translations['update_info2'] = `Last update: ${formattedDate}`;
        }
    } catch (error) {
        console.warn("Не удалось обработать данные из Gist.");
    }
}

// Загрузка перевода
async function loadTranslations(lang) {
    try {
        const response = await fetch(`languages/${lang}.json`);
        translations = await response.json();
		await fetchGistData();
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