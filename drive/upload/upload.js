// ページ内要素定義

const uploader = document.getElementById("uploader");
const metadataForm = document.getElementById("uploader-metadata");
const filenameInputter = document.getElementById("uploader-filename");
const publishedAtPicker = document.getElementById("uploader-published-at");
const mediaForm = document.getElementById("uploader-media");
const columnTypePicker = document.getElementById("uploader-column-type");
let columnFilePicker = document.getElementById("uploader-column--file");
const columnFilename = document.getElementById("uploader-column--file--name");
const columnTextInputter = document.getElementById("uploader-column--text");



// メソッド定義

class CMUploader {
	static changeInputterStates (isFilePickerEnabled, isTextInputterEnabled) {
		columnFilePicker.parentNode.classList[isFilePickerEnabled ? "remove" : "add"]("hide");
		columnTextInputter.parentNode.classList[isTextInputterEnabled ? "remove" : "add"]("hide");

		columnFilePicker.required = isFilePickerEnabled;
		columnTextInputter.required = isTextInputterEnabled;
		
		if (!isFilePickerEnabled) this.refreshFilePicker();
	}

	static refreshFilePicker () {
		columnFilename.value = "";

		const refreshedPicker = document.createElement("input");
		refreshedPicker.id = "uploader-column--file";
		refreshedPicker.type = "File";

		columnFilePicker.parentNode.insertBefore(refreshedPicker, columnFilePicker);
		columnFilePicker.remove();
		columnFilePicker = refreshedPicker;
	}

	static changeColumnType (columnType) {
		switch (true) {
			case !columnType:
				return this.changeInputterStates(false, false);
			default:
				this.refreshFilePicker();
				columnFilePicker.accept = columnType;
				
				return this.changeInputterStates(true, false);
			case columnType === "TEXT_DIRECT":
				return this.changeInputterStates(false, true);
		}
	}
}



// イベント登録

window.addEventListener("DOMContentLoaded", () => {
	uploader.addEventListener("submit", e => {
		e.preventDefault();
	});

	columnTypePicker.addEventListener("change", e => CMUploader.changeColumnType(e.target.value));
});