import Task from "./Task";
import moment from "moment";

export interface TaskSpawnerInterface {
    getName(): string;

    getTasks(): Task[];

    getTaskInterval(): number;

    generateTask(currentTime: Date): void

    getTaskByExecuter(workerName: string): Task | undefined;
}

export default class TaskSpawner implements TaskSpawnerInterface {
    public readonly name: string;
    public readonly priority: number;
    public readonly executersAssigned: string[];
    private tasks: Task[];
    private taskInterval: number;
    private readonly tasksToSpawn: number;
    private taskTemplate: Task;

    constructor(name: string, taskTemplate: Task, taskInterval: number, priority: number, executersAssigned: string[]) {
        this.name = name;
        this.tasks = [];
        this.taskInterval = taskInterval;
        this.tasksToSpawn = 1;
        this.taskTemplate = taskTemplate;
        this.priority = priority;
        this.executersAssigned = [];
    }

    public getName(): string {
        return this.name;
    }

    public setTasks(tasks: Task[]) {
        this.tasks = tasks
    }

    public getTaskInterval(): number {
        return this.taskInterval;
    }

    public timeForNextTask(currentTime: Date): number {
        const currentTimeMoment = moment(currentTime);
        const nextTaskTime = currentTime.getMinutes() % this.taskInterval;
        const timeForNextTaskComplete = Math.min(...this.tasks.map(task => {
            return currentTimeMoment.diff(moment(task.getStopTime()), 'minutes');
        }))
        return Math.min(nextTaskTime, timeForNextTaskComplete);
    }

    public getPriority(): number {
        return this.priority;
    }

    public generateTask(currentTime: Date): void {
        if (currentTime.getMinutes() % this.taskInterval === 0) {
            for (let i = 0; i < this.tasksToSpawn; i++) {
                const newTask: Task = structuredClone(this.taskTemplate)
                this.tasks.push(newTask)
            }
        }
    }

    public getTaskByExecuter(executerName: string): Task | undefined {
        if (!this.executersAssigned.includes(executerName)) return undefined;
        const task = this.tasks.find(task => {
            const executerAssigned = task.getExecuterAssigned();
            return executerAssigned === executerName;
        })
        if (!task) return undefined;
        const taskIndex = this.tasks.indexOf(task)
        return task;
    }

    public getTaskIndex(task: Task) {
        return this.tasks.indexOf(task)
    }

    public deleteTask(taskIndex: number): void {
        this.tasks = this.tasks.splice(taskIndex, 1);
    }

    public startTask(taskIndex: number, executerAssigned: string, currentTime: Date): void {
        const task = this.tasks[taskIndex];
        task.start(executerAssigned, currentTime)
    }

    public getTasks(): Task[] {
        return this.tasks;
    }
}



