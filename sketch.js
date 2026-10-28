
/* =========================================================
   數數拼圖樂園
   拼圖格數：4 欄 × 3 列，共 12 塊
   圖片：獎盃.jpg（與 index.html、sketch.js 同資料夾）

   功能：
   1. 12 塊拼圖，初始顯示問號
   2. 點擊拼圖，開啟四選一題目
   3. 答對藍框、答錯粉紅框
   4. 答對噴彩帶、答錯畫面震動
   5. 關閉題目後顯示拼圖
   6. 已作答題目可以複習，不會重複計分
   7. 未作答也能關閉題目
   8. 拖曳拼圖到正確位置，自動吸附
   9. 完成後顯示完整圖片與 12 格成績
   10. 重新開始會重新打亂拼圖
   11. 支援不同螢幕大小
   ========================================================= */

// ==================== 拼圖格數 ====================
const GRID = {
  cols: 4,
  rows: 3
};

const TOTAL_TILES = GRID.cols * GRID.rows;

// ==================== 顏色 ====================
const C = {
  bg: "#fff8ef",
  ink: "#57483e",
  brown: "#8b6a50",
  cream: "#fff2dc",
  blue: "#70d6ff",
  pink: "#ff70a6",
  yellow: "#ffd166",
  purple: "#cdb4db",
  green: "#b9e8b0",
  shadow: "#eadbcd",
  white: "#ffffff"
};

// ==================== 遊戲變數 ====================
let puzzleImage;
let tiles = [];
let questions = [];

let modalOpen = false;
let currentTile = -1;
let answered = false;
let reviewMode = false;
let selectedAnswer = -1;

let correctCount = 0;
let answeredCount = 0;
let gameFinished = false;

let dragTile = -1;
let dragOffsetX = 0;
let dragOffsetY = 0;
let pressX = 0;
let pressY = 0;
let hasDragged = false;

let shakeUntil = 0;
let shakePower = 0;

let revealEffects = [];
let confetti = [];

let tileSize = 80;
let boardX = 0;
let boardY = 0;
let trayX = 0;
let trayY = 0;
let layoutMode = "wide";

// ==================== 載入圖片 ====================
function preload() {
  puzzleImage = loadImage(
    "獎盃.jpg",
    () => console.log("獎盃圖片載入成功"),
    () => console.error("圖片載入失敗：請確認檔名為獎盃.jpg")
  );
}

// ==================== 初始化 ====================
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);

  createQuestions();
  restartGame();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateLayout();
}

// ==================== 12 道題目 ====================
function createQuestions() {
  questions = [
    {
      type: "sequence",
      title: "找出缺少的數字！",
      sequence: ["1", "2", "3", "＿", "5", "6", "7"],
      options: ["2", "4", "6", "8"],
      answer: 1,
      explanation: "數字依序增加 1，所以答案是 4。"
    },
    {
      type: "apples",
      title: "蘋果有幾個？",
      count: 3,
      options: ["2 個", "3 個", "4 個", "5 個"],
      answer: 1,
      explanation: "一共有 3 顆蘋果。"
    },
    {
      type: "sequence",
      title: "接下來是幾？",
      sequence: ["2", "4", "6", "＿", "10"],
      options: ["7", "8", "9", "12"],
      answer: 1,
      explanation: "每次增加 2，所以答案是 8。"
    },
    {
      type: "apples",
      title: "數數看有幾顆！",
      count: 5,
      options: ["3 個", "4 個", "5 個", "6 個"],
      answer: 2,
      explanation: "一共有 5 顆蘋果。"
    },
    {
      type: "sequence",
      title: "哪個數字不見了？",
      sequence: ["1", "3", "5", "＿", "9"],
      options: ["6", "7", "8", "10"],
      answer: 1,
      explanation: "每次增加 2，所以答案是 7。"
    },
    {
      type: "apples",
      title: "蘋果總共有幾個？",
      count: 4,
      options: ["2 個", "3 個", "4 個", "5 個"],
      answer: 2,
      explanation: "一共有 4 顆蘋果。"
    },
    {
      type: "sequence",
      title: "幫數字排隊！",
      sequence: ["3", "4", "5", "＿", "7"],
      options: ["5", "6", "8", "9"],
      answer: 1,
      explanation: "數字依序增加 1，所以答案是 6。"
    },
    {
      type: "apples",
      title: "請數一數！",
      count: 6,
      options: ["4 個", "5 個", "6 個", "7 個"],
      answer: 2,
      explanation: "一共有 6 顆蘋果。"
    },
    {
      type: "sequence",
      title: "找出缺少的數字！",
      sequence: ["10", "9", "8", "＿", "6"],
      options: ["4", "5", "7", "8"],
      answer: 2,
      explanation: "數字每次減少 1，所以答案是 7。"
    },
    {
      type: "apples",
      title: "有幾顆蘋果呢？",
      count: 2,
      options: ["1 個", "2 個", "3 個", "4 個"],
      answer: 1,
      explanation: "一共有 2 顆蘋果。"
    },
    {
      type: "sequence",
      title: "接著數下去！",
      sequence: ["5", "10", "15", "＿", "25"],
      options: ["18", "20", "22", "30"],
      answer: 1,
      explanation: "每次增加 5，所以答案是 20。"
    },
    {
      type: "apples",
      title: "最後數一次蘋果！",
      count: 7,
      options: ["5 個", "6 個", "7 個", "8 個"],
      answer: 2,
      explanation: "一共有 7 顆蘋果。"
    }
  ];
}

// ==================== 建立並打亂拼圖 ====================
function createTiles() {
  tiles = [];

  // 打亂拼圖片在待拼區的順序
  let slots = Array.from(
    { length: TOTAL_TILES },
    (_, i) => i
  );

  for (let i = slots.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }

  for (let i = 0; i < TOTAL_TILES; i++) {
    tiles.push({
      id: i,

      // 原圖中此拼圖片的位置
      col: i % GRID.cols,
      row: floor(i / GRID.cols),

      unlocked: false,
      revealed: false,
      placed: false,
      answered: false,
      correct: false,
      selectedAnswer: -1,

      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      homeX: 0,
      homeY: 0,

      traySlot: slots[i],
      dragging: false
    });
  }
}

// ==================== 響應式布局 ====================
function calculateLayout() {
  layoutMode = width >= height * 1.05 ? "wide" : "tall";

  if (layoutMode === "wide") {
    // 左邊放待拼區，右邊放拼圖板
    tileSize = min(
      (width - 100) / 10.3,
      (height - 190) / 3.3,
      120
    );

    tileSize = max(tileSize, 28);

    boardX = width * 0.70 - tileSize * GRID.cols / 2;
    boardY = max(
      115,
      height * 0.53 - tileSize * GRID.rows / 2
    );

    trayX = width * 0.25 - tileSize * GRID.cols / 2;
    trayY = boardY;
  } else {
    // 手機版上下排列
    tileSize = min(
      (width - 28) / 4.2,
      (height - 250) / 6.5,
      88
    );

    tileSize = max(tileSize, 24);

    boardX = width / 2 - tileSize * GRID.cols / 2;
    boardY = 115;

    trayX = width / 2 - tileSize * GRID.cols / 2;
    trayY = boardY + tileSize * GRID.rows + 48;
  }

  for (let t of tiles) {
    t.targetX = boardX + t.col * tileSize;
    t.targetY = boardY + t.row * tileSize;

    let col = t.traySlot % GRID.cols;
    let row = floor(t.traySlot / GRID.cols);

    t.homeX = trayX + col * tileSize;
    t.homeY = trayY + row * tileSize;

    if (!t.placed && !t.dragging) {
      t.x = t.homeX;
      t.y = t.homeY;
    }
  }
}

// ==================== 主畫面 ====================
function draw() {
  background(C.bg);

  if (millis() < shakeUntil) {
    translate(
      random(-shakePower, shakePower),
      random(-shakePower, shakePower)
    );
  }

  drawDecorations();
  drawHeader();
  drawLabels();
  drawBoard();
  drawTiles();
  drawRevealEffects();

  if (!modalOpen) {
    drawConfetti();
  }

  if (gameFinished) {
    drawFinishScreen();
  }

  if (modalOpen) {
    drawQuestionModal();
  }
}

// 背景裝飾
function drawDecorations() {
  noStroke();

  fill("#ffe9c9");
  circle(width * 0.04, height * 0.14, 60);
  circle(width * 0.96, height * 0.22, 80);

  fill("#e0f5ff");
  circle(width * 0.94, height * 0.87, 75);
  circle(width * 0.08, height * 0.88, 50);

  fill("#f9d8e5");
  circle(width * 0.51, height * 0.04, 35);
}

// 標題與進度條
function drawHeader() {
  noStroke();

  fill(C.ink);
  textStyle(BOLD);
  textSize(constrain(width * 0.027, 18, 30));
  text("數數拼圖樂園", width / 2, 28);

  textStyle(NORMAL);
  fill(C.brown);
  textSize(constrain(width * 0.013, 11, 16));
  text("答題解鎖拼圖，將獎盃拼完整！", width / 2, 54);

  let barW = min(width * 0.42, 330);
  let barX = width / 2 - barW / 2;

  fill("#eadbcd");
  rect(barX, 70, barW, 12, 8);

  fill(C.blue);
  rect(
    barX,
    70,
    barW * answeredCount / TOTAL_TILES,
    12,
    8
  );

  fill(C.ink);
  textSize(12);
  text(
    "已作答 " + answeredCount + " 題　答對 " + correctCount + " 題",
    width / 2,
    94
  );
}

// 拼圖區域標題
function drawLabels() {
  noStroke();
  fill(C.ink);
  textStyle(BOLD);
  textSize(constrain(tileSize * 0.22, 11, 16));

  if (layoutMode === "wide") {
    text(
      "解鎖的拼圖",
      trayX + tileSize * GRID.cols / 2,
      trayY - 18
    );

    text(
      "拼圖板",
      boardX + tileSize * GRID.cols / 2,
      boardY - 18
    );
  } else {
    text(
      "拼圖板",
      width / 2,
      boardY - 18
    );

    text(
      "解鎖的拼圖",
      width / 2,
      trayY - 18
    );
  }

  textStyle(NORMAL);
}

// ==================== 拼圖板 ====================
function drawBoard() {
  for (let row = 0; row < GRID.rows; row++) {
    for (let col = 0; col < GRID.cols; col++) {
      let x = boardX + col * tileSize;
      let y = boardY + row * tileSize;

      noStroke();
      fill("#f2e7da");
      rect(x + 2, y + 2, tileSize - 4, tileSize - 4, 8);

      noFill();
      stroke("#d7c6b4");
      strokeWeight(2);

      drawingContext.setLineDash([5, 5]);
      rect(x + 4, y + 4, tileSize - 8, tileSize - 8, 8);
      drawingContext.setLineDash([]);
    }
  }
}

// ==================== 繪製拼圖片 ====================
function drawTiles() {
  for (let t of tiles) {
    if (!t.dragging) drawOneTile(t);
  }

  // 正在拖曳的拼圖片最後繪製，避免被其他塊遮住
  for (let t of tiles) {
    if (t.dragging) drawOneTile(t);
  }
}

function drawOneTile(t) {
  let x = t.placed ? t.targetX : t.x;
  let y = t.placed ? t.targetY : t.y;
  let s = tileSize - 6;

  // 未解鎖時顯示問號
  if (!t.unlocked || !t.revealed) {
    noStroke();

    fill(C.shadow);
    rect(x + 3, y + 4, s, s, 10);

    fill(C.white);
    rect(x, y, s, s, 10);

    fill("#f3e6d9");
    circle(x + s / 2, y + s / 2, s * 0.43);

    fill(C.brown);
    textStyle(BOLD);
    textSize(s * 0.48);
    text("?", x + s / 2, y + s / 2);
    textStyle(NORMAL);

    return;
  }

  noStroke();
  fill(C.shadow);
  rect(x + 3, y + 4, s, s, 8);

  // 將圖片裁切成 GRID.cols × GRID.rows
  if (puzzleImage && puzzleImage.width > 0) {
    let sourceW = puzzleImage.width / GRID.cols;
    let sourceH = puzzleImage.height / GRID.rows;

    image(
      puzzleImage,
      x,
      y,
      s,
      s,
      t.col * sourceW,
      t.row * sourceH,
      sourceW,
      sourceH
    );
  } else {
    fill("#f8d7da");
    rect(x, y, s, s, 8);

    fill(C.ink);
    textSize(10);
    text("圖片未載入", x + s / 2, y + s / 2);
  }

  // 答對藍框、答錯粉紅框
  stroke(t.correct ? C.blue : C.pink);
  strokeWeight(max(2, tileSize * 0.035));
  noFill();
  rect(x + 1, y + 1, s - 2, s - 2, 8);

  noStroke();
  fill(t.correct ? C.blue : C.pink);
  circle(x + s - 2, y + 2, max(16, tileSize * 0.23));

  fill(C.white);
  textStyle(BOLD);
  textSize(max(11, tileSize * 0.16));
  text(t.correct ? "✓" : "×", x + s - 2, y + 1);
  textStyle(NORMAL);
}

// ==================== 滑鼠點擊 ====================
function mousePressed() {
  if (modalOpen) {
    if (isCloseButton(mouseX, mouseY)) {
      closeQuestion();
      return;
    }

    if (reviewMode || answered) return;

    let option = getClickedOption(mouseX, mouseY);

    if (option !== -1) {
      chooseAnswer(option);
    }

    return;
  }

  if (gameFinished) {
    if (isRestartButton(mouseX, mouseY)) {
      restartGame();
    }
    return;
  }

  // 從最上層開始判斷，避免拖曳時選錯拼圖片
  for (let i = tiles.length - 1; i >= 0; i--) {
    let t = tiles[i];
    let x = t.placed ? t.targetX : t.x;
    let y = t.placed ? t.targetY : t.y;

    if (
      mouseX >= x &&
      mouseX <= x + tileSize - 6 &&
      mouseY >= y &&
      mouseY <= y + tileSize - 6
    ) {
      dragTile = i;
      pressX = mouseX;
      pressY = mouseY;
      dragOffsetX = mouseX - x;
      dragOffsetY = mouseY - y;
      hasDragged = false;
      t.dragging = true;
      return;
    }
  }
}

// ==================== 拖曳拼圖 ====================
function mouseDragged() {
  if (dragTile === -1 || modalOpen) return;

  let t = tiles[dragTile];

  if (dist(mouseX, mouseY, pressX, pressY) > 8) {
    hasDragged = true;
  }

  if (hasDragged && t.unlocked && t.revealed && !t.placed) {
    t.x = mouseX - dragOffsetX;
    t.y = mouseY - dragOffsetY;
  }
}

function mouseReleased() {
  if (dragTile === -1) return;

  let t = tiles[dragTile];
  t.dragging = false;

  if (hasDragged && t.unlocked && t.revealed && !t.placed) {
    let cx = t.targetX + tileSize / 2;
    let cy = t.targetY + tileSize / 2;

    // 拖到正確位置附近就吸附
    if (dist(mouseX, mouseY, cx, cy) < tileSize * 0.75) {
      t.x = t.targetX;
      t.y = t.targetY;
      t.placed = true;

      addConfetti(cx, cy, 12);
      checkGameFinished();
    } else {
      // 沒有放對位置就回到待拼區
      t.x = t.homeX;
      t.y = t.homeY;
    }
  } else if (!hasDragged) {
    openQuestion(dragTile);
  }

  dragTile = -1;
  hasDragged = false;
}

// ==================== 開啟題目／複習 ====================
function openQuestion(index) {
  if (gameFinished) return;

  currentTile = index;

  let t = tiles[index];

  modalOpen = true;
  selectedAnswer = t.selectedAnswer;
  reviewMode = t.answered;
  answered = t.answered;

  // 開啟題目時清除先前彩帶
  confetti = [];
}

// ==================== 選擇答案 ====================
function chooseAnswer(optionIndex) {
  if (answered || reviewMode || currentTile === -1) return;

  let q = questions[currentTile];
  let t = tiles[currentTile];

  selectedAnswer = optionIndex;
  answered = true;

  t.selectedAnswer = optionIndex;
  t.answered = true;
  t.unlocked = true;
  t.correct = optionIndex === q.answer;

  answeredCount++;

  if (t.correct) {
    correctCount++;

    // 答對時在題目視窗範圍內噴彩帶
    let r = getModalRect();
    addModalConfetti(r.x, r.y, r.w, r.h, 100);
  } else {
    // 答錯時震動
    shakeUntil = millis() + 280;
    shakePower = 6;
  }
}

// ==================== 關閉題目 ====================
function closeQuestion() {
  // 關閉視窗立即清除彩帶
  confetti = [];

  if (currentTile === -1) {
    modalOpen = false;
    return;
  }

  let t = tiles[currentTile];

  // 未作答也能關閉，但不解鎖
  if (!t.answered) {
    modalOpen = false;
    currentTile = -1;
    reviewMode = false;
    answered = false;
    return;
  }

  // 第一次作答後，關閉題目才顯示拼圖
  if (!t.revealed) {
    t.unlocked = true;
    t.revealed = true;
    t.x = t.homeX;
    t.y = t.homeY;

    revealEffects.push({
      x: t.x,
      y: t.y,
      start: millis(),
      size: tileSize
    });
  }

  modalOpen = false;
  currentTile = -1;
  reviewMode = false;
  answered = false;

  checkGameFinished();
}

// ==================== 題目視窗位置 ====================
function getModalRect() {
  let w = min(width * 0.88, 560);
  let h = min(height * 0.90, 650);

  return {
    x: width / 2 - w / 2,
    y: height / 2 - h / 2,
    w: w,
    h: h
  };
}

// ==================== 題目視窗 ====================
function drawQuestionModal() {
  let r = getModalRect();
  let mx = r.x;
  let my = r.y;
  let mw = r.w;
  let mh = r.h;

  noStroke();
  fill(65, 51, 43, 150);
  rect(0, 0, width, height);

  fill("#d9c9b8");
  rect(mx + 4, my + 5, mw, mh, 24);

  fill(C.white);
  rect(mx, my, mw, mh, 24);

  let q = questions[currentTile];
  let t = tiles[currentTile];

  fill(C.ink);
  textStyle(BOLD);
  textSize(constrain(mw * 0.052, 19, 27));

  if (reviewMode) {
    text("複習題目", width / 2, my + 35);
  } else if (answered) {
    text("答題結果", width / 2, my + 35);
  } else {
    text(q.title, width / 2, my + 35);
  }

  textStyle(NORMAL);
  drawCloseButton(mx + mw - 32, my + 30);

  let questionY = my + 88;

  if (q.type === "sequence") {
    drawSequenceQuestion(
      q,
      questionY,
      mw,
      answered || reviewMode
    );
  } else {
    drawAppleQuestion(
      q,
      questionY,
      mw,
      answered || reviewMode
    );
  }

  // 四選一選項
  let optionTop = my + mh * 0.66;
  let gap = 10;
  let optionW = (mw - 48 - gap) / 2;
  let optionH = min(48, mh * 0.09);

  for (let i = 0; i < 4; i++) {
    let col = i % 2;
    let row = floor(i / 2);

    let ox = mx + 24 + col * (optionW + gap);
    let oy = optionTop + row * (optionH + 10);

    let bg = "#fff8ef";
    let border = "#eadbcd";

    if (answered || reviewMode) {
      // 正確答案為藍色
      if (i === q.answer) {
        bg = C.blue;
        border = C.blue;
      }

      // 答錯時，所選錯誤答案為粉紅色
      if (!t.correct && i === t.selectedAnswer) {
        bg = C.pink;
        border = C.pink;
      }
    }

    noStroke();
    fill(bg);
    rect(ox, oy, optionW, optionH, 12);

    noFill();
    stroke(border);
    strokeWeight(2);
    rect(ox, oy, optionW, optionH, 12);

    // 文字不加描邊，避免模糊重影
    noStroke();
    fill(C.ink);
    textStyle(BOLD);
    textSize(constrain(optionH * 0.38, 13, 18));
    text(
      q.options[i],
      ox + optionW / 2,
      oy + optionH / 2
    );
    textStyle(NORMAL);
  }

  // 答題回饋
  if (answered || reviewMode) {
    let feedbackY = optionTop + optionH * 2 + 25;

    noStroke();
    fill(t.correct ? "#2789a5" : "#d34b7c");
    textStyle(BOLD);
    textSize(constrain(mw * 0.035, 14, 18));

    text(
      t.correct ? "答對了！太棒了！" : "沒關係，再看一次答案！",
      width / 2,
      feedbackY
    );

    textStyle(NORMAL);
    fill(C.ink);
    textSize(constrain(mw * 0.027, 11, 14));
    text(
      q.explanation,
      width / 2,
      feedbackY + 23
    );

    fill(C.brown);
    textSize(12);
    text("按右上角 × 關閉題目", width / 2, my + mh - 22);
  } else {
    fill(C.brown);
    textSize(12);
    text("選擇一個答案，也可以直接關閉", width / 2, my + mh - 22);
  }

  // 彩帶限制在題目視窗內
  drawModalConfetti(r.x, r.y, r.w, r.h);
}

// ==================== 數字序列題 ====================
function drawSequenceQuestion(q, y, mw, showAnswer) {
  let boxW = min(mw * 0.84, 430);
  let boxH = 70;
  let x = width / 2 - boxW / 2;

  noStroke();
  fill(C.cream);
  rect(x, y, boxW, boxH, 16);

  fill(C.ink);
  textStyle(BOLD);
  textSize(constrain(boxW * 0.075, 19, 30));
  text(q.sequence.join("  "), width / 2, y + boxH / 2);
  textStyle(NORMAL);

  if (showAnswer) {
    fill("#2789a5");
    textStyle(BOLD);
    textSize(15);
    text(
      "正確答案：" + q.options[q.answer],
      width / 2,
      y + boxH + 23
    );
    textStyle(NORMAL);
  }
}

// ==================== 數蘋果題 ====================
function drawAppleQuestion(q, y, mw, showNumbers) {
  let count = q.count;
  let spacing = min(54, mw * 0.12);
  let cols = count > 4 ? 3 : count;
  let rows = ceil(count / cols);

  let startX = width / 2 - (min(count, cols) - 1) * spacing / 2;
  let startY = y + 25;

  for (let i = 0; i < count; i++) {
    let col = i % cols;
    let row = floor(i / cols);

    let ax = startX + col * spacing;
    let ay = startY + row * 62;

    drawApple(ax, ay, spacing * 0.55);

    // 作答後才標上數字
    if (showNumbers) {
      noStroke();
      fill(C.ink);
      textStyle(BOLD);
      textSize(14);
      text(i + 1, ax, ay + 28);
      textStyle(NORMAL);
    }
  }

  if (showNumbers) {
    noStroke();
    fill("#2789a5");
    textStyle(BOLD);
    textSize(15);
    text(
      "總共有 " + count + " 顆蘋果",
      width / 2,
      startY + rows * 62
    );
    textStyle(NORMAL);
  }
}

// 繪製一顆蘋果
function drawApple(x, y, s) {
  push();
  translate(x, y);

  noStroke();
  fill("#ef476f");
  circle(-s * 0.18, 0, s * 0.7);
  circle(s * 0.18, 0, s * 0.7);
  ellipse(0, s * 0.12, s * 0.8, s * 0.65);

  fill("#7a4e2d");
  rect(-2, -s * 0.55, 4, s * 0.25, 2);

  fill("#70b77e");
  ellipse(s * 0.13, -s * 0.48, s * 0.38, s * 0.18);

  pop();
}

// ==================== 關閉按鈕 ====================
function drawCloseButton(x, y) {
  noStroke();
  fill("#ffe7ed");
  circle(x, y, 30);

  stroke("#b74a70");
  strokeWeight(3);
  line(x - 5, y - 5, x + 5, y + 5);
  line(x + 5, y - 5, x - 5, y + 5);
}

function isCloseButton(x, y) {
  let r = getModalRect();

  return dist(
    x,
    y,
    r.x + r.w - 32,
    r.y + 30
  ) < 23;
}

// ==================== 判斷選項點擊 ====================
function getClickedOption(x, y) {
  let r = getModalRect();
  let optionTop = r.y + r.h * 0.66;
  let gap = 10;
  let optionW = (r.w - 48 - gap) / 2;
  let optionH = min(48, r.h * 0.09);

  for (let i = 0; i < 4; i++) {
    let col = i % 2;
    let row = floor(i / 2);

    let ox = r.x + 24 + col * (optionW + gap);
    let oy = optionTop + row * (optionH + 10);

    if (
      x >= ox && x <= ox + optionW &&
      y >= oy && y <= oy + optionH
    ) {
      return i;
    }
  }

  return -1;
}

// ==================== 彩帶效果 ====================
function addModalConfetti(x, y, w, h, amount) {
  for (let i = 0; i < amount; i++) {
    confetti.push({
      x: random(x + 15, x + w - 15),
      y: random(y + 45, y + h * 0.58),
      vx: random(-2.6, 2.6),
      vy: random(-5, 0.5),
      gravity: random(0.05, 0.13),
      life: 1,
      size: random(5, 10),
      color: random([
        C.blue, C.pink, C.yellow, C.purple, C.green
      ]),
      rotation: random(TWO_PI),
      spin: random(-0.16, 0.16),
      minX: x,
      minY: y,
      maxX: x + w,
      maxY: y + h
    });
  }
}

function addConfetti(x, y, amount) {
  for (let i = 0; i < amount; i++) {
    confetti.push({
      x: x,
      y: y,
      vx: random(-3, 3),
      vy: random(-5, -1),
      gravity: 0.1,
      life: 1,
      size: random(4, 8),
      color: random([
        C.blue, C.pink, C.yellow, C.purple, C.green
      ]),
      rotation: random(TWO_PI),
      spin: random(-0.15, 0.15),
      minX: 0,
      minY: 0,
      maxX: width,
      maxY: height
    });
  }
}

function drawModalConfetti(x, y, w, h) {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(x, y, w, h);
  drawingContext.clip();

  drawConfetti();

  drawingContext.restore();
}

function drawConfetti() {
  for (let i = confetti.length - 1; i >= 0; i--) {
    let p = confetti[i];

    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.rotation += p.spin;
    p.life -= 0.014;

    push();
    translate(p.x, p.y);
    rotate(p.rotation);
    noStroke();
    fill(p.color);
    rect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65, 2);
    pop();

    if (
      p.life <= 0 ||
      p.x < p.minX - 20 ||
      p.x > p.maxX + 20 ||
      p.y > p.maxY + 20
    ) {
      confetti.splice(i, 1);
    }
  }
}

// ==================== 拼圖顯現動畫 ====================
function drawRevealEffects() {
  for (let i = revealEffects.length - 1; i >= 0; i--) {
    let e = revealEffects[i];
    let progress = constrain((millis() - e.start) / 520, 0, 1);
    let radius = e.size * (0.08 + progress * 0.72);
    let alpha = 130 * (1 - progress);

    noFill();
    stroke(112, 214, 255, alpha);
    strokeWeight(3);

    circle(
      e.x + (e.size - 6) / 2,
      e.y + (e.size - 6) / 2,
      radius
    );

    if (progress >= 1) {
      revealEffects.splice(i, 1);
    }
  }
}

// ==================== 完成判斷 ====================
function checkGameFinished() {
  if (
    !gameFinished &&
    tiles.length === TOTAL_TILES &&
    tiles.every(t => t.placed)
  ) {
    gameFinished = true;
    confetti = [];
    addConfetti(width / 2, height / 2, 100);
  }
}

// ==================== 完成畫面 ====================
function drawFinishScreen() {
  noStroke();
  fill(68, 52, 43, 175);
  rect(0, 0, width, height);

  let cw = min(width * 0.9, 520);
  let ch = min(height * 0.9, 620);
  let x = width / 2 - cw / 2;
  let y = height / 2 - ch / 2;

  fill(C.white);
  rect(x, y, cw, ch, 24);

  fill(C.ink);
  textStyle(BOLD);
  textSize(25);
  text("拼圖完成！", width / 2, y + 32);

  textStyle(NORMAL);
  textSize(14);
  text("你完成了十二塊拼圖，真棒！", width / 2, y + 58);

  // 顯示完整獎盃圖片
  if (puzzleImage && puzzleImage.width > 0) {
    imageMode(CENTER);

    let imgSize = min(145, cw * 0.34);
    let imgRatio = puzzleImage.width / puzzleImage.height;
    let imgW = imgSize;
    let imgH = imgSize;

    if (imgRatio > 1) {
      imgH = imgSize / imgRatio;
    } else {
      imgW = imgSize * imgRatio;
    }

    image(
      puzzleImage,
      width / 2,
      y + 140,
      imgW,
      imgH
    );

    imageMode(CORNER);
  }

  fill(C.brown);
  textStyle(BOLD);
  textSize(17);
  text(
    "答對 " + correctCount + " / " + TOTAL_TILES + " 題",
    width / 2,
    y + 225
  );
  textStyle(NORMAL);

  // 12 格成績：4 欄 × 3 列
  let rs = min(48, cw * 0.105);
  let rg = 7;
  let totalW = rs * GRID.cols + rg * (GRID.cols - 1);
  let totalH = rs * GRID.rows + rg * (GRID.rows - 1);

  let rx = width / 2 - totalW / 2;
  let ry = y + 250;

  // 若卡片較矮，將成績區域稍微往上移
  if (ry + totalH > y + ch - 60) {
    ry = y + ch - totalH - 65;
  }

  for (let i = 0; i < TOTAL_TILES; i++) {
    let col = i % GRID.cols;
    let row = floor(i / GRID.cols);

    let bx = rx + col * (rs + rg);
    let by = ry + row * (rs + rg);

    fill(tiles[i].correct ? C.blue : C.pink);
    noStroke();
    rect(bx, by, rs, rs, 8);

    fill(C.white);
    textStyle(BOLD);
    textSize(20);
    text(
      tiles[i].correct ? "✓" : "×",
      bx + rs / 2,
      by + rs / 2
    );
  }

  textStyle(NORMAL);

  // 重新開始按鈕
  let bw = min(220, cw * 0.65);
  let bh = 40;
  let bx = width / 2 - bw / 2;
  let by = y + ch - 52;

  fill(C.blue);
  noStroke();
  rect(bx, by, bw, bh, 14);

  fill(C.ink);
  textStyle(BOLD);
  textSize(15);
  text("再玩一次", width / 2, by + bh / 2);
  textStyle(NORMAL);
}

// 判斷是否點擊重新開始
function isRestartButton(x, y) {
  let cw = min(width * 0.9, 520);
  let ch = min(height * 0.9, 620);
  let cardY = height / 2 - ch / 2;

  let bw = min(220, cw * 0.65);
  let bh = 40;
  let bx = width / 2 - bw / 2;
  let by = cardY + ch - 52;

  return (
    x >= bx && x <= bx + bw &&
    y >= by && y <= by + bh
  );
}

// ==================== 重新開始 ====================
function restartGame() {
  modalOpen = false;
  currentTile = -1;
  answered = false;
  reviewMode = false;
  selectedAnswer = -1;

  correctCount = 0;
  answeredCount = 0;
  gameFinished = false;

  dragTile = -1;
  hasDragged = false;

  shakeUntil = 0;
  shakePower = 0;

  revealEffects = [];
  confetti = [];

  // 重新建立並打亂 12 塊拼圖
  createTiles();
  calculateLayout();
}
