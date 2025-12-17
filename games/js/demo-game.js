// Демо игры Fire Safety KZ

class DemoGame {
  constructor() {
    this.currentGame = this.getGameType();
    this.score = 0;
    this.gameStep = 0;
    this.isPlaying = false;
    this.init();
  }

  getGameType() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('game') || 'pass-method';
  }

  init() {
    this.setupGame();
    this.bindEvents();
  }

  setupGame() {
    const gameTitle = document.getElementById('gameTitle');
    const gameContent = document.getElementById('gameContent');
    
    const games = {
      'pass-method': {
        title: 'PASS Метод - Демо',
        content: this.createPassMethodDemo()
      },
      'evacuation-plan': {
        title: 'План Эвакуации - Демо',
        content: this.createEvacuationDemo()
      },
      'inspector-violations': {
        title: 'Инспектор - Демо',
        content: this.createInspectorDemo()
      },
      'fire-systems': {
        title: 'Системы Пожаротушения - Демо',
        content: this.createSystemsDemo()
      },
      'first-aid': {
        title: 'Первая Помощь - Демо',
        content: this.createFirstAidDemo()
      }
    };

    const game = games[this.currentGame];
    if (game) {
      gameTitle.textContent = game.title;
      gameContent.innerHTML = game.content;
    }
  }

  bindEvents() {
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
  }

  startGame() {
    this.isPlaying = true;
    this.gameStep = 1;
    this.updateUI();
    
    // Запускаем логику конкретной игры
    switch(this.currentGame) {
      case 'pass-method':
        this.startPassMethod();
        break;
      case 'evacuation-plan':
        this.startEvacuationPlan();
        break;
      default:
        this.startGenericGame();
    }
  }

  resetGame() {
    this.score = 0;
    this.gameStep = 0;
    this.isPlaying = false;
    this.updateUI();
    this.setupGame();
  }

  updateUI() {
    document.getElementById('scoreValue').textContent = this.score;
    document.getElementById('startBtn').disabled = this.isPlaying;
    document.getElementById('resetBtn').disabled = !this.isPlaying && this.score === 0;
  }

  addScore(points) {
    this.score += points;
    this.updateUI();
    
    // Отправляем результат в родительское окно
    if (this.score >= 80) {
      setTimeout(() => {
        this.completeGame();
      }, 1000);
    }
  }

  completeGame() {
    this.isPlaying = false;
    
    // Отправляем результат в главное приложение
    if (window.parent && window.parent.postMessage) {
      window.parent.postMessage({
        type: 'GAME_SCORE_UPDATE',
        gameId: this.currentGame,
        score: this.score
      }, '*');
    }
    
    alert(`Игра завершена! Ваш результат: ${this.score}/100`);
  }

  // Демо PASS метода
  createPassMethodDemo() {
    return `
      <div class="pass-method-demo">
        <div class="extinguisher-container">
          <div class="extinguisher" id="extinguisher"></div>
          <div>Нажмите на огнетушитель</div>
        </div>
        <div class="fire-simulation">
          <div class="fire" id="fire"></div>
          <div class="step-indicator" id="stepIndicator">
            Шаг 1: Pull (Выдерните чеку)
          </div>
        </div>
      </div>
    `;
  }

  startPassMethod() {
    const extinguisher = document.getElementById('extinguisher');
    const fire = document.getElementById('fire');
    const stepIndicator = document.getElementById('stepIndicator');
    
    const steps = [
      'Pull (Выдерните чеку)',
      'Aim (Направьте на основание огня)', 
      'Squeeze (Нажмите рычаг)',
      'Sweep (Водите из стороны в сторону)'
    ];
    
    let currentStep = 0;
    
    extinguisher.addEventListener('click', () => {
      if (!this.isPlaying) return;
      
      currentStep++;
      this.addScore(20);
      
      if (currentStep < steps.length) {
        stepIndicator.textContent = `Шаг ${currentStep + 1}: ${steps[currentStep]}`;
        stepIndicator.classList.add('step-active');
        
        setTimeout(() => {
          stepIndicator.classList.remove('step-active');
        }, 1000);
      } else {
        stepIndicator.textContent = 'Огонь потушен! 🎉';
        fire.style.display = 'none';
        this.addScore(20);
      }
    });
  }

  // Демо плана эвакуации
  createEvacuationDemo() {
    return `
      <div style="text-align: center;">
        <h3>План Эвакуации - Демо Версия</h3>
        <div style="margin: 2rem 0;">
          <div style="width: 300px; height: 200px; border: 2px solid #ccc; margin: 0 auto; position: relative; background: #f9f9f9;">
            <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 40px; background: #dc2626; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px;">Огонь</div>
            <div style="position: absolute; bottom: 20px; right: 20px; width: 60px; height: 40px; background: #16a34a; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px;">Выход</div>
          </div>
          <p style="margin-top: 1rem;">Нажмите "Начать", чтобы построить маршрут эвакуации</p>
        </div>
      </div>
    `;
  }

  // Демо инспектора
  createInspectorDemo() {
    return `
      <div style="text-align: center;">
        <h3>Найдите нарушения пожарной безопасности</h3>
        <div style="margin: 2rem 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; max-width: 400px; margin: 0 auto;">
            <div class="violation-item" data-violation="blocked-exit" style="padding: 1rem; border: 2px solid #ccc; cursor: pointer; border-radius: 8px;">
              <div style="font-size: 2rem;">🚪📦</div>
              <div>Заблокированный выход</div>
            </div>
            <div class="violation-item" data-violation="no-extinguisher" style="padding: 1rem; border: 2px solid #ccc; cursor: pointer; border-radius: 8px;">
              <div style="font-size: 2rem;">❌🧯</div>
              <div>Нет огнетушителя</div>
            </div>
          </div>
          <p style="margin-top: 1rem;">Нажмите на нарушения, чтобы их отметить</p>
        </div>
      </div>
    `;
  }

  // Демо систем пожаротушения
  createSystemsDemo() {
    return `
      <div style="text-align: center;">
        <h3>Системы Пожаротушения</h3>
        <div style="margin: 2rem 0;">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; max-width: 400px; margin: 0 auto;">
            <div style="padding: 1rem; background: #f1f5f9; border-radius: 8px;">
              <div style="font-size: 2rem;">🚰</div>
              <div>Спринклерная система</div>
            </div>
            <div style="padding: 1rem; background: #f1f5f9; border-radius: 8px;">
              <div style="font-size: 2rem;">💨</div>
              <div>Газовая система</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Демо первой помощи
  createFirstAidDemo() {
    return `
      <div style="text-align: center;">
        <h3>Первая Помощь при Пожаре</h3>
        <div style="margin: 2rem 0;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🚑</div>
          <div style="max-width: 300px; margin: 0 auto; text-align: left;">
            <p><strong>При ожогах:</strong></p>
            <ul>
              <li>Охладить водой</li>
              <li>Наложить стерильную повязку</li>
              <li>Вызвать скорую</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  startGenericGame() {
    // Общая логика для простых демо игр
    const violations = document.querySelectorAll('.violation-item');
    violations.forEach(item => {
      item.addEventListener('click', () => {
        if (!this.isPlaying) return;
        
        item.style.borderColor = '#16a34a';
        item.style.backgroundColor = '#dcfce7';
        this.addScore(40);
      });
    });
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  new DemoGame();
});