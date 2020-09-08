//*****************************************************/
//************* VARIABLES *****************************/
//*****************************************************/

let isPlaying = false;
let startSpeed = 4;
let cnavasWidth;
let canvasHeight;
let myGame;

//*****************************************************/
//************* CLASSES *******************************/
//*****************************************************/

class Player {
    constructor() {
        this.width = 150;
        this.height = 10;
        this.x = (cnavasWidth - this.width) / 2;
        this.y = 550;
        this.playerSpeed = 8;
        this.isLeftKey = false;
        this.isRightKey = false;
    }

    draw() {
        this.checkKey();
        gameCtx.fillStyle = "rgb(172, 12, 12)";
        gameCtx.fillRect(this.x, this.y, this.width, this.height);
        logoCtx.strokeRect(this.x, this.y, this.width, this.height);
    }

    checkKey() {
        if (this.isLeftKey && this.x > 0)
            this.x -= this.playerSpeed;

        else if (this.isRightKey && this.x < cnavasWidth - this.width)
            this.x += this.playerSpeed;
    }
}

class Ball {
    constructor() {
        this.radius = 10;
        this.x = cnavasWidth / 2;
        this.y = 545 - this.radius;     //Vom Player abhängig????
        this.directionX = Math.random() < 0.5 ? -1 : 1;
        this.directionY = -1;
        this.angleNumeric = startSpeed / (Math.round((Math.random() * (3 - 1.5) + 1.5) * 2) / 2);
        this.ballSpeed = startSpeed;
        this.maxSpeed = 10;
        this.collissionOff = false;
        this.collissionOffCounter = 0;

    }

    draw(i) {
        gameCtx.beginPath();
        gameCtx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        gameCtx.fillStyle = "rgb(112, 128, 144)";
        gameCtx.fill();
        gameCtx.stroke();
        this.move(i);
    }

    move(i) {
        this.borderCollision(i);
        this.playerCollision(myGame._player);
        this.logoCollision(myGame._logo);
        this.powerupCollision(myGame._powerup);


        const xSpeed = this.angleNumeric;
        const ySpeed = Math.sqrt(this.ballSpeed ** 2 - xSpeed ** 2);
        this.x += xSpeed * this.directionX;
        this.y += ySpeed * this.directionY;
    }

    borderCollision(i) {

        if (this.x > cnavasWidth - this.radius) {
            this.x -= 1;
            this.directionX *= -1;
        }
        else if (this.x < 0 + this.radius) {
            this.x += 1;
            this.directionX *= -1;
        }
        else if (this.y > canvasHeight - this.radius) {
            if (myGame._balls.length > 1) {
                myGame._balls.splice(i, 1);
            }
            else {
                if (myGame.lives > 0) {
                    myGame.lives -= 1;
                    myGame.nextRound();
                }
                else if (myGame.lives === 0) {
                    myGame.gameOver();
                }
            }
        }
        else if (this.y < 0 + this.radius) {
            this.y += 1;
            this.directionY *= -1;

            if (this.collissionOffCounter >= 1)
                this.collissionOffCounter--;
            if (this.collissionOffCounter === 0)
                this.collissionOff = false;
        }
    }

    playerCollision(player) {
        let box = { x: player.x, y: player.y, w: player.width, h: player.height }
        let segment = player.width / 5;

        if (this.boxCollision(box) === "y") {

            if (this.x >= player.x && this.x <= player.x + segment) {  //stark links reflektieren
                this.directionX = -1
                this.angleNumeric = this.ballSpeed / 1.5;
            }
            else if (this.x > player.x + segment && this.x <= player.x + (2 * segment)) {  //links reflektieren
                this.directionX = -1
                this.angleNumeric = this.ballSpeed / 3;
            }
            else if (this.x > player.x + (2 * segment) && this.x <= player.x + (3 * segment)) {   //hoch reflektion
                this.angleNumeric = 0;
            }
            else if (this.x > player.x + (3 * segment) && this.x <= player.x + (4 * segment)) {  //rechts reflektion
                this.directionX = 1;
                this.angleNumeric = this.ballSpeed / 3;
            }
            else if (this.x > player.x + (4 * segment) && this.x <= player.x + player.width) {     //stark rechts reflektion
                this.directionX = 1;
                this.angleNumeric = this.ballSpeed / 1.5;
            }
            myGame._powerup.generatePowerup(this);
            this.y = player.y - this.radius - 1;
            this.directionY *= -1;

            playerSound.pause();
            playerSound.currentTime = 0;
            playerSound.play();
        }
    }

    logoCollision(logo) {
        if (this.x > 20 && this.x < 1040 && this.y > 20 && this.y < 280) {    //Wenn Ball INNERHALB Bereich der Blöcke
            let collisionColumn = Math.floor(this.x / logo.width);
            let collisionRow = Math.floor((this.y) / logo.height);
            for (let r = -1; r < 2; r++) {
                for (let c = -1; c < 2; c++) {
                    let b = logo.bricks[collisionRow + r][collisionColumn + c];
                    let box = { x: b.x, y: b.y, w: b.w, h: b.h }
                    if (b.status === 1) {

                        if (this.boxCollision(box) === "x") {
                            if (this.collissionOff != true) {
                                if (this.angleNumeric != 0)
                                    this.directionX *= -1;
                                else if (this.angleNumeric === 0)
                                    this.directionY *= -1;
                            }
                            b.status = 0;
                            myGame.score++;

                            pointSound.currentTime = 0;
                            pointSound.play();

                            if (this.ballSpeed < this.maxSpeed)
                                this.ballSpeed += 0.05;
                        }
                        else if (this.boxCollision(box) === "y") {
                            if (this.collissionOff != true) {
                                this.directionY *= -1;
                            }
                            b.status = 0;
                            myGame.score++;

                            pointSound.currentTime = 0;
                            pointSound.play();

                            if (this.ballSpeed < this.maxSpeed)
                                this.ballSpeed += 0.05;
                        }
                    }
                }
            }
        }
    }

    powerupCollision(powerup) {
        if (powerup.powerups.length > 0) {
            for (let i = 0; i < powerup.powerups.length; i++) {
                let p = powerup.powerups[i];
                let box = { x: p.x, y: p.y, w: p.w, h: p.h };
                if (this.boxCollision(box) === "x" || this.boxCollision(box) === "y") {
                    myGame._powerup.effect(i, this);
                    powerup.powerups.splice(i, 1);
                }
            }
        }
    }

    boxCollision(box) {
        let half = { x: box.w / 2, y: box.h / 2 };

        let center = {
            x: this.x - (box.x + half.x),
            y: this.y - (box.y + half.y)
        };

        let side = {
            x: Math.abs(center.x) - half.x,
            y: Math.abs(center.y) - half.y
        };

        if (side.x < 0 || side.y < 0) {
            if (Math.abs(side.y) < this.radius && side.x < 0) { //Kollision auf der y-Achse
                return "y";
            }
            else if (Math.abs(side.x) < this.radius && side.y < 0) { //Kollision auf der x-Achse
                return "x";
            }
        }
    }
}

class Logo {
    constructor() {
        this.gameLogo =
`                                                      
                                                      
   bbbbbbbbb bbb   bbbbbb   bbb       bbb        bb   
   bbbbbbbbb bbb   bbbbbbb  bbb      bbbb       bbb   
   bbbbbbbbb bbb   bbb  bbb bbb     bbbbb      bbb    
   bbb       bbb   bbb   bbbbbb    bbbbbb     bbb     
   bbbbbbb   bbbbbbbbb    bbbbb   bbb bbb    bbb      
   bbbbbbb   bbbbbbbbb     bbbb  bbb  bbb   bbb       
   bbbbbbb   bbbbbbbbb    bbbbb bbb   bbb  bbb        
   bbb       bbb   bbb   bbbbbbbbb    bbb bbb         
   bbb       bbb   bbb  bbb bbbbb     bbbbbb          
   bbb       bbb   bbbbbbb  bbbb      bbbbb           
   bbb       bbb   bbbbbb   bbb       bbbb            
                                                      
                                                       `;

        this.x = 0;
        this.y = 0;
        this.width = 20;
        this.height = 20;
        this.brickCount = 0
        this.bricks = [];
        this.g = "#BDBDBD";
        this.r = "#ac0c0c";
        this.l = "#848484";
        this.b = "#22386A";

        this.map = this.gameLogo.split("\n").map(e => e.split(""));

        for (let r = 0; r < this.map.length; r++) {
            this.bricks[r] = [];
            for (let c = 0; c < this.map[r].length; c++) {
                if (this.map[r][c] === `g`) {
                    this.bricks[r][c] = { x: this.x, y: this.y, w: this.width, h: this.height, type: `g`, status: 1 }
                    this.x += this.width;
                    this.brickCount++;
                }
                else if (this.map[r][c] === `l`) {
                    this.bricks[r][c] = { x: this.x, y: this.y, w: this.width, h: this.height, type: `l`, status: 1 }
                    this.x += this.width;
                    this.brickCount++;
                }
                else if (this.map[r][c] === `r`) {
                    this.bricks[r][c] = { x: this.x, y: this.y, w: this.width, h: this.height, type: `r`, status: 1 }
                    this.x += this.width;
                    this.brickCount++;
                }
                else if (this.map[r][c] === `b`) {
                    this.bricks[r][c] = { x: this.x, y: this.y, w: this.width, h: this.height, type: `b`, status: 1 }
                    this.x += this.width;
                    this.brickCount++;
                }
                else if (this.map[r][c] === ` `) {
                    this.bricks[r][c] = { x: this.x, y: this.y, w: this.width, h: this.height, type: ` `, status: 0 }
                    this.x += this.width;
                }
            }
            this.x = 0;
            this.y += this.height;
        }
        this.rowCount = this.bricks.length;
        this.columnCount = this.bricks[0].length;
    }

    draw() {
        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.columnCount; c++) {
                if (this.bricks[r][c].status === 1) {
                    this.x = this.bricks[r][c].x
                    this.y = this.bricks[r][c].y

                    if (this.bricks[r][c].type === `g`) {
                        logoCtx.fillStyle = this.g;
                        logoCtx.fillRect(this.x, this.y, this.width, this.height);
                    }
                    else if (this.bricks[r][c].type === `l`) {
                        logoCtx.fillStyle = this.l;
                        logoCtx.fillRect(this.x, this.y, this.width, this.height);
                    }
                    else if (this.bricks[r][c].type === `r`) {
                        logoCtx.fillStyle = this.r;
                        logoCtx.fillRect(this.x, this.y, this.width, this.height);
                    }
                    else if (this.bricks[r][c].type === `b`) {
                        logoCtx.fillStyle = this.b;
                        logoCtx.fillRect(this.x, this.y, this.width, this.height);
                    }
                    logoCtx.strokeRect(this.x, this.y, this.width, this.height);
                }
            }
        }
    }
}

class Powerup {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.powerups = [];
        this.maxPowerups = 3;
        this.timeToLive = 2400;  //dauer bis sich das Powerup von alleine löscht. Je Frame wird um 1 verringert
        this.chance = 35; //Prozentwert für das Erstellen eines Powerups
        this.pic = new Image();
    }

    generatePowerup(that) {     //Wird beim aufprall auf den Player erstellt
        if (this.powerups.length < this.maxPowerups && myGame.score >= 30) {    //Erst wenn 30 Punkte erreicht wurden gibt es Powerups
            let rndNumber = Math.floor(Math.random() * 100 + 1)
            if (rndNumber >= 100 - this.chance) {     // 10% Chance auf ein Powerup beim Aufprall auf den Player
                let posX = Math.floor(Math.random() * (1000 - 20 + 1) + 20);
                let posY = Math.floor(Math.random() * (450 - 300 + 1) + 300);
                let wichPowerup = Math.floor(Math.random() * 9);
                let effect = "";
                let source = "";

                if (wichPowerup === 0) {
                    if (that.ballSpeed < that.maxSpeed) {
                        effect = "speedupBall";
                        source = "./Powerups/speedupBall.png";
                    }
                }
                else if (wichPowerup === 1) {
                    if (that.ballSpeed > 7) {
                        effect = "slowdownBall";
                        source = "./Powerups/slowdownBall.png";
                    }
                }
                else if (wichPowerup === 2) {
                    if (myGame._player.width < 300) {
                        effect = "increasePlayer";
                        source = "./Powerups/increasePlayer.png";
                    }
                }
                else if (wichPowerup === 3) {
                    if (myGame._player.width > 50) {
                        effect = "decreasePlayer";
                        source = "./Powerups/decreasePlayer.png";
                    }
                }
                else if (wichPowerup === 4) {
                    if (that.radius < 35) {
                        effect = "increaseBall";
                        source = "./Powerups/increaseBall.png";
                    }
                }
                else if (wichPowerup === 5) {
                    if (that.radius > 5) {
                        effect = "decreaseBall";
                        source = "./Powerups/decreaseBall.png";
                    }
                }
                else if (wichPowerup === 6) {
                    effect = "addBall";
                    source = "./Powerups/addBall.png";
                }
                else if (wichPowerup === 7) {
                    if (myGame.lives === 0) {
                        effect = "extraLive"
                        source = "./Powerups/extraLive.png"
                    }
                }
                else if (wichPowerup === 8) {
                    effect = "collissionOff";
                    source = "./Powerups/collissionOff.png";
                }

                if (effect != "" && source != "")
                    this.powerups.push({ x: posX, y: posY, w: this.width, h: this.height, effect: effect, src: source, TTL: this.timeToLive });
            }
        }
    }

    draw() {
        for (var i = 0; i < this.powerups.length; i++) {
            let p = this.powerups[i];
            this.pic.src = p.src;

            if (p.TTL >= 0) {
                if (!this.pic.complete) {     //Überprüfen ob das Image schon geladen wurde. Wenn nein, dann warten und erneut
                    setTimeout(function () {
                        this.draw();
                    }, 25);
                    return;
                }
                else {
                    gameCtx.drawImage(this.pic, p.x, p.y, p.w, p.h);
                    p.TTL--;
                }
            }
            else {
                this.powerups.splice(i, 1);
            }

        }
    }

    effect(i, that) {      //Der Effekt des Powerups wird auf das jeweilige Objekt ausgeführt
        let effect = this.powerups[i].effect;

        switch (effect) {
            case "speedupBall":
                if (that.ballSpeed < that.maxSpeed)
                    that.ballSpeed += 1;
                break;
            case "slowdownBall":
                if (that.ballSpeed > startSpeed)
                    that.ballSpeed -= 1;
                break;
            case "increasePlayer":
                if (myGame._player.width < 300)
                    myGame._player.width += 50;
                break;
            case "decreasePlayer":
                if (myGame._player.width > 50)
                    myGame._player.width -= 50;
                break;
            case "increaseBall":
                if (that.radius < 35)
                    that.radius += 5;
                break;
            case "decreaseBall":
                if (that.radius > 5)
                    that.radius -= 5;
                break;
            case "addBall":
                myGame._balls.push(new Ball());
                break;
            case "extraLive":
                myGame.lives++;
                break;
            case "collissionOff":
                that.collissionOff = true;
                that.collissionOffCounter = 3;
                break;
        }
    }
}

class Game {
    constructor() {
        this._balls = [];
        this._player = new Player();
        this._logo = new Logo();
        this._powerup = new Powerup();
        this._balls.push(new Ball());

        this.brickCount = this._logo.brickCount;
        this.lives = 3;
        this.score = 0;

    }

    draw() {
        gameCtx.clearRect(0, 0, cnavasWidth, canvasHeight);
        logoCtx.clearRect(0, 0, cnavasWidth, canvasHeight);

        this._logo.draw();
        this._player.draw();
        this._powerup.draw();
        for (var i = 0; i < this._balls.length; i++) {
            this._balls[i].draw(i);
        }
        this.drawScore();
        this.drawLives();
    }

    drawScore() {
        gameCtx.font = "20px Arial";
        gameCtx.fillStyle = "Black";
        gameCtx.fillText("Score: " + this.score, 8, 590);

        if (this.score === this.brickCount) {
            isPlaying = false;
            debugger;
            
            jackpotSound.pause();
            jackpotSound.currentTime();
            jackpotSound.play();

            alert("Gewonnen!")
            location.reload();
        }
    }

    drawLives() {
        gameCtx.font = "20px Arial";
        gameCtx.fillStyle = "Black";
        gameCtx.fillText("Lives: " + this.lives, 980, 590);
    }

    nextRound() {
        //Reset Player
        this._player.width = 150;
        this._player.height = 10;
        this._player.x = (cnavasWidth - this._player.width) / 2;
        this._player.y = 550;
        this._player.isLeftKey = false;
        this._player.isRightKey = false;

        //Reset Ball
        for (const ball of this._balls) {
            ball.radius = 10;
            ball.x = cnavasWidth / 2;
            ball.y = this._player.y - ball.radius - 10;
            ball.directionX = Math.random() < 0.5 ? -1 : 1;
            ball.directionY = -1;
            ball.angleNumeric = startSpeed / (Math.round((Math.random() * (3 - 1.5) + 1.5) * 2) / 2);
            ball.ballSpeed = startSpeed;
            ball.collissionOff = false;
            ball.collissionOffCounter = 0;
        }
    }

    gameOver() {
        debugger;
        gameOverSound.play();


        if (confirm("Game Over") === true) {
            isPlaying = false;
            location.reload();
        }
        else {
            isPlaying = false;
        }
    }
}

//*****************************************************/
//************* FUNCTIONS *****************************/
//*****************************************************/

function init() {      //Initialiesierungsmethode des Spiels. Wird als erstes aufgerufen
    gameCanvas = document.getElementById("gameCanvas");
    gameCtx = gameCanvas.getContext("2d");
    logoCanvas = document.getElementById("logoCanvas");
    logoCtx = logoCanvas.getContext("2d");
    cnavasWidth = gameCanvas.clientWidth;
    canvasHeight = gameCanvas.clientHeight;

    playerSound = document.getElementById("playerSound");
    pointSound = document.getElementById("pointSound");
    jackpotSound = document.getElementById("jackpotSound");
    gameOverSound = document.getElementById("gameOverSound");

    myGame = new Game();
    myGame._player.draw();
    myGame._logo.draw();
    for (const ball of myGame._balls) {
        ball.draw();
    }
    myGame.drawLives();
    myGame.drawScore();

    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);

    requestAFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60) }
    })();

}

function gameLoop() {
    myGame.draw();

    if (isPlaying)
        requestAFrame(gameLoop);
}

function startStopGame() {
    if (isPlaying === false) {
        isPlaying = true;
        gameLoop();
    }
    else if (isPlaying === true) {
        isPlaying = false;
    }
}

function keyDown(e) {
    keyID = e.keyCode || e.wich;
    switch (keyID) {
        case 37:    //Key-Left
            myGame._player.isLeftKey = true;
            e.preventDefault();
            break;
        case 39:    //Key-Right
            myGame._player.isRightKey = true;
            e.preventDefault();
            break;
        case 65:    //Key-A
            myGame._player.isLeftKey = true;
            e.preventDefault();
            break;
        case 68:    //Key-D
            myGame._player.isRightKey = true;
            e.preventDefault();
            break;
        case 13:    //Key-Enter
            startStopGame()
            break;

    }
}

function keyUp(e) {
    keyID = e.keyCode || e.wich;
    switch (keyID) {
        case 37:    //Key-Left
            myGame._player.isLeftKey = false;
            e.preventDefault();
            break;
        case 39:    //Key-Right
            myGame._player.isRightKey = false;
            e.preventDefault();
            break;
        case 65:    //Key-A
            myGame._player.isLeftKey = false;
            e.preventDefault();
            break;
        case 68:    //Key-D
            myGame._player.isRightKey = false;
            e.preventDefault();
    }
}

init();