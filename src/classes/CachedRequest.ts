import { AxiosResponse } from "axios";


export class CachedRequest <T = any> {
  public createdAt: number

  constructor(public response: AxiosResponse<T>){
    this.createdAt = Date.now()
  }
}
