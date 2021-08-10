import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { nextInteger } from "../utils";
import { ScheduledTask } from "./Scheduler";
import { UpdatableItem, UpdatableItemConfig } from "./UpdatableItem";

interface CachedRequestParams<T> {
  response: AxiosResponse<T>;
  requestConfig: AxiosRequestConfig;
  key: string;
  lifespan?: number;
  keepOld?: boolean;
  updateOnce?: boolean;
}
interface CachedRequestFlags {
  updateOnce: boolean;
  keepOld: boolean;
}

export class CachedRequest<T = any> extends UpdatableItem {

  public response: AxiosResponse<T>
  public key: string
  public responseBody: T

  private requestConfig: AxiosRequestConfig

  constructor(params: CachedRequestParams<T>, updateConfig: UpdatableItemConfig){
    super(updateConfig)

    this.requestConfig = params.requestConfig
    this.key = params.key
    this.response = params.response
    this.responseBody = params.response.data

  }
  protected saveSnapshot(){
    this.snapshots.set(this.updatedAt, this.response)
  }
  protected async update(){
    const newResponse = await axios.request(this.requestConfig)
    this.response = newResponse
    this.responseBody = newResponse.data
  }
}
