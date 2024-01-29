import OpenAI from 'https://cdn.jsdelivr.net/npm/openai@4.26.0/+esm';
class CoffeeOpenAIChat {
	constructor(API_KEY, options) {
		options = options || {};
		options.runStatusCheckDelay = options.runStatusCheckDelay || 2000;
		options.onInitMessagesLoad = options.onInitMessagesLoad || function(){};
		this.threadID = options.threadID || null;
		this.options = options;
		this.app = null;
		this.openai = null;
		this.thread = [];
		this.lastMessage = null;
		if ( options.loadAppOnInit !== false ) this.loadApp(API_KEY);
	}
	loadApp(API_KEY) {
		const appDomain = 'https://chat.coffeeww.com/app';
		const headers = {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json',
			'X-API-KEY': API_KEY
		};
		fetch(`${appDomain}`, {
			method: 'POST', headers
		}).then(res => {
			return res.json();
		}).then(res => {
			const {data} = res;
			if ( typeof data.open_ai_key !== 'string' )
				return console.error('CoffeeOpenAIChat.loadApp() App.open_ai_key string is missing.');
			if ( typeof data.assistant_id !== 'string' )
				return console.error('CoffeeOpenAIChat.loadApp() App.assistant_id string is missing.');
			this.app = data;
			if ( this.options.initOnLoadApp !== false ) this.init();
		}).catch(err => {
			console.error(err);
		});
	}
	async init() {
		const {app, threadID, options} = this;
		if ( !app ) return console.error('CoffeeOpenAIChat.init() App not defined.');
		const openai = new OpenAI({
		  apiKey: app.open_ai_key,
		  dangerouslyAllowBrowser: true,
		});
		this.openai = openai;
		if ( threadID ) return this.loadMessages(threadID, options.onInitMessagesLoad);
		const thread = await openai.beta.threads.create();
		this.threadID = thread.id;
	}
	async addMessage(input, onComplete, onError) {
		const {options, app, openai, threadID} = this;
		onComplete = onComplete || function(){};
		onError = onError || function(){};
		if ( !app )
			return console.error('CoffeeOpenAIChat.addMessage() App not defined.');
		if ( !openai )
			return console.error('CoffeeOpenAIChat.addMessage() openai instance has not been created.');
		if ( !threadID )
			return console.error('CoffeeOpenAIChat.addMessage() threadID not defined.');
		if ( typeof app.prompt_template === 'string' )
			input = app.prompt_template.replace('${prompt}', input);
		await openai.beta.threads.messages.create(threadID, {
		  role: 'user',
		  content: input,
		});
		const run = await openai.beta.threads.runs.create(threadID, {
		  assistant_id: app.assistant_id,
		});
		let response = await openai.beta.threads.runs.retrieve(threadID, run.id);
		while (response.status === 'in_progress' || response.status === 'queued') {
		  await new Promise((resolve) => setTimeout(resolve, options.runStatusCheckDelay));
		  response = await openai.beta.threads.runs.retrieve(threadID, run.id);
		}
		this.loadMessages(threadID, onComplete, onError);
	}
	async loadMessages(_threadID, onComplete, onError) {
		const {options, app, openai, threadID} = this;
		onComplete = onComplete || function(){};
		onError = onError || function(){};
		const messageList = await openai.beta.threads.messages.list(_threadID);
		const messages = [];
		let lastMessage = null;
		const lastIndex = messageList.data.length-1;
		messageList.data.reverse().forEach((message, index)=>{
			const content = message.content[0]['text'].value;
			const { role } = message;
			const MESSAGE = { content, role };
			this.process( MESSAGE );
			messages.push( MESSAGE );
			if ( lastIndex == index ) lastMessage = MESSAGE;
		});
		this.thread = messages;
		this.lastMessage = lastMessage;
		onComplete.call(this, messages, lastMessage);
	}
	process( message ) {
		const { app } = this;
		const { role } = message;
		if ( role == 'assistant' && typeof app.assistant_replacements === 'object' ) {
			if ( Array.isArray(app.assistant_replacements) ) {
				this.app.assistant_replacements.forEach(repl=>{
					let [find, replace] = repl;
					if ( typeof repl[2] === 'string' ) {
						find = find.replace(/\"/ig, '\\"');
						find = new RegExp(find, repl[2]);
					}
					message.content = message.content.replace(find, replace);
				});
			}
		}
		if ( role == 'assistant' && typeof app.extract_assistant_quotes === 'string' ) {
			switch( this.app.extract_assistant_quotes ) {
				case 'LAST':
					const quotes = message.content.split(/[\"“”]/gi);
					if ( quotes.length >= 3 ) message.content = quotes[quotes.length-2];
					break;
			}
		}
		if ( role == 'user' && typeof app.prompt_template === 'string' ) {
			const parts = app.prompt_template.split(/\$\{\s*prompt\s*\}/g);
			parts.forEach(part=>{
				message.content = message.content.replace(part, '');
			});
		}
	}
}
export default CoffeeOpenAIChat;
