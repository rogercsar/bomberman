const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gridSize = 10;  // Tamanho da grid
let tileSize;

// Imagens
const playerImage = new Image();
const blockImage = new Image();
const destructibleBlockImage = new Image();
const enemyImage = new Image();
const bombImage = new Image();
const explosionImage = new Image();

playerImage.src = 'path/to/bomberman.png';
blockImage.src = 'path/to/fase2/blocos2.png';
destructibleBlockImage.src = 'path/to/fase2/blocos3.png';
enemyImage.src = 'path/to/fase2/inimigos2.png';
bombImage.src = 'path/to/bomba.webp';
explosionImage.src = 'path/to/explosao.webp';

let playerPosition = { x: 0, y: 0 };
let blocks = [
    { x: 3, y: 0, type: 'indestructible' },
    { x: 5, y: 0, type: 'destructible', points: 10 },
    { x: 2, y: 3, type: 'destructible', points: 20 },
    { x: 2, y: 4, type: 'indestructible' },
    { x: 6, y: 5, type: 'destructible', points: 30 },
    { x: 0, y: 6, type: 'indestructible' },
    { x: 9, y: 8, type: 'indestructible' },
    { x: 7, y: 8, type: 'destructible', points: 40 },
    // outros blocos
];
let enemies = [
    { x: 5, y: 5 },
    { x: 6, y: 6 },
    { x: 7, y: 7 },
    { x: 2, y: 7 }
];
let bombs = [];
let score = 0;
let lives = 10;
let gameOver = false;

function resizeCanvas() {
    canvas.width = 560;
    canvas.height = 560;
    tileSize = Math.min(canvas.width, canvas.height) / gridSize;
    draw();
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawBlocks();
    drawEnemies();
    drawPlayer();
    drawScoreLives();
}

function drawGrid() {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}

function drawPlayer() {
    ctx.drawImage(playerImage, playerPosition.x * tileSize, playerPosition.y * tileSize, tileSize, tileSize);
}

function drawBlocks() {
    blocks.forEach(block => {
        let img = block.type === 'indestructible' ? blockImage : destructibleBlockImage;
        ctx.drawImage(img, block.x * tileSize, block.y * tileSize, tileSize, tileSize);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemyImage, enemy.x * tileSize, enemy.y * tileSize, tileSize, tileSize);
    });
}

function drawBomb(x, y) {
    ctx.drawImage(bombImage, x * tileSize, y * tileSize, tileSize, tileSize);
}

function drawExplosion(x, y) {
    ctx.drawImage(explosionImage, x * tileSize, y * tileSize, tileSize, tileSize);
}

function drawScoreLives() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.clearRect(0, canvas.height - 50, canvas.width, 50); // Limpa a área onde desenhamos o texto
    ctx.fillText(`Score: ${score}`, 10, canvas.height - 30);
    ctx.fillText(`Lives: ${lives}`, canvas.width - 100, canvas.height - 30);
}

function movePlayer(direction) {
    if (gameOver) return;

    let newX = playerPosition.x;
    let newY = playerPosition.y;

    switch (direction) {
        case 'ArrowUp':
            newY--;
            break;
        case 'ArrowDown':
            newY++;
            break;
        case 'ArrowLeft':
            newX--;
            break;
        case 'ArrowRight':
            newX++;
            break;
    }

    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize && !isColliding(newX, newY)) {
        playerPosition.x = newX;
        playerPosition.y = newY;
        checkCollisionWithEnemies();
    }

    draw();
}

function isColliding(x, y) {
    return blocks.some(block => block.x === x && block.y === y);
}

function placeBomb() {
    if (gameOver) return;

    const bombPosition = { x: playerPosition.x, y: playerPosition.y };
    bombs.push(bombPosition);
    drawBomb(bombPosition.x, bombPosition.y);

    setTimeout(() => {
        explodeBomb(bombPosition.x, bombPosition.y);
    }, 2000);
}

let currentPhase = 1;

function startNewPhase() {
    currentPhase++;
    blocks = generateBlocksForPhase(currentPhase);
    enemies = generateEnemiesForPhase(currentPhase);
    playerPosition = { x: 0, y: 0 };
    
    drawGrid();
    drawBlocks();
    drawEnemies();
    drawPlayer();
}

function generateBlocksForPhase(phase) {
    return [
        { x: 1, y: 0, type: 'indestructible' },
        { x: 2, y: 0, type: 'destructible', points: 10 },
        { x: 2, y: 2, type: 'destructible', points: 20 },
        { x: 3, y: 3, type: 'indestructible' },
        // Adicione mais blocos conforme a fase aumenta
    ];
}

function generateEnemiesForPhase(phase) {
    return [
        { x: 5, y: 5 },
        { x: 6, y: 6 },
        // Adicione mais inimigos conforme a fase aumenta
    ];
}

function explodeBomb(x, y) {
    ctx.clearRect(x * tileSize, y * tileSize, tileSize, tileSize);

    const explosionArea = [
        { x, y },
        { x: x - 1, y },
        { x: x + 1, y },
        { x, y: y - 1 },
        { x, y: y + 1 },
    ];

    explosionArea.forEach(pos => {
        if (pos.x >= 0 && pos.x < gridSize && pos.y >= 0 && pos.y < gridSize) {
            const blockIndex = blocks.findIndex(block => block.x === pos.x && block.y === pos.y);
            if (blockIndex !== -1) {
                if (blocks[blockIndex].type === 'destructible') {
                    score += blocks[blockIndex].points; // Atualiza a pontuação
                    blocks.splice(blockIndex, 1);  // Remove bloco destruído
                }
            }

            const enemyIndex = enemies.findIndex(enemy => enemy.x === pos.x && enemy.y === pos.y);
            if (enemyIndex !== -1) {
                score += 50;  // Pontuação por destruir inimigo
                enemies.splice(enemyIndex, 1);  // Remove inimigo destruído
            }

            if (playerPosition.x === pos.x && playerPosition.y === pos.y) {
                gameOver = true;
                let game = confirm('Colisão com a bomba! Deseja tentar novamente ?');
                if (game == true){
                    window.location.reload();
                }
                else {
                    alert('Você perdeu!');
                }
            }

            ctx.fillStyle = 'orange';
            ctx.fillRect(pos.x * tileSize, pos.y * tileSize, tileSize, tileSize);
        }
    });

    setTimeout(() => {
        clearExplosion();

        // Verifica se todos os inimigos foram destruídos
        if (enemies.length === 0) {
            alert("Você venceu! Próxima fase...");
            window.location.href = 'fase3.html';  // Mude para o nome do arquivo da segunda fase
        } else {
            drawScoreLives(); // Atualiza a pontuação na tela
        }
    }, 500);
}


function clearExplosion() {
    draw();
}

function moveEnemies() {
    if (gameOver) return;

    enemies.forEach(enemy => {
        let directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        let randomDirection = directions[Math.floor(Math.random() * directions.length)];

        let newX = enemy.x;
        let newY = enemy.y;

        switch (randomDirection) {
            case 'ArrowUp':
                newY--;
                break;
            case 'ArrowDown':
                newY++;
                break;
            case 'ArrowLeft':
                newX--;
                break;
            case 'ArrowRight':
                newX++;
                break;
        }

        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize && !isColliding(newX, newY)) {
            enemy.x = newX;
            enemy.y = newY;
        }
    });

    checkCollisionWithEnemies();
    draw();
}

function checkCollisionWithEnemies() {
    if (enemies.some(enemy => enemy.x === playerPosition.x && enemy.y === playerPosition.y)) {
        lives--;
        if (lives <= 0) {
            gameOver = true;
            let game = confirm('Acabou as vidas! Deseja tentar novamente?');
            if (game) {
                window.location.reload();
            } else {
                window.location.href='gameover.html';
            }
        } else {
            // Movimenta o jogador de volta ao início
            playerPosition = { x: 0, y: 0 };
        }
        drawScoreLives(); // Atualiza a pontuação e vidas na tela
    }
}

// Movimentação do jogador
window.addEventListener('keydown', function (event) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        movePlayer(event.key);
    } else if (event.key === ' ') {
        placeBomb();
    }
});

// Movimentação dos inimigos a cada 1 segundo
setInterval(moveEnemies, 1000);
