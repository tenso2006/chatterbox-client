// YOUR CODE HERE:
//https://api.parse.com/1/classes/messages

var App = function() {
  this.server = 'https://api.parse.com/1/classes/messages';
  this.previousRoomName;
  this.previousData;
};

App.prototype.recursion = function() {
  var context = this;
  var newData = this.fetch.call(context);
  this.previousRoomName = context.selectRoom.call(context, newData, context.previousRoomName);
  setTimeout(context.recursion.bind(context), 1000);
};

App.prototype.init = function() {
  var context = this;
  $('.username').on('click', {context: context}, context.handleUsernameClick);
  $('#send .submit').on('click', {context: context}, context.handleSubmit);
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
  var context = this;
  var newData;
  $.ajax({
    url: this.server,
    type: 'GET',
    contentType: 'jsonp',
    data: {
      order: '-createdAt'
    },
    success: function (data) {
      newData = data;
      if ( $('#chats').children().length === 0 ) {
        for ( var j = 10; j > 0; j-- ) {
          context.renderMessage(data.results[j]);
        }
      }
      var roomNames = context.checkRoomNames(data.results);
      if ( $('#roomSelect').children().length !== roomNames.length ) {
        $('#roomSelect').remove();
        $('#main').append('<select id="roomSelect"></select>');
        roomNames.forEach( function(roomName) {
          context.renderRoom(roomName);
        });
      }
      var currentData = JSON.stringify(data.results[0]);
      if ( context.previousData !== currentData ) {
        context.renderMessage(JSON.parse(currentData));
      }
      context.previousData = currentData;
      // setTimeout(context.fetch.bind(context, previousData, previousRoomName), 1000);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
  return newData;
};

App.prototype.clearMessages = function() {
  $('#chats').remove();
  $('#main').append('<div id="chats"></div>');
};

App.prototype.renderMessage = function(message) {
  $('#chats').append(`<div class='${message.roomname}'> <a class='username' href='#'>${message.username}</a>: ${message.text} @ ${message.roomname}</div>`);
};

App.prototype.renderRoom = function(roomName) {
  $('#roomSelect').append(`<option>${roomName}</option>`);
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
  console.log(message);
  if ( message.text !== '' ) {
    event.data.context.send(message);
  }
  $('#message').val('');
};

App.prototype.checkRoomNames = function(messages) {
  var roomNames = [];
  messages.forEach( function(message) {
    if ( roomNames.indexOf(message.roomname) === -1 && message.roomname !== undefined ) {
      roomNames.push(message.roomname);
    }
  });
  return roomNames;
};

App.prototype.selectRoom = function(data, previousRoomName) {
  var currentRoomName;
  var rooms = $('#roomSelect').children();
  for ( var i = 0; i < rooms.length; i++ ) {
    if ( rooms[i].selected ) {
      if ( rooms[i].value === previousRoomName ) {
        return previousRoomName;
      } else {
        currentRoomName = rooms[i].value;
        var selectedMessages = $('.lobby');
        // this.clearMessages();
        // for ( var i = 0; i < selectedMessages.length; i++ ) {
        //   this.renderMessage(selectedMessages[i]);  
        // }
      }
    }
  }
  return currentRoomName;
};

var app = new App();
setTimeout(app.init.bind(app), 1000);
setTimeout(app.recursion.bind(app), 1000);

