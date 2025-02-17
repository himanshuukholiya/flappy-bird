// canvas
let canvas = document.querySelector('canvas');
let context = canvas.getContext("2d"); // drawing on the board

let canvasWidth = 360;
let canvasHeight = 640;

// bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = canvasWidth / 8;
let birdY = canvasHeight / 2.5;
let birdImage;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

// pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = canvasWidth;
let pipeY = 0;

let topPipeImage;
let bottomPipeImage;

// ground 
let groundWidth = 360;
let groundHeight = 65.45;
let groundX = 0;
let groundY = canvasHeight - groundHeight;
let groundImage;

let ground = {
    x : groundX,
    y : groundY,
    width : groundWidth,
    height : groundHeight,
}

// physics
let velocityX = -2; // pipes moving left speed
let velocityY = 0; // bird jump speed
let gravity = 0.4;

let gameStarted = false;
let gameOver = false;


// score
let score = 0;

// restart button
let restartButton = false;


window.onload = function() {
    
    // canvas

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // bird

    birdImage = new Image();
    birdImage.src = "./images/bird.png"
    birdImage.onload = function () {
        context.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
    }

    // pipes

    topPipeImage = new Image();
    topPipeImage.src = "./images/upper.png";

    bottomPipeImage = new Image();
    bottomPipeImage.src = "./images/lower.png";

    // ground 
    
    groundImage = new Image();
    groundImage.src = "./images/ground.png"
    groundImage.onload = function () {
        context.drawImage(groundImage, ground.x, ground.y, ground.width, ground.height);
    }

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    document.addEventListener("keydown", moveBirdKey);
    canvas.addEventListener("mousedown", moveBirdMouse);
    canvas.addEventListener("touchstart", moveBirdTouch);

    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (restartButton && x >= canvasWidth / 2.8 && x <= (canvasWidth / 2.8) + 100 && y >= 120 && y <= 170) {
            canvas.style.cursor = 'pointer';
        } else {
            canvas.style.cursor = 'default';
        }
    });
}

function update() {
    requestAnimationFrame(update);

    if (gameOver || !gameStarted) {
        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    // bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // so it doesn't exceed top
    context.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);

    // pipes
    for (let i = 0; i < pipeArray.length; i++ ) {
        let pipe = pipeArray[i]; 
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height)

        // updating scores
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // 2 pipes -> 0.5 + 0.5 = 1
            pipe.passed = true;
        }

        if (delectCollision(bird, pipe)) {
            gameOver = true;
            restartButton = true;
        }
    }

    // clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // removes first element from array
    }

    // ground 
    context.drawImage(groundImage, ground.x, ground.y, ground.width, ground.height);

    if (delectCollision(bird, ground)) {
        gameOver = true;
        restartButton = true;
    }

    // score
    context.fillStyle = "#ffffff";
    context.font = "45px Open-Sans"
    context.fillText(score, canvasWidth / 2.2, 50);

    if (gameOver) {
        context.fillText("GAME OVER", canvasWidth / 8, 100)
    }

    // restart button
    if (restartButton) {
        context.fillStyle = '#E86101';
        context.fillRect(canvasWidth / 2.8, 120, 100, 50);
    
        context.fillStyle = '#ffffff';
        context.font = '500 20px Open-Sans';
        context.fillText('Restart', canvasWidth / 2.4, 150);
    
        // restart game
        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (x >= canvasWidth / 2.8 && x <= (canvasWidth / 2.8) + 100 && y >= 120 && y <= 170) {
                bird.y = birdY;
                pipeArray = [];
                score = 0;
                gameOver = false;
                restartButton = false;
                birdX = canvasWidth / 8;
                birdY = canvasHeight / 2.5;
                velocityY = 0;
                gravity = 0.3
                gameStarted = true;
            }
        });
    }
}

function placePipes () {

    if (gameOver || !gameStarted) {
        return;
    }
    
    let randomPipeY = pipeY - pipeHeight / 2 - Math.random() * (pipeHeight / 2.5);
    let openingSpace = canvas.height / 4;

    let topPipe = {
        img : topPipeImage,
        x : pipeX,
        y : randomPipeY, 
        width : pipeWidth,
        height : pipeHeight,
        passed : false, // bird passed or not
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImage,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false,
    }

    pipeArray.push(bottomPipe);
}

// jump
function moveBirdKey(e) {
    if (e.code == "Space") {
        if (!gameStarted) {
            gameStarted = true;
        }
        jump()
    }

    // reset game
    if (gameOver && e.code == "Space") {
        bird.y = birdY;
        pipeArray = [];
        score = 0;
        gameOver = false;
        restartButton = false;
        gameStarted = false;
    }
}
function moveBirdMouse(e) {
    if (e.button === 0) {
        if (!gameStarted) {
            gameStarted = true;
        }
        jump();
    }
}
function moveBirdTouch() {
    if (!gameStarted) {
        gameStarted = true;
    }
    jump();
}
function jump() {
    velocityY = -6;
}

// check collision
function delectCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}