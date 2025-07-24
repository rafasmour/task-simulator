export interface TaskReporterInterface {
    appendReport(report: string, time: Date): void;
    getReport(): Record<string, string>;
}

export default class TaskReporter implements TaskReporterInterface {
    private name: string;
    private report: Record<string, string>;

    constructor(name: string) {
        this.name = name;
        this.report = {};
    }
    public getName(): string {
        return this.name;
    }
    public getReport(): Record<string, string> {
        return this.report;
    }
    public appendReport(report: string, time: Date): void {
        const timestamp = time.toISOString();
        this.report[timestamp] = report;
    }
}