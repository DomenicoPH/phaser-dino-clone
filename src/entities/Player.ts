import { GameScene } from '../scenes/GameScene';

export class Player extends Phaser.Physics.Arcade.Sprite {

    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    scene: GameScene;

    constructor(scene: GameScene, x: number, y: number, key: string){
        
        super(scene, x, y, key);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.init();

        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this)
    }

    init(){
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        
        this
            .setOrigin(0,1)
            .setBodySize(44, 92)
            .setOffset(20, 0)
            .setGravityY(5000)
            .setCollideWorldBounds(true)
            .setDepth(1);
            
        this.registerAnimations();
    }
 
    update(){
        const { space, down } = this.cursors;

        const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);
        const isDownJustDown = Phaser.Input.Keyboard.JustDown(down);
        const isDownJustUp = Phaser.Input.Keyboard.JustUp(down);

        const onFloor = (this.body as Phaser.Physics.Arcade.Body).onFloor()
        
        if(isSpaceJustDown && onFloor){ // Si la tecla 'space' es presionada
            this.setVelocityY(-1600)
        }
        if(isDownJustDown && onFloor){  // Si la tecla abajo es presionada
            this.body.setSize(this.body.width, 58);
            this.setOffset(60, 34);
        }
        if(isDownJustUp && onFloor){    // Si la tecla abajo es liberada
            this.body.setSize(44, 92);
            this.setOffset(20, 0)
        }
        
        if(!this.scene.isGameRunning){
            return;
        }

        if(this.body.deltaAbsY() > 0){
            this.anims.stop();
            this.setTexture('dino-run', 0)
        } else {
            this.playRunAnimation();
        }

            //console.log('this.body.y', this.body.y)
            //console.log('this.body.deltaAbsY()', this.body.deltaAbsY())
    }

    playRunAnimation(){
        this.body.height <= 58 ? this.play('dino-down', true) : this.play('dino-run', true);
    }


    registerAnimations(){
        this.anims.create({
            key: 'dino-run',
            frames: this.anims.generateFrameNumbers('dino-run', {start: 2, end: 3}),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'dino-down',
            frames: this.anims.generateFrameNumbers('dino-down'),
            frameRate: 10,
            repeat: -1,
        });
    }

    die(){
        this.anims.pause();
        this.setTexture('dino-hurt');
    }

}