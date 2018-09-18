/**
 * HTMLテンプレートを読み込むクラス
 * @author Genbu Hase
 */
class TemplateLoader {
	static get SELECTORS () {
		return {
			Tags: {
				Component: "DTL\\:Component"
			},

			Attrs: {
				ComponentName: "DTL\\:Name"
			}
		}
	}
	
	/**
	 * テンプレート内の外部コンポーネントを読み込みます
	 * 
	 * @param {String} rootDir ルートテンプレートのURL
	 * @param {HTMLHtmlElement} template テンプレートDOM要素
	 * 
	 * @return {Promise<null>}
	 */
	static loadComponents (rootDir, template) {
		const tasks = [];

		const components = template.querySelectorAll(TemplateLoader.SELECTORS.Tags.Component);
		for (const component of components) {
			let componentUrl = component.getAttribute("Src");

			try {
				new URL(componentUrl);
			} catch (error) {
				componentUrl = [ rootDir, componentUrl ].join("/");
			}

			tasks.push(fetch(componentUrl).then(resp => resp.text()).then(html => component.outerHTML = html));
		}

		return Promise.all(tasks).then(() => {
			if (!template.querySelectorAll(TemplateLoader.SELECTORS.Tags.Component).length) return;

			TemplateLoader.loadComponents(rootDir, template);
		});
	}



	/**
	 * TemplateLoaderを生成します
	 * @param {String} templateUrl テンプレートファイルのURL
	 */
	constructor (templateUrl) {
		if (templateUrl == undefined) throw new TypeError("templateUrl is required");

		this.loaded = false;

		let rootDir = "";
		fetch(templateUrl).then(resp => {
			rootDir = new URL(resp.url).href.replace(document.baseURI, "").split(/\//).join("/");
			return resp.text();
		}).then(html => {
			const template = document.createElement("html");
			template.innerHTML = html;

			TemplateLoader.loadComponents(rootDir, template).then(() => {
				this.template = template;
				this.loaded = true;
			});
		}).catch(error => { throw error });
	}

	/**
	 * イベントを登録します
	 * 
	 * @param {TemplateLoader.EventTypes} eventName
	 * @param {Function} [callback]
	 * 
	 * @return {Promise}
	 */
	on (eventName, callback) {
		switch (eventName) {
			default:
				throw new TypeError("A provided event-type is not acceptable");

			case "load":
				return new Promise(resolve => {
					const detector = setInterval(() => {
						if (this.loaded) {
							clearInterval(detector);

							if (callback) callback(this);
							resolve(this);
						}
					});
				});
		}
	}

	/**
	 * テンプレート内のコンポーネントを読み込みます
	 * 
	 * @param {String} name コンポーネント名
	 * @param {String[]} variables コンポーネント内変数
	 * 
	 * @return {HTMLElement}
	 */
	createComponent (name, ...variables) {
		return new TemplateLoader.Component(this.template, name, ...variables);
	}
}

/**
 * @typedef {"load"} TemplateLoader.EventTypes
 */



/**
 * テンプレートを用いてコンポーネントを読み込むクラス
 * @author Genbu Hase
 */
TemplateLoader.Component = class Component {
	/**
	 * Componentを生成します
	 * 
	 * @param {HTMLHtmlElement} template テンプレートDOM要素
	 * @param {String} name コンポーネント名
	 * @param {String[]} [variables] コンポーネント内変数
	 * 
	 * @return {HTMLElement}
	 */
	constructor (template, name, ...variables) {
		const foundComponent = template.querySelector(`*[${TemplateLoader.SELECTORS.Attrs.ComponentName}="${name}"]`);
		if (!foundComponent) throw new TypeError("Any components aren't found by the provided condition");

		const component = document.importNode(foundComponent, true);

		const componentWrapper = document.createElement("div");
		componentWrapper.appendChild(component);

		component.outerHTML = (() => {
			let html = component.outerHTML;
			variables.forEach((variable, index) => html = html.replace(new RegExp(`\\$\\{${index}\\}`, "g"), variable));

			return html;
		})();

		return componentWrapper.firstElementChild;
	}
}