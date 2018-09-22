// ページ内要素定義

const allColumnsStates = document.querySelectorAll(".drive-state--columns--all");

const explore = document.getElementById("explore");



// メソッド定義

const CMExplore = (() => {
	class CMExplore {
		static changeThumbnailSize (url, size) {
			if (this.COLUMN_THUMBNAIL_MATCHER.test(url)) return url.replace(url.match(this.COLUMN_THUMBNAIL_MATCHER)[1], size ? `=s${size}` : "");
			if (this.FILETYPE_THUMBNAIL_MATCHER.test(url)) return url.replace(url.match(this.FILETYPE_THUMBNAIL_MATCHER)[1], size || "16");
		}

		/**
		 * コラムの状態に基づいて代入します
		 * 
		 * @param {HTMLElement} column コラム要素
		 * @param {ColumnStates} states
		 */
		static updateColumnStates (column, states) {
			if (!states) return;

			if (states.title !== undefined) for (const title of column.querySelectorAll(".column-title")) title.textContent = states.title;
			if (states.thumbnail !== undefined) column.style.setProperty("--column-thumbnail", `url(${states.thumbnail})`);
			if (states.authors && Array.isArray(states.authors)) for (const author of column.querySelectorAll(".column-author")) author.textContent = states.authors.join(", ");
			if (states.uploadedAt !== undefined) for (const uploadedAtState of column.querySelectorAll(".column-uploaded-at")) uploadedAtState.textContent = new Date(states.uploadedAt).toLocaleDateString();
			if (states.publishedAt !== undefined) for (const publishedAtState of column.querySelectorAll(".column-published-at")) publishedAtState.textContent = states.publishedAt ? new Date(states.publishedAt).toLocaleDateString() : "不明";

			if (states.usedStudents && Array.isArray(states.usedStudents)) {
				for (const usedCountState of column.querySelectorAll(".column-used-count")) usedCountState.textContent = states.usedStudents.length;

				for (const usedByAuthor of column.querySelectorAll(".column-used-by-author")) {
					if (states.usedStudents.indexOf(user.uid) < 0) break;
	
					usedByAuthor.classList.add("red-text");
					usedByAuthor.textContent = "済";
				}
			}
		}
	}

	CMExplore.UUID_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
	CMExplore.COLUMN_THUMBNAIL_MATCHER = /^https:\/\/(?:.*\.)?googleusercontent\.com\/.+(=s\d+)$/;
	CMExplore.FILETYPE_THUMBNAIL_MATCHER = /^https:\/\/(?:.*\.)?googleusercontent\.com\/(\d+)\/.+/;



	return CMExplore;
})();

/**
 * @typedef {Object} ColumnStates
 * @prop {String} title
 * @prop {String} thumbnail
 * @prop {Array<String>} authors
 * @prop {String} uploadedAt
 * @prop {String} publishedAt
 * @prop {Array<String>} usedStudents
 */



// 定数定義

const templates = new TemplateLoader("./../libs/templates/Column.html");



// イベント登録

Promise.all([
	templates.on("load"),
	CMCommon.on("authorized")
]).then(() => {
	CMCommon.on("authorized").then(() => {
		return gapi.client.drive.files.list({
			q: `parents in "${DRIVE_DIR_ID}" and trashed != true`,
			fields: "files(id,name,originalFilename,owners(displayName,photoLink,emailAddress),createdTime,properties,webContentLink,iconLink,hasThumbnail,thumbnailLink)"
		});
	}).then(resp => {
		const columns = resp.result.files;

		for (const allColumnsState of allColumnsStates) allColumnsState.textContent = columns.length;
		for (const column of columns) {
			column.properties.usedStudents = column.properties.usedStudents ? column.properties.usedStudents.split(" ") : [];

			const columnPanel = templates.createComponent("Column", column.id);

			CMExplore.updateColumnStates(columnPanel, {
				title: column.originalFilename,
				thumbnail: column.hasThumbnail ? CMExplore.changeThumbnailSize(column.thumbnailLink) : CMExplore.changeThumbnailSize(column.iconLink, 256),
				authors: column.owners.map(owner => owner.displayName),
				uploadedAt: column.createdTime,
				publishedAt: column.properties.publishedAt,
				usedStudents: column.properties.usedStudents
			});

			explore.appendChild(columnPanel);

			for (const downloadBtn of columnPanel.querySelectorAll(".column-download")) {
				downloadBtn.addEventListener("click", () => {
					const dlWindow = window.open(column.webContentLink, "download");
					dlWindow.addEventListener("unload", () => {
						const fileId = columnPanel.dataset.columnId;

						gapi.client.drive.files.get({ fileId, fields: "properties" }).then(
							resp => {
								const usedStudents = column.properties.usedStudents = resp.result.properties.usedStudents ? resp.result.properties.usedStudents.split(" ") : [];
								if (usedStudents.indexOf(user.uid) < 0) usedStudents.push(user.uid);

								return gapi.client.drive.files.update({ fileId, properties: { usedStudents: usedStudents.join(" ") } });
							},

							error => {
								M.toast({ classes: "red", html: "ダウンロードに失敗しました" });
								throw error;
							}
						).then(
							() => {
								M.toast({ html: "ダウンロードが完了しました" });
								CMExplore.updateColumnStates(columnPanel, { usedStudents: column.properties.usedStudents });
							},

							error => {
								M.toast({ classes: "red", html: "利用状況の更新に失敗しました" });
								throw error;
							}
						);
					});
				});
			}

			for (const menuDeleteBtn of columnPanel.querySelectorAll(".column-menu--delete")) {
				menuDeleteBtn.addEventListener("click", () => {
					gapi.client.drive.files.delete({ fileId: columnPanel.dataset.columnId }).then(
						() => {
							M.toast({ html: "コラムの削除に成功しました" });

							columnPanel.remove();
							for (const allColumnsState of allColumnsStates) allColumnsState.textContent = allColumnsState.textContent - 1;
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