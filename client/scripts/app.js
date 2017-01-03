// YOUR CODE HERE:
//https://api.parse.com/1/classes/messages

var App = function() {
  this.server = 'https://api.parse.com/1/classes/messages';
  this.previousRoomName;
  this.previousData;
  this.roomname = 'lobby';
};

App.prototype.recursion = function() {
  var context = this;
  var newData = this.fetch.call(context);
  this.previousRoomName = context.selectRoom.call(context, newData, context.previousRoomName);
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
      console.log(data);
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
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
    if ( (text !== undefined && (text.split('<').length > 1 || text.split('url').length > 1)) || (roomname !== undefined && (roomname.split('<').length > 1 || roomname.split('url').length > 1)) ) {
      continue;
    } else {
      newResults.push(datum);
    }
  }
  return { results: newResults };
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
      var newData = context.checkForAttack(data);
      if ( $('#chats').children().length < 2 ) {
        for ( var j = 50; j > 0; j-- ) {
          context.renderMessage(newData.results[j]);
          if ( $('#chats').children().length === 15 ) {
            break;
          }
        }
      }
      var roomNames = context.checkRoomNames(newData.results);
      if ( $('#roomSelect').children().length !== roomNames.length ) {
        $('#roomSelect').remove();
        $('#main').append('<select id="roomSelect"></select>');
        roomNames.forEach( function(roomName) {
          context.renderRoom(roomName);
        });
      }
      var currentData = JSON.stringify(newData.results[0]);
      console.log(currentData);
      if ( context.previousData !== currentData ) {
        // console.log(JSON.parse(currentData));
        context.renderMessage.call(context, JSON.parse(currentData));
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
  // console.log('Our room name :' + this.roomname + '. Message room name : ' + message.roomname);
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

App.prototype.checkRoomNames = function(messages) {
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
            console.log(selectedMessages[i]);
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
setInterval(app.recursion.bind(app), 1000);

