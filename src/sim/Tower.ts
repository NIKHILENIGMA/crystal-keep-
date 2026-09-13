import { TowerType, TOWER_DATA } from '../data/towers';

export class Tower {
  public type: TowerType;
  public x: number;
  public y: number;
  public level: number = 1;
  public cooldownTimer: number = 0;
  public totalSpent: number = 0;

  constructor(type: TowerType, x: number, y: number) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.totalSpent = this.def.baseCost;
  }

  public get def() { return TOWER_DATA[this.type]; }
  public get range() { return this.def.range * (1 + (this.level - 1) * 0.15); }
  public get damage() { return this.def.damage * Math.pow(1.6, this.level - 1); }
  public get sellValue() { return Math.floor(this.totalSpent * 0.7); }
  public get upgradeCost() { return Math.floor(this.def.baseCost * Math.pow(1.5, this.level)); }
}
