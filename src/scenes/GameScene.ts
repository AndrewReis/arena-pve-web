import Phaser from "phaser";
import { HealthBar, StaminaBar } from "../models/Bar";
import { createGame, sendAction } from "../services/api";

export interface GameData {
  id: string;
  state: {
    currentPlayer: string;
    heroes: Array<any>;
    enemies: Array<any>;
  };
  enemyMoviment: {actionIndex: number, targetId: string} | null;
}

export default class GameScene extends Phaser.Scene {
  private TILE_SIZE = 64;

  private gameData!: GameData;
  private heroAbilities: any[] = [];
  private isClickable = false;
  private playerMoviment = { targetId: '', ability: -1 };

  constructor() {
    super("GameScene");
  }

  preload() {
    const animations = ['idle'];
    animations.forEach(anim => {
      this.load.atlas(`iron_man_${anim}`, `/public/assets/iron_man/${anim}.png`, `/public/assets/iron_man/${anim}.json`);
      this.load.atlas(`thor_${anim}`, `/public/assets/thor/${anim}.png`, `/public/assets/thor/${anim}.json`);
    })

    // fundo
    this.load.image("bg", "/public/assets/terrace.png");

    // heróis
    this.load.image("iron_man", "/public/assets/iron_man.png");
    this.load.image("captain_america", "/public/assets/captain_america.png");
    this.load.image("thor", "/public/assets/thor.png");

    // inimigos
    this.load.image("thanos", "/public/assets/thanos.png");
    this.load.image("red_skull", "/public/assets/red_skull.png");
    this.load.image("ultron", "/public/assets/ultron.png");
  }

  async create() {
    this.add.image(400, 200, "bg").setDisplaySize(800, 400);

    // criar partida via API
    this.gameData = await createGame();

    this.getHeroAbilities(this.gameData.state.currentPlayer);

    this.drawScene();

    this.input.on("gameobjectdown", (pointer: any, obj: any) => {
      const type = obj.getData("type");
      const id = obj.getData("id");

      if (type === "ability") {
        console.log("ability clicked:", id);
        this.setPlayerAction(id);
      }

      if (type === "enemy" && this.isClickable) {
        this.setPlayerTarget(id);
        this.isClickable = false;
      }
    });
  }

  private getHeroAbilities(currentPlayerId: string) {
    this.heroAbilities =
      this.gameData.state.heroes.find(h => h.id === currentPlayerId)?.abilities || [];
  }

  private setPlayerAction(abilityId: string) {
    const abilityIndex = this.heroAbilities.findIndex(ab => ab.id === abilityId);
    this.playerMoviment.ability = abilityIndex;
    this.isClickable = true;
  }

  private async setPlayerTarget(targetId: string) {
    this.playerMoviment.targetId = targetId;
    await this.useAbility();
  }

  private async useAbility() {
    this.gameData = await sendAction(this.gameData.id, this.playerMoviment);

    console.log("Updated game data:", this.gameData);
    this.getHeroAbilities(this.gameData.state.currentPlayer);
    this.drawScene();
  }

  private drawGrid(): void {
    const width = Math.round(this.scale.width);
    const height = Math.round(this.scale.height);

    // cria um graphics local — será removido se você usar this.children.removeAll()
    const g = this.add.graphics();
    g.lineStyle(1, 0x000000, 1); // verde, largura 1

    // linhas verticais + labels no topo
    for (let x = 0; x <= width; x += this.TILE_SIZE) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, height);
      g.strokePath();

      // label com 10px Arial (sem bloquear z-order dos sprites)
      this.add.text(x + 2, 10, String(x), {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#000000'
      }).setDepth(1000);
    }

    // linhas horizontais + labels à esquerda
    for (let y = 0; y <= height; y += this.TILE_SIZE) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(width, y);
      g.strokePath();

      // posiciona label um pouco acima da linha quando possível
      const labelY = (y - 2 > 0) ? y - 2 : 10;
      this.add.text(2, labelY, String(y), {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#000000'
      }).setDepth(1000);
    }
  }

  private drawScene() {
    this.children.removeAll();

    this.add.image(400, 200, "bg").setDisplaySize(800, 400);

    this.add.text(352 - 98, 25, `Current: ${this.gameData.state.currentPlayer}`, {
      fontSize: "18px",
      color: "#000000",
      backgroundColor: "#ffffff",
      fontStyle: "bold"
    });

    this.gameData.state.heroes.forEach((hero, i) => {
      const isMiddle = i === 1;

      const x = isMiddle ? 64 * 4 : 64 * 3;
      const y = 100 + i * this.TILE_SIZE;

      const sprite = this.add.image(x, y, hero.id).setOrigin(0, 0).setScale(0.2);

      const healthBar = new HealthBar(this, {
        x: 0,
        y: 0 + (i * 35),
        value: (hero.stats.health / hero.stats.health) * 100
      });

      healthBar.draw();

      const staminaBar = new StaminaBar(this, {
        x: 0,
        y: 0 + (i * 35) + 12,
        value: (hero.stats.stamina / hero.stats.stamina) * 100
      });

      staminaBar.draw();
    });

    this.gameData.state.enemies.forEach((enemy, i) => {
      const x = 600;
      const y = 70 + i * this.TILE_SIZE;

      const sprite = this.add.image(x, y, enemy.id).setOrigin(0, 0).setDisplaySize(50, 50);
      sprite.setInteractive();
      sprite.setData("type", "enemy");
      sprite.setData("id", enemy.id);

      const healthBar = new HealthBar(this, {
        x: 576,
        y: 0 + (i * 35),
        value: (enemy.stats.health / enemy.stats.health) * 100
      });

      healthBar.draw();
    });

    // desenhar habilidades
    this.heroAbilities.forEach((ability, i) => {
      const column = 64 * 4;
      const x = column + (i * 64);
      const y = 320;

      const rect = this.add.rectangle(x, y, 64, 64, 0x333333).setOrigin(0, 0);
      rect.setInteractive();
      rect.setData("type", "ability");
      rect.setData("id", ability.id);
    });

    this.drawGrid()
  }
}
