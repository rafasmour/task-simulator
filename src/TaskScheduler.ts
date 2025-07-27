import Task from "./Task";
import TaskExecuter from "./TaskExecuter";
import TaskSpawner from "./TaskSpawner";
import moment from "moment";

export interface TaskSchedulerInterface {
    assignTask(currentTime: Date): void;
    completeTask(taskExecuter: TaskExecuter, task: Task, taskSpawner: TaskSpawner): void;
}

export default class TaskScheduler implements TaskSchedulerInterface {
    public readonly name: string,
    public readonly taskSpawners: TaskSpawner[],
    private taskExecuters: TaskExecuter[],
    constructor(
        name: string,
        taskSpawners: TaskSpawner[],
        taskExecuters: TaskExecuter[],
    ){
        this.name = name;
        this.taskSpawners = taskSpawners.sort((a, b) => a.priority - b.priority)
        this.taskExecuters = taskExecuters;
    }

    manageTasks(currentTime: Date): void {
        for (const taskExecuter of this.taskExecuters) {
            if (!taskExecuter.getBusy()) continue;
            for (const taskSpawner of this.taskSpawners) {
                const task = taskSpawner.getTaskByExecuter(taskExecuter.name);
                if (!task) continue;
                const endTime = task.getStopTime();
                if (!endTime) continue;
                if (moment(endTime).isSameOrBefore(currentTime)) {
                    this.completeTask(taskExecuter, task, taskSpawner);
                    break; 
                }
                if(taskExecuter.getBusy()) continue;
                const task = this.getTaskLifo();
                if(!task) continue;
                this.assignTask(taskExecuter, task, TaskSpawner)
            }
        }
    }
    private completeTask(taskExecuter: TaskExecuter, task: Task, taskSpawner: TaskSpawner): void {
        taskSpawner.deleteTask(task);
        taskExecuter.setBusy(false);
    }
    private assignTask(taskExecuter: TaskExecuter, task: Task, taskSpawner: TaskSpawner, currentTime: Date) {
        const taskIndex = taskSpawner.getTaskIndex(task);
        taskSpawner.startTask(taskIndex, taskExecuter.getName(), currentTime)
        taskExecuter.setBusy(true);
    } 
    private getTaskLifo(): Task | undefined {
        for(const taskSpawner of this.taskSpawners) {
            for(const task of taskSpawner.getTasks()) {
                if(!task.getWorkerAssigned())
                    return task;
            }
        }
    }
    private getTaskFifo(): Task | undefined {
        for(const taskSpawner of this.taskSpawners) {
            const tasks = taskSpawner.getTasks()
            for(let i = tasks.length; i >= 0; i--) {
                const task = tasks[i]
                if(!task.getWorkerAssigned())
                    return task;
            }
        }
    }
}