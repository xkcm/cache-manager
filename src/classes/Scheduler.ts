import { stringifyFunction } from '../utils'

type Callback = (createdAt?: number, scheduledTime?: number, executionTime?: number) => any
type TaskState = 'pending' | 'aborted' | 'resolved'

interface TaskConfig {
  callback: Callback;
  scheduledTime: number;
  taskName: string;
  createdAt: number;
  state?: TaskState;
  overwrite?: boolean;
}

const registerScheduledTasks = new Map<string, ScheduledTask>()

export class ScheduledTask {
  public callback: Callback
  public scheduledTime: number
  public createdAt: number
  public state: TaskState
  public taskName: string

  private timeout: NodeJS.Timeout
  private promiseResolver
  private promiseObj: Promise<[number, number, number]>

  static list(){
    return registerScheduledTasks.keys()
  }
  static task(name: string){
    return registerScheduledTasks.get(name)
  }
  static register(taskName: string, callback: Callback, scheduledTime: number): ScheduledTask{
    return new ScheduledTask({
      callback,
      scheduledTime,
      taskName,
      createdAt: Date.now()
    })
  }

  constructor(config: TaskConfig){
    if (registerScheduledTasks.has(config.taskName) && !config.overwrite) throw new Error("Task with given name already declared")
    if (!(/^\w+$/.test(config.taskName))) throw new Error("Invalid task name")
    this.taskName = config.taskName
    this.callback = config.callback
    this.scheduledTime = config.scheduledTime
    this.createdAt = config.createdAt
    this.state = config.state || 'pending'
    if (this.scheduledTime < this.createdAt) this.execute()
    else this.timeout = setTimeout(() => {
      this.execute()
    }, this.scheduledTime - Date.now())
    registerScheduledTasks.set(config.taskName, this)
  }
  public execute() {
    try{clearTimeout(this.timeout)}catch(e){}
    const args = [this.createdAt, this.scheduledTime, Date.now()]
    if (this.promiseResolver) this.promiseResolver(args)
    this.state = 'resolved'
    return this.callback.call(this.callback, ...args)
  }
  public abort(){
    try { clearTimeout(this.timeout) }
    catch(e){}
    this.state = 'aborted'
    return true
  }
  public async promise(){
    if (!this.promiseObj) {
      this.promiseObj = new Promise((res) => {
        this.promiseResolver = res
      })
    }
    return this.promiseObj
  }
  get [Symbol.toStringTag](){
    return 'ScheduledTask'
  }
}
