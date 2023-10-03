const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let playerImg = new Image();
playerImg.src = "assets/nointernet.png"; 
let enemyImg = new Image();
enemyImg.src = "assets/derin.png";

let playerHealth = 10
let enemyHealth = 40

let MaxPHealth = 10
let MaxEHealth = 40

let player = { x: 100, y: 300, health: playerHealth, bullets: [] };
let enemy = { x: 700, y: 300, health: enemyHealth, bullets: [], targetY: 300 };

let canShootPlayer = true;
let canShootEnemy = true;

let gameState = "running";  // Possible values: "running", "gameover"

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
document.getElementById("restartButton").addEventListener("click", restartGame);


let keys = {};

function handleKeyDown(e) {
  keys[e.code] = true;
}

function handleKeyUp(e) {
    keys[e.code] = false;
    if (e.code === 'Space') canShootPlayer = true; // Reset shooting flag on key release
  }

function shoot(shooter, direction, type) {
    let canShoot = type === 'player' ? canShootPlayer : canShootEnemy;
  
    if (canShoot) {
        shooter.bullets.push({ x: shooter.x, y: shooter.y, vx: direction * 5, vy: 0, width: 10, height: 5 });  
      if (type === 'player') {
        canShootPlayer = false;
      } else {
        canShootEnemy = false;
      }
    }
  }

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function update() {
    // Player actions
  if (keys['ArrowUp'] && player.y > 0) player.y -= 5;
  if (keys['ArrowDown'] && player.y < canvas.height - 40) player.y += 5;
  if (keys['Space']) shoot(player, 1, 'player');
  
  // Update player bullet positions
  player.bullets.forEach(bullet => {
    bullet.x += bullet.vx;
  });
  
  // Remove off-screen player bullets
  player.bullets = player.bullets.filter(bullet => bullet.x >= 0 && bullet.x <= canvas.width);
  
  // Enemy actions
  // Enemy AI
  if (Math.random() < 0.15) {
    shoot(enemy, -1, 'enemy');
    canShootEnemy = true;
  }
  const moveSpeed = 5; // Adjust this for enemy's moving speed
  if (Math.abs(enemy.y - enemy.targetY) <= moveSpeed) {
        // If close to the target position, set a new random target
        enemy.targetY = Math.random() * (canvas.height - 40);
  } 
  else {
        // Move towards the target position
        if (enemy.y < enemy.targetY) enemy.y += moveSpeed;
        if (enemy.y > enemy.targetY) enemy.y -= moveSpeed;
  }

  // Update enemy bullet positions
  enemy.bullets.forEach(bullet => {
    bullet.x += bullet.vx;
  });

    // Check if player bullets hit enemy
    for (let i = player.bullets.length - 1; i >= 0; i--) {
        if (checkCollision(player.bullets[i], {x: enemy.x, y: enemy.y, width: 60, height: 60})) {
            enemy.health--;
            player.bullets.splice(i, 1);
        }
    }

    // Check if enemy bullets hit player
    for (let i = enemy.bullets.length - 1; i >= 0; i--) {
        if (checkCollision(enemy.bullets[i], {x: player.x, y: player.y, width: 60, height: 60})) {
            player.health--;
            enemy.bullets.splice(i, 1);
        }
    }

    if (player.health <= 0) {
        gameState = "gameover";
        setTimeout(() => {
            alert("Brother wins!");
            document.getElementById("restartButton").style.display = "block";  // Show the button
        }, 50);
    }
    
    if (enemy.health <= 0) {
        gameState = "gameover";
        setTimeout(() => {
            alert("Player wins!");
            document.getElementById("restartButton").style.display = "block";  // Show the button
        }, 50);
    }
    

  // Remove off-screen enemy bullets
  enemy.bullets = enemy.bullets.filter(bullet => bullet.x >= 0 && bullet.x <= canvas.width);

  
  
  draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, 60, 60);
    
    // Draw enemy
    ctx.drawImage(enemyImg, enemy.x, enemy.y, 60, 60);
    
    // Draw player bullets
    ctx.fillStyle = 'blue';
    player.bullets.forEach(bullet => {
    ctx.fillRect(bullet.x + 40, bullet.y + 15, bullet.width, bullet.height);
    });

    // Draw enemy bullets
    ctx.fillStyle = 'red';
    enemy.bullets.forEach(bullet => {
    ctx.fillRect(bullet.x - bullet.width, bullet.y + 15, bullet.width, bullet.height);
    });

    
    // Draw health bars
    drawHealthBar(player, 'blue', MaxPHealth);
    drawHealthBar(enemy, 'red', MaxEHealth);
}

function drawHealthBar(character, color, maxHealth) {
  const width = 40;
  const healthWidth = (character.health / maxHealth) * width;
  const x = character === player ? character.x : character.x;
  const y = character.y - 20;
  
  ctx.fillStyle = color;
  ctx.fillRect(x, y, healthWidth, 10);
  
  ctx.fillStyle = 'white';
  ctx.font = '10px sans-serif';
  ctx.fillText(`${(character.health / maxHealth) * 100}%`, x + 10, y + 8);
}

function gameLoop() {
    if (gameState === "running") {
        update();
    }
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    // Reset game variables
    player = { x: 100, y: 300, health: MaxPHealth, bullets: [] };
    enemy = {x: 700, y: 300, health: MaxEHealth, bullets: [], targetY: 300 };
    gameState = "running";
    document.getElementById("restartButton").style.display = "none";  // Hide the button
}


gameLoop();
