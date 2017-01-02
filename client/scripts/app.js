// YOUR CODE HERE:
//https://api.parse.com/1/classes/messages

var App = function() {

};

App.prototype.init = function() {

};

App.prototype.send = function(message) {
  $.ajax({
    url: 'https://api.parse.com/1/classes/messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

App.prototype.fetch = function() {
  $.ajax({
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent', data);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

App.prototype.clearMessages = function() {
  $('#chats').remove();
  $('#main').append('<div id="chats"></div>');
};

App.prototype.renderMessage = function(message) {
  $('#chats').append(`<div>${message.username}: ${message.text} @ ${message.roomname}</div>`);
};

App.prototype.renderRoom = function(roomName) {
  $('#roomSelect').append(`<div>${roomName}</div>`);
};

var app = new App;  