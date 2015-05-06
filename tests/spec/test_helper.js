function randomString(length) {
  length = length || 8;
  var text = '';
  var allowedCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for(var i=0; i < length; i++)
    text += allowedCharacters.charAt(Math.floor(Math.random() * allowedCharacters.length));

  return text;
}
