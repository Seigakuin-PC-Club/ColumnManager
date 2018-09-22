// ページ内要素定義

const yourColumnsStates = document.querySelectorAll(".drive-state--columns--yours");

const drive = document.getElementById("drive");



// メソッド定義

const CMDrive = (() => {
	class CMDrive {
		/**
		 * アルファベット・数字で構成されたUUIDをランダムに生成します
		 * 
		 * @param {Number} [length=8] UUIDの長さ
		 * @return {String}
		 */
		static generateUuid (length = 8) {
			let uuid = "";
	
			let counter = 0;
			while (counter++ < length) uuid += this.UUID_CHARS[ Math.floor(Math.random() * this.UUID_CHARS.length) ];
	
			return uuid;
		}

		static changeThumbnailSize (url, size) {
			if (this.COLUMN_THUMBNAIL_MATCHER.test(url)) return url.replace(url.match(this.COLUMN_THUMBNAIL_MATCHER)[1], size ? `=s${size}` : "");
			if (this.FILETYPE_THUMBNAIL_MATCHER.test(url)) return url.replace(url.match(this.FILETYPE_THUMBNAIL_MATCHER)[1], size || "16");
		}
	}

	CMDrive.UUID_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
	CMDrive.COLUMN_THUMBNAIL_MATCHER = /^https:\/\/(?:.*\.)?googleusercontent\.com\/.+(=s\d+)$/;
	CMDrive.FILETYPE_THUMBNAIL_MATCHER = /^https:\/\/(?:.*\.)?googleusercontent\.com\/(\d+)\/.+/;



	return CMDrive;
})();



// 定数定義

const templates = new TemplateLoader("./../libs/templates/Drive.html");



// イベント登録

Promise.all([
	templates.on("load"),
	CMCommon.on("authorized")
]).then(() => {
	CMCommon.on("authorized").then(() => {
		return gapi.client.drive.files.list({
			q: `parents in "${DRIVE_DIR_ID}" and name contains "${user.uid}" and trashed != true`,
			fields: "files(id,name,originalFilename,createdTime,properties,webContentLink,iconLink,hasThumbnail,thumbnailLink)"
		});
	}).then(resp => {
		const columns = resp.result.files;

		for (const yourColumnsState of yourColumnsStates) yourColumnsState.textContent = columns.length;
		for (const column of columns) {
			column.properties.usedStudents = column.properties.usedStudents ? column.properties.usedStudents.split(" ") : [];

			const { publishedAt, usedStudents } = column.properties;

			const columnPanel = templates.createComponent("Column--Own", column.id, CMDrive.generateUuid(8));
			columnPanel.style.setProperty("--column-thumbnail", `url(${column.hasThumbnail ? CMDrive.changeThumbnailSize(column.thumbnailLink) : CMDrive.changeThumbnailSize(column.iconLink, 256)})`);

			for (const title of columnPanel.querySelectorAll(".column-title")) title.textContent = column.originalFilename;
			for (const uploadedAtState of columnPanel.querySelectorAll(".column-uploaded-at")) uploadedAtState.textContent = new Date(column.createdTime).toLocaleDateString();
			for (const publishedAtState of columnPanel.querySelectorAll(".column-published-at")) publishedAtState.textContent = publishedAt ? new Date(publishedAt).toLocaleDateString() : "不明";

			for (const usedByAuthor of columnPanel.querySelectorAll(".column-used-by-author")) {
				if (usedStudents.indexOf(user.uid) < 0) break;

				usedByAuthor.classList.add("red-text");
				usedByAuthor.textContent = "済";
			}

			for (const usedCountState of columnPanel.querySelectorAll(".column-used-count")) usedCountState.textContent = usedStudents.length;

			for (const downloadBtn of columnPanel.querySelectorAll(".column-download")) {
				downloadBtn.addEventListener("click", () => {
					const dlWindow = window.open(column.webContentLink, "download");
					dlWindow.addEventListener("unload", () => {
						const fileId = columnPanel.dataset.columnId;

						gapi.client.drive.files.get({ fileId, fields: "properties" }).then(
							resp => {
								const usedStudents = resp.result.properties.usedStudents.split(" ");
								if (usedStudents.indexOf(user.uid) < 0) usedStudents.push(user.uid);

								return gapi.client.drive.files.update({ fileId, properties: { usedStudents: usedStudents.join(" ") } });
							},

							error => {
								M.toast({ classes: "red", html: "ダウンロードに失敗しました" });
								throw error;
							}
						).then(
							() => M.toast({ html: "ダウンロードが完了しました" }),

							error => {
								M.toast({ classes: "red", html: "利用状況の更新に失敗しました" });
								throw error;
							}
						);
					});
				});
			}

			drive.appendChild(columnPanel);
			for (const menuTrigger of columnPanel.querySelectorAll(".dropdown-trigger")) M.Dropdown.init(menuTrigger);

			for (const menuDeleteBtn of columnPanel.querySelectorAll(".column-menu--delete")) {
				menuDeleteBtn.addEventListener("click", () => {
					gapi.client.drive.files.delete({ fileId: columnPanel.dataset.columnId }).then(
						() => {
							M.toast({ html: "コラムの削除に成功しました" });

							columnPanel.remove();
							for (const yourColumnsState of yourColumnsStates) yourColumnsState.textContent = yourColumnsState.textContent - 1;
						},

						error => {
							M.toast({ classes: "red", html: "コラムの削除に失敗しました" });
							throw error;
						}
					);
				});
			}
		}
	});
});



/* global M, TemplateLoader, CMCommon, gapi, user, DRIVE_DIR_ID */