declare module "node-cron" {
    export type ScheduledTask = {
        start: () => void;
        stop: () => void;
        destroy: () => void;
        validate: (expression: string) => boolean;
    };

    export function schedule(expression: string, callback: () => void, options?: { scheduled?: boolean; timezone?: string }): ScheduledTask;
}
