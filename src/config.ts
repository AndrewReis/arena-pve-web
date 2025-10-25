import 'phaser'

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#ffffff',
  scale: {
    mode: Phaser.Scale.NONE,
    // autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'phaser-example',
    width: 768,
    height: 385
  },
  render: {
    antialias: true,
    pixelArt: false
  }
};