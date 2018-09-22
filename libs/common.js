// ページ内要素定義

const signInOutBtns = document.querySelectorAll("A.btn--sign-in-out");
const isSignedInStates = document.querySelectorAll(".user-state--is-signed-in");
const userStatePanels = document.querySelectorAll(".user-state-panel");
const userPhotoStates = document.querySelectorAll(".user-state--photo");
const userNameStates = document.querySelectorAll(".user-state--name");
const userEmailStates = document.querySelectorAll(".user-state--email");

const scriptLoader = document.querySelector('Script[Src$="common.js"]');
const drawer = document.querySelector("#drawer");



// メソッド定義

const MESSAGES = {
	State_isNetworkConnected: {
		true: { short: "接続済み", long: "接続されています" },
		false: { short: "未接続", long: "ネットワークに接続されていません" },
	},

	UserState_isSignedIn: {
		true: { short: "Sign out", long: "ログインされています" },
		false: { short: "Sign in", long: "ログインされていません" },
	},
};

class CMCommon {
	/**
	 * イベントを登録します
	 * 
	 * @param {CMCommon.Events} event 登録するイベント
	 * @param {Function} [callback] イベントのコールバック
	 * 
	 * @return {Promise}
	 */
	static on (event, callback) {
		switch (event) {
			default:
				throw new TypeError("The provided event is not defined");
			case "authorized":
				if (callback instanceof Function) callback();

				return new Promise((resolve, reject) => {
					let counter = 0;
					const detector = setInterval(() => {
						counter++;
						
						if (isAuthorized) {
							clearInterval(detector);
							return resolve();
						}
			
						if (counter >= 10000) {
							clearInterval(detector);
							return reject(new Error("Connection has been disconnected by a timeout"));
						}
					});
				});
		}
	}

	/**
	 * 指定された要素に紐付けられたメッセージを代入します
	 * 
	 * @param {HTMLElement} elem DOM要素
	 * @param {any} state 状態
	 * @param {String} [propertyName="textContent"] 代入時に利用されるプロパティ名
	 */
	static updateMessage (elem, state, propertyName = "textContent") {
		const MSGNAME_MATCHER = /^message--/;
		const MSGTYPE_MATCHER = /^message-(short|long)/;

		let msgName = null;
		let msgType = "short";
		for (const className of Array.prototype.values.call(elem.classList)) {
			if (MSGNAME_MATCHER.test(className)) msgName = className.split(MSGNAME_MATCHER)[1];
			if (MSGTYPE_MATCHER.test(className)) msgType = className.match(MSGTYPE_MATCHER)[1];
		}

		elem[propertyName] = MESSAGES[msgName][state][msgType];
	}

	/**
	 * 指定されたメールアドレスが生徒用のものかどうか照合します
	 * 
	 * @param {String} email メールアドレス
	 * @return {Boolean}
	 */
	static checkEmailValidity (email) { return UID_MATCHER.test(email) }

	/** Google API周りの変数を初期化します */
	static initShorthands () {
		if (!window.gapi) return;
		
		auth = gapi.auth2.getAuthInstance();
		user = auth.currentUser.get();

		if (auth.isSignedIn.get()) {
			user.uid =
				user.getBasicProfile().getEmail().match(UID_MATCHER).length ?
				user.getBasicProfile().getEmail().match(UID_MATCHER)[1] : "";
		}
	}

	static onAuthorizedHandler (isSignedIn) {
		if (scriptLoader.dataset.authRequired !== undefined && !isSignedIn) return location.href = ROOT_DIR;

		this.initShorthands();

		if (isSignedIn && !this.checkEmailValidity(user.getBasicProfile().getEmail())) {
			return auth.signOut().then(() => location.href = `${ROOT_DIR}/error/403`);
		}

		if (isSignedIn === null) {
			for (const name of userNameStates) name.textContent = MESSAGES.State_isNetworkConnected.false.long;
			return;
		}

		isAuthorized = true;

		for (const isSignedInState of isSignedInStates) this.updateMessage(isSignedInState, isSignedIn);
		for (const signInOutBtn of signInOutBtns) {
			signInOutBtn.classList.remove("hide");
			signInOutBtn.dataset.isSignedIn = isSignedIn;
		}

		this.updateUserPanel(isSignedIn ? user : null);
	}

	static updateUserPanel (user) {
		if (!user) {
			for (const photo of userPhotoStates) photo.src = `${ROOT_DIR}/assets/profile-default.png`;
			for (const name of userNameStates) this.updateMessage(name, false);
			for (const email of userEmailStates) email.textContent = "";
			
			return;
		}

		const profile = user.getBasicProfile();

		for (const photo of userPhotoStates) photo.src = profile.getImageUrl();
		for (const name of userNameStates) name.textContent = profile.getName();
		for (const email of userEmailStates) email.textContent = profile.getEmail();

		for (const tab of drawer.querySelectorAll(":scope > *.hide")) tab.classList.remove("hide");
	}
}

/**
 * @typedef {"authorized"} CMCommon.Events
 */



// 定数定義

const ROOT_DIR = location.host === "seigakuin-pc-club.github.io" ? `${location.origin}/ColumnManager` : location.origin;
const DRIVE_DIR_ID = "1MoMuOrbicOuO7xMtcJ5crk87dW7OuxTM";

const CLIENT_OPTIONS = {
	apiKey: "AIzaSyB1VKWTrQ8d6yQ-5a7e_q_nz5xCpETrE60",
	clientId: "894129288771-s8j9a9muf2cbs4vs79h1uhagcc73jrd2.apps.googleusercontent.com",
	scope: "https://www.googleapis.com/auth/drive",
	discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],

	hosted_domain: "seig-boys.jp",
};

const SIGNIN_OPTIONS = {
	scope: "email openid",
	redirect_uri: ROOT_DIR,

	// ux_mode: "popup" | "redirect",
};

const UID_MATCHER = /^(b\d{5})@seig-boys\.jp/;

let isAuthorized = false;
let auth = null;
let user = null;



// Materializeの初期化処理

window.addEventListener("DOMContentLoaded", () => {
	const selects = document.querySelectorAll("Select");
	for (const select of selects) M.FormSelect.init(select);

	const dropdowns = document.querySelectorAll(".dropdown-trigger");
	for (const dropdown of dropdowns) M.Dropdown.init(dropdown);
	
	const sidenavs = document.querySelectorAll(".sidenav");
	for (const sidenav of sidenavs) M.Sidenav.init(sidenav);

	const collapsibles = document.querySelectorAll(".collapsible");
	for (const collapsible of collapsibles) M.Collapsible.init(collapsible);

	const datepickers = document.querySelectorAll(".datepicker");
	for (const datepicker of datepickers) {
		M.Datepicker.init(datepicker, {
			defaultDate: new Date(),
			format: "yyyy/mm/dd",
			firstDay: 1,
			showClearBtn: true,

			onClose: () => M.updateTextFields()
		});
	}
});



// Google APIとの連携処理

window.addEventListener("DOMContentLoaded", () => {
	// Google APIとの連携

	if (!window.gapi) return CMCommon.onAuthorizedHandler(null);
	
	gapi.load("client:auth2", () => {
		Promise.all([
			gapi.client.init(CLIENT_OPTIONS).catch(error => { throw error }),
			gapi.auth2.getAuthInstance()
		]).then(() => {
			CMCommon.onAuthorizedHandler(gapi.auth2.getAuthInstance().isSignedIn.get());
			auth.isSignedIn.listen(state => CMCommon.onAuthorizedHandler(state));
		});
	});



	// イベントの登録

	for (const signInOutBtn of signInOutBtns) {
		signInOutBtn.addEventListener("click", () => {
			const isDesktop = signInOutBtn.classList.contains("btn--sign-in-out--desktop");

			switch (signInOutBtn.dataset.isSignedIn) {
				default:
					return;
				case "true":
					return gapi.auth2.getAuthInstance().signOut().then(() => location.href = ROOT_DIR);
				case "false":
					return gapi.auth2.getAuthInstance().signIn(Object.assign(SIGNIN_OPTIONS, { ux_mode: isDesktop ? "popup" : "redirect" }));
			}
		});
	}
});



/* global M, gapi */