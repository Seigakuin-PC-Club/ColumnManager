// ページ内要素定義

const uploader = document.getElementById("uploader");
const filenameInputter = document.getElementById("uploader-filename");
const publishedAtPicker = document.getElementById("uploader-published-at");
const columnTypePicker = document.getElementById("uploader-column-type");
const columnPicker = document.getElementById("uploader-column");



// イベント登録

window.addEventListener("DOMContentLoaded", () => {
	uploader.addEventListener("submit", e => {
		//e.preventDefault();
	});

	columnTypePicker.addEventListener("change", e => {
		columnPicker.accept = e.target.value;
	});
});