const socket = io();
const input = document.getElementById('messageInput');
const chatBox = document.getElementById('chat-box');

function sendMessage() {
  const msg = input.value;
  if (msg.trim() === '') return;
  socket.emit('chatMessage', msg);
  input.value = '';
}

socket.on('chatMessage', (data) => {
  const msgEl = document.createElement('div');
  msgEl.innerHTML = `<strong>[${data.time}]</strong> ${data.text} <em>(${data.emotion})</em>`;
  chatBox.appendChild(msgEl);
  chatBox.scrollTop = chatBox.scrollHeight;
});
