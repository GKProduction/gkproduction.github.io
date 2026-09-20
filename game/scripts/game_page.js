// ==== Просмотр страницы игры ====
document.title = "...";

// === ID игры ===

// ID игры
const GAME_ID = new URLSearchParams(location.search).get("id");

// Путь к данным игры
const GAME_PATH = "data/" + GAME_ID + "/";

// Данные
let DATA;		// Данные игры
let PLATFORMS;	// Платформы
let STRINGS;	// Строки локализации

// === Стиль страницы ===
const style = document.createElement("link");
style.rel = "stylesheet";
style.href = GAME_PATH + "styles.css";
document.head.appendChild(style);

// === Блоки страницы ===
const logo_block = document.querySelector(".logo-block");
const gallery_block = document.querySelector(".gallery-block");
const description_block = document.querySelector(".description-block");
const links_block = document.querySelector(".links-block");
const copyright_block = document.querySelector(".copyright-block");

//  === Данные игры ===

// == Логотип ==
// Обновить логотип
function update_logo() {
	// Удалить старый логотип
	const old_logo = document.querySelector(".logo"); // Найти логотип
	if (old_logo) old_logo.remove(); // Если есть, удалить
	
	// Новый логотип (logo.png)
	const img = new Image(); // Создать изображение
	img.className = "logo"; // Задать класс
	
	// Если загружен, то вставить на страницу
	img.onload = () => {
		logo_block.appendChild(img); // Вставить в logo_block
	};
	
	// Если ошибка загрузки, то вставить локализованный логотип
	img.onerror = () => {
		const localized = new Image(); // Создать изображение
		localized.className = "logo"; // Задать класс
		
		// Если загружен, то вставить на страницу
		localized.onload = () => {
			logo_block.appendChild(localized); // Вставить в logo_block
		};
		
		// Указать путь к изображению
		localized.src = GAME_PATH + "logo_" + language.split("-")[0] + ".png";
	};
	
	// Указать путь к изображению
	img.src = GAME_PATH + "logo.png";
}

// == Данные ==
// Загрузка данных игры
async function load_data() {
	const [data_res, platforms_res] = await Promise.all([
		fetch(GAME_PATH + "data.json"),
		fetch("data/platforms.json")
	]);
	
	// Игра не найдена
	if (!data_res.ok) {
		location.replace("../404.html");
		throw new Error("Game not found");
	}
	
	DATA = await data_res.json();
	PLATFORMS = await platforms_res.json();
}

// Создать галерею
function build_gallery() {
	// Трейлер
	if (DATA.trailer) {
		const trailer_img = new Image();
		trailer_img.src = GAME_PATH + "screenshots/trailer.png";
		trailer_img.draggable = false;
		trailer_img.addEventListener("click", () => show_lightbox([...gallery.children].indexOf(trailer_img)));
		trailer_img.dataset.trailer = "true";
		gallery.appendChild(trailer_img);
	}
	
	// Скриншоты
	DATA.screenshots.forEach((name) => {
		const img = new Image();
		img.src = GAME_PATH + "screenshots/" + name;
		img.draggable = false;
		img.addEventListener("click", () => show_lightbox([...gallery.children].indexOf(img)));
		gallery.appendChild(img);
	});
	
	// Убрать загрузку галереи
	gallery_loading.remove();
}

// Создать копирайт
function build_copyright() {
	const copyright = document.createElement("div");
	copyright.className = "copyright";
	copyright.textContent = DATA.copyright;
	copyright_block.appendChild(copyright);
}

// Обновить описание игры
async function update_description() {
	// Очистить старый
	description_block.innerHTML = "";
	
	// Загрузить новый
	const desc_response = await fetch(GAME_PATH + "languages/" + language + ".md");
	const desc_text = await desc_response.text();
	const description = document.createElement("div");
	description.className = "description";
	description.innerHTML = marked.parse(desc_text, { breaks: true });
	description_block.appendChild(description);
}

// Сменить язык
async function change_language(new_lang) {
	// Сменить язык
	language = new_lang;
	save_language();
	
	// Перезагрузить строки
	await load_strings();
	
	// Обновить все тексты
	update_texts();
	
	// Обновить описание
	await update_description();
	
	// Обновить логотип
	update_logo();
}

// Загрузка строк локализации
async function load_strings() {
	// Общие строки	"/game/languages/ru-RU.json"
	const main_locale = await (await fetch("languages/" + language + ".json")).json();
	
	// Строки игры	"/game/data/game_name/languages/ru-RU.json"
	const game_locale = await (await fetch(GAME_PATH + "languages/" + language + ".json")).json();
	
	// Объединить в одну базу строк
	STRINGS = { ...main_locale, ...game_locale };
}

// Обновление текстов на странице (по data-id)
// Без параметров — обновить все
// С параметром — обновить конкретные (ID или массив ID)
function update_texts(ids) {
	
	// Обновить название вкладки
	document.title = STRINGS["game.name"] || "";
	
	// Если параметр не указан — собрать все data-id на странице
	if (ids === undefined) {
		ids = [...document.querySelectorAll("[data-id]")].map(el => el.dataset.id);
	}
	
	// Если передана одна строка — сделать массив
	if (typeof ids === "string") {
		ids = [ids];
	}
	
	// Обновить каждый
	ids.forEach(id => {
		document.querySelectorAll('[data-id="' + id + '"]').forEach(el => {
			el.textContent = STRINGS[id] || "";
		});
	});
}

// Загрузка данных при запуске
async function first_load() {
	
	// 1. Текст
	await Promise.all([
		load_data(),			// Загрузить данные игры
		load_strings(),			// Загрузить строки
		update_description()		// Загрузить описание
	]);
	update_texts();				// Обновить строки
	
	// 2. Логотип
	update_logo();
	
	// 3. Галерея и копирайт
	build_gallery();
	build_copyright();
	
}
// Создать элементы

// == Скриншоты ==

// Создать галерею
// Контейнер галереи
const container = document.createElement("div");
container.className = "gallery-container";

// Внутренний блок с картинками
const gallery = document.createElement("div");
gallery.className = "gallery";

// Вложить gallery в container
container.appendChild(gallery);

// Вставить container в gallery_block
gallery_block.appendChild(container);

// Оверлей загрузки
const gallery_loading = document.createElement("div");
gallery_loading.className = "gallery-loading";

// Вложить в container
container.appendChild(gallery_loading);

// === Кнопка "Играть сейчас" ===
const play_button = document.createElement("button");
play_button.className = "play-button";
play_button.dataset.id = "play_game.play_now";
links_block.appendChild(play_button);

// Оверлей модального окна
const overlay = document.createElement("div");
overlay.className = "overlay";

// Окно
const modal = document.createElement("div");
modal.className = "modal";

overlay.appendChild(modal);
document.body.appendChild(overlay);

// Открыть окно
function open_modal() {
	overlay.classList.add("open");
	document.body.style.overflow = "hidden";
}

// Закрыть окно
function close_modal() {
	overlay.classList.remove("open");
	document.body.style.overflow = "";
	modal.innerHTML = "";
	modal.className = "modal";
}

// Создать крестик
function create_close_button() {
	const close = document.createElement("button");
	close.className = "modal-close";
	close.textContent = "×";
	close.addEventListener("click", close_modal);
	modal.appendChild(close);
}

// Показать ссылки
function show_links() {
	modal.className = "modal";
	modal.innerHTML = "";
	create_close_button();
	
	// Содержимое модального окна
	const modal_content = document.createElement("div");
	modal_content.className = "modal-content";
	
	// Ссылки по секциям
	const OS_LIST = ["Windows", "Android", "HTML5"];
	
	OS_LIST.forEach(os => {
		// Секция
		const section = document.createElement("div");
		section.className = "links-section";
		
		// Заголовок
		const title = document.createElement("h3");
		title.className = "links-title";
		title.dataset.id = "play_game." + os.toLowerCase();
		section.appendChild(title);
		
		// Контейнер с иконками
		const icons = document.createElement("div");
		icons.className = "links-icons";
		
		// Иконки для этой ОС
		for (const platform in DATA.links) {
			if (PLATFORMS[platform] && PLATFORMS[platform].os === os) {
				const a = document.createElement("a");
				a.href = DATA.links[platform];
				a.target = "_blank";
				
				const img = new Image();
				img.src = "../images/platforms/" + PLATFORMS[platform].icon;
				img.alt = PLATFORMS[platform].name;
				img.title = PLATFORMS[platform].name;
				
				a.appendChild(img);
				icons.appendChild(a);
			}
		}
		
		section.appendChild(icons);
		modal_content.appendChild(section);
	});
	
	modal.appendChild(modal_content);
	
	// Обновить текст в окне ссылок
	update_texts(["play_game.windows", "play_game.android", "play_game.html5"]);
	
	// Открыть модальное окно
	open_modal();
}

// Обработчики закрытия
overlay.addEventListener("click", (e) => {
	if (e.target === overlay) close_modal();
});
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		close_modal();
	}
	
	// Стрелки — только если лайтбокс открыт
	if (modal.classList.contains("modal-lightbox")) {
		const total = gallery.children.length;
		if (e.key === "ArrowLeft") {
			e.preventDefault();
			show_lightbox(current_screenshot - 1);
		}
		if (e.key === "ArrowRight") {
			e.preventDefault();
			show_lightbox(current_screenshot + 1);
		}
	}
});

// Открытие по кнопке
play_button.addEventListener("click", show_links);

// === Загрузить данные при запуске ===
first_load();

// ====================

// Текущий скриншот
let current_screenshot = 0;

// Показать лайтбокс
function show_lightbox(index) {
	const total = gallery.children.length;
	index = (index + total) % total;
	current_screenshot = index;
	
	modal.innerHTML = "";
	modal.className = "modal modal-lightbox";
	
	create_close_button();
	
	// Содержимое: трейлер или картинка
	const item = gallery.children[index];
	
	if (item.dataset.trailer) {
		// Трейлер — iframe
		const iframe = document.createElement("iframe");
		iframe.className = "lightbox-video";
		iframe.src = "https://www.youtube.com/embed/" + get_youtube_id(DATA.trailer);
		iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
		iframe.allowFullscreen = true;
		iframe.referrerPolicy = "strict-origin-when-cross-origin";
		modal.appendChild(iframe);
	} else {
		// Обычный скриншот
		const img = new Image();
		img.className = "lightbox-image";
		img.src = item.src;
		modal.appendChild(img);
	}
		
	// Счётчик
	const counter = document.createElement("div");
	counter.className = "lightbox-counter";
	counter.textContent = (index + 1) + "/" + total;
	modal.appendChild(counter);
	
	// Стрелка влево
	const arrow_left = document.createElement("button");
	arrow_left.className = "lightbox-arrow lightbox-arrow-left";
	arrow_left.textContent = "‹";
	arrow_left.addEventListener("click", () => show_lightbox(current_screenshot - 1));
	modal.appendChild(arrow_left);
	
	// Стрелка вправо
	const arrow_right = document.createElement("button");
	arrow_right.className = "lightbox-arrow lightbox-arrow-right";
	arrow_right.textContent = "›";
	arrow_right.addEventListener("click", () => show_lightbox(current_screenshot + 1));
	modal.appendChild(arrow_right);
	
	// Открыть окно
	open_modal();
}

// Получить ID видео YouTube
function get_youtube_id(url) {
	const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
	return match ? match[1] : "";
}


// === Свайпы ===
let touch_start_x = 0;
let touch_start_y = 0;
let touch_dx = 0;
let touch_dy = 0;

modal.addEventListener("touchstart", (e) => {
	touch_start_x = e.touches[0].clientX;
	touch_start_y = e.touches[0].clientY;
	touch_dx = 0;
	touch_dy = 0;
});

modal.addEventListener("touchmove", (e) => {
	if (!modal.classList.contains("modal-lightbox")) return;
	
	touch_dx = e.touches[0].clientX - touch_start_x;
	touch_dy = e.touches[0].clientY - touch_start_y;
	
	const img = modal.querySelector(".lightbox-image");
	if (img) {
		img.style.transform = "translate(" + touch_dx + "px, " + touch_dy + "px)";
	}
});

modal.addEventListener("touchend", () => {
	const total = gallery.children.length;
	
	if (!modal.classList.contains("modal-lightbox")) return;
	
	const img = modal.querySelector(".lightbox-image");
	
	// Порог срабатывания
	if (touch_dx < -50 && Math.abs(touch_dx) > Math.abs(touch_dy)) {
		// Влево → следующий
		if (img) img.style.transform = "";
		show_lightbox(current_screenshot + 1);
	}
	else if (touch_dx > 50 && Math.abs(touch_dx) > Math.abs(touch_dy)) {
		// Вправо → предыдущий
		if (img) img.style.transform = "";
		show_lightbox(current_screenshot - 1);
	}
	else if (touch_dy > 100 && Math.abs(touch_dy) > Math.abs(touch_dx)) {
		// Вниз → закрыть
		close_modal();
	}
	else {
		// Не дотянули — вернуть на место
		if (img) img.style.transform = "";
	}
});