function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;

    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }

    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }


    var locX = x;
    var locY = y - 10;

    var offset = vindex === 0 ? this.startX : 0;

    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy * 2,
                  this.frameHeight * scaleBy * 2);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "SaddleBrown";
    ctx.fillRect(0,500,800,300);
    Entity.prototype.draw.call(this);
}

function Unicorn(game, x, y, typeID, direction) {

    Entity.call(this, game, x, y, typeID);
    this.pid = typeID;
    this.direction = direction;
    this.throwing = false;
    this.snowballTimer = 0;
    this.hold = 20;
    this.speed = 10;
    this.snowmanAnimation = new Animation(ASSET_MANAGER.getAsset("./img/snowman.png"),0, 0, 48, 48,/*frame speed*/ 0.5, /*# of frames*/2, true, false);
    this.throwAnimation = new Animation(ASSET_MANAGER.getAsset("./img/snowman.png"),96, 0, 48, 48, 0.5, 2, true, false);

}

Unicorn.prototype = new Entity();
Unicorn.prototype.constructor = Unicorn;


Unicorn.prototype.update = function () {
    if (this.game.up)
    {
        if (this.y > 0)
            this.y -= this.speed;
    }
    if (this.game.down)
    {
        if(this.y <500)
            this.y += this.speed;
    }
    if (this.game.left) {
        console.log(this.x);
        if(this.x > 0)
            this.x -= this.speed;
    }
    if (this.game.right) {
        console.log(this.x);
        if (this.x < 500)
         this.x += this.speed;
    }
    this.direction = 1;
    if (this.hold === 0) this.throwing = false;
    if (this.snowballTimer < 0) { //throwing
        console.log("Throwing!!! ");
        this.throwing = true;
        this.hold = 20;
        var snowball = new Snowball(this.game, this.x+70, this.y+20, 2, 1);
        this.game.addEntity(snowball);
        this.snowballTimer = 100;
    }
    if(this.snowballTimer >= 0) {//not throwing
        if (this.throwing){
            this.hold--;
        }
        else{
            this.snowballTimer -= 1;
            this.x += 0.1;
        }

    }
    Entity.prototype.update.call(this);
}

Unicorn.prototype.draw = function (ctx) {
    if (this.throwing && this.hold > 0){
        this.throwAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else {
        this.snowmanAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}


// the "main" code begins here

var ASSET_MANAGER = new AssetManager();
ASSET_MANAGER.queueDownload("./img/snowman.png");


ASSET_MANAGER.downloadAll(function () {
    var socket = io.connect("http://76.28.150.193:8888");

    socket.on("load", function (data) {
        console.log(data);
    });
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var unicorn = new Unicorn(gameEngine, 250, 400, 1);
    gameEngine.addEntity(bg);
    gameEngine.addEntity(unicorn);


    var entitiesList = [];
    //Save Button
    var saveButton = document.createElement("Button");
    saveButton.innerHTML = "Save";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(saveButton);
    saveButton.addEventListener("click", function () {
        //console.log("Current size of the entities is : " + gameEngine.entities.length);
        entitiesList.length = 0;
        var temp;

        for (var i = 0; i < gameEngine.entities.length; i++) {
            if (gameEngine.entities[i].typeID === 1 ||
                gameEngine.entities[i].typeID === 2 ) {
                temp = new singleEntityInfo(gameEngine.entities[i].typeID,
                    gameEngine.entities[i].x, gameEngine.entities[i].y, gameEngine.entities[i].direction);
                //console.log("type ID" + gameEngine.entities[i].typeID);
                entitiesList.push(temp);
                //console.log("Added new typeID : " + temp.typeID);
            }
        }
        //console.log("Size of the new entity list is : " + entitiesList.length);
        //console.log("Second push successed");

        socket.emit("save", { studentname: "Feng Yang", statename: "snowman", data: entitiesList });
    });

    // Load Button
    var loadButton = document.createElement("Button");
    loadButton.innerHTML = "Load";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(loadButton);
    loadButton.addEventListener("click", function () {
        socket.emit("load", { studentname: "Feng Yang", statename: "snowman"});
        //console.log(this.savedlist[0].typeID);

        for (var i = 0; i < gameEngine.entities.length; i++) {
            if (gameEngine.entities[i].typeID === 1 ||
                gameEngine.entities[i].typeID === 2 ) {
                gameEngine.entities[i].removeFromWorld = true;
            }
            //gameEngine.entities[i].length = 0;
        }

        var newUnicorn;
        var newSnowball;

        for (var i = 0; i < entitiesList.length; i++) {
            switch (entitiesList[i].typeID) {
                case 1:
                    newUnicorn = new Unicorn(gameEngine, entitiesList[i].x,
                        entitiesList[i].y, entitiesList[i].typeID, entitiesList[i].direction);
                    gameEngine.addEntity(newUnicorn);
                    break;
                case 2:
                    newSnowball = new Snowball(gameEngine, entitiesList[i].x,
                        entitiesList[i].y, entitiesList[i].typeID, entitiesList[i].direction);
                    gameEngine.addEntity(newSnowball);
                    break;
                default : break;
            }
        }

    });



    gameEngine.init(ctx);
    gameEngine.start();
});
function singleEntityInfo(typeID, x, y, direction) {
    //console.log("I am in");
    this.typeID = typeID;
    //console.log("Object typeID is : " + this.typeID);
    this.x = x;
    this.y = y;
    this.direction = direction;
}