// === Язык ===

const LANGUAGES = ["en-US", "ru-RU"]; // Все языки
const DEFAULT_LANGUAGE = "en-US"; // Язык по умолчанию

// Сохранение выбранного языка
function save_language(){
	localStorage.setItem("language", language);
}

// Указать ранее выбранный язык
let language = localStorage.getItem("language");

// Язык не указан? Или указан язык, которого нет?
if (!language || !LANGUAGES.includes(language)) {
	
	// Узнать язык браузера
	let lang = navigator.language; 
	
	// Указать язык на странице
	if (["ru", "uk", "be", "kk"].includes(lang.split("-")[0])) {
		language = "ru-RU"; // Русский
	}
	else {
		language = DEFAULT_LANGUAGE; // Английский
	}
	
	// Запомнить выбранный язык
	save_language();
}