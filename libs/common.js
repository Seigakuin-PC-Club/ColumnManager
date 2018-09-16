// Materializeの初期化処理

window.addEventListener("DOMContentLoaded", () => {
	const sidenavs = document.querySelectorAll(".sidenav");
	for (const sidenav of sidenavs) M.Sidenav.init(sidenav);
});



// Google APIとの連携処理

const CLIENT_OPTIONS = {
	apiKey: "AIzaSyB1VKWTrQ8d6yQ-5a7e_q_nz5xCpETrE60",
	clientId: "894129288771-s8j9a9muf2cbs4vs79h1uhagcc73jrd2.apps.googleusercontent.com",
	scope: "https://www.googleapis.com/auth/drive",
	discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],

	hosted_domain: "seig-boys.jp"
};

const SIGNIN_OPTIONS = {
	scope: "email openid",
	redirect_uri: `${location.host === "seigakuin-pc-club.github.io" ? `${location.origin}/ColumnManager` : location.origin}/login`,

	ux_mode: "popup"
};



window.addEventListener("DOMContentLoaded", () => {
	if (gapi.client) return;

	gapi.load("client:auth2", () => {
		Promise.all([
			gapi.client.init(CLIENT_OPTIONS).catch(error => { throw error }),
			gapi.auth2.getAuthInstance()
		]).then(() => {
			//return gapi.auth2.getAuthInstance().signIn(SIGNIN_OPTIONS);
		}).then(() => {
			console.log("Complated");
		});
	});
});



/* global M */
/* global gapi */