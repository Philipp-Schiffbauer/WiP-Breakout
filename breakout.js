//*****************************************************/
//************* Player ********************************/
//*****************************************************/

function player()
{
    this.x = 150;
    this.y = 200;
    this.width = 50;
    this.height = 50;
    this.speed = 1;
    this.is_downkey = false;
    this.is_upkey = false;
    this.is_leftkey = false;
    this.is_rightkey = false;
}

player.prototype.draw = function ()
{
    this.checkKey();
    main_Ctx.fillStyle = "red"
    main_Ctx.fillRect(this.x,this.y,this.width,this.height);
}

player.prototype.draw = function ()
{
    this.checkKey();
    main_Ctx.fillStyle = "red"
    main_Ctx.fillRect(this.x,this.y,this.width,this.height);
}

player.prototype.checkKey = function()
{
    if(this.is_downkey && this.y <= 400 - this.height) {
        this.y += 5;
    }
    else if(this.is_upkey && this.y >= 0) {
        this.y -= 5;
    }
    else if(this.is_rightkey && this.x <= 600 - this.width) {
        this.x += 5;
    }
    else if(this.is_leftkey && this.x >= 0) {
        this.x -= 5;
    }
}


//*****************************************************/
//************* Ball **********************************/
//*****************************************************/

function ball()
{
    this.x = 80;
    this.y = 80;
    this.directionX = 1;
    this.directionY = 1;
    this.radius = 10;

    this.ballSpeed = 1;
}

ball.prototype.draw = function ()
{
    main_Ctx.beginPath();
    main_Ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    main_Ctx.fillStyle = "#21889e";
    main_Ctx.fill();
    main_Ctx.stroke();

    this.move();
}

ball.prototype.move = function ()
{
    this.borderCollision(this.x, this.y);
    this.playerCollision(myPlayer);

    this.x += (this.directionX * this.ballSpeed);
    this.y += (this.directionY * this.ballSpeed);
}

ball.prototype.borderCollision = function (x,y)
{
    if(x > document.getElementById("main_Canvas").clientWidth)
    {
        this.x -= 1;
        this.directionX *= -1;
        this.ballSpeed += 0.1;
    }
    else if(x < (document.getElementById("main_Canvas").clientWidth - document.getElementById("main_Canvas").clientWidth))
    {
        this.x += 1;
        this.directionX *= -1;
        this.ballSpeed += 0.1;
    }
    else if(y > document.getElementById("main_Canvas").clientHeight)
    {
        this.y -= 1;
        this.directionY *= -1;
        this.ballSpeed += 0.1;
    }
    else if(y < (document.getElementById("main_Canvas").clientHeight - document.getElementById("main_Canvas").clientHeight))
    {
        this.y += 1;
        this.directionY *= -1;
        this.ballSpeed += 0.1;
    }
}

ball.prototype.playerCollision = function (player)
{
     var circle = this;

    distX = (circle.x - player.x-player.width/2);
    distY = (circle.y - player.y-player.height/2);

    var DeltaX = circle.x - Math.max(player.x, Math.min(this.x, player.x + player.width));
    var DeltaY = circle.y - Math.max(player.y, Math.min(this.y, player.y + player.height));

    var bCollision = (DeltaX * DeltaX + DeltaY * DeltaY) < (circle.radius * circle.radius);

    if(bCollision)
    {
        debugger;
        if(DeltaY === 0 && DeltaX < 0)    //Rechts
        {
            this.x += 10;
            this.directionX *= -1
        }
        else if(DeltaY === 0 && DeltaX > 0)   //Links
        {
            this.x -= 10;
            this.directionX *= -1
        }
        else if(DeltaX === 0 && DeltaY < 0)     //Oben
        {          
            this.Y -= 10;
            this.directionY *= -1;
        }
        else if(DeltaX === 0 && DeltaY > 0)     //Unten
        {
            this.Y += 10;
            this.directionY *= -1;
        }
    }

    document.getElementById("x").innerHTML = Math.abs(distX);
    document.getElementById("y").innerHTML = Math.abs(distY);
}


//*****************************************************/
//************* FUNCTIONS *****************************/
//*****************************************************/

function init()
{
    background_Canvas = document.getElementById("background_Canvas");
    background_Ctx = background_Canvas.getContext("2d");
    main_canvas = document.getElementById("main_Canvas");
    main_Ctx = main_canvas.getContext("2d");

    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);

    myPlayer = new player();
    myBall = new ball();

    requestAFrame = (function() {
        return  window.requestAnimationFrame        || window.webkitRequestAnimationFrame   ||
                window.mozRequestAnimationFrame     || window.oRequestAnimationFrame        ||
                window.msRequestAnimationFrame      || function(callback) {window.setTimeout(callback, 1000 / 60)}
    })();
    
}

function gameLoop()
{
    main_Ctx.clearRect(0,0,600,400);
    myPlayer.draw();
    myBall.draw();

    if(is_playing)
        requestAFrame(gameLoop);
}

function start_stop_game()
{
    if(is_playing === false) {
        is_playing = true;
        gameLoop();
    }
    else if(is_playing === true) {
        is_playing = false;
    }
}

function keyDown(e)
{
    keyID = e.keyCode || e.wich;
    switch(keyID)
    {
        case 38:    //Key-Up
            myPlayer.is_upkey = true;
            e.preventDefault();
        break;
        case 40:    //Key-Down
            myPlayer.is_downkey = true;
            e.preventDefault();
        break;
        case 37:    //Key-Left
            myPlayer.is_leftkey = true;
            e.preventDefault();
        break;
        case 39:    //Key-Right
            myPlayer.is_rightkey = true;
            e.preventDefault();
        break;
    }
}


function keyUp(e)
{
    keyID = e.keyCode || e.wich;

    switch(keyID)
    {
        case 38:    //Key-Up
            myPlayer.is_upkey = false;
            e.preventDefault();
        break;
        case 40:    //Key-Down
            myPlayer.is_downkey = false;
            e.preventDefault();
        break;
        case 37:    //Key-Left
            myPlayer.is_leftkey = false;
            e.preventDefault();
        break;
        case 39:    //Key-Right
            myPlayer.is_rightkey = false;
            e.preventDefault();
        break;
    }
}

init();