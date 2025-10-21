export interface ICharacter {
  key: string;
  health: number;
  energy: number;
  owner: boolean;
  assets: { img: string; json: string };
  anims: Array<{
    key: string,
    repeat: number,
    prefix: string,
    suffix: string,
    end: number,
    zeroPad: number,
    frameRate: number
  }>
  skillSelected?: {
    name: string;
    damage: number;
    cost: number;
  };
  position: { x: number, y: number };
  skills: Array<{
    name: string;
    damage: number;
    cost: number;
  }>
}
