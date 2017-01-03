// YOUR CODE HERE:
//https://api.parse.com/1/classes/messages

var App = function() {
  this._previousRoomName;
  this._previousData;
  this.server = 'https://api.parse.com/1/classes/messages';
  this.roomname = 'lobby';
  this.data = { results: [] };
};

App.prototype.refreshMessages = function() {
  var context = this;
  this.fetch.call(context);
  var filteredData = this.checkForAttack(this.data); 
  this.checkRoomNames.call(context, filteredData.results);
  this._previousRoomName = context.selectRoom.call(context, filteredData, context._previousRoomName);
  this.maintainNumberOfMessages.call(context, filteredData);
  this.updateNewMessages.call(context);
};

App.prototype.updateNewMessages = function() {
  var context = this;
  var currentMostRecent = JSON.stringify(context.data.results[0]);
  if ( context._previousData !== currentMostRecent ) {
    context.renderMessage.call(context, JSON.parse(currentMostRecent));
  }
  context._previousData = currentMostRecent;
};

App.prototype.maintainNumberOfMessages = function(data) {
  if ( $('#chats').children().length < 2 ) { 
    for ( var j = 50; j > 0; j-- ) {
      this.renderMessage(data.results[j]);
      if ( $('#chats').children().length === 15 ) {
        break;
      }
    }
  }
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
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

App.prototype.checkForAttack = function (data) {
  var newResults = [];
  for (var i = 0; i < data.results.length; i++ ) {
    var datum = data.results[i];
    var text = String(datum.text);
    var roomname = String(datum.roomname);
    var username = String(datum.username);
    if (roomname !== undefined && (roomname.split('<').length > 1 || roomname.split('url').length > 1)) {
      continue;
    } else if (text !== undefined && (text.split('<').length > 1 || text.split('url').length > 1)) {
      continue;
    } else if (username !== undefined && (username.split('<').length > 1 || username.split('url').length > 1)) {
      continue;
    } else {
      newResults.push(datum);
    }
  }
  return { results: newResults };
};

App.prototype.fetch = function() {
  var context = this;
  $.ajax({
    url: this.server,
    type: 'GET',
    contentType: 'jsonp',
    data: {
      order: '-createdAt'
    },
    success: function (data) {
      context.data = data;
      console.log('chatterbox: Message received');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

App.prototype.clearMessages = function() {
  $('#chats').remove();
  $('#main').append('<div id="chats"></div>');
};

App.prototype.clearRooms = function() {
  $('#roomSelect').remove();
  $('#main').append('<select id="roomSelect"></select>');
};


App.prototype.renderMessage = function(message) {
  if ( message && message.roomname === this.roomname ) {
    $('#chats').append(`<div class='${message.roomname}'> <a class='username' href='#'>${message.username}</a>: ${message.text} @ ${message.roomname}</div>`);
  }
};

App.prototype.renderRoom = function(roomName) {
  $('#roomSelect').append(`<option class='roomName'>${roomName}</option>`);
};

App.prototype.handleUsernameClick = function(event) {

};

App.prototype.handleSubmit = function(event) {
  var text = $('#message').val();
  var message = {
    username: 'DJ',
    text: text,
    roomname: event.data.context.roomname
  };
  if ( message.text !== '' ) {
    event.data.context.send(message);
  }
  $('#message').val('');
};

App.prototype.filterMessages = function(messages) {
  var roomNames = [];
  messages.forEach( function(message) {
    if ( message && message.roomname && message.roomname !== '' ) {
      message.roomname = message.roomname.replace(/[~`!#$%\^&*+=\-\[\]\\;,/{}|\\":<>\?\ ']/g, '');
      if ( roomNames.indexOf(message.roomname) === -1 ) {
        roomNames.push(message.roomname);
      }
    }  
  });
  return roomNames;
};

App.prototype.checkRoomNames = function(messages) {
  var context = this;
  var roomNames = context.filterMessages(messages);
  if ( $('#roomSelect').children().length !== roomNames.length ) {
    this.clearRooms();
    roomNames.forEach( function(roomName) {
      context.renderRoom(roomName);
    });
  }
};

App.prototype.selectRoom = function(data, previousRoomName) {
  var currentRoomName;
  var rooms = $('#roomSelect').children();
  for ( var i = 0; i < rooms.length; i++ ) {
    if ( rooms[i].selected ) {
      if ( rooms[i].value === previousRoomName || rooms[i].value === '' ) {
        return previousRoomName;
      } else {
        currentRoomName = rooms[i].value;
        this.roomname = currentRoomName;
        var selectedMessages = jQuery.extend(true, [], $('.' + currentRoomName));
        this.clearMessages();
        if ( selectedMessages.length !== 0 ) {
          for ( var i = 0; i < selectedMessages.length; i++ ) {
            $('#chats').append(selectedMessages[i]);  
          }
        }
      }
    }
  }
  return currentRoomName;
};

var app = new App();
setTimeout(app.init.bind(app), 1000);
setInterval(app.refreshMessages.bind(app), 200);

