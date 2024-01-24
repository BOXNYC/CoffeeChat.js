class CoffeeChat {
	constructor(API_KEY) {
		this.domain = 'https://chat.coffeeww.com';
		this.threadID = null;
		this.API_KEY = API_KEY;
	}
	static forEach(resp, callback) {
		resp.data.forEach(({content, role})=>{
			content.forEach(({text})=>{
				callback({text: text.value, role});
			});
		});
	}
	addMessage(prompt, onComplete, onError) {
		const endpoint = this.threadID ?
			`${this.domain}/messages/${this.threadID}` :
			`${this.domain}/messages`;
		fetch(`${endpoint}`, {
			method: this.threadID ? 'PUT' : 'POST',
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				'X-API-KEY': this.API_KEY
			},
			body: JSON.stringify({prompt})
		}).then(res => {
			return res.json();
		}).then(res => {
			this.threadID = res.data[0].thread_id;
			onComplete(res)
		}).catch(err => {
			onError(err);
		});
	}
	deleteThread(threadID, onComplete, onError) {
		const endpoint = `${this.domain}/thread/${threadID}`
		fetch(`${endpoint}`, {
			method: 'DELETE',
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				'X-API-KEY': this.API_KEY
			}
		}).then(res => {
			return res.json();
		}).then(res => {
			onComplete(res)
		}).catch(err => {
			onError(err);
		});
	}
	retrieveThread(onComplete, onError) {
		if ( !this.threadID ) return;
		const endpoint = `${this.domain}/thread/${this.threadID}`
		fetch(`${endpoint}`, {
			method: 'GET',
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				'X-API-KEY': this.API_KEY
			}
		}).then(res => {
			return res.json();
		}).then(res => {
			onComplete(res)
		}).catch(err => {
			onError(err);
		});
	}
	clear() {
		this.threadID = null;
	}
}
