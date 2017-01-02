// All this is doing is inserting the parse API keys into every $.ajax
// request that you make so you don't have to.

// Put your parse application keys here!
$.ajaxPrefilter(function (settings, _, jqXHR) {
  jqXHR.setRequestHeader('X-Parse-Application-Id', '6UJYuifdHSHnOvG2DiYXU6cwluUvgDiVOpr8Weqi');
  jqXHR.setRequestHeader('X-Parse-REST-API-Key', 'gYu7Z35zwiNz4BaNgwyaq9u9A36eVHd38MiDvCH5');
});
