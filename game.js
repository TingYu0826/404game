const gameArea = document.getElementById("gameArea");
const totalDisplay = document.getElementById("total");
const winScreen = document.getElementById("winScreen");

let total = 0;
let speed = 1;
let items = [];
const goal = 49;

let currentDifficulty = "";


// 模擬商品 emoji + 隨機價格
const products = [
    { icon: "🍔", price: 9 },
    { icon: "🥤", price: 10 },
    { icon: "🍟", price: 8 },
    { icon: "🍩", price: 12 },
    { icon: "🧁", price: 7 },
    { icon: "🍙", price: 11 },
    { icon: "🍕", price: 13 },
];

function startGame(difficulty) {
    currentDifficulty = difficulty;
    total = 0;
    updateTotal();
    gameArea.innerHTML = "";

    // 控制飄浮速度（越快越難）
    speed = {
        easy: 1,
        medium: 2,
        hard: 4,
    }[difficulty];

    // 隨機生成多個商品
    for (let i = 0; i < 10; i++) {
        const item = createItem();
        gameArea.appendChild(item.el);
        items.push(item);
        moveItem(item);
    }
}

// function createItem() {
//     const product = products[Math.floor(Math.random() * products.length)];
//     const el = document.createElement("div");
//     el.className = "item";
//     el.innerText = `${product.icon} $${product.price}`;
//     el.style.top = `${Math.random() * 80 + 10}%`;
//     el.style.left = `${Math.random() * 80 + 10}%`;
//
//     el.onclick = () => {
//         total += product.price;
//         updateTotal();
//         el.remove(); // 被點過就消失
//         checkWin();
//     };
//
//     return { el, dx: randSpeed(), dy: randSpeed() };
// }

function createItem() {
    const product = products[Math.floor(Math.random() * products.length)];
    const el = document.createElement("div");
    el.className = "item";
    el.innerText = `${product.icon} $${product.price}`;
    el.style.top = `${Math.random() * 80 + 10}%`;
    el.style.left = `${Math.random() * 80 + 10}%`;

    el.onclick = () => {
        total += product.price;
        updateTotal();
        el.remove();
        checkWin();
    };

    // 固定速度，隨機方向
    const dx = Math.random() < 0.5 ? speed : -speed;
    const dy = Math.random() < 0.5 ? speed : -speed;

    return { el, dx, dy };
}

function randSpeed() {
    const s = Math.random() * speed + 0.5;
    return Math.random() < 0.5 ? s : -s;
}

function moveItem(item) {
    const move = () => {
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

        requestAnimationFrame(move);
    };
    move();
}

function updateTotal() {
    totalDisplay.innerText = `目前金額：$${total}`;
}

// function checkWin() {
//     if (total >= goal) {
//         winScreen.style.display = "flex";
//     }
// }

function checkWin() {
    if (total >= goal) {
        winScreen.style.display = "flex";

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
            nextBtn.innerText = "挑戰困難模式";
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