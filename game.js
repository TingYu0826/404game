let scoresPerLevel = [];
let lastScore = 0;
const startMenu = document.querySelector('.start-menu');
const gameArea = document.getElementById("gameArea");
const totalDisplay = document.getElementById("total");
const winScreen = document.getElementById("winScreen");

let total = 0;
let timer = null;
let timeLeft = 30;
const timerDisplay = document.getElementById("timer");
const failScreen = document.getElementById("failScreen");
const retryBtn = document.getElementById("retryBtn");
let speed = 1;
let items = [];
const goal = 49;

let currentDifficulty = "";

const products = [
    { icon: "💄", price: 9 },
    { icon: "👗", price: 10 },
    { icon: "👠", price: 8 },
    { icon: "👙", price: 12 },
    { icon: "💍", price: 7 },
    { icon: "👜", price: 11 },
    { icon: "🕶️", price: 4 },
    { icon: "👒", price: 5 },
    { icon: "💅", price: 6 },
    { icon: "🥨", price: 3 },
];

function isColliding(el1, el2) {
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}

function startGame(difficulty) {
    startMenu.style.display = "none"; // 開始遊戲時隱藏按鈕
    currentDifficulty = difficulty;
    total = 0;
    updateTotal();
    gameArea.innerHTML = "";

    // 控制飄浮速度（越快越難）
    speed = {
        easy: 1,
        medium: 3,
        hard: 8,
    }[difficulty];

    // 顯示計時器
    timeLeft = 30;
    timerDisplay.innerText = `剩餘時間：${timeLeft}秒`;
    timerDisplay.style.display = "block";
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = `剩餘時間：${timeLeft}秒`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            timerDisplay.style.display = "none";
            showFailScreen();
        }
    }, 1000);

    // 隨機生成多個商品
    for (let i = 0; i < 10; i++) {
        const item = createItem();
        gameArea.appendChild(item.el);
        items.push(item);
        moveItem(item);
    }
}

// 在 createItem() 內加拖曳事件
function createItem() {
    const product = products[Math.floor(Math.random() * products.length)];
    const el = document.createElement("div");
    el.className = "item";
    el.innerText = `${product.icon} $${product.price}`;
    el.style.top = `${Math.random() * 80 + 10}%`;
    el.style.left = `${Math.random() * 80 + 10}%`;

    let dragging = false;
    let offsetX = 0, offsetY = 0;

    el.onmousedown = (e) => {
        dragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        el.style.zIndex = 1000;
        document.body.style.cursor = "grabbing";
    };

    // 新增拖曳時購物車放大效果
    let lastOverCart = false;
    document.addEventListener("mousemove", (e) => {
        if (dragging) {
            el.style.top = `${e.clientY - offsetY}px`;
            el.style.left = `${e.clientX - offsetX}px`;
            // 判斷滑鼠是否在購物車範圍
            const cart = document.querySelector(".cart");
            const cartRect = cart.getBoundingClientRect();
            if (
                e.clientX > cartRect.left &&
                e.clientX < cartRect.right &&
                e.clientY > cartRect.top &&
                e.clientY < cartRect.bottom
            ) {
                if (!lastOverCart) {
                    cart.classList.add("cart-hover");
                    lastOverCart = true;
                }
            } else {
                if (lastOverCart) {
                    cart.classList.remove("cart-hover");
                    lastOverCart = false;
                }
            }
        }
    });

    document.addEventListener("mouseup", (e) => {
        if (dragging) {
            dragging = false;
            el.style.zIndex = "";
            document.body.style.cursor = "";
            // 拖曳結束時恢復購物車原狀
            const cart = document.querySelector(".cart");
            cart.classList.remove("cart-hover");
            lastOverCart = false;
            // 判斷是否進入購物車
            const cartRect = cart.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            if (
                elRect.right > cartRect.left &&
                elRect.left < cartRect.right &&
                elRect.bottom > cartRect.top &&
                elRect.top < cartRect.bottom
            ) {
                total += product.price;
                updateTotal();
                el.remove();
                checkWin();
            }
        }
    });

    // 固定速度，隨機方向
    const dx = Math.random() < 0.5 ? speed : -speed;
    const dy = Math.random() < 0.5 ? speed : -speed;

    return { el, dx, dy, dragging: () => dragging };
}

function moveItem(item) {
    const move = () => {
        if (!item.dragging || !item.dragging()) {
            let top = item.el.offsetTop + item.dy;
            let left = item.el.offsetLeft + item.dx;

            // 上下邊界
            if (top < 0) {
                top = 0;
                item.dy *= -1;
            } else if (top > window.innerHeight - 40) {
                top = window.innerHeight - 40;
                item.dy *= -1;
            }

            // 左右邊界
            if (left < 0) {
                left = 0;
                item.dx *= -1;
            } else if (left > window.innerWidth - 100) {
                left = window.innerWidth - 100;
                item.dx *= -1;
            }

            item.el.style.top = `${top}px`;
            item.el.style.left = `${left}px`;

            // 商品間碰撞檢查
            for (const other of items) {
                if (other !== item && !other.dragging?.() && !item.dragging?.()) {
                    if (isColliding(item.el, other.el)) {
                        // 交換速度方向
                        [item.dx, other.dx] = [other.dx, item.dx];
                        [item.dy, other.dy] = [other.dy, item.dy];

                        // 推開重疊（加在這裡）
                        const r1 = item.el.getBoundingClientRect();
                        const r2 = other.el.getBoundingClientRect();
                        const overlapX = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left);
                        const overlapY = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);

                        if (overlapX > 0 && overlapY > 0) {
                            if (overlapX < overlapY) {
                                item.el.style.left = `${item.el.offsetLeft + (item.dx > 0 ? overlapX : -overlapX)}px`;
                                other.el.style.left = `${other.el.offsetLeft + (other.dx > 0 ? -overlapX : overlapX)}px`;
                            } else {
                                item.el.style.top = `${item.el.offsetTop + (item.dy > 0 ? overlapY : -overlapY)}px`;
                                other.el.style.top = `${other.el.offsetTop + (other.dy > 0 ? -overlapY : overlapY)}px`;
                            }
                        }
                    }
                }
            }
        }
        requestAnimationFrame(move);
    };
    move();
}

function updateTotal() {
    totalDisplay.innerText = `目前金額：$${total}`;
}

function checkWin() {
    if (total >= goal) {
        scoresPerLevel.push(total);
        lastScore = total;
        sendScore();

        // ✅ 顯示過關畫面與按鈕
        winScreen.style.display = "flex";
        timerDisplay.style.display = "none";
        if (timer) clearInterval(timer);
        startMenu.style.display = "block";

        const nextBtn = document.getElementById("nextBtn");

        if (currentDifficulty === "easy") {
            nextBtn.style.display = "inline-block";
            nextBtn.innerText = "挑戰中等模式";
            nextBtn.onclick = () => {
                total = 0;                      // ✅ 開始下一關前重設分數
                winScreen.style.display = "none";
                startGame("medium");
            };
        } else if (currentDifficulty === "medium") {
            nextBtn.style.display = "inline-block";
            nextBtn.innerText = "挑戰地獄級難度!";
            nextBtn.onclick = () => {
                total = 0;
                winScreen.style.display = "none";
                startGame("hard");
            };
        } else {
            // 地獄級最後一關 → 不顯示下一關按鈕
            nextBtn.style.display = "none";
        }
    }
}

function showFailScreen() {
    document.getElementById("failTotal").innerText = `總共放了${total}元的商品進購物車`;
    failScreen.style.display = "flex";
    startMenu.style.display = "block";
    gameArea.innerHTML = "";
    scoresPerLevel.push(total); // 新增這行
    sendScore();
} // ← 補上這個大括號，正確結束 showFailScreen

function sendScore() {
    // 將 scoresPerLevel 轉成物件陣列
    const records = scoresPerLevel.map((score, idx) => ({
        score,
        level: idx + 1
    }));

    fetch('http://localhost:3000/api/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nickname: '匿名玩家',
            records
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log('✅ 多筆關卡分數儲存成功');
            } else {
                console.log('❌ 儲存失敗');
            }
        })
        .catch(err => console.error('❌ 錯誤:', err));
}


retryBtn.onclick = function() {
    failScreen.style.display = "none";
    startGame(currentDifficulty);
};

