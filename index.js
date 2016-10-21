'use strict';
var utils = require('readline-utils');
var repeat = require('repeat-string');

module.exports = function() {
  var windowSize = require('window-size');
  var size = windowSize.height - 10;
  var score = 0;
  var head = '^';
  var body = [];

  // borders are from cli-table chars: https://github.com/Automattic/cli-table/blob/master/lib/index.js#L21-L37
  var borders = {
    'top': '─',
    'top-mid': '┬',
    'top-left': '┌',
    'top-right': '┐',
    'bottom': '─',
    'bottom-mid': '┴',
    'bottom-left': '└',
    'bottom-right': '┘',
    'left': '│',
    'left-mid': '├',
    'mid': '─',
    'mid-mid': '┼',
    'right': '│',
    'right-mid': '┤',
    'middle': '│'
  };

  var center = [
    Math.floor(windowSize.width / 2),
    Math.floor(windowSize.height / 2)
  ];

  var len = 1;
  var direction = [0, -1];
  var position, board;

  function render() {
    rl.output.unmute();
    utils.clearScreen(rl);

    var output = '';
    var top = center[1] - Math.floor(size / 2);
    var left = center[0] - size;
    output += '\n' + repeat(' ', left) + score + '\n';
    output += repeat('\n', top - 2);
    output += repeat(' ', left);
    output += borders['top-left'] + repeat(borders.top, (size * 2)) + borders['top-right'] + '\n';

    for (var row = 0; row < board.length; row++) {
      output += repeat(' ', left) + borders.left;
      for (var col = 0; col < board[row].length; col++) {
        output += ' ' + board[row][col];
      }
      output += borders.right + '\n';
    }
    output += repeat(' ', left);
    output += borders['bottom-left'] + repeat(borders.bottom, (size * 2)) + borders['bottom-right'] + '\n';

    rl.output.write(output);
    rl.output.mute();
  }

  function move(event) {
    if (!event) return;
    switch (event.key.name) {
      case 'right':
        direction = [1, 0];
        head = '>';
        break;
      case 'left':
        direction = [-1, 0];
        head = '<';
        break;
      case 'up':
        direction = [0, -1];
        head = '^';
        break;
      case 'down':
        direction = [0, 1];
        head = 'v';
        break;
    }
  }

  function reset() {
    score = 0;
    len = 1;
    body = [];
    position = [
      Math.floor(size / 2),
      Math.floor(size / 2)
    ];

    board = new Array(size);
    for (var i = 0; i < board.length; i++) {
      board[i] = new Array(size);
      for (var j = 0; j < board[i].length; j++) {
        board[i][j] = ' ';
      }
    }
    board[position[1]][position[0]] = head;
  }

  function tick() {
    board[position[1]][position[0]] = ' ';
    position[0] += direction[0];
    position[1] += direction[1];

    if (position[0] >= size || position[1] >= size || position[0] < 0 || position[1] < 0) {
      reset();
      return;
    }

    if (board[position[1]][position[0]] === '@') {
      score++;
      len++;
      if (body.length) {
        body.push(position.slice());
      }
    } else if (board[position[1]][position[0]] !== ' ') {
      reset();
      return;
    }

    board[position[1]][position[0]] = head;
    body.reduce(function(acc, curr, i, arr) {
      var tail = 'X';
      var prev = (i === 0 ? position : arr[i - 1]);
      var next = (i === arr.length - 1 ? null : arr[i + 1]);
      if (prev[0] === curr[0]) {
        if (next) {
          if (next[0] === curr[0]) tail = borders.middle;
          else if (next[0] > curr[0]) {
            if (prev[1] < curr[1]) tail = borders['bottom-left'];
            else tail = borders['top-left'];
          } else {
            if (prev[1] < curr[1]) tail = borders['bottom-right'];
            else tail = borders['top-right'];
          }
        } else {
          tail = borders.middle;
        }
      } else if (prev[1] === curr[1]) {
        if (next) {
          if (next[1] === curr[1]) tail = borders.mid;
          else if (next[1] > curr[1]) {
            if (prev[0] > curr[0]) tail = borders['top-left'];
            else tail = borders['top-right'];
          } else {
            if (prev[0] > curr[0]) tail = borders['bottom-left'];
            else tail = borders['bottom-right'];
          }
        } else {
          tail = borders.mid;
        }
      }
      board[curr[1]][curr[0]] = tail;
    }, []);

    body.unshift(position.slice());
    while (body.length > len) {
      var part = body.pop();
      board[part[1]][part[0]] = ' ';
    }
    render();
  }

  function apple() {
    var x = Math.floor(Math.random() * size);
    var y = Math.floor(Math.random() * size);
    board[y][x] = '@';
  }

  var rl = utils.createInterface();
  var width = utils.cliWidth(rl);
  rl.setPrompt('');
  utils.hideCursor(rl);

  rl.input.on('keypress', function(str, key) {
    var event = utils.normalize(str, key);
    move(event);
  });

  rl.on('line', function(line) {
    console.log('line', line);
  });

  rl.output.mute();
  reset();
  render();

  setInterval(tick, 200);
  setInterval(apple, 2000);

};
