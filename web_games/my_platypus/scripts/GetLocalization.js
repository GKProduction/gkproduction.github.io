// Get Localization for Clickteam Fusion 2.5 HTML5
// v1.0

function GetLocalization(file = "\languages\en_US.json"){
	try {
	const xhr = new XMLHttpRequest();
	xhr.open('GET', `${file}`, false);
	xhr.send();
	info_data =  xhr.responseText;
	info_event="On read localization";
	return;
	} catch (err) {
	console.error('Ошибка чтения файла локализации:', err);
	return null;
	}
}
