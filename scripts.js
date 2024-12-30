const gameState = {
    score: 0,
    lives: 3,
    playerHealth: 100,
    projectiles: [],
    enemies: [],
    powerUps: [],
    playerPosition: { x: window.innerWidth / 2, y: window.innerHeight - 60 },
    currentWave: 1,
    enemySpawnRate: 1000,
    isShielded: false,
    isSpeedBoosted: false,
    waveInProgress: false,
    boss: null, // Tracks the boss
    bossMovementDirection: 1, // Direction for boss movement
    bossMovementInterval: null, // Interval for boss movement
    bossAttackInterval: null, // Interval for boss attacks
    enemySpawning: true,
};

// DOM Elements
const gameCanvas = document.getElementById('gameCanvas');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const healthBar = document.getElementById('health');

// Player Movement with Mouse
gameCanvas.addEventListener('mousemove', (e) => {
    gameState.playerPosition.x = e.clientX;
    gameState.playerPosition.y = e.clientY;

    player.style.left = `${gameState.playerPosition.x - player.offsetWidth / 2}px`;
    player.style.top = `${gameState.playerPosition.y - player.offsetHeight / 2}px`;
});

// Enemy Sprites and Types
const enemySprites = [
    { src: 'assets/ships/ship_2.png', type: 'fast', health: 1, speed: 10 },
    { src: 'assets/ships/ship_3.png', type: 'tough', health: 3, speed: 5 },
    { src: 'assets/ships/ship_4.png', type: 'shooter', health: 1, speed: 5 },
    { src: 'assets/ships/ship_5.png', type: 'dodger', health: 1, speed: 5 },
    { src: 'assets/ships/ship_6.png', type: 'basic', health: 1, speed: 5 },
];

// Utility Functions
function updateHealth(damage) {
    // Ignore damage if the shield is active
    if (gameState.isShielded) {
        console.log("Shield absorbed the damage!");
        return;
    }

    gameState.playerHealth = Math.max(0, gameState.playerHealth - damage);
    healthBar.style.width = `${gameState.playerHealth}%`;

    if (gameState.playerHealth === 0) {
        updateLives();
    }
}

function resetHealth() {
    gameState.playerHealth = 100;
    healthBar.style.width = '100%';
}

function updateScore(points) {
    gameState.score += points;
    scoreDisplay.textContent = gameState.score;
}

function resetPlayerPosition() {
    gameState.playerPosition = { x: window.innerWidth / 2, y: window.innerHeight - 60 };
    player.style.left = `${gameState.playerPosition.x - player.offsetWidth / 2}px`;
    player.style.top = `${gameState.playerPosition.y - player.offsetHeight / 2}px`;
}

// Wave Announcement
function announceWave(waveNumber) {
    const waveAnnouncement = document.createElement('div');
    waveAnnouncement.id = 'wave-announcement';
    waveAnnouncement.textContent = `Wave ${waveNumber}`;
    document.body.appendChild(waveAnnouncement);

    setTimeout(() => waveAnnouncement.remove(), 2000); // Remove after 2 seconds
}

// Start Wave
function startWave() {
    if (gameState.waveInProgress) return;
    gameState.waveInProgress = true;

    if (gameState.currentWave === 3) {
        announceWave('Boss Incoming');
        setTimeout(() => spawnBoss(), 2000);
    } else {
        announceWave(gameState.currentWave);

        if (gameState.enemySpawning) {
            enemySpawnInterval = setInterval(spawnEnemy, gameState.enemySpawnRate);
        }
    }

    setTimeout(() => {
        gameState.waveInProgress = false;
        if (gameState.boss === null) gameState.currentWave++;
    }, 30000);
}

// Pause and resume gameplay for boss cutscene
function pauseGameplay() {
    clearInterval(enemySpawnInterval); // Stop enemy spawning
    clearInterval(shootingInterval); // Stop player shooting
    gameState.isPaused = true; // Set a pause flag
    console.log("Gameplay paused for cutscene.");
}

function resumeGameplay() {
    if (gameState.enemySpawning && gameState.waveInProgress) {
        enemySpawnInterval = setInterval(spawnEnemy, gameState.enemySpawnRate); // Resume spawning enemies
    }
    shootingInterval = setInterval(fireBullet, 300); // Resume player shooting
    gameState.isPaused = false; // Clear the pause flag
    console.log("Gameplay resumed.");
}

// Game Mechanics
function fireBullet() {
    const projectile = document.createElement('div');
    projectile.classList.add('projectile');
    projectile.style.left = `${gameState.playerPosition.x - 2.5}px`;
    projectile.style.top = `${gameState.playerPosition.y - 20}px`;
    gameCanvas.appendChild(projectile);
    gameState.projectiles.push(projectile);
}

function spawnPowerUp() {
    const powerUp = document.createElement('div');
    powerUp.classList.add('power-up');

    // Define the power-up types
    const powerUpTypes = ['speed-boost', 'triple-shot', 'shield'];
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

    powerUp.classList.add(randomType); // Add the specific power-up type as a class
    powerUp.dataset.type = randomType; // Store the type for collision logic

    // Random position within the canvas
    powerUp.style.left = `${Math.random() * (window.innerWidth - 32)}px`;
    powerUp.style.top = `${Math.random() * (window.innerHeight - 100)}px`;

    gameCanvas.appendChild(powerUp);
    gameState.powerUps.push(powerUp);

    // Remove the power-up after 10 seconds if not collected
    setTimeout(() => {
        powerUp.remove();
        gameState.powerUps = gameState.powerUps.filter((p) => p !== powerUp);
    }, 10000); // Lifespan of 10 seconds
}

function spawnEnemy() {
    if (!gameState.enemySpawning) return; // Don't spawn if disabled

    const randomEnemy = enemySprites[Math.floor(Math.random() * enemySprites.length)];
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.backgroundImage = `url(${randomEnemy.src})`;
    enemy.dataset.type = randomEnemy.type;
    enemy.dataset.health = randomEnemy.health;
    enemy.dataset.speed = randomEnemy.speed;

    enemy.style.left = `${Math.random() * (window.innerWidth - 48)}px`;
    enemy.style.top = `-48px`;
    gameCanvas.appendChild(enemy);
    gameState.enemies.push(enemy);
}

function spawnPowerUp() {
    console.log("Spawning power-up..."); // Debugging log
    const powerUp = document.createElement('div');
    powerUp.classList.add('power-up');

    // Define the power-up types
    const powerUpTypes = ['speed-boost', 'triple-shot', 'shield'];
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

    powerUp.classList.add(randomType); // Add the specific power-up type as a class
    powerUp.dataset.type = randomType; // Store the type for collision logic

    // Random position within the canvas
    powerUp.style.left = `${Math.random() * (window.innerWidth - 32)}px`;
    powerUp.style.top = `${Math.random() * (window.innerHeight - 100)}px`;

    gameCanvas.appendChild(powerUp);
    gameState.powerUps.push(powerUp);

    // Remove the power-up after 10 seconds if not collected
    setTimeout(() => {
        powerUp.remove();
        gameState.powerUps = gameState.powerUps.filter((p) => p !== powerUp);
    }, 10000); // Lifespan of 10 seconds
}

function spawnEnemyProjectile(enemyRect) {
    const projectile = document.createElement('div');
    projectile.classList.add('enemy-projectile');
    projectile.style.left = `${enemyRect.left + enemyRect.width / 2 - 2.5}px`;
    projectile.style.top = `${enemyRect.bottom}px`;
    gameCanvas.appendChild(projectile);

    const interval = setInterval(() => {
        const top = parseInt(projectile.style.top);
        projectile.style.top = `${top + 8}px`;

        // Remove if off-screen
        if (top > window.innerHeight) {
            clearInterval(interval);
            projectile.remove();
        }

        // Check collision with player
        const playerRect = player.getBoundingClientRect();
        const projectileRect = projectile.getBoundingClientRect();
        if (
            projectileRect.left < playerRect.right &&
            projectileRect.right > playerRect.left &&
            projectileRect.top < playerRect.bottom &&
            projectileRect.bottom > playerRect.top
        ) {
            if (!gameState.isShielded) {
                updateHealth(10); // Damage player
            } else {
                console.log("Shield protected the player from the projectile!");
            }
            clearInterval(interval);
            projectile.remove();
        }
    }, 16);
}

// Update Functions
function updateProjectiles() {
    gameState.projectiles.forEach((projectile, index) => {
        const top = parseInt(projectile.style.top);
        projectile.style.top = `${top - 10}px`;

        if (top < 0) {
            projectile.remove(); // Remove from DOM
            gameState.projectiles.splice(index, 1); // Remove from array
            return; // Continue to next projectile
        }

        // Check collision with boss
        if (gameState.boss) {
            const bossRect = gameState.boss.getBoundingClientRect();
            const projectileRect = projectile.getBoundingClientRect();
            if (
                projectileRect.left < bossRect.right &&
                projectileRect.right > bossRect.left &&
                projectileRect.top < bossRect.bottom &&
                projectileRect.bottom > bossRect.top
            ) {
                updateBossHealth(10); // Damage boss
                projectile.remove(); // Remove projectile from DOM
                gameState.projectiles.splice(index, 1); // Remove projectile from array
                return; // Prevent double processing
            }
        }
    });
}

function updateEnemies() {
    gameState.enemies.forEach((enemy, eIndex) => {
        const top = parseInt(enemy.style.top);
        const speed = parseInt(enemy.dataset.speed);
        enemy.style.top = `${top + speed}px`;

        const playerRect = player.getBoundingClientRect();
        const enemyRect = enemy.getBoundingClientRect();

        // Dodger behavior: random horizontal movement
        if (enemy.dataset.type === 'dodger' && Math.random() < 0.05) {
            const newLeft = parseInt(enemy.style.left) + (Math.random() < 0.5 ? -10 : 10);
            enemy.style.left = `${Math.max(0, Math.min(window.innerWidth - 48, newLeft))}px`;
        }

        // Shooter behavior: fire projectiles
        if (enemy.dataset.type === 'shooter' && Math.random() < 0.01) {
            spawnEnemyProjectile(enemyRect);
        }

        // Remove enemy if off-screen
        if (top > window.innerHeight) {
            enemy.remove(); // Remove from DOM
            gameState.enemies.splice(eIndex, 1); // Remove from array
            return; // Exit the current loop iteration
        }

        // Check collision with player
        if (
            playerRect.left < enemyRect.right &&
            playerRect.right > enemyRect.left &&
            playerRect.top < enemyRect.bottom &&
            playerRect.bottom > enemyRect.top
        ) {
            if (!gameState.isShielded) {
                updateHealth(20); // Damage player
            } else {
                console.log("Shield blocked the enemy collision!");
            }
            enemy.remove(); // Remove enemy from DOM
            gameState.enemies.splice(eIndex, 1); // Remove from array
            return; // Exit the current loop iteration
        }
        

        // Check collision with projectiles
        gameState.projectiles.forEach((projectile, pIndex) => {
            const projectileRect = projectile.getBoundingClientRect();

            if (
                projectileRect.left < enemyRect.right &&
                projectileRect.right > enemyRect.left &&
                projectileRect.top < enemyRect.bottom &&
                projectileRect.bottom > enemyRect.top
            ) {
                const remainingHealth = parseInt(enemy.dataset.health) - 1;

                if (remainingHealth <= 0) {
                    updateScore(10);
                    enemy.remove(); // Remove from DOM
                    gameState.enemies.splice(eIndex, 1); // Remove from array
                } else {
                    enemy.dataset.health = remainingHealth; // Update enemy health
                }

                projectile.remove(); // Remove projectile from DOM
                gameState.projectiles.splice(pIndex, 1); // Remove projectile from array
                return; // Exit the loop to prevent double removal
            }
        });
    });
}

function applyPowerupEffect(powerUpType) {
    if (powerUpType === 'speed-boost') {
        if (!gameState.isSpeedBoosted) {
            console.log("Speed Boost Activated!");
            gameState.isSpeedBoosted = true;
            player.classList.add('speed-boost-active'); // Add glowing effect

            clearInterval(shootingInterval);
            shootingInterval = setInterval(fireBullet, 100); // Faster shooting

            setTimeout(() => {
                gameState.isSpeedBoosted = false;
                player.classList.remove('speed-boost-active'); // Remove glowing effect
                clearInterval(shootingInterval);
                shootingInterval = setInterval(fireBullet, 300); // Restore normal shooting
                console.log("Speed Boost Ended!");
            }, 10000); // Effect lasts 10 seconds
        }
    } else if (powerUpType === 'triple-shot') {
        console.log("Triple Shot Activated!");
        const originalFireBullet = fireBullet;
        player.classList.add('triple-shot-active'); // Add glowing effect

        fireBullet = function () {
            originalFireBullet(); // Center bullet
            fireBulletSide(-10); // Left bullet
            fireBulletSide(10); // Right bullet
        };

        setTimeout(() => {
            fireBullet = originalFireBullet; // Restore single shot
            player.classList.remove('triple-shot-active'); // Remove glowing effect
            console.log("Triple Shot Ended!");
        }, 10000); // Effect lasts 10 seconds
    } else if (powerUpType === 'shield') {
        if (!gameState.isShielded) {
            console.log("Shield Activated!");
            gameState.isShielded = true;
            player.classList.add('shield-active'); // Add glowing effect

            setTimeout(() => {
                gameState.isShielded = false;
                player.classList.remove('shield-active'); // Remove glowing effect
                console.log("Shield Ended!");
            }, 10000); // Effect lasts 10 seconds
        }
    }
}

function updatePowerUps() {
    gameState.powerUps.forEach((powerUp, index) => {
        const playerRect = player.getBoundingClientRect();
        const powerUpRect = powerUp.getBoundingClientRect();

        if (
            playerRect.left < powerUpRect.right &&
            playerRect.right > powerUpRect.left &&
            playerRect.top < powerUpRect.bottom &&
            playerRect.bottom > powerUpRect.top
        ) {
            const powerUpType = powerUp.classList[1]; // Get the type (e.g., 'speed-boost')
            console.log(`Collected power-up: ${powerUpType}`); // Debugging log
            applyPowerupEffect(powerUpType);

            powerUp.remove();
            gameState.powerUps.splice(index, 1);
        }
    });
}

// Helper function for Triple Shot
function fireBulletSide(offset) {
    const projectile = document.createElement('div');
    projectile.classList.add('projectile');
    projectile.style.left = `${gameState.playerPosition.x - 2.5 + offset}px`;
    projectile.style.top = `${gameState.playerPosition.y - 20}px`;
    gameCanvas.appendChild(projectile);
    gameState.projectiles.push(projectile);
}

function spawnBoss() {
    const boss = document.createElement('div');
    boss.id = 'boss';

    // Dynamically set size based on the screen dimensions, now slightly larger
    const bossWidth = window.innerWidth / 3; // 1/3 of the screen width
    const bossHeight = (bossWidth / 4) * 3; // Maintain proportional size (wider than tall)

    boss.style.backgroundImage = "url('assets/bosses/1B.png')";
    boss.style.backgroundSize = "contain"; // Scale the image to fit the element
    boss.style.backgroundRepeat = "no-repeat"; // Prevent tiling
    boss.style.backgroundPosition = "center"; // Center the image
    boss.style.position = 'absolute';
    boss.style.width = `${bossWidth}px`;
    boss.style.height = `${bossHeight}px`;
    boss.style.left = `${(window.innerWidth - bossWidth) / 2}px`; // Center horizontally
    boss.style.top = `-${bossHeight}px`; // Start off-screen

    // Rotate the boss by 180 degrees (corrected)
    boss.style.transform = "rotate(180deg)";

    boss.dataset.health = 100; // Boss health
    gameCanvas.appendChild(boss);
    gameState.boss = boss;

    // Show the boss health bar
    const bossHealthBar = document.getElementById('bossHealthBar');
    bossHealthBar.style.display = 'block';

    // Pause gameplay during the boss entrance
    pauseGameplay();

    // Boss entrance animation
    const introInterval = setInterval(() => {
        const currentTop = parseInt(boss.style.top);
        if (currentTop >= 150) { // Adjust the final position to be lower
            clearInterval(introInterval);
            resumeGameplay(); // Resume gameplay after entrance
            startBossBehavior(); // Begin boss movement and attacks
        } else {
            boss.style.top = `${currentTop + 3}px`; // Move down gradually
        }
    }, 16); // Smooth animation
}

// Function to handle boss movement and attacks after the entrance
function startBossBehavior() {
    const boss = gameState.boss;
    if (!boss) return;

    // Boss movement logic
    gameState.bossMovementDirection = 1; // Initialize direction
    gameState.bossMovementInterval = setInterval(() => {
        if (!gameState.boss) {
            clearInterval(gameState.bossMovementInterval);
            return;
        }
        const currentLeft = parseInt(boss.style.left);
        const newLeft = currentLeft + gameState.bossMovementDirection * 5;
        if (newLeft <= 0 || newLeft >= window.innerWidth - parseInt(boss.style.width)) {
            gameState.bossMovementDirection *= -1; // Reverse direction
        }
        boss.style.left = `${newLeft}px`;
    }, 30);

    // Boss attack logic: cycle through attack patterns
    gameState.bossAttackInterval = setInterval(() => {
        if (!gameState.boss) {
            clearInterval(gameState.bossAttackInterval);
            return;
        }

        const bossRect = boss.getBoundingClientRect();
        const attackPatterns = [
            straightLineAttack,
            verticalSpreadShot, // Add vertical spread shot
            circularSpray,
            targetedShot,
        ];
        const randomAttack = attackPatterns[Math.floor(Math.random() * attackPatterns.length)];
        randomAttack(bossRect); // Execute a random attack
    }, 2000); // Boss attacks every 2 seconds
}

// Straight Line Attack
function straightLineAttack(bossRect) {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            spawnEnemyProjectile(bossRect);
        }, i * 200); // Slight delay between each shot
    }
}

// Vertical spreadshot
function verticalSpreadShot(bossRect) {
    const spreadCount = 5; // Number of projectiles in the spread
    const angleIncrement = Math.PI / 8; // Adjust spread angle
    const initialAngle = Math.PI / 2; // Start directly downward (90 degrees)

    for (let i = 0; i < spreadCount; i++) {
        const angle = initialAngle + angleIncrement * (i - Math.floor(spreadCount / 2));
        spawnProjectileWithAngle(bossRect, (angle * 180) / Math.PI); // Convert to degrees
    }
}

// Circular Spray Attack
function circularSpray(bossRect) {
    for (let angle = 0; angle < 360; angle += 30) {
        spawnProjectileWithAngle(bossRect, angle);
    }
}

// Targeted Shot
function targetedShot(bossRect) {
    const playerRect = player.getBoundingClientRect();
    const angle = Math.atan2(
        playerRect.top - bossRect.bottom,
        playerRect.left + playerRect.width / 2 - (bossRect.left + bossRect.width / 2)
    );
    spawnProjectileWithAngle(bossRect, angle * (180 / Math.PI)); // Convert to degrees
}

// Helper: Spawn Projectiles at an Angle
function spawnProjectileWithAngle(bossRect, angle) {
    const projectile = document.createElement('div');
    projectile.classList.add('enemy-projectile');
    projectile.style.left = `${bossRect.left + bossRect.width / 2 - 2.5}px`;
    projectile.style.top = `${bossRect.bottom}px`;
    gameCanvas.appendChild(projectile);

    // Calculate velocity based on angle
    const speed = 5;
    const radians = (Math.PI / 180) * angle;
    const vx = speed * Math.cos(radians);
    const vy = speed * Math.sin(radians);

    const interval = setInterval(() => {
        const currentLeft = parseInt(projectile.style.left);
        const currentTop = parseInt(projectile.style.top);

        projectile.style.left = `${currentLeft + vx}px`;
        projectile.style.top = `${currentTop + vy}px`;

        // Remove projectile if off-screen
        if (
            currentTop > window.innerHeight ||
            currentTop < 0 ||
            currentLeft > window.innerWidth ||
            currentLeft < 0
        ) {
            clearInterval(interval);
            projectile.remove();
        }

        // Check collision with player
        const playerRect = player.getBoundingClientRect();
        const projectileRect = projectile.getBoundingClientRect();
        if (
            projectileRect.left < playerRect.right &&
            projectileRect.right > playerRect.left &&
            projectileRect.top < playerRect.bottom &&
            projectileRect.bottom > playerRect.top
        ) {
            if (!gameState.isShielded) {
                updateHealth(10); // Damage player
            } else {
                console.log("Shield protected the player from the projectile!");
            }
            clearInterval(interval);
            projectile.remove();
        }
    }, 16);
}

// Update Boss Health Bar
function updateBossHealth(damage) {
    const boss = gameState.boss;
    if (!boss) return;

    const bossHealth = document.getElementById('bossHealth');
    const newHealth = Math.max(0, parseInt(boss.dataset.health) - damage);
    boss.dataset.health = newHealth;
    bossHealth.style.width = `${(newHealth / 100) * 100}%`;

    if (newHealth <= 0) {
        boss.remove();
        gameState.boss = null;
        clearInterval(gameState.bossMovementInterval);
        clearInterval(gameState.bossAttackInterval);
        const bossHealthBar = document.getElementById('bossHealthBar');
        bossHealthBar.style.display = 'none';
        alert('Boss Defeated!');
    }
}

// Add Boss Logic to Waves
function startWave() {
    if (gameState.waveInProgress) return;
    gameState.waveInProgress = true;

    if (gameState.currentWave === 3) {
        announceWave('Boss Incoming');
        setTimeout(() => spawnBoss(), 2000);
    } else {
        announceWave(gameState.currentWave);

        if (gameState.enemySpawning) {
            enemySpawnInterval = setInterval(spawnEnemy, gameState.enemySpawnRate);
        }
    }

    setTimeout(() => {
        gameState.waveInProgress = false;
        gameState.currentWave++;
    }, 30000);
}

// Game Loop
function gameLoop() {
    if (!gameState.waveInProgress) {
        startWave();
    }
    updateProjectiles();
    updateEnemies();
    updatePowerUps(); 
    requestAnimationFrame(gameLoop);
}

// Initialization
let shootingInterval = null;
let enemySpawnInterval = null;
let powerUpSpawnInterval = null;


function startGame() {
    resetPlayerPosition();
    resetHealth();

    // Initialize intervals
    shootingInterval = setInterval(fireBullet, 300);
    powerUpSpawnInterval = setInterval(spawnPowerUp, 10000); // Spawn power-ups every 10 seconds

    startWave(); // Start the first wave
    gameLoop(); // Begin the game loop
}

startGame();
