//import Phaser from "phaser";
import { SpriteWithDynamicBody } from "../types";
import { Player } from '../entities/Player';
import { GameScene } from '../scenes/GameScene';
import { PRELOAD_CONFIG } from "..";

class PlayScene extends GameScene{

    player: Player;
    ground: Phaser.GameObjects.TileSprite;
    obstacles: Phaser.Physics.Arcade.Group;
    clouds: Phaser.GameObjects.Group;
    startTrigger: SpriteWithDynamicBody;

    scoreText: Phaser.GameObjects.Text;
    gameOverContainer: Phaser.GameObjects.Container;
    gameOverText: Phaser.GameObjects.Image;
    restartText: Phaser.GameObjects.Image;

    score: number = 0;
    scoreInterval: number = 100;    // El score incrementará en 1 cada 100ms
    scoreDeltaTime: number = 0;

    spawnInterval: number = 1500;
    spawnTime: number = 0;
    gameSpeed: number = 10;  // Velocidad horizontal de los obstáculos

    constructor(){
        super('PlayScene');
    }

    create(){
        this.createEnviroment();
        this.createPlayer();
        this.createObstacles();
        this.createGameOverContainer();
        this.handleGameStart();
        this.handleObstacleCollisions();
        this.handleGameRestart();
        this.createAnimations();
        this.createScore();

    };

    update(time: number, delta: number): void {

        if(!this.isGameRunning){ return }

        this.spawnTime += delta;
        if(this.spawnTime >= this.spawnInterval){
            this.spawnObstacle();
            this.spawnTime = 0;
        }

        this.scoreDeltaTime += delta;
        if(this.scoreDeltaTime >= this.scoreInterval){
            this.score++;
            console.log(this.score)
            this.scoreDeltaTime = 0;
        }

        Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed); // Desplazamiento de los obstáculos hacia la izquierda
        Phaser.Actions.IncX(this.clouds.getChildren(), -0.5);               // Desplazamiento de las nubes hacia la izquierda

        const score = Array.from(String(this.score), Number);
        for(let i=0; i < 5 - String(this.score).length; i++){
            score.unshift(0);
        }
        this.scoreText.setText(score.join(''));

        this.obstacles.getChildren().forEach((obstacle: SpriteWithDynamicBody) => {
            if(obstacle.getBounds().right < 0){     // Si el borde derecho de obstáculo ha pasado el borde izquierdo del mundo...
                this.obstacles.remove(obstacle);    // Borra el obstáculo
            }
        });

        this.clouds.getChildren().forEach((cloud: SpriteWithDynamicBody) => {
            if(cloud.getBounds().right < 0){        // Si el borde derecho de la nube ha pasado el borde izquierdo del mundo...
                cloud.x = this.gameWidth + 30       // Coloca el obstáculo
            }
        });
        
        this.ground.tilePositionX += this.gameSpeed;

    }

    /* FUNCIONES */

    createPlayer(){
        // Crea al jugador
        this.player = new Player(this, 0, this.gameHeight, 'dino-run').setFrame(1); // Crea al dino utilizando el frame 1 del sprite 'dino-run' (ver PrealoadScene)
    };

    createEnviroment(){
        // Crea el Mundo
        this.ground = this.add
            .tileSprite(0, this.gameHeight, 88, 26, 'ground')
            .setOrigin(0,1)

        this.clouds = this.add.group();
        this.clouds = this.clouds.addMultiple([
            this.add.image(this.gameWidth / 2, 170, 'cloud'),
            this.add.image(this.gameWidth - 80, 80, 'cloud'),
            this.add.image(this.gameWidth / 1.3, 100, 'cloud'),
        ])
        this.clouds.setAlpha(0);
    };

    createObstacles(){
        // Crea los Obstáculos
        this.obstacles = this.physics.add.group();
    };

    createGameOverContainer(){
        // Crea el Contenedor de GAME OVER
        this.gameOverText = this.add.image(0, 0, 'game-over');
        this.restartText = this.add.image(0, 80, 'restart').setInteractive();

        this.gameOverContainer = this.add
        .container(this.gameWidth / 2, (this.gameHeight / 2) - 50)
        .add([this.gameOverText, this.restartText])
        .setAlpha(0);
    };

    createAnimations(){
        this.anims.create({
            key: "enemy-bird-fly",
            frames: this.anims.generateFrameNumbers('enemy-bird'),
            frameRate: 6,
            repeat: -1,
        })
    };

    createScore(){
        this.scoreText = this.add.text(this.gameWidth, 0, "00000", {
            fontSize: 30,
            fontFamily: 'Arial',
            color: '#535353',
            resolution: 5,
        })
        .setOrigin(1, 0)
        .setAlpha(0);
    }

    spawnObstacle(){
        // Generar obstáculo
        const obstacleCount = PRELOAD_CONFIG.cactusesCount + PRELOAD_CONFIG.birdsCount;
        const obstacleNumber = Math.floor(Math.random() * obstacleCount ) + 1;

        let distance = Phaser.Math.Between(150, 300);
        let obstacle;

        if(obstacleNumber > PRELOAD_CONFIG.cactusesCount){

            const enemyPossibleHeight = [20, 70];
            const enemyHeight = enemyPossibleHeight[Math.floor(Math.random() * 2)];

            obstacle = this.obstacles.create(this.gameWidth + distance, this.gameHeight - enemyHeight, `enemy-bird`)
            obstacle.play('enemy-bird-fly', true);

        } else {

            obstacle = this.obstacles.create(this.gameWidth + distance, this.gameHeight, `obstacle-${obstacleNumber}`)

        }

        obstacle.setOrigin(0, 1).setImmovable();

    };

    handleGameStart(){
        // Inicio del juego
        this.startTrigger = this.physics.add.sprite(0, 10, null)    // Trigger superior: pos.x: 0 / pos.y: 10 / sprite asociado: null
        .setOrigin(0, 1)    // origin: esquina inf. izq.
        .setAlpha(0);       // invisibles

        this.physics.add.overlap(this.startTrigger, this.player, () => {
            if(this.startTrigger.y === 10){ 
                this.startTrigger.body.reset(0, this.gameHeight);
                console.log('Triggering upper trigger!');
                return
            }
            this.startTrigger.body.reset(9999, 9999);

            const rollOutEvent = this.time.addEvent({
                delay: 1000 / 60,
                loop: true,
                callback: () => {
                    this.player.playRunAnimation();
                    this.player.setVelocityX(80);
                    this.ground.width += (17 * 2);
                    // Game Start Condition
                    if(this.ground.width >= this.gameWidth){
                        rollOutEvent.remove();
                        this.ground.width = this.gameWidth;
                        this.player.setVelocityX(0);
                        this.clouds.setAlpha(1);
                        this.scoreText.setAlpha(1);
                        this.isGameRunning = true;
                    }
                }
            })

        });
    };

    handleObstacleCollisions(){
        // Colisiones con obstáculos
        this.physics.add.collider(this.obstacles, this.player, () => {
            this.isGameRunning = false;
            this.physics.pause();
            this.anims.pauseAll();

            this.player.die();
            this.gameOverContainer.setAlpha(1)

            this.spawnTime = 0;
            this.score = 0;
            this.scoreDeltaTime = 0;
            this.gameSpeed = this.gameSpeed;
        });
    };

    handleGameRestart(){
        // Restart
        this.restartText.on('pointerdown', () => {
            this.physics.resume();
            this.player.setVelocityY(0);
            this.obstacles.clear(true, true);
            this.gameOverContainer.setAlpha(0);
            this.anims.resumeAll();
            this.isGameRunning = true;
        })
    };


};

export default PlayScene;