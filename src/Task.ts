import moment from 'moment'
export interface TaskInterface {
    getStartTime(): Date | undefined;
    getStopTime(): Date | undefined;
    getWorkerAssigned(): string;
    setWorkerAssigned(workerAssigned: string): void;
    start(startTime: Date): void;

}

export default class Task implements TaskInterface {
    public readonly name: string;
    public readonly duration: number;
    private startTime?: Date;
    private stopTime?: Date;
    private workerAssigned?: string;

    constructor(name: string, duration: number) {
        this.name = name;
        this.duration = duration;
    }

    public getStartTime(): Date | undefined  {
        return this.startTime ?? undefined;
    }
    
    public getStopTime(): Date | undefined {
        return this.stopTime;
    }
    public getWorkerAssigned(): string {
        return this.workerAssigned ?? '';
    }
    public setWorkerAssigned(workerAssigned: string): void {
        this.workerAssigned = workerAssigned;
    }
    public start(startTime: Date): void {
        this.startTime = startTime;
        const stopTimeMoment = moment(startTime).add({ minutes: this.duration})
        this.stopTime = stopTimeMoment.toDate();
    }
}