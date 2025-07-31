class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Инициализация змейки
        this.snake = [
            {x: 10, y: 10}
        ];
        this.dx = 0;
        this.dy = 0;
        
        // Еда
        this.food = this.generateFood();
        
        // Игровые переменные
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = 150;
        
        // Элементы интерфейса
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        
        this.initializeEventListeners();
        this.updateScoreDisplay();
        this.draw();
    }
    
    initializeEventListeners() {
        // Кнопки управления
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        
        // Управление клавиатурой
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Скрытие окна окончания игры при клике вне его
        this.gameOverElement.addEventListener('click', (e) => {
            if (e.target === this.gameOverElement) {
                this.hideGameOver();
            }
        });
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        const key = e.key.toLowerCase();
        
        // Предотвращение движения в противоположном направлении
        switch(key) {
            case 'arrowup':
            case 'w':
                if (this.dy !== 1) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'arrowdown':
            case 's':
                if (this.dy !== -1) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'arrowleft':
            case 'a':
                if (this.dx !== 1) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'arrowright':
            case 'd':
                if (this.dx !== -1) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
            case ' ':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.hideGameOver();
        
        // Сброс направления
        this.dx = 1;
        this.dy = 0;
        
        this.gameLoop();
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? 'Продолжить' : 'Пауза';
        
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }
    
    restartGame() {
        this.resetGame();
        this.startGame();
    }
    
    resetGame() {
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.food = this.generateFood();
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = 150;
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Пауза';
        
        this.updateScoreDisplay();
        this.draw();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.update();
        this.draw();
        
        setTimeout(() => {
            if (this.gameRunning && !this.gamePaused) {
                this.gameLoop();
            }
        }, this.gameSpeed);
    }
    
    update() {
        // Движение змейки
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // Проверка столкновения со стенами
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Проверка столкновения с собой
        for (let i = 0; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Проверка съедания еды
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            this.updateScoreDisplay();
            
            // Увеличение скорости
            if (this.gameSpeed > 50) {
                this.gameSpeed -= 2;
            }
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        // Очистка canvas
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Отрисовка сетки
        this.drawGrid();
        
        // Отрисовка змейки
        this.drawSnake();
        
        // Отрисовка еды
        this.drawFood();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            // Вертикальные линии
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            // Горизонтальные линии
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Голова змейки
                this.ctx.fillStyle = '#28a745';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 2,
                    segment.y * this.gridSize + 2,
                    this.gridSize - 4,
                    this.gridSize - 4
                );
                
                // Глаза
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 6,
                    segment.y * this.gridSize + 6,
                    3, 3
                );
                this.ctx.fillRect(
                    segment.x * this.gridSize + 11,
                    segment.y * this.gridSize + 6,
                    3, 3
                );
            } else {
                // Тело змейки
                this.ctx.fillStyle = '#20c997';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 2,
                    segment.y * this.gridSize + 2,
                    this.gridSize - 4,
                    this.gridSize - 4
                );
            }
        });
    }
    
    drawFood() {
        this.ctx.fillStyle = '#dc3545';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        return newFood;
    }
    
    gameOver() {
        this.gameRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        
        // Обновление рекорда
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        
        this.updateScoreDisplay();
        this.showGameOver();
    }
    
    showGameOver() {
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'flex';
    }
    
    hideGameOver() {
        this.gameOverElement.style.display = 'none';
    }
    
    updateScoreDisplay() {
        this.scoreElement.textContent = this.score;
        this.highScoreElement.textContent = this.highScore;
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
}); 