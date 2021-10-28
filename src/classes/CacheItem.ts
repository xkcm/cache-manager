import { nextInteger } from "../utils"
import { CacheCollection } from "./CacheCollection"
import { ScheduledTask } from "./Scheduler"
import { UpdatableItem, UpdatableItemConfig } from "./UpdatableItem"

export type CacheItemKey = unknown
export type CacheItemData = unknown

interface CacheItemConfig<T> {
  parentCollection: CacheCollection;
  key: CacheItemKey,
  data: T
}
interface CacheItemFlags {
  updateOnce: boolean;
  keepOld: boolean;
}

export class CacheItem<T = CacheItemData> extends UpdatableItem {
  public data: T
  public key: CacheItemKey

  private parentCollection: CacheCollection

  constructor(config: CacheItemConfig<T>, updateConfig: UpdatableItemConfig = {}){
    super(updateConfig)

    this.data = config.data
    this.key = config.key
    
    this.parentCollection = config.parentCollection
  }
  protected saveSnapshot(){
    this.snapshots.set(this.updatedAt, this.data)
  }
  protected async update(){
    const { data, key } = await this.parentCollection.fetcher.fetchOne<T>(this.key)
    this.data = data
    this.key = key
  }

  public destroy(){
    this.data = null
    this.key = null
    this.createdAt = null
    this.snapshots = null
  }
}