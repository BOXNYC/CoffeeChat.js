# CoffeeChat.js
JavaScript class helper for connecting to CoffeeChat at https://chat.coffeeww.com/

## Overview
CoffeeChat.js is a ES6 class which connects to the CoffeeChat API to handle REST API calls asynchronsly. Intitialize a class instance with your API key (CoffeeChat is not a public project, it's use is soley for Coffee Worldwide's clientelle), and use it immediatly to chat, load, and delete threads. CoffeeChat uses OpenAI's Assistant API. Current support:`
```JavaScript
<instance>.addMessage(message, onComplete, onError)
```
```JavaScript
<instance>.retrieveThread(onComplete, onError)
// Note: retrieveThread uses the instance's threadID property, it must be set before calling: <instance>.threadID = '########';
```
```JavaScript
<instance>.deleteThread(threadID, onComplete, onError)
// Note: retrieveThread uses the instance's threadID property, it must be set before calling: <instance>.threadID = '########';
```
```JavaScript
static CoffeeChat.forEach(resp, callback)
// Loops through all the current thread's messages calling the callback method with a single param object with two properties ({text, role})
// *role* is either "user" or "assistant" 
```

## How to use
```JavaScript
const $thread = document.querySelector('ul');
const render = resp => {
  $thread.innerHTML = '';
  CoffeeChat.forEach(resp, ({text, role})=>{
    const $li = document.createElement('li');
    $li.className = `list-group-item ${role}`;
    $li.innerHTML = text;
    $thread.appendChild($li);
  });
}
const renderQuestion = text => {
  const $li = document.createElement('li');
  $li.className = 'list-group-item user';
  $li.innerHTML = text;
  $thread.appendChild($li);
}
const showLoading = () => {
  const $spinner = document.createElement('div');
  $spinner.className = 'spinner-border mx-auto';
  $spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
  $thread.appendChild($spinner);
}

const APP_KEY = '################################';
const chatAPI = new CoffeeChat(APP_KEY);
document.querySelector('input[type="text"]').onkeyup = e => {
  if (e.key !== 'Enter') return;
  renderQuestion(e.target.value);
  showLoading();
  chatAPI.addMessage(e.target.value, resp=>{
    render(resp);
    e.target.disabled = false;
  }, console.error);
  e.target.value = '';
  e.target.disabled = true;
}
```
