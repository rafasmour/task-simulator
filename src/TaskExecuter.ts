export interface TaskExecuterInterface {
    getName(): string;
    getBusy(): boolean;
    setBusy(busy: boolean): void;
}

export default class TaskExecuter implements TaskExecuterInterface {
    public readonly name: string;
    private busy: boolean;

    constructor(name: string) {
        this.name = name;
        this.busy = false;
    }
    getName(): string {
        return this.name;
    }
    getBusy(): boolean {
        return this.busy;
    }
    setBusy(busy: boolean): void {
        this.busy = busy;
    }
}