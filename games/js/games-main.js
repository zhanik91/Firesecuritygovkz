
class FireSafetyGames {
  constructor() {
    this.currentScore = 0;
    this.currentLevel = 1;
    this.gameStarted = false;
    this.achievements = JSON.parse(localStorage.getItem('fireGameAchievements') || '[]');
    this.totalScore = parseInt(localStorage.getItem('fireGameTotalScore') || '0');
    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.setupEventListeners();
    this.loadUserProgress();
    this.updateUI();
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/games/sw.js', {
          scope: '/games/'
        });
        console.log('[SW] Registration successful:', registration);
        
        // Проверяем обновления
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });
      } catch (error) {
        console.error('[SW] Registration failed:', error);
      }
    }
  }

  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: #dc2626; color: white; padding: 1rem; border-radius: 8px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <p style="margin: 0 0 0.5rem 0; font-weight: bold;">Доступно обновление игр!</p>
        <button onclick="this.parentElement.parentElement.remove(); window.location.reload();" style="background: white; color: #dc2626; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
          Обновить
        </button>
        <button onclick="this.parentElement.parentElement.remove();" style="background: transparent; color: white; border: 1px solid white; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">
          Позже
        </button>
      </div>
    `;
    document.body.appendChild(notification);
  }

  setupEventListeners() {
    // Кнопки игр
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('game-btn')) {
        const gameType = e.target.dataset.game;
        this.startGame(gameType);
      }
      
      if (e.target.classList.contains('reset-progress')) {
        this.resetProgress();
      }

      if (e.target.classList.contains('share-score')) {
        this.shareScore();
      }
    });

    // Клавиатурные сокращения
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case '1': this.startGame('pass'); e.preventDefault(); break;
          case '2': this.startGame('evacuation'); e.preventDefault(); break;
          case '3': this.startGame('inspector'); e.preventDefault(); break;
          case '4': this.startGame('systems'); e.preventDefault(); break;
          case '5': this.startGame('firstaid'); e.preventDefault(); break;
        }
      }
    });
  }

  startGame(gameType) {
    this.gameStarted = true;
    this.currentScore = 0;
    
    const gameContainer = document.getElementById('game-container');
    const gameContent = this.getGameContent(gameType);
    
    gameContainer.innerHTML = `
      <div class="game-header">
        <div class="game-info">
          <h3>${this.getGameTitle(gameType)}</h3>
          <div class="game-stats">
            <span>Счет: <span id="current-score">${this.currentScore}</span></span>
            <span>Уровень: <span id="current-level">${this.currentLevel}</span></span>
          </div>
        </div>
        <button class="exit-game" onclick="firegames.exitGame()">Выйти</button>
      </div>
      <div class="game-content">
        ${gameContent}
      </div>
      <div class="game-controls">
        <button class="game-action-btn" onclick="firegames.nextLevel()">Следующий уровень</button>
        <button class="game-help-btn" onclick="firegames.showHelp('${gameType}')">Помощь</button>
      </div>
    `;

    this.initializeGameLogic(gameType);
  }

  getGameContent(gameType) {
    switch(gameType) {
      case 'pass':
        return this.createPassGame();
      case 'evacuation':
        return this.createEvacuationGame();
      case 'inspector':
        return this.createInspectorGame();
      case 'systems':
        return this.createSystemsGame();
      case 'firstaid':
        return this.createFirstAidGame();
      default:
        return '<p>Игра в разработке</p>';
    }
  }

  createPassGame() {
    return `
      <div class="pass-game">
        <div class="fire-scenario">
          <div class="fire-element" id="fire-source"></div>
          <div class="fire-extinguisher" id="extinguisher"></div>
        </div>
        <div class="pass-options">
          <button class="pass-btn" data-action="aim">П - Прицелиться</button>
          <button class="pass-btn" data-action="pull">А - Выдернуть чеку</button>
          <button class="pass-btn" data-action="squeeze">С - Сжать рукоятку</button>
          <button class="pass-btn" data-action="sweep">С - Сметающие движения</button>
        </div>
        <div class="pass-feedback" id="pass-feedback"></div>
      </div>
    `;
  }

  createEvacuationGame() {
    return `
      <div class="evacuation-game">
        <div class="building-plan">
          <canvas id="evacuation-canvas" width="400" height="300"></canvas>
        </div>
        <div class="evacuation-controls">
          <button class="evac-btn" onclick="firegames.drawEvacPath()">Нарисовать маршрут</button>
          <button class="evac-btn" onclick="firegames.clearPath()">Очистить</button>
          <button class="evac-btn" onclick="firegames.checkEvacuation()">Проверить</button>
        </div>
        <div class="evacuation-timer">
          Время: <span id="evac-timer">00:00</span>
        </div>
      </div>
    `;
  }

  createInspectorGame() {
    return `
      <div class="inspector-game">
        <div class="inspection-scene">
          <div class="violation-spot" data-violation="blocked-exit" style="position: absolute; top: 50px; left: 100px; width: 50px; height: 50px; background: #ef4444; cursor: pointer;"></div>
          <div class="violation-spot" data-violation="no-extinguisher" style="position: absolute; top: 150px; left: 200px; width: 50px; height: 50px; background: #f97316; cursor: pointer;"></div>
          <div class="violation-spot" data-violation="blocked-alarm" style="position: absolute; top: 100px; left: 300px; width: 50px; height: 50px; background: #eab308; cursor: pointer;"></div>
        </div>
        <div class="violations-found">
          <h4>Найденные нарушения:</h4>
          <ul id="violations-list"></ul>
        </div>
        <div class="inspection-progress">
          Прогресс: <span id="inspection-progress">0/3</span>
        </div>
      </div>
    `;
  }

  createSystemsGame() {
    return `
      <div class="systems-game">
        <div class="system-components">
          <div class="component" data-type="detector">Датчик дыма</div>
          <div class="component" data-type="alarm">Сигнализация</div>
          <div class="component" data-type="sprinkler">Спринклер</div>
          <div class="component" data-type="panel">Панель управления</div>
        </div>
        <div class="system-connections">
          <canvas id="systems-canvas" width="400" height="250"></canvas>
        </div>
        <div class="systems-instructions">
          Соедините компоненты системы пожарной безопасности в правильном порядке
        </div>
      </div>
    `;
  }

  createFirstAidGame() {
    return `
      <div class="firstaid-game">
        <div class="patient-scenario">
          <div class="patient-status">
            <h4>Пострадавший от ожогов</h4>
            <p>Степень ожога: 2-я степень, площадь 15%</p>
          </div>
        </div>
        <div class="firstaid-actions">
          <button class="aid-btn" data-action="cool">Охладить водой</button>
          <button class="aid-btn" data-action="cover">Накрыть чистой тканью</button>
          <button class="aid-btn" data-action="call">Вызвать скорую</button>
          <button class="aid-btn" data-action="position">Удобно уложить</button>
        </div>
        <div class="action-sequence">
          <h4>Последовательность действий:</h4>
          <ol id="action-list"></ol>
        </div>
      </div>
    `;
  }

  initializeGameLogic(gameType) {
    switch(gameType) {
      case 'pass':
        this.initPassGame();
        break;
      case 'evacuation':
        this.initEvacuationGame();
        break;
      case 'inspector':
        this.initInspectorGame();
        break;
      case 'systems':
        this.initSystemsGame();
        break;
      case 'firstaid':
        this.initFirstAidGame();
        break;
    }
  }

  initPassGame() {
    let passSequence = [];
    const correctSequence = ['pull', 'aim', 'squeeze', 'sweep'];
    
    document.querySelectorAll('.pass-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        passSequence.push(action);
        
        const feedback = document.getElementById('pass-feedback');
        
        if (passSequence.length === correctSequence.length) {
          if (JSON.stringify(passSequence) === JSON.stringify(correctSequence)) {
            feedback.innerHTML = '<span style="color: green;">Отлично! Правильная последовательность ПАСС!</span>';
            this.addScore(100);
          } else {
            feedback.innerHTML = '<span style="color: red;">Неправильная последовательность. Попробуйте снова.</span>';
            passSequence = [];
          }
        } else {
          feedback.innerHTML = `Шаг ${passSequence.length}: ${this.getActionName(action)}`;
        }
      });
    });
  }

  initEvacuationGame() {
    const canvas = document.getElementById('evacuation-canvas');
    const ctx = canvas.getContext('2d');
    
    // Рисуем план здания
    this.drawBuildingPlan(ctx);
    
    // Инициализируем таймер
    this.startEvacuationTimer();
  }

  drawBuildingPlan(ctx) {
    // Стены
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, 300, 200);
    
    // Комнаты
    ctx.strokeRect(100, 100, 100, 50);
    ctx.strokeRect(250, 100, 100, 50);
    
    // Выходы
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(45, 125, 10, 30);
    ctx.fillRect(345, 125, 10, 30);
    
    // Огонь
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(130, 180, 40, 40);
    
    // Подписи
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText('ВЫХОД', 15, 145);
    ctx.fillText('ВЫХОД', 360, 145);
    ctx.fillText('ОГОНЬ', 135, 205);
  }

  startEvacuationTimer() {
    let seconds = 0;
    const timer = setInterval(() => {
      seconds++;
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      document.getElementById('evac-timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
    
    this.evacuationTimer = timer;
  }

  initInspectorGame() {
    let foundViolations = [];
    
    document.querySelectorAll('.violation-spot').forEach(spot => {
      spot.addEventListener('click', (e) => {
        const violation = e.target.dataset.violation;
        if (!foundViolations.includes(violation)) {
          foundViolations.push(violation);
          e.target.style.background = '#22c55e';
          
          const list = document.getElementById('violations-list');
          const li = document.createElement('li');
          li.textContent = this.getViolationName(violation);
          list.appendChild(li);
          
          document.getElementById('inspection-progress').textContent = `${foundViolations.length}/3`;
          
          if (foundViolations.length === 3) {
            this.addScore(150);
            setTimeout(() => {
              alert('Все нарушения найдены! Отличная работа инспектора!');
            }, 500);
          }
        }
      });
    });
  }

  initSystemsGame() {
    const canvas = document.getElementById('systems-canvas');
    const ctx = canvas.getContext('2d');
    
    // Рисуем компоненты системы
    this.drawSystemComponents(ctx);
  }

  drawSystemComponents(ctx) {
    const components = [
      { x: 50, y: 50, label: 'Датчик', color: '#3b82f6' },
      { x: 200, y: 50, label: 'Панель', color: '#8b5cf6' },
      { x: 350, y: 50, label: 'Сигнал', color: '#f59e0b' },
      { x: 125, y: 150, label: 'Спринклер', color: '#10b981' }
    ];
    
    components.forEach(comp => {
      ctx.fillStyle = comp.color;
      ctx.fillRect(comp.x, comp.y, 60, 40);
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.fillText(comp.label, comp.x + 5, comp.y + 25);
    });
  }

  initFirstAidGame() {
    let actionSequence = [];
    const correctSequence = ['call', 'cool', 'cover', 'position'];
    
    document.querySelectorAll('.aid-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        actionSequence.push(action);
        
        const list = document.getElementById('action-list');
        const li = document.createElement('li');
        li.textContent = this.getAidActionName(action);
        list.appendChild(li);
        
        if (actionSequence.length === correctSequence.length) {
          if (JSON.stringify(actionSequence) === JSON.stringify(correctSequence)) {
            this.addScore(120);
            setTimeout(() => {
              alert('Правильная последовательность оказания первой помощи!');
            }, 500);
          } else {
            alert('Неправильная последовательность. Изучите протокол оказания помощи при ожогах.');
            actionSequence = [];
            list.innerHTML = '';
          }
        }
      });
    });
  }

  getGameTitle(gameType) {
    const titles = {
      'pass': 'Метод ПАСС',
      'evacuation': 'Планирование эвакуации',
      'inspector': 'Инспектор по пожарной безопасности',
      'systems': 'Системы пожарной безопасности',
      'firstaid': 'Первая помощь при пожаре'
    };
    return titles[gameType] || 'Игра';
  }

  getActionName(action) {
    const names = {
      'pull': 'Выдернуть чеку',
      'aim': 'Прицелиться в основание огня',
      'squeeze': 'Сжать рукоятку',
      'sweep': 'Сметающие движения'
    };
    return names[action] || action;
  }

  getViolationName(violation) {
    const names = {
      'blocked-exit': 'Заблокированный выход',
      'no-extinguisher': 'Отсутствует огнетушитель',
      'blocked-alarm': 'Заблокированная сигнализация'
    };
    return names[violation] || violation;
  }

  getAidActionName(action) {
    const names = {
      'call': 'Вызвать скорую помощь',
      'cool': 'Охладить ожог водой',
      'cover': 'Накрыть чистой тканью',
      'position': 'Удобно уложить пострадавшего'
    };
    return names[action] || action;
  }

  addScore(points) {
    this.currentScore += points;
    this.totalScore += points;
    
    document.getElementById('current-score').textContent = this.currentScore;
    this.saveProgress();
    this.checkAchievements();
  }

  nextLevel() {
    this.currentLevel++;
    document.getElementById('current-level').textContent = this.currentLevel;
    // Здесь можно добавить логику для увеличения сложности
  }

  exitGame() {
    if (this.evacuationTimer) {
      clearInterval(this.evacuationTimer);
    }
    
    document.getElementById('game-container').innerHTML = `
      <div class="game-menu">
        <h2>Обучающие игры по пожарной безопасности</h2>
        <div class="games-grid">
          <div class="game-card">
            <h3>Метод ПАСС</h3>
            <p>Изучите правильную технику использования огнетушителя</p>
            <button class="game-btn" data-game="pass">Играть</button>
          </div>
          <div class="game-card">
            <h3>Планирование эвакуации</h3>
            <p>Постройте безопасный маршрут эвакуации</p>
            <button class="game-btn" data-game="evacuation">Играть</button>
          </div>
          <div class="game-card">
            <h3>Инспектор</h3>
            <p>Найдите нарушения пожарной безопасности</p>
            <button class="game-btn" data-game="inspector">Играть</button>
          </div>
          <div class="game-card">
            <h3>Системы безопасности</h3>
            <p>Изучите компоненты систем пожарной безопасности</p>
            <button class="game-btn" data-game="systems">Играть</button>
          </div>
          <div class="game-card">
            <h3>Первая помощь</h3>
            <p>Освойте оказание первой помощи при пожаре</p>
            <button class="game-btn" data-game="firstaid">Играть</button>
          </div>
        </div>
        <div class="user-progress">
          <h3>Ваш прогресс</h3>
          <p>Общий счет: ${this.totalScore}</p>
          <p>Достижения: ${this.achievements.length}</p>
          <button class="reset-progress">Сбросить прогресс</button>
          <button class="share-score">Поделиться результатом</button>
        </div>
      </div>
    `;
    
    this.gameStarted = false;
  }

  showHelp(gameType) {
    const helpTexts = {
      'pass': 'Запомните последовательность ПАСС: Выдернуть чеку, Прицелиться, Сжать рукоятку, Сметающие движения',
      'evacuation': 'Постройте кратчайший безопасный маршрут от источника опасности к выходу',
      'inspector': 'Найдите все нарушения пожарной безопасности, кликая по проблемным местам',
      'systems': 'Соедините компоненты пожарной системы в правильной последовательности',
      'firstaid': 'Правильная последовательность: Вызов помощи, Охлаждение, Защита, Положение'
    };
    
    alert(helpTexts[gameType] || 'Справка недоступна');
  }

  saveProgress() {
    localStorage.setItem('fireGameTotalScore', this.totalScore.toString());
    localStorage.setItem('fireGameAchievements', JSON.stringify(this.achievements));
  }

  loadUserProgress() {
    this.totalScore = parseInt(localStorage.getItem('fireGameTotalScore') || '0');
    this.achievements = JSON.parse(localStorage.getItem('fireGameAchievements') || '[]');
  }

  updateUI() {
    // Обновляем отображение прогресса пользователя
    const progressElement = document.querySelector('.user-progress');
    if (progressElement) {
      progressElement.querySelector('p').textContent = `Общий счет: ${this.totalScore}`;
    }
  }

  checkAchievements() {
    const newAchievements = [];
    
    if (this.totalScore >= 100 && !this.achievements.includes('first_hundred')) {
      newAchievements.push('first_hundred');
    }
    
    if (this.totalScore >= 500 && !this.achievements.includes('fire_expert')) {
      newAchievements.push('fire_expert');
    }
    
    if (this.totalScore >= 1000 && !this.achievements.includes('master_firefighter')) {
      newAchievements.push('master_firefighter');
    }
    
    newAchievements.forEach(achievement => {
      this.achievements.push(achievement);
      this.showAchievement(achievement);
    });
    
    if (newAchievements.length > 0) {
      this.saveProgress();
    }
  }

  showAchievement(achievement) {
    const achievementNames = {
      'first_hundred': 'Первые 100 очков!',
      'fire_expert': 'Эксперт пожарной безопасности',
      'master_firefighter': 'Мастер-пожарный'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #333; padding: 1rem 2rem; border-radius: 8px;
      box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
      z-index: 1000; font-weight: bold;
      animation: slideDown 0.5s ease-out;
    `;
    notification.innerHTML = `🏆 ${achievementNames[achievement]}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  resetProgress() {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
      localStorage.removeItem('fireGameTotalScore');
      localStorage.removeItem('fireGameAchievements');
      this.totalScore = 0;
      this.achievements = [];
      this.updateUI();
      alert('Прогресс сброшен!');
    }
  }

  shareScore() {
    if (navigator.share) {
      navigator.share({
        title: 'Fire Safety KZ - Мой результат',
        text: `Я набрал ${this.totalScore} очков в обучающих играх по пожарной безопасности!`,
        url: window.location.href
      });
    } else {
      // Fallback для браузеров без Web Share API
      const text = `Я набрал ${this.totalScore} очков в обучающих играх по пожарной безопасности! ${window.location.href}`;
      navigator.clipboard.writeText(text).then(() => {
        alert('Результат скопирован в буфер обмена!');
      });
    }
  }
}

// Инициализация игр при загрузке страницы
let firegames;
document.addEventListener('DOMContentLoaded', () => {
  firegames = new FireSafetyGames();
});

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translate(-50%, -100%); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
`;
document.head.appendChild(style);
