import Phaser from "phaser";

interface GameData {
  id: string;
  state: {
    currentPlayer: string;
    heroes: Array<any>;
    enemies: Array<any>;
  };
}

export default class GameScene extends Phaser.Scene {
  private TILE_SIZE = 64;
  private COLS = 25;
  private ROWS = 20;

  private gameData!: GameData;
  private heroAbilities: any[] = [];
  private isClickable = false;
  private playerMoviment = { targetId: null as string | null, ability: -1 };

  private gridGraphics!: Phaser.GameObjects.Graphics;
  private gridLabels: Phaser.GameObjects.Text[] = [];

  constructor() {
    super("GameScene");
  }

  preload() {
    // fundo
    this.load.image("bg", "/public/assets/game_bg_2.png");

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
    this.gameData = await this.createGame();

    this.getHeroAbilities(this.gameData.state.currentPlayer);

    this.drawScene();

    this.input.on("gameobjectdown", (pointer: any, obj: any) => {
      const type = obj.getData("type");
      const id = obj.getData("id");

      if (type === "ability") {
        this.setPlayerAction(id);
      }

      if (type === "enemy" && this.isClickable) {
        this.setPlayerTarget(id);
        this.isClickable = false;
      }
    });
  }

  private async createGame(): Promise<GameData> {
    const response = await fetch("http://localhost:3000/game", {
      method: "POST"
    });
    return response.json();
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
    const response = await fetch(
      `http://localhost:3000/game/${this.gameData.id}/apply-action`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.playerMoviment)
      }
    );
    this.gameData = await response.json();

    this.getHeroAbilities(this.gameData.state.currentPlayer);
    this.drawScene();
  }

  private drawGrid(): void {
    const width = Math.round(this.scale.width);
    const height = Math.round(this.scale.height);

    // cria um graphics local — será removido se você usar this.children.removeAll()
    const g = this.add.graphics();
    g.lineStyle(1, 0x00ff00, 1); // verde, largura 1

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
        color: '#00ff00'
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
        color: '#00ff00'
      }).setDepth(1000);
    }
  }

  private drawScene() {
    this.children.removeAll();

    this.add.image(400, 200, "bg").setDisplaySize(800, 400);

    // desenhar heróis
    this.gameData.state.heroes.forEach((hero, i) => {
      const x = 64 * 3;
      const y = 128 + i * this.TILE_SIZE;

      const sprite = this.add.image(x, y, hero.id).setOrigin(0, 0).setDisplaySize(50, 50);

      // vida
      this.add.rectangle(x, y - 10, hero.stats.health, 10, 0x009c40).setOrigin(0, 0);
      // stamina
      this.add.rectangle(x, y + 60, hero.stats.stamina, 10, 0x005fba).setOrigin(0, 0);
    });

    // desenhar inimigos
    this.gameData.state.enemies.forEach((enemy, i) => {
      const x = 600;
      const y = 70 + i * this.TILE_SIZE;

      const sprite = this.add.image(x, y, enemy.id).setOrigin(0, 0).setDisplaySize(50, 50);
      sprite.setInteractive();
      sprite.setData("type", "enemy");
      sprite.setData("id", enemy.id);

      // vida
      this.add.rectangle(x - 50, y - 10, enemy.stats.health, 10, 0x009c40).setOrigin(0, 0);
      // stamina
      this.add.rectangle(x - 50, y + 60, enemy.stats.stamina, 10, 0x005fba).setOrigin(0, 0);
    });

    // desenhar habilidades
    this.heroAbilities.forEach((ability, i) => {
      const x = 207 + i * 80;
      const y = 320;

      const rect = this.add.rectangle(x, y, 64, 64, 0x333333).setOrigin(0, 0);
      rect.setInteractive();
      rect.setData("type", "ability");
      rect.setData("id", ability.id);

      this.add.text(x + 10, y + 20, ability.name || "Skill", {
        fontSize: "10px",
        color: "#fff"
      });
    });

    this.drawGrid()
  }
}
