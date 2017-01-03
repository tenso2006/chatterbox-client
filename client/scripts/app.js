// YOUR CODE HERE:
//https://api.parse.com/1/classes/messages

var App = function() {

};

App.prototype.init = function() {
  var context = this;
  $('.username').on('click', {context: context}, context.handleUsernameClick);
  $('#send .submit').on('click', {context: context}, context.handleSubmit);
  context.fetch(context);
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

App.prototype.fetch = function(context, previousData = null) {
  $.ajax({
    url: 'https://api.parse.com/1/classes/messages',
    type: 'GET',
    contentType: 'jsonp',
    data: {
      order: '-createdAt'
    },
    success: function (data) {
      var currentData = JSON.stringify(data.results[0]);
      if ( previousData !== currentData ) {
        context.renderMessage(JSON.parse(currentData));
      }
      previousData = currentData;
      setTimeout(function() {
        context.fetch(context, previousData);
      }, 1000);
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
  $('#chats').append(`<div> <a class='username' href='#'>${message.username}</a>: ${message.text} @ ${message.roomname}</div>`);
};

App.prototype.renderRoom = function(roomName) {
  $('#roomSelect').append(`<div>${roomName}</div>`);
};

App.prototype.handleUsernameClick = function(event) {

};

App.prototype.handleSubmit = function(event) {
  var text = $('#message').val();
  var message = {
    username: 'DJ',
    text: text,
    roomname: 'lobby'
  };
  event.data.context.send(message);
  $('#message').val('');
};

var app = new App();