class CoffeeChatIFrame {
	constructor(API_KEY, options) {
		options = options || {};
		this.threadID = options.threadID || null;
		this.options = options;
		this.onComplete = null;
		this.onError = null;
		this.thread = [];
		this.lastMessage = null;
		if (typeof options.iframeSelector === 'undefined') this.createIFrameEmbed(API_KEY);
		window.addEventListener('message', this.messageReceived.bind(this), false);
	}
	createIFrameEmbed(API_KEY) {
		const $container = document.createElement('div');
		$container.setAttribute('style', 'position: absolute; width: 1px !important; height: 1px !important; padding: 0 !important; margin: 0 !important; min-width: 1px !important; min-height: 1px !important;');
		$container.innerHTML = '<iframe id="coffee-chat-iframeapi" width="1" height="1" frameborder="0" src="https://chat.coffeeww.com/iframeapi?key='+API_KEY+'"></iframe>';
		(this.options.iFrameEmbedParent || document.body).appendChild($container);
	}
	get iframe() {
		this._iframe = this._iframe || document.getElementById('coffee-chat-iframeapi');
		return this._iframe;
	}
	messageReceived(event) {
		if (typeof event.data !== 'object') return;
		const {thread, lastMessage, threadID} = event.data;
		this.thread.push(...thread);
		if ( this.onComplete )
			this.onComplete.call(this, thread, lastMessage, threadID);
	}
	addMessage(input, onComplete, onError) {
		if (onComplete) this.onComplete = onComplete;
		if (onError) this.onError = onError;
		this.iframe.contentWindow.postMessage({input}, '*');
	}
	loadMessages(_threadID, onComplete, onError) {
		this.iframe.contentWindow.postMessage({threadID}, '*');
	}
}
