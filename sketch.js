function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
let objs = [];
let objsNum = 100;

const palette = [
  "#fbf8cc",
  "#ffcfd2",
  "#f1c0e8",
  "#a3c4f3",
  "#c0f9ecff",
  "#e0a8ffff",
  // 新增調色
  "#ffd6a5",
  "#ffd1dc",
  "#bde0fe",
  "#c7f9cc",
  "#f7b267",
  "#9ad3bc",
  "#c9c9ff"
];

let menuItems = ["作品一", "作品二", "關閉作品"];
let menuW = 0;
let menuH = 0;
let menuPadding = 20;
let menuItemHeight = 36;
let selectedMenu = -1;

// 新增：背景顏色陣列與目前索引（擴充為較淺但仍偏暗的色系）
let bgColors = [
  "#1f2937", // 石板灰
  "#243a4a", // 暗藍灰
  "#35505f", // 灰藍綠
  "#3b4b58", // 中等灰藍
  "#2c3e4a", // 深石板
  "#2f4f4f", // 深灰綠
  "#405868", // 柔和藍灰
  "#4a5a6a", // 中等藍灰
  "#35566a", // 青藍
  "#25414b", // 暗青
  "#2b3b42"  // 暗鋼藍
];
let bgIndex = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  angleMode(DEGREES);
  frameRate(60);
  noFill();

  // 使用目前背景顏色
  background(bgColors[bgIndex]);

  for (let i = 0; i < objsNum; i++) {
    objs.push(new Obj(i));
  }
}

function draw() {
  blendMode(BLEND);
  // 使用變數決定背景色
  background(bgColors[bgIndex]);

  // 新增左側半透明選單
  drawMenu();

  blendMode(SCREEN);

  for (let i = 0; i < objs.length; i++) {
    objs[i].move();
    objs[i].display();
  }
}

// 新增函式：畫選單
function drawMenu() {
  push();
  rectMode(CORNER);
  noStroke();
  textSize(20);
  textAlign(LEFT, TOP);

  // 最大寬度上限（視窗 20% 或 300px）
  let upperW = min(width * 0.2, 300);

  // 計算文字最大寬度，再加上左右內距作為選單寬度
  let maxTextW = 0;
  for (let i = 0; i < menuItems.length; i++) {
    let w = textWidth(menuItems[i]);
    if (w > maxTextW) maxTextW = w;
  }

  // 最小寬度保留空間（避免太窄），上限為 upperW
  let computedW = maxTextW + menuPadding * 2;
  menuW = constrain(computedW, 80, upperW);

  // 只有當滑鼠距離左側小於等於 100px 時才顯示選單
  let menuVisible = mouseX <= 100;

  // 選單高度僅包住選項，不延伸到視窗底部
  menuH = menuPadding * 2 + menuItems.length * menuItemHeight;

  if (!menuVisible) {
    menuW = 0;
    pop();
    return;
  }

  // 半透明白色背景（只到選單高度）
  fill(255, 220);
  rect(0, 0, menuW, menuH);

  // 選單文字與選取標示
  for (let i = 0; i < menuItems.length; i++) {
    if (i === selectedMenu) {
      // 選取時用深色區塊並改為白字
      fill(0, 100);
      rect(menuPadding - 8, menuPadding + i * menuItemHeight - 4, menuW - menuPadding * 2 + 16, menuItemHeight);
      fill(255);
    } else {
      // 第三項（關閉作品）用紅字標記
      if (i === 2) {
        fill(220, 50, 50);
      } else {
        fill(0, 200);
      }
    }
    text(menuItems[i], menuPadding, menuPadding + i * menuItemHeight);
  }
  pop();
}

function mousePressed() {
  // 只在選單顯示且點在選單區域時處理點擊（原本選單選取邏輯）
  if (menuW > 0 && mouseX >= 0 && mouseX <= menuW && mouseY >= 0 && mouseY <= menuH) {
    let idx = Math.floor((mouseY - menuPadding) / menuItemHeight);
    if (idx >= 0 && idx < menuItems.length) {
      selectedMenu = idx;
      console.log("選到：" + menuItems[idx]);

      // 根據選項決定要載入的 URL 或關閉 iframe
      if (idx === 0) {
        // 作品一
        loadOrShowIframe('https://luoluo960127-commits.github.io/20251014_2/');
      } else if (idx === 1) {
        // 作品二
        loadOrShowIframe('https://hackmd.io/@4-xTnaJnSJ63zQwJoyuXRw/S1veKdJ3el');
      } else if (idx === 2) {
        // 關閉作品：移除或隱藏 iframe，回到背景
        let existing = document.getElementById('externalFrame');
        if (existing) existing.remove();
        selectedMenu = -1;
        console.log("已關閉作品，回到背景");
      }
    }
  }

  // 每次按下螢幕都切換背景顏色（如需排除選單點擊可把這段移到選單點擊外的 else）
  bgIndex = (bgIndex + 1) % bgColors.length;
  console.log("背景顏色切換為：", bgColors[bgIndex]);
}

// 輔助函式：建立或顯示 iframe（寬為 80vw）
function loadOrShowIframe(url) {
  let existing = document.getElementById('externalFrame');
  if (!existing) {
    let iframe = document.createElement('iframe');
    iframe.id = 'externalFrame';
    iframe.src = url;
    iframe.style.position = 'fixed';
    iframe.style.left = '10vw';
    iframe.style.top = '0';
    iframe.style.width = '80vw';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.zIndex = '9999';
    document.body.appendChild(iframe);
  } else {
    existing.style.display = 'block';
    existing.src = url;
  }
}

class Obj {
  constructor(tmpIndex) {
    this.index = tmpIndex;
    this.startX = random(width);
    this.init();
    this.goalX = this.startX + this.rangeX;
  }

  init() {
    this.rangeX = random([
      5, 5, 5, 5, 5, 5, 10, 10, 10, 20, 20, 100, 100, 100, 100, 200, 300
    ]);
    this.step = map(this.rangeX, 5, 200, 5, 30); //random(1, 20);
    this.strWeight = random(3, 30);
    this.c = color(random(palette));
    if (this.rangeX < 100) {
      this.c.setAlpha(150);
    }
    this.isOut = random(100) < 10 ? true : false;
  }

  move() {
    this.startX += this.step;
    this.goalX = this.startX + this.rangeX;

    if (this.startX > width) {
      this.init();
      this.startX = -this.rangeX;
      this.goalX = this.startX + this.rangeX;
    }
  }

  display() {
    strokeWeight(this.strWeight);
    stroke(this.c);
    noFill();
    beginShape();
    for (let x = this.startX; x <= this.goalX; x++) {
      let y = map(
        noise(
          x * 0.001,
          this.isOut ? this.index * 0.025 : this.index * 0.005,
          frameCount * 0.003
        ),
        0,
        1,
        -height * 0.25,
        height * 1.25
      );
      vertex(x, y);
    }
    endShape();
  }
}
