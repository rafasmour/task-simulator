import Task from "./Task";

export interface TaskSpawnerInterface {
    getName(): string;
    getTasks(): Task[];
    getTaskInterval(): number;
    getPriority(): number;
    getWorkersAssigned(): string[];
    generateTask(currentTime: Date): void
    getTaskByWorker(workerName: string): Task | undefined;
}

export default class TaskSpawner implements TaskSpawnerInterface {
    public readonly name: string;
    private tasks: Task[];
    private taskInterval: number;
    private taskDuration: number;
    public readonly priority: number;
    public readonly executersAssigned: string[];
    private taskTemplate: Task;
    constructor(name: string, taskTemplate: Task, taskInterval: number, taskDuration: number, priority: number, workersAssigned: string[]) {
        this.name = name;
        this.tasks = [];
        this.taskInterval = taskInterval;
        this.taskDuration = taskDuration;
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
    public getPriority(): number {
        return this.priority;
    }
    public generateTask(currentTime: Date): void {
        if(currentTime.getMinutes() % this.taskDuration === 0) {
            const newTask: Task = structuredClone(this.taskTemplate)
            this.tasks.push(newTask)
        }
    }
    public getTaskByExecuter(executerName: string): Task | undefined { 
        if(!this.executersAssigned.includes(executerName)) return undefined;
        const task = this.tasks.find(task => {
            const workerAssigned = task.getWorkerAssigned();
            return workerAssigned === executerName;
        })
        if(!task) return undefined;
        const taskIndex = this.tasks.indexOf(task)
        return task;
    }
    public getTaskIndex(task: Task) {
        return this.tasks.indexOf(task)
    }
    public deleteTask(taskIndex: number):void {
        this.tasks = this.tasks.splice(taskIndex, 1);
    }
    public startTask(taskIndex: number, workerAssigned: string, currentTime: Date): void {
        const task = this.tasks[taskIndex];
        task.start(workerAssigned, currentTime)
    }
}



