const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20); // Cada bloco será 20x20px
let numPeca = Math.floor(Math.random() * 7);
let dropInterval = 1000;




function sorteiaPeca(){
    numPeca = Math.floor(Math.random() * 7);
}


const matrix = [
    [
        [0, 0, 0],
        [1, 1, 1], //T
        [0, 1, 0],
    ],
    [
        [1, 0, 0],
        [1, 1, 0], //cobrinha em pé (la ele)
        [0, 1, 0],
    ],
    [
        [0, 0, 0],
        [0, 1, 1], //cobrinha deitada (la ele)
        [1, 1, 0],
    ],
    [
        [0, 0, 0],
        [1, 1, 0], //bloco
        [1, 1, 0],
    ],
    [
        [0, 1, 0],
        [0, 1, 0], //vara (la ele pro max)
        [0, 1, 0],
    ],
    [
        [1, 1, 0],
        [1, 0, 0], //faz o L em pé
        [1, 0, 0],
    ],
    [
        [0, 0, 0],
        [1, 0, 0], //faz o L deitado
        [1, 1, 1],
    ]
];

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function drawMatrix(matrix, offset, isArena = false) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                let color;
                if (isArena) {
                    color = colorMap[y + offset.y][x + offset.x] || 'gray';
                } else {
                    color = player.cor;
                }

                context.fillStyle = color;
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix[numPeca].forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const ay = y + player.pos.y;
                const ax = x + player.pos.x;
                arena[ay][ax] = value;
                colorMap[ay][ax] = player.cor; 
            }
        });
    });
    sorteiaPeca();
}

function collide(arena, player) {
    const m = player.matrix[numPeca];
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        arenaSweep(); // Remover linhas completas
        playerReset();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    player.cor = '#' + Math.floor(Math.random() * (999 - 300) + 300);
    player.matrix = matrix;
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        alert("Game Over!");
    }
}

function playerRotate() {
    const m = player.matrix[numPeca];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
        }
    }
    m.forEach(row => row.reverse());
    if (collide(arena, player)) {
        m.forEach(row => row.reverse());
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
            }
        }
    }
}

// Função para remover linhas completas
let score = 0;
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        score += rowCount * 10;
        rowCount *= 2;
        aumentaVelocidade();
        console.log(dropInterval);
        console.log(score);
    }
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 }, true); // arena com colorMap
    drawMatrix(player.matrix[numPeca], player.pos);   // player com cor atual

    document.getElementById('score').innerText = 'Score: ' + score;
}

let andar = 1;
function aumentaVelocidade(){
   dropInterval = dropInterval/1.1;
}

let dropCounter = 0;
let lastTime = 0;


function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);
const colorMap = createMatrix(12, 20);
const player = {
    pos: { x: 0, y: 0 },
    matrix: matrix,
    cor: 'cyan'
};

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        playerMove(-andar);
    } else if (event.key === 'ArrowRight') {
        playerMove(andar);
    } else if (event.key === 'ArrowDown') {
        playerDrop();
    } else if (event.key === 'ArrowUp') {
        playerRotate();
    }
});

playerReset();
update();

