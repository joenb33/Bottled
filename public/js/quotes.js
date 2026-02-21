(function () {
  'use strict';
  var QUOTES = [
    'The sea doesn\'t care who you are. Neither does Bottled.',
    'Throw your words into the sea. Someone, somewhere, will find them.',
    'Not every bottle is found. Not every message is read. That\'s the sea.',
    'You\'ll never know who finds it—that\'s the point.',
    'No replies. No likes. No followers. Just the sea.',
    'A message in a bottle is a hope, not a contract.',
    'The tide will bring more.',
  ];
  function random() {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }
  window.BottledQuotes = { random: random };
})();
