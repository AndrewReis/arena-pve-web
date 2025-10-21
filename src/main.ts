// dependencies
import { Game, Types } from "phaser";

import '../public/assets/style.css';

// scenes
import GameScene from './scenes/GameScene';

// config
import { GameConfig } from './config'

(async () => {
  const config: Types.Core.GameConfig = {
    ...GameConfig,
    scene: [GameScene]
  };

  new Game(config);
})();