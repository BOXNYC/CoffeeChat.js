# CoffeeChat.js
JavaScript class helper for connecting to CoffeeChat at https://chat.coffeeww.com/

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
