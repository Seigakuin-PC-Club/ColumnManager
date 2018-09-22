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
		console.info(columns);

		for (const yourColumnsState of yourColumnsStates) yourColumnsState.textContent = columns.length;

		for (const column of columns) {
			const columnPanel = templates.createComponent("Column--Own", CMDrive.generateUuid(8));
			columnPanel.style.setProperty("--column-thumbnail", `url(${column.hasThumbnail ? CMDrive.changeThumbnailSize(column.thumbnailLink) : CMDrive.changeThumbnailSize(column.iconLink, 256)})`);

			const columnTitle = columnPanel.querySelectorAll(".column-title");
			for (const title of columnTitle) title.textContent = column.originalFilename;

			const columnUploadedAt = columnPanel.querySelectorAll(".column-uploaded-at");
			for (const uploadedAt of columnUploadedAt) uploadedAt.textContent = new Date(column.createdTime).toLocaleDateString();

			const columnPublishedAt = columnPanel.querySelectorAll(".column-published-at");
			for (const publishedAt of columnPublishedAt) publishedAt.textContent = column.properties.publishedAt ? new Date(column.properties.publishedAt).toLocaleDateString() : "";

			const columnUsedCount = columnPanel.querySelectorAll(".column-used-count");
			for (const usedCount of columnUsedCount) {

			}
			
			const columnMenuTrigger = columnPanel.querySelectorAll(".dropdown-trigger");

			drive.appendChild(columnPanel);
			for (const menuTrigger of columnMenuTrigger) M.Dropdown.init(menuTrigger);
		}
	});
});



/* global M, TemplateLoader, CMCommon, gapi, user, DRIVE_DIR_ID */