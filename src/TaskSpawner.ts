import Task from "./Task";
import moment from "moment";

export interface TaskSpawnerInterface {
    getName(): string;

    getTasks(): Task[];

    generateTask(currentTime: Date): void

    getTaskByExecuter(workerName: string): Task | undefined;
}

export default class TaskSpawner implements TaskSpawnerInterface {
    public readonly name: string;
    public readonly priority: number;
    public readonly executersAssigned: string[];
    private tasks: Task[];
    // contains the minutes where tasks should be spawned
    private readonly taskInterval: number[];
    private readonly tasksToSpawn: number;
    private taskTemplate: Task;

    constructor(name: string, taskToSpawn: number, taskTemplate: Task, taskInterval: number, priority: number, executersAssigned: string[]) {
        this.name = name;
        this.tasks = [];
        this.taskInterval = [];
        for (let i = taskInterval; i <= 60; i += taskInterval) {
            this.taskInterval.push(i);
        }
        this.tasksToSpawn = taskToSpawn;
        this.taskTemplate = taskTemplate;
        this.priority = priority;
        this.executersAssigned = executersAssigned;
    }

    public getName(): string {
        return this.name;
    }

    public timeForNextTask(currentTime: Date): number {
        const currentMinutes = currentTime.getMinutes();
        const closestMatch = Math.min(...this.taskInterval.filter((time) => time > currentMinutes));
        if (!closestMatch) return -1;
        const nextTaskSpawn = closestMatch - currentMinutes;
        const leastCompleteTime = moment.min(...this.tasks.filter(task => task.getStopTime() !== undefined).map(task => moment(task.getStopTime())))
        const minutesForNextComplete = moment(leastCompleteTime).diff(moment(currentTime), 'minutes', true /*true means float or precise difference*/);
        const timeForNextTask = Math.min(nextTaskSpawn, minutesForNextComplete);
        return Math.min(...[nextTaskSpawn, minutesForNextComplete].filter(v => v > 0));
    }

    public getPriority(): number {
        return this.priority;
    }

    public generateTask(currentTime: Date): void {
        const currentMinutes = currentTime.getMinutes();
        const interval = this.taskInterval.includes(currentMinutes)
        const isHourly = currentMinutes === 0 && this.taskInterval.includes(60);
        if (interval || isHourly) {
            for (let i = 0; i < this.tasksToSpawn; i++) {
                const newTask: Task = new Task(
                    this.taskTemplate.name,
                    this.taskTemplate.duration
                )
                console.log(`TaskSpawner ${this.name} generated task ${newTask.name} at ${currentTime}`);
                this.tasks.push(newTask)
            }
        }
    }

    public hasTasks(): boolean {
        return this.tasks.length > 0;
    }

    public getTaskByExecuter(executerName: string): Task | undefined {
        if (!this.executersAssigned.includes(executerName)) return undefined;
        const task = this.tasks.find(task => {
            const executerAssigned = task.getExecuterAssigned();
            return executerAssigned === executerName;
        })
        if (!task) return undefined;
        return task;
    }

    public deleteTask(task: Task): void {
        this.tasks = this.tasks.filter((t) => t !== task);
    }

    public startTask(task: Task, executerAssigned: string, currentTime: Date): boolean {
        if (!task) {
            throw new Error(`TaskSpawner ${this.name} could not find task}`);
        }
        task.start(executerAssigned, currentTime)
        return true
    }

    public getTasks(): Task[] {
        return this.tasks;
    }
}



