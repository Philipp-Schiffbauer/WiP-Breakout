
class menu {
    constructor() {
        this.elements = [];
        this.borders = {x1: 0, x2: designCanvas.width, y1: 300, y2: 600};
        this.colors = ["#ac0c0c", "#186600" , "#22386A", "#F1C40F", "#FF6F00", "#E91E63", "#9900CC", "#616161", "#121212"];

    }

    draw() {
        this.drawMenu();
        this.drawTools();
        this.drawColorbuttons();
    }

    drawMenu() {
        //Menu bar
        designCtx.fillStyle = "#28272b";
        designCtx.fillRect(0, 300, 1060, 60);

        //Menu Text
        designCtx.font = "40px Anton"
        designCtx.fillStyle = "White";
        designCtx.textAlign = "center"
        designCtx.fillText("Level Designer", designCanvas.width / 2, 340)

        //Color Text
        designCtx.font = "30px Anton";
        designCtx.fillStyle = "black";
        designCtx.fillText("Colors", 50, 390)

        //Brush Text
        designCtx.font = "30px Anton";
        designCtx.fillStyle = "black";
        designCtx.fillText("Tools", 400, 390)
    }

    drawColorbuttons() {
        this.x = 10;
        this.y = 420;
        this.width = 100;
        this.height = 30;
    

        for(let i = 0; i<this.colors.length;) {
            for(let j = 0; j < 3; j++) {       
                this.elements.push({x: this.x, y: this.y, w: this.width, h: this.height, color: this.colors[i]});

                designCtx.fillStyle = this.colors[i];
                designCtx.fillRect(this.x, this.y, this.width, this.height);
                designCtx.fillStyle = "black";
                designCtx.lineWidth = 3;
                designCtx.strokeRect(this.x, this.y, this.width, this.height);
                designCtx.lineWidth = 1;

                this.x += this.width + 10;
                i++;
            }
            this.x = 10;
            this.y += 50;
        } 

    }

    drawTools() {

    }

    handleClick(x, y) {
        this.elements.forEach(element => {
            if(x >= element.x && x <= element.x + element.w && y >= element.y && y <= element.y + element.h) {
                myDesigner.brickColor = element.color;
            }
        });
    }
}

class designer {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.bricks = [];
        this.brickColor = "#22386A"
        this.width = 20;
        this.height = 20;
        this.rowCount = 15;
        this.columnCount = 54;
        this.borders = {x1: 0, x2: this.columnCount * this.width, y1: 0, y2: this.rowCount * this.height};

        for(let row = 0; row < this.rowCount; row++) {
            this.bricks[row] = []
            for(let column = 0; column < this.columnCount; column++) {
                this.bricks[row][column] = {x: this.x, y: this.y, w: this.width, h: this.height, type: `_`, color: this.brickColor}
                this.x += this.width;
            }
            this.x = 0;
            this.y += this.height;
        }
        
    }

    draw() {
        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.columnCount; c++) {
                let brick = this.bricks[r][c];
                this.x = brick.x;
                this.y = brick.y;

                if (brick.type === `x`) {
                    designCtx.fillStyle = brick.color;
                    designCtx.fillRect(this.x, this.y, this.width, this.height);
                }

                designCtx.strokeRect(this.x, this.y, this.width, this.height);
            }
        }
    }

    handleClick(x, y) {
        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.columnCount; c++) {
                let brick = this.bricks[r][c];
                if(x >= brick.x && x < brick.x + brick.w && y >= brick.y && y < brick.y + brick.h) {
                    brick.color = this.brickColor;
                    brick.type = `x`;
                }
            }
        }
        this.draw()
    }
}



function init() {      //Initialiesierungsmethode des Spiels. Wird als erstes aufgerufen
    designCanvas = document.getElementById("levelDesignerCanvas");
    designCtx = designCanvas.getContext("2d");
    cnavasWidth = designCanvas.clientWidth;
    canvasHeight = designCanvas.clientHeight;

    myMenu = new menu();
    myDesigner = new designer();
    myDesigner.draw();
    myMenu.draw();

    window.addEventListener("mousedown", mouseDown, false);
}

/*
function drawLoop() {
    myDesigner.draw();

    while (true) {
        requestAFrame(drawLoop);
    }
}
*/

function mouseDown(e) {
    let x = e.offsetX;
    let y = e.offsetY;

    if(x >= myDesigner.borders.x1 && x <= myDesigner.borders.x2 && y >= myDesigner.borders.y1 && y <= myDesigner.borders.y2) {
        myDesigner.handleClick(x, y);
    }
    else if (x >= myMenu.borders.x1 && x <= myMenu.borders.x2 && y >= myMenu.borders.y1 && y <= myMenu.borders.y2) {
        myMenu.handleClick(x, y);
    }
    
}

init();