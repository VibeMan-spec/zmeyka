/**
 * Именное пространство
 */
var Game      = Game      || {};
var Keyboard  = Keyboard  || {}; 
var Component = Component || {};

/**
 * Раскладка клавиатуры
 */
Keyboard.Keymap = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
};

/**
 * События на клавиатуре
 */
Keyboard.ControllerEvents = function() {
  
  // Сеты
  var self      = this;
  this.pressKey = null;
  this.keymap   = Keyboard.Keymap;
  
  // События на нажатие клавиш
  document.onkeydown = function(event) {
    self.pressKey = event.which;
  };
  
  // получиить ключ
  this.getKey = function() {
    return this.keymap[this.pressKey];
  };
};

/**
 *Этап игрового компонента
 */
Component.Stage = function(canvas, conf) {  
  
  // сеты
  this.keyEvent  = new Keyboard.ControllerEvents();
  this.width     = canvas.width;
  this.height    = canvas.height;
  this.length    = [];
  this.food      = {};
  this.score     = 0;
  this.direction = 'right';
  this.conf      = {
    cw   : 10,
    size : 5,
    fps  : 1000
  };
  
  // конфликт слияния
  if (typeof conf == 'object') {
    for (var key in conf) {
      if (conf.hasOwnProperty(key)) {
        this.conf[key] = conf[key];
      }
    }
  }
  
};

/**
 * Игровая состовляющая змейки
 */
Component.Snake = function(canvas, conf) {
  
  // Игровая стадия
  this.stage = new Component.Stage(canvas, conf);
  
  // запускает змею
  this.initSnake = function() {
    
    // изменение размера змеиного кольца
    for (var i = 0; i < this.stage.conf.size; i++) {
      
      // Добавьте змеиные клетки
      this.stage.length.push({x: i, y:0});
		}
	};
  
  // вызвать змею
  this.initSnake();
  
  // добавить еду
  this.initFood = function() {
		
    // добавить еду на стадии
    this.stage.food = {
			x: Math.round(Math.random() * (this.stage.width - this.stage.conf.cw) / this.stage.conf.cw), 
			y: Math.round(Math.random() * (this.stage.height - this.stage.conf.cw) / this.stage.conf.cw), 
		};
	};
  
  //Инициализировать питание
  this.initFood();
  
  // перезапуск игры
  this.restart = function() {
    this.stage.length            = [];
    this.stage.food              = {};
    this.stage.score             = 0;
    this.stage.direction         = 'right';
    this.stage.keyEvent.pressKey = null;
    this.initSnake();
    this.initFood();
  };
};

/**
 * Розыгрыш игры
 */
Game.Draw = function(context, snake) {
  
  // Этап жеребьевки
  this.drawStage = function() {
    
    // Проверьте Нажатие клавиши и Установите Направление движения
    var keyPress = snake.stage.keyEvent.getKey(); 
    if (typeof(keyPress) != 'undefined') {
      snake.stage.direction = keyPress;
    }
    
    // Нарисуйте белую сцену
		context.fillStyle = "white";
		context.fillRect(0, 0, snake.stage.width, snake.stage.height);
		
    // Позиция змеи
    var nx = snake.stage.length[0].x;
		var ny = snake.stage.length[0].y;
		
    // Добавление позиции в зависимости от направления сцены
    switch (snake.stage.direction) {
      case 'right':
        nx++;
        break;
      case 'left':
        nx--;
        break;
      case 'up':
        ny--;
        break;
      case 'down':
        ny++;
        break;
    }
    
    // Проверить столкновение
    if (this.collision(nx, ny) == true) {
      snake.restart();
      return;
    }
    
    // логика еды змеи
    if (nx == snake.stage.food.x && ny == snake.stage.food.y) {
      var tail = {x: nx, y: ny};
      snake.stage.score++;
      snake.initFood();
    } else {
      var tail = snake.stage.length.pop();
      tail.x   = nx;
      tail.y   = ny;	
    }
    snake.stage.length.unshift(tail);
    
    // нарисовать змею
    for (var i = 0; i < snake.stage.length.length; i++) {
      var cell = snake.stage.length[i];
      this.drawCell(cell.x, cell.y);
    }
    
    // нарисовать еду
    this.drawCell(snake.stage.food.x, snake.stage.food.y);
    
    // показать счёт
    context.fillText('Счёт: ' + snake.stage.score, 5, (snake.stage.height - 5));
  };
  
  // нарисовать ячейку
  this.drawCell = function(x, y) {
    context.fillStyle = 'rgb(170, 170, 170)';
    context.beginPath();
    context.arc((x * snake.stage.conf.cw + 6), (y * snake.stage.conf.cw + 6), 4, 0, 2*Math.PI, false);    
    context.fill();
  };
  
  // Проверьте столкновение со стенами
  this.collision = function(nx, ny) {  
    if (nx == -1 || nx == (snake.stage.width / snake.stage.conf.cw) || ny == -1 || ny == (snake.stage.height / snake.stage.conf.cw)) {
      return true;
    }
    return false;    
	}
};


/**
 * Игра змейка
 */
Game.Snake = function(elementId, conf) {
  
  // сеты
  var canvas   = document.getElementById(elementId);
  var context  = canvas.getContext("2d");
  var snake    = new Component.Snake(canvas, conf);
  var gameDraw = new Game.Draw(context, snake);
  
  // Игровой интервал
  setInterval(function() {gameDraw.drawStage();}, snake.stage.conf.fps);
};


/**
 *Нагрузка на окно
 */
window.onload = function() {
  var snake = new Game.Snake('stage', {fps: 100, size: 4});
};