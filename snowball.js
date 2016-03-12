function Snowball(game, x, y,thePid, direction) {

    this.game = game;
    this.pid = thePid;
    Entity.call(this, game, x, y, thePid);
    this.setBox(-15, -15, 15, 15);
    this.radius = 100;
    this.direction =  direction;
    var speed = 2; //this bullet moves 2 pixels every tick
    this.direction = this.direction * speed;
    this.elapsed = 1;
    this.timesOfBoucing = 0;
    this.shoot = new Animation(ASSET_MANAGER.getAsset("./img/snowman.png"), 194, 2, 11, 11, 0.02, 1, true, false);
}

Snowball.prototype = new Entity();
Snowball.prototype.constructor = Snowball;

Snowball.prototype.update = function () {

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && ent.pid === 2) {
            var cl = Entity.prototype.collide.call(this, ent);
            if (cl == COLLIDE_LEFT || cl == COLLIDE_RIGHT) {
                if (this.timesOfBoucing > 20 && ent.timesOfBoucing > 20) {
                    this.removeFromWorld = true;
                    ent.removeFromWorld = true;
                } else {
                    this.direction *= -1;
                    this.timesOfBoucing++;
                    ent.timesOfBoucing++;
                }
            }
        }
    }
    if (this.x >= 700 || this.x <= -30) {
        this.direction *= -1;
        console.log("I am removed");
    }
    this.x += this.elapsed * this.direction ;
    Entity.prototype.update.call(this);
}

Snowball.prototype.draw = function (ctx) {
    this.shoot.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}