document.addEventListener('keydown', function(event) {
    // Check if the pressed key is 'R' (key code 82 or 'r'/'R')
    if (event.key === 'r' || event.key === 'R') {
        // Refresh the page
        location.reload();
    }
});

function topWall(obj) {
    return obj.y;
}
function bottomWall(obj) {
    return obj.y + obj.height;
}
function leftWall(obj) {
    return obj.x;
}
function rightWall(obj) {
    return obj.x + obj.width;
}

// DINOSAUR
function Dinosaur(x, dividerY) {
    this.width = 55;
    this.height = 70;
    this.x = x;
    this.y = dividerY - this.height;
    this.vy = 0;
    this.jumpVelocity = -20;
    this.image = new Image();
    this.image.src = 'dinosaur.png';
}

Dinosaur.prototype.draw = function(context) {
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
};

Dinosaur.prototype.jump = function() {
    console.log("Jump called");
    this.vy = this.jumpVelocity;
};

Dinosaur.prototype.update = function(divider, gravity) {
    this.y += this.vy;
    this.vy += gravity;
    if (bottomWall(this) > topWall(divider) && this.vy > 0) {
        this.y = topWall(divider) - this.height;
        this.vy = 0;
        return;
    }
};

// DIVIDER
function Divider(gameWidth, gameHeight) {
    this.width = gameWidth;
    this.height = 4;
    this.x = 0;
    this.y = gameHeight - this.height - Math.floor(0.2 * gameHeight);
    this.grassOffset = 0;
}

Divider.prototype.draw = function(context) {
    var oldFill = context.fillStyle;

    context.fillStyle = "grey";
    context.fillRect(this.x, this.y, this.width, context.canvas.height - this.y);

    context.fillStyle = "white";
    const grassSpacing = 10;
    const grassWidth = 2;
    const grassHeight = 10;

    for (let i = this.grassOffset; i < this.width; i += grassSpacing) {
        context.fillRect(i, this.y, grassWidth, -grassHeight);
    }

    context.fillStyle = oldFill;
};

Divider.prototype.update = function() {
    this.grassOffset -= 1;
    if (this.grassOffset <= -10) {
        this.grassOffset = 0;
    }
};

// CACTUS
function Cactus(gameWidth, groundY) {
    this.width = 40;
    this.height = (Math.random() > 0.5) ? 30 : 70;
    this.x = gameWidth;
    this.y = groundY - this.height;
    this.image = new Image();
    this.image.src = 'cactus.png';
}

Cactus.prototype.draw = function(context) {
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
};

// GAME
function Game () {
    var canvas = document.getElementById("game");
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d");
    this.context.fillStyle = "brown";
    document.spacePressed = false;

    document.addEventListener("keydown", function(e) {
        if (e.key === " ") this.spacePressed = true;
    });

        document.addEventListener("keyup", function(e) {
            if (e.key === " ") this.spacePressed = false;
        });

            this.gravity = 1.5;
            this.divider = new Divider(this.width, this.height);
            this.dino = new Dinosaur(Math.floor(0.1 * this.width), this.divider.y);
            this.cacti = [];

            this.runSpeed = -10;
            this.paused = false;
            this.noOfFrames = 0;
            this.score = 0; // Initialize score
}

Game.prototype.spawnCactus = function(probability) {
    if (Math.random() <= probability) {
        this.cacti.push(new Cactus(this.width, this.divider.y));
    }
}

Game.prototype.update = function () {
    if (this.paused) {
        return;
    }

    if (document.spacePressed == true && bottomWall(this.dino) >= topWall(this.divider)) {
        console.log("Conditions met");
        this.dino.jump();
    }
    this.dino.update(this.divider, this.gravity);

    // Removing old cacti that cross the left border of the screen
    if (this.cacti.length > 0 && rightWall(this.cacti[0]) < 0) {
        this.cacti.shift();
        this.score += 1; // Increase score for each cactus passed
    }

    // Spawning new cacti
    if (this.cacti.length == 0) {
        this.spawnCactus(0.5);
    } else if (this.cacti.length > 0 && this.width - leftWall(this.cacti[this.cacti.length-1]) > this.jumpDistance + 150) {
        this.spawnCactus(0.05);
    }

    // Moving the cacti
    for (let i = 0; i < this.cacti.length; i++) {
        this.cacti[i].x += this.runSpeed;
    }

    // Collision Detection
    for (let i = 0; i < this.cacti.length; i++) {
        if (rightWall(this.dino) >= leftWall(this.cacti[i])
            && leftWall(this.dino) <= rightWall(this.cacti[i]) && bottomWall(this.dino) >= topWall(this.cacti[i])) {
            // COLLISION OCCURRED
            this.paused = true;
            }
    }

    this.noOfFrames++;
    this.score = Math.floor(this.noOfFrames / 10);

    // Jump Distance of the Dinosaur
    this.jumpDistance = Math.floor(this.runSpeed * (2 * this.dino.jumpVelocity) / this.gravity);
};

Game.prototype.draw = function () {
    this.context.clearRect(0, 0, this.width, this.height);
    this.divider.draw(this.context);
    this.dino.draw(this.context);

    for (let i = 0; i < this.cacti.length; i++) {
        this.cacti[i].draw(this.context);
    }

    this.context.fillStyle = "white";
    this.context.font = "20px Arial";  // Set a font size and style
    this.context.shadowColor = "black"; // Add shadow color for text
    this.context.shadowBlur = 2; // Blur effect for shadow
    this.context.fillText("Score: " + this.score, this.width - 120, 30); // Display score
    this.context.shadowColor = "transparent"; // Reset shadow to default after drawing
};

var game = new Game();
function main (timeStamp) {
    game.update();
    game.draw();
    window.requestAnimationFrame(main);
}
var startGame = window.requestAnimationFrame(main);
