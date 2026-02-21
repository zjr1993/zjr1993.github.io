// 获取 DOM 元素
// const btnRock = document.getElementById('btn-rock');
// const btnPaper = document.getElementById('btn-paper');
// const btnScissors = document.getElementById('btn-scissors');
// const btnReset = document.getElementById('btn-reset'); // 单局重置按钮

// const userHand = document.getElementById('user-hand');
// const computerHand = document.getElementById('computer-hand');

// const messageDiv = document.getElementById('message');
// const resultText = document.getElementById('result-text');

// // 获取新增的 DOM 元素
// const userScoreEl = document.getElementById('user-score');
// const compScoreEl = document.getElementById('comp-score');
// const gameOverScreen = document.getElementById('game-over-screen');
// const finalResultText = document.getElementById('final-result-text');
// const btnRestartGame = document.getElementById('btn-restart-game');

// // === 新增：游戏全局状态变量 ===
// const choices = ['rock', 'paper', 'scissors'];
// const WINNING_SCORE = 10; // 设定胜利目标分数
// let userScore = 0;
// let computerScore = 0;
// let isAnimating = false; // 动画锁：防止在动画期间重复点击

// // 主游戏逻辑
// function playGame(userChoice) {
//   // 如果正在播放动画，或者游戏已经结束，直接无视用户的点击
//   if (isAnimating) return; 

//   // 锁定状态，开始动画
//   isAnimating = true;

//   // 1. 复位手势，隐藏单局结果
//   userHand.classList.remove('is-paper', 'is-scissors');
//   computerHand.classList.remove('is-paper', 'is-scissors');
//   messageDiv.style.visibility = 'hidden';

//   // 2. 加上摇晃动画
//   userHand.classList.add('shaking');
//   computerHand.classList.add('shaking');

//   // 3. 延迟 1.5 秒后出拳
//   setTimeout(() => {
//     // 停止摇晃
//     userHand.classList.remove('shaking');
//     computerHand.classList.remove('shaking');

//     // 电脑随机出拳
//     const computerChoice = choices[Math.floor(Math.random() * choices.length)];

//     // 4. 添加手势变形类名
//     if (userChoice !== 'rock') userHand.classList.add(`is-${userChoice}`);
//     if (computerChoice !== 'rock') computerHand.classList.add(`is-${computerChoice}`);

//     // 5. 判定单局胜负并计分
//     if (userChoice === computerChoice) {
//       resultText.innerText = "You Tied! (平局)";
//     } else if (
//       (userChoice === 'rock' && computerChoice === 'scissors') ||
//       (userChoice === 'paper' && computerChoice === 'rock') ||
//       (userChoice === 'scissors' && computerChoice === 'paper')
//     ) {
//       resultText.innerText = "You Win! (你赢了)";
//       userScore++; // 玩家加一分
//     } else {
//       resultText.innerText = "Computer Wins! (电脑赢了)";
//       computerScore++; // 电脑加一分
//     }

//     // 更新页面上的分数显示
//     userScoreEl.innerText = userScore;
//     compScoreEl.innerText = computerScore;

//     // 显示单局结果
//     messageDiv.style.visibility = 'visible';
    
//     // 解除动画锁
//     isAnimating = false;

//     // 6. === 新增：检查是否有人达到 10 分 ===
//     checkGameOver();

//   }, 500); 
// }

// // 检查游戏是否结束的函数
// function checkGameOver() {
//   if (userScore >= WINNING_SCORE || computerScore >= WINNING_SCORE) {
//     // 决定结算画面的文案和颜色
//     if (userScore >= WINNING_SCORE) {
//       finalResultText.innerText = "🏆 YOU WON THE GAME! 🏆";
//       finalResultText.style.color = "green";
//     } else {
//       finalResultText.innerText = "💀 COMPUTER WON! 💀";
//       finalResultText.style.color = "red";
//     }
//     // 显示结算遮罩层
//     gameOverScreen.style.display = 'flex';
//   }
// }

// // 绑定出拳按钮事件
// btnRock.addEventListener('click', () => playGame('rock'));
// btnPaper.addEventListener('click', () => playGame('paper'));
// btnScissors.addEventListener('click', () => playGame('scissors'));

// // 下一回合按钮（清空当前手势）
// btnReset.addEventListener('click', () => {
//   if (isAnimating) return;
//   userHand.classList.remove('is-paper', 'is-scissors');
//   computerHand.classList.remove('is-paper', 'is-scissors');
//   messageDiv.style.visibility = 'hidden';
// });

// // 全局重置按钮（再来一局）
// btnRestartGame.addEventListener('click', () => {
//   // 分数清零
//   userScore = 0;
//   computerScore = 0;
//   userScoreEl.innerText = '0';
//   compScoreEl.innerText = '0';
  
//   // 隐藏结算画面和单局结果
//   gameOverScreen.style.display = 'none';
//   messageDiv.style.visibility = 'hidden';

//   // 手势复位
//   userHand.classList.remove('is-paper', 'is-scissors');
//   computerHand.classList.remove('is-paper', 'is-scissors');
// });


// 获取 DOM 元素
const btnRock = document.getElementById('btn-rock');
const btnPaper = document.getElementById('btn-paper');
const btnScissors = document.getElementById('btn-scissors');
const btnReset = document.getElementById('btn-reset'); 

const userHand = document.getElementById('user-hand');
const computerHand = document.getElementById('computer-hand');

const messageDiv = document.getElementById('message');
const resultText = document.getElementById('result-text');

const userScoreEl = document.getElementById('user-score');
const compScoreEl = document.getElementById('comp-score');
const gameOverScreen = document.getElementById('game-over-screen');
const finalResultText = document.getElementById('final-result-text');
const btnRestartGame = document.getElementById('btn-restart-game');

// === 新增：获取难度按钮组 ===
const diffButtons = document.querySelectorAll('.diff-btn');

// 全局状态变量
const choices = ['rock', 'paper', 'scissors'];
let WINNING_SCORE = 10; // 注意：这里从 const 变成了 let，以便动态修改
let userScore = 0;
let computerScore = 0;
let isAnimating = false;
let COMPUTERAI = new strategy();

const convert = {
  'rock': 'R',
  'paper': 'P',
  'scissors': 'S'
}

const inverse = {
  'R': 'rock',
  'P': 'paper',
  'S': 'scissors'
}


// === 提取通用的重置游戏函数 ===
function resetGame() {
  userScore = 0;
  computerScore = 0;
  userScoreEl.innerText = '0';
  compScoreEl.innerText = '0';
  
  gameOverScreen.style.display = 'none';
  messageDiv.style.visibility = 'hidden';

  userHand.classList.remove('is-paper', 'is-scissors', 'shaking');
  computerHand.classList.remove('is-paper', 'is-scissors', 'shaking');
  COMPUTERAI = new strategy();
}

// === 新增：绑定难度选择逻辑 ===
diffButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (isAnimating) return; // 动画期间不让切难度

    // 1. 移除所有按钮的高亮类名，然后给当前点击的加高亮
    diffButtons.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    // 2. 从被点击按钮的 data-score 属性中读取分数并转换为数字
    WINNING_SCORE = parseInt(e.target.getAttribute('data-score'));

    // 3. 切换难度后自动重置当前游戏比分
    resetGame();
  });
});

// 主游戏逻辑
function playGame(userChoice) {
  if (isAnimating) return; 
  isAnimating = true;

  userHand.classList.remove('is-paper', 'is-scissors');
  computerHand.classList.remove('is-paper', 'is-scissors');
  messageDiv.style.visibility = 'hidden';

  userHand.classList.add('shaking');
  computerHand.classList.add('shaking');

  setTimeout(() => {
    userHand.classList.remove('shaking');
    computerHand.classList.remove('shaking');

    const computerChoice = inverse[COMPUTERAI.predict(convert[userChoice])];

    if (userChoice !== 'rock') userHand.classList.add(`is-${userChoice}`);
    if (computerChoice !== 'rock') computerHand.classList.add(`is-${computerChoice}`);

    if (userChoice === computerChoice) {
      resultText.innerText = "You Tied! (平局)";
    } else if (
      (userChoice === 'rock' && computerChoice === 'scissors') ||
      (userChoice === 'paper' && computerChoice === 'rock') ||
      (userChoice === 'scissors' && computerChoice === 'paper')
    ) {
      resultText.innerText = "You Win! (你赢了)";
      userScore++; 
    } else {
      resultText.innerText = "Computer Wins! (电脑赢了)";
      computerScore++; 
    }

    userScoreEl.innerText = userScore;
    compScoreEl.innerText = computerScore;
    messageDiv.style.visibility = 'visible';
    
    isAnimating = false;
    checkGameOver();

  }, 500); 
}

function checkGameOver() {
  if (userScore >= WINNING_SCORE || computerScore >= WINNING_SCORE) {
    if (userScore >= WINNING_SCORE) {
      finalResultText.innerText = "🏆 YOU WON THE GAME! 🏆";
      finalResultText.style.color = "green";
    } else {
      finalResultText.innerText = "💀 COMPUTER WON! 💀";
      finalResultText.style.color = "red";
    }
    gameOverScreen.style.display = 'flex';
  }
}

// 绑定出拳事件
btnRock.addEventListener('click', () => playGame('rock'));
btnPaper.addEventListener('click', () => playGame('paper'));
btnScissors.addEventListener('click', () => playGame('scissors'));

// 绑定单局重置
btnReset.addEventListener('click', () => {
  if (isAnimating) return;
  userHand.classList.remove('is-paper', 'is-scissors');
  computerHand.classList.remove('is-paper', 'is-scissors');
  messageDiv.style.visibility = 'hidden';
});

// 绑定重新开始事件（使用新封装的 resetGame 函数）
btnRestartGame.addEventListener('click', resetGame);
