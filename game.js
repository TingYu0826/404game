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

// 模擬商品 emoji + 隨機價格
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

    document.addEventListener("mousemove", (e) => {
        if (dragging) {
            el.style.top = `${e.clientY - offsetY}px`;
            el.style.left = `${e.clientX - offsetX}px`;
        }
    });

    document.addEventListener("mouseup", (e) => {
        if (dragging) {
            dragging = false;
            el.style.zIndex = "";
            document.body.style.cursor = "";
            // 判斷是否進入購物車
            const cart = document.querySelector(".cart");
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
        winScreen.style.display = "flex";
        timerDisplay.style.display = "none";
        if (timer) clearInterval(timer);
        startMenu.style.display = "block"; // 遊戲結束時顯示按鈕

        const nextBtn = document.getElementById("nextBtn");
        const buttonGroup = document.getElementById("buttonGroup");

        // 簡單 → 中等
        if (currentDifficulty === "easy") {
            nextBtn.style.display = "inline-block";
            nextBtn.innerText = "挑戰中等模式";
            nextBtn.onclick = () => {
                winScreen.style.display = "none";
                startGame("medium");
            };
        }

        // 中等 → 困難
        else if (currentDifficulty === "medium") {
            nextBtn.style.display = "inline-block";
            nextBtn.innerText = "挑戰地獄級難度!";
            nextBtn.onclick = () => {
                winScreen.style.display = "none";
                startGame("hard");
            };
        }

        // 困難 → 不顯示下一關
        else {
            nextBtn.style.display = "none";
        }
    }
}

function showFailScreen() {
    document.getElementById("failTotal").innerText = `總共放了${total}元的商品進購物車`;
    failScreen.style.display = "flex";
    startMenu.style.display = "block";
    gameArea.innerHTML = "";
}

retryBtn.onclick = function() {
    failScreen.style.display = "none";
    startGame(currentDifficulty);
};