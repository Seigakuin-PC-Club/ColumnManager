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

	hosted_domain: "seig-boys.jp",
};

const SIGNIN_OPTIONS = {
	scope: "email openid",
	redirect_uri: location.host === "seigakuin-pc-club.github.io" ? `${location.origin}/ColumnManager` : location.origin,

	// ux_mode: "popup" | "redirect",
};

const DIR_ID = "1MoMuOrbicOuO7xMtcJ5crk87dW7OuxTM";



window.addEventListener("DOMContentLoaded", () => {
	// ページ内要素

	const signInOutBtns = document.querySelectorAll("A.btn--sign-in-out");
	const isSignedInStates = document.querySelectorAll(".user-state--is-signed-in");



	// Google APIとの連携
	
	gapi.load("client:auth2", () => {
		Promise.all([
			gapi.client.init(CLIENT_OPTIONS).catch(error => { throw error }),
			gapi.auth2.getAuthInstance()
		]).then(() => {
			const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();

			for (const isSignedInState of isSignedInStates) isSignedInState.textContent = !isSignedIn ? "Sign in" : "Sign out";
			for (const signInOutBtn of signInOutBtns) signInOutBtn.dataset.isSignedIn = isSignedIn;

			gapi.auth2.getAuthInstance().isSignedIn.listen(state => {
				for (const isSignedInState of isSignedInStates) isSignedInState.textContent = !state ? "Sign in" : "Sign out";
			});
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
					return gapi.auth2.getAuthInstance().signOut().then(() => location.reload());
				case "false":
					return gapi.auth2.getAuthInstance().signIn(Object.assign(SIGNIN_OPTIONS, { ux_mode: isDesktop ? "popup" : "redirect" }));
			}
		});
	}
});



/* global M */
/* global gapi */