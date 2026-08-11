/**
 * puzzleEngine.js — 星座消消乐 Engine V1
 *
 * 经典三消玩法：
 *   交换相邻元素 → 3+相同连线 → 消除 → 下落填充 → 连锁消除
 *   使用 6 种水果作为游戏元素
 *
 * 纯函数引擎，不依赖任何微信 API。
 */

var ROWS = 8;
var COLS = 8;

// 6 种水果元素
var SYMBOLS = ['🍎','🍊','🍉','🍇','🍓','🍌'];

/** 生成随机棋盘（保证初始无三连） */
function createBoard() {
  var board = [];
  for (var r = 0; r < ROWS; r++) {
    board[r] = [];
    for (var c = 0; c < COLS; c++) {
      var symbol;
      do {
        symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      } while (_wouldMatch(board, r, c, symbol));
      board[r][c] = symbol;
    }
  }
  return board;
}

/** 某位置放置 symbol 是否会产生三连 */
function _wouldMatch(board, r, c, symbol) {
  // 水平检查
  if (c >= 2 && board[r][c-1] === symbol && board[r][c-2] === symbol) return true;
  // 垂直检查
  if (r >= 2 && board[r-1] && board[r-1][c] === symbol && board[r-2] && board[r-2][c] === symbol) return true;
  return false;
}

/** 检查两个位置是否相邻 */
function isAdjacent(r1, c1, r2, c2) {
  var dr = Math.abs(r1 - r2);
  var dc = Math.abs(c1 - c2);
  return (dr + dc === 1);
}

/** 交换两个元素并返回新 board */
function swap(board, r1, c1, r2, c2) {
  var newBoard = board.map(function (row) { return row.slice(); });
  var tmp = newBoard[r1][c1];
  newBoard[r1][c1] = newBoard[r2][c2];
  newBoard[r2][c2] = tmp;
  return newBoard;
}

/** 扫描所有匹配（3+ 连线），返回待消除坐标集合 */
function findMatches(board) {
  var matched = {};

  // 水平扫描
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS - 2; c++) {
      var s = board[r][c];
      if (!s) continue;
      var count = 1;
      while (c + count < COLS && board[r][c + count] === s) count++;
      if (count >= 3) {
        for (var k = 0; k < count; k++) {
          matched[r + ',' + (c + k)] = true;
        }
      }
      c += count - 1;
    }
  }

  // 垂直扫描
  for (var c = 0; c < COLS; c++) {
    for (var r = 0; r < ROWS - 2; r++) {
      var s = board[r][c];
      if (!s) continue;
      var count = 1;
      while (r + count < ROWS && board[r + count] && board[r + count][c] === s) count++;
      if (count >= 3) {
        for (var k = 0; k < count; k++) {
          matched[(r + k) + ',' + c] = true;
        }
      }
      r += count - 1;
    }
  }

  return matched;
}

/**
 * 消除匹配 → 下落 → 填充 → 返回 { board, newMatches, score } 或 null
 */
function processMatches(board) {
  var matches = findMatches(board);
  var matchKeys = Object.keys(matches);
  if (matchKeys.length === 0) return null;

  // 计算分数（每消3个=10分，多1个+5分）
  // 简化：每个消除格 = 10 分
  var score = matchKeys.length * 10;

  // 标记消除（置空）
  var newBoard = board.map(function (row) { return row.slice(); });
  for (var i = 0; i < matchKeys.length; i++) {
    var parts = matchKeys[i].split(',');
    newBoard[parseInt(parts[0])][parseInt(parts[1])] = null;
  }

  // 下落
  for (var c = 0; c < COLS; c++) {
    var writeRow = ROWS - 1;
    for (var r = ROWS - 1; r >= 0; r--) {
      if (newBoard[r][c] !== null) {
        newBoard[writeRow][c] = newBoard[r][c];
        writeRow--;
      }
    }
    // 填充空位
    for (var r = writeRow; r >= 0; r--) {
      var symbol;
      do {
        symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      } while (_wouldMatch(newBoard, r, c, symbol));
      newBoard[r][c] = symbol;
    }
  }

  return { board: newBoard, score: score };
}

/**
 * 执行完整的一步（交换 + 消除链）
 * 返回 { board, score, valid }
 */
function playMove(board, r1, c1, r2, c2) {
  if (!isAdjacent(r1, c1, r2, c2)) {
    return { board: board, score: 0, valid: false };
  }

  var swapped = swap(board, r1, c1, r2, c2);

  // 检查交换后是否有匹配
  var firstMatches = findMatches(swapped);
  if (Object.keys(firstMatches).length === 0) {
    return { board: board, score: 0, valid: false };
  }

  // 连锁消除
  var totalScore = 0;
  var currentBoard = swapped;
  var result = processMatches(currentBoard);

  while (result) {
    totalScore += result.score;
    currentBoard = result.board;
    result = processMatches(currentBoard);
  }

  return { board: currentBoard, score: totalScore, valid: true };
}

/** 检查棋盘是否还有可用的移动 */
function hasMoves(board) {
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      // 尝试与右侧交换
      if (c < COLS - 1) {
        var s = swap(board, r, c, r, c + 1);
        if (Object.keys(findMatches(s)).length > 0) return true;
      }
      // 尝试与下方交换
      if (r < ROWS - 1) {
        var s2 = swap(board, r, c, r + 1, c);
        if (Object.keys(findMatches(s2)).length > 0) return true;
      }
    }
  }
  return false;
}

module.exports = {
  ROWS: ROWS,
  COLS: COLS,
  SYMBOLS: SYMBOLS,
  createBoard: createBoard,
  isAdjacent: isAdjacent,
  findMatches: findMatches,
  playMove: playMove,
  hasMoves: hasMoves
};
