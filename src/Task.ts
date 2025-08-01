import moment from 'moment'

export interface TaskInterface {
    getStartTime(): Date | undefined;

    getStopTime(): Date | undefined;

    getExecuterAssigned(): string;

    start(executerAssigned: string, startTime: Date): void;

}

export default class Task implements TaskInterface {
    public readonly name: string;
    public readonly duration: number;
    private startTime?: Date;
    private stopTime?: Date;
    private executerAssigned?: string;

    constructor(name: string, duration: number) {
        this.name = name;
        this.duration = duration;
    }

    public getStartTime(): Date | undefined {
        return this.startTime ?? undefined;
    }

    public getStopTime(): Date | undefined {
        return this.stopTime;
    }

    public getExecuterAssigned(): string {
        return this.executerAssigned ?? '';
    }

    public start(executerAssigned: string, startTime: Date): void {
        this.executerAssigned = executerAssigned;
        this.startTime = startTime;
        const stopTimeMoment = moment(this.startTime).add({minutes: this.duration})
        this.stopTime = stopTimeMoment.toDate();
        const stop = this.stopTime;
    }
}