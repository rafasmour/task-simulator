import TaskReporter from "./TaskReporter";
import TaskScheduler from "./TaskScheduler";
import moment from "moment";

export interface TaskSimulatorInterface {
    start(): void;
}

export default class TaskSimulator implements TaskSimulatorInterface {
    constructor(
        public readonly name: string,
        private report: TaskReporter,
        private scheduler: TaskScheduler,
        private startTime: Date,
        private endTime: Date,
    ) {
    }

    start(): void {
        const currentTimeMoment = moment(this.startTime);
        do {
            this.scheduler.update(currentTimeMoment.toDate())
            this.report.appendReport(
                `Tasks managed at ${currentTimeMoment.format('YYYY-MM-DD HH:mm:ss')}`,
                currentTimeMoment.toDate()
            )
            console.log(`Tasks managed at ${currentTimeMoment.format('YYYY-MM-DD HH:mm:ss')}`);
            currentTimeMoment.add(
                this.scheduler.leastInterval(currentTimeMoment.toDate()),
                'minutes'
            )
        } while (currentTimeMoment.isSameOrBefore(this.endTime))
    }
}