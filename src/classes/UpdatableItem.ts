import { nextInteger } from "../utils";
import { ScheduledTask } from "./Scheduler";

export interface UpdatableItemConfig {
  lifespan: number;
  keepOld?: boolean;
  updateOnce?: boolean;
  updateTimes?: number;
}
interface UpdatableItemSettings {
  keepOld: boolean;
  updateOnce: boolean;
  updateTimes: number;
}

export class UpdatableItem {
  public lifespan: number
  public updatedAt: number
  public createdAt: number
  public updateTask: ScheduledTask
  public updates: number = 0
  public snapshots: Map<number, unknown>

  protected flags: UpdatableItemSettings = {
    keepOld: false,
    updateOnce: false,
    updateTimes: Infinity
  }

  constructor(config: UpdatableItemConfig){
    this.lifespan = +config.lifespan || Infinity
    this.createdAt = Date.now()
    this.updatedAt = this.createdAt
    
    this.flags.keepOld = config.keepOld || false
    this.flags.updateOnce = config.updateOnce || false
    this.flags.updateTimes = config.updateTimes || Infinity

    if (Number.isFinite(this.lifespan)) this.scheduleUpdate()
    if (this.flags.keepOld) this.saveSnapshot()
  }
  private scheduleUpdate(){
    if (!Number.isFinite(this.nextUpdateTime)) return
    this.updateTask = ScheduledTask.register(
      `update_updatable_item_${nextInteger('updatable_item_update')}`,
      async () => {
        await this.update()
        this.postUpdate()
      },
      this.updatedAt + this.lifespan
    )
  }
  protected saveSnapshot() {
    this.snapshots.set(this.updatedAt, this)
  }
  public get nextUpdateTime() {
    return this.updateTask.scheduledTime
  }
  // meant to be overridden in a parent class
  protected async update(){}
  private postUpdate(){
    if (!this.flags.updateOnce && this.flags.updateTimes > this.updates) this.scheduleUpdate()
    if (this.flags.keepOld) this.saveSnapshot()
  }
}
