import { ScheduledTask } from "./Scheduler"

describe('Testing Scheduler module', () => {
  it('should create a new ScheduledTask', () => {
    const task = ScheduledTask.register('task_1', () => {}, Date.now() + 1000)
    expect(task).toBeDefined()
    task.abort()
    expect(task.state).toBe('aborted')
  })
  it('should create a new task and wait for it to be resolved', async () => {
    const task = ScheduledTask.register('task_2', () => {}, Date.now() + 1000)
    expect(task).toBeDefined()
    expect(task.state).toBe('pending')
    await task.promise()
    expect(task.state).toBe('resolved')
  })
  it('should execute task with correct scope', async () => {
    let flag = false
    const task = ScheduledTask.register('task_3', () => {
      flag = true
    }, Date.now() + 1000)
    expect(task).toBeDefined()
    await task.promise()
    expect(flag).toBeTruthy()
  })
})
