import { nextInteger } from "../utils"
import { CacheCollection } from "./CacheCollection"
import { ScheduledTask } from "./Scheduler"

export type CacheItemKey = unknown
export type CacheItemData = unknown

interface CacheItemConfig {
  parentCollection: CacheCollection;
  lifespan?: number;
  updateOnlyOnce?: boolean;
  keepOld?: boolean;
}

export class CacheItem <T = CacheItemData> {
  public createdAt: number
  public updatedAt: number
  public nextUpdateTime: number | 'never' = 'never'
  public keepOld: boolean = false
  public snapshots: Map<number, unknown>
  public lifespan: number = Infinity
  public updateOnlyOnce: boolean
  public updateTask: ScheduledTask

  private parentCollection: CacheCollection
  constructor(public key: CacheItemKey, public data: T, config: CacheItemConfig){

    this.createdAt = Date.now()
    this.updatedAt = this.createdAt
    this.parentCollection = config.parentCollection

    if (config.keepOld === true) {
      this.keepOld = true
      this.snapshots = new Map()
      this.saveSnapshot()
    }
    if (config.lifespan){
      this.nextUpdateTime = this.updatedAt + config.lifespan
      this.lifespan = config.lifespan
      this.updateOnlyOnce = config.updateOnlyOnce || false
      this.scheduleUpdate()
    }
  }
  private scheduleUpdate(){
    if (this.nextUpdateTime === 'never') return
    this.updateTask = ScheduledTask.register(`update_cache_item_${nextInteger('update_cache_item')}`, () => this.update(), this.nextUpdateTime)
  }
  private saveSnapshot(){
    this.snapshots.set(this.updatedAt, this.data)
  }
  public async update(){
    
    const { data, key } = await this.parentCollection.fetcher.fetchOne<T>(this.key)

    if (this.keepOld) this.saveSnapshot

    this.data = data
    this.key = key
    this.updatedAt = Date.now()

    if (!this.updateOnlyOnce){
      this.nextUpdateTime = this.updatedAt + this.lifespan
      this.scheduleUpdate()
    }
    else this.nextUpdateTime = 'never'
  }

  public destroy(){
    this.data = null
    this.key = null
    this.createdAt = null
    this.keepOld = null
    this.updatedAt = null
    this.nextUpdateTime = null
    this.snapshots = null
  }
}