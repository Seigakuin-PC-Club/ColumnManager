// ?q=parents in "${DRIVE_DIR_ID}" and name contains "${user.uid}" and trashed != true
// ?fields=files(id,name,originalFilename,createdTime,properties,webContentLink,iconLink,hasThumbnail,thumbnailLink)

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
			while (counter++ < length) uuid += this.UUIDCHARS[ Math.floor(Math.random() * this.UUIDCHARS.length) ];
	
			return uuid;
		}
	}

	CMDrive.UUIDCHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");



	return CMDrive;
})();