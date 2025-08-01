import Task from "./Task";
import TaskExecuter from "./TaskExecuter";
import TaskSpawner from "./TaskSpawner";
import moment from "moment";

export interface TaskSchedulerInterface {
    update(currentTime: Date): void;
}

export default class TaskScheduler implements TaskSchedulerInterface {
    public readonly name: string;
    public readonly taskSpawners: TaskSpawner[];
    private taskExecuters: TaskExecuter[];

    constructor(
        name: string,
        taskSpawners: TaskSpawner[],
        taskExecuters: TaskExecuter[],
    ) {
        this.name = name;
        this.taskSpawners = taskSpawners.sort((a, b) => a.priority - b.priority)
        this.taskExecuters = taskExecuters;
    }

    manageTasks(currentTime: Date): void {
        for (const taskExecuter of this.taskExecuters) {
            if (!taskExecuter.getBusy()) {
                for (const taskSpawner of this.taskSpawners) {
                    const task = this.getTaskLifo()
                    if(!task) continue;
                    this.assignTask(taskExecuter, task, taskSpawner, currentTime);
                    break;
                }
                continue;
            }
            for (const taskSpawner of this.getSpawnersByExecuter(taskExecuter.name)) {
                const hasTasks = taskSpawner.hasTasks();
                if(!hasTasks) continue;
                const task = taskSpawner.getTaskByExecuter(taskExecuter.name);
                if (!task) continue;
                const endTime = task.getStopTime();
                if (!endTime) continue;
                if (moment(currentTime).isSameOrAfter(endTime)) {
                    this.completeTask(taskExecuter, task, taskSpawner);
                } else {
                    continue;
                }
                if (taskExecuter.getBusy()) continue;
                const taskToAssign = this.getTaskLifo();
                if (!taskToAssign) continue;
                this.assignTask(taskExecuter, taskToAssign, taskSpawner, currentTime)
                break;
            }
        }
    }

    leastInterval(currentTime: Date): number {
        return Math.min(
            ...this.taskSpawners
                .map(taskSpawner => taskSpawner.timeForNextTask(currentTime)).filter((time) => time > 0)
        )
    }

    update(currentTime: Date): void {
        for (const taskSpawner of this.taskSpawners) {
            taskSpawner.generateTask(currentTime)
        }
        this.manageTasks(currentTime);
        console.log(`TaskScheduler ${this.name} updated at ${currentTime.toISOString()}`);
    }

    private completeTask(taskExecuter: TaskExecuter, task: Task, taskSpawner: TaskSpawner): void {
        taskSpawner.deleteTask(task);
        taskExecuter.setBusy(false);
    }

    private assignTask(taskExecuter: TaskExecuter, task: Task, taskSpawner: TaskSpawner, currentTime: Date) {
        const taskStarted = taskSpawner.startTask(task, taskExecuter.getName(), currentTime)
        taskExecuter.setBusy(taskStarted);
    }
    private getSpawnersByExecuter(executerName: string): TaskSpawner[] {
        return this.taskSpawners.filter(taskSpawner => taskSpawner.executersAssigned.includes(executerName));
    }

    private getTaskLifo(executerName: string): Task | undefined {
        for (const taskSpawner of this.getSpawnersByExecuter(executerName)) {
            const tasks = taskSpawner.getTasks().filter(task => !task.getExecuterAssigned())
            if(tasks.length === 0) continue;
            return tasks[0]
        }
    }

    private getTaskFifo(executerName: string): Task | undefined {
        for (const taskSpawner of this.getSpawnersByExecuter(executerName)) {
            const tasks = taskSpawner.getTasks()
            for (let i = tasks.length; i >= 0; i--) {
                const task = tasks[i]
                if (!task.getExecuterAssigned())
                    return task;
            }
        }
    }
}