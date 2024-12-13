import Phaser from "phaser";
import PreloadScene from "./scenes/PreloadScene";
import PlayScene from "./scenes/PlayScene";

export const PRELOAD_CONFIG = {
  cactusesCount: 6
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,  //type: Phaser.CANVAS //type: Phaser.WEBGL //type: Phaser.HEADLESS
  width: 1000,
  height: 340,
  pixelArt: true,
  transparent: true,
  physics: {
    default: 'arcade',
    arcade: {
      //gravity: { y: 200 },
      debug: true,
    }
  },
  scene: [PreloadScene, PlayScene]
};

new Phaser.Game(config);