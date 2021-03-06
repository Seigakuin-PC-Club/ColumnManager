// ページ内要素定義

const uploader = document.getElementById("uploader");
const metadataForm = document.getElementById("uploader-metadata");
const columnNameInputter = document.getElementById("uploader-column-name");
const publishedAtPicker = document.getElementById("uploader-published-at");
const mediaForm = document.getElementById("uploader-media");
const columnTypePicker = document.getElementById("uploader-column-type");
let columnFilePicker = document.getElementById("uploader-column--file");
const columnFilename = document.getElementById("uploader-column--file--name");
const columnFileUsedPicker = document.getElementById("uploader-column-used--file");
const columnTextInputter = document.getElementById("uploader-column--text");
const columnTextUsedPicker = document.getElementById("uploader-column-used--text");
const uploadBtn = document.getElementById("uploader-upload");



// メソッド定義

class CMUploader {
	static get uploadMode () {
		switch (columnTypePicker.value) {
			case "":
				return "NONE";
			default:
				return "FILE";
			case "TEXT_DIRECT":
				return "TEXT";
		}
	}

	static changeInputterStates (isFilePickerEnabled, isTextInputterEnabled) {
		columnFilePicker.parentNode.classList[isFilePickerEnabled ? "remove" : "add"]("hide");
		columnTextInputter.parentNode.classList[isTextInputterEnabled ? "remove" : "add"]("hide");

		columnFilePicker.required = isFilePickerEnabled;
		columnTextInputter.required = isTextInputterEnabled;
		
		if (!isFilePickerEnabled) this.refreshFilePicker();
	}

	static refreshFilePicker () {
		if (!templates.loaded) return;

		columnFilename.value = "";

		const refreshedPicker = templates.createComponent("ColumnFilePicker");

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

	/**
	 * コラムのデータを読み込みます
	 * 
	 * @param {"FILE" | "TEXT"} mode アップロードモード
	 * @return {Promise<{ mime: String, ext: String, body: String, isUsedByAuthor: Boolean }>}
	 */
	static getColumnData (mode) {
		return new Promise((resolve, reject) => {
			if (mode === "FILE") {
				const columnFile = columnFilePicker.files[0];

				const columnReader = new FileReader();
				columnReader.addEventListener("load", e => {
					resolve({
						mime: columnFile.type,
						ext: columnFile.name.split(".").slice(-1).join(""),

						body: e.target.result.split(",").slice(1).join(""),
						isUsedByAuthor: columnFileUsedPicker.checked
					});
				});

				columnReader.addEventListener("error", error => reject(error));

				columnReader.readAsDataURL(columnFile);
			} else if (mode === "TEXT") {
				resolve({
					mime: "text/plain",
					ext: "txt",
					
					body: window.btoa(unescape(encodeURIComponent(columnTextInputter.value))),
					isUsedByAuthor: columnTextUsedPicker.checked
				});
			}
		});
	}

	/**
	 * コラムをアップロードします
	 * @return {Promise}
	 */
	static uploadColumn () {
		if (!Array.prototype.every.call(uploader.querySelectorAll("*[Required]"), item => item.checkValidity())) {
			return M.toast({ classes: "red", html: "必須項目が入力されていません" });
		}

		return this.getColumnData(this.uploadMode).catch(error => { throw error }).then(column => {
			return gapi.client.request({
				path: uploader.action,
				method: uploader.method,
	
				headers: {
					"Content-Type": `multipart/related; boundary=${BOUNDARY}`
				},
	
				body: [
					`--${BOUNDARY}`,
					"Content-Type: application/json; charset=UTF-8",
					"",
					JSON.stringify({
						name: `${user.uid} |:| ${columnNameInputter.value || "Untitled"}.${column.ext}`,
						originalFilename: columnNameInputter.value || "Untitled",

						properties: {
							publishedAt: publishedAtPicker.M_Datepicker.date ? publishedAtPicker.M_Datepicker.date.toJSON() : "",
							usedStudents: column.isUsedByAuthor ? [ user.uid ].join(" ") : ""
						},
	
						parents: [ DRIVE_DIR_ID ],
					}, null, "\t"),
					"",
					`--${BOUNDARY}`,
					"Content-Transfer-Encoding: base64",
					`Content-Type: ${column.mime}`,
					"",
					column.body,
					`--${BOUNDARY}--`
				].join("\n")
			});
		});
	}
}



// 定数定義

const BOUNDARY = "ColumnManager";
const templates = new TemplateLoader("./../../libs/templates/Uploader.html");



// イベント登録

window.addEventListener("DOMContentLoaded", () => {
	uploader.addEventListener("submit", e => {
		e.preventDefault();

		uploadBtn.disabled = true;
		CMUploader.uploadColumn().then(
			() => {
				M.toast({ html: "コラムが正常にアップロードされました" });
				uploadBtn.disabled = false;
			},

			error => {
				M.toast({ classes: "red", html: "コラムのアップロードに失敗しました" });
				uploadBtn.disabled = false;
				
				throw error;
			}
		);
	});

	columnTypePicker.addEventListener("change", e => CMUploader.changeColumnType(e.target.value));
});



/* global M, TemplateLoader, gapi, user, DRIVE_DIR_ID */