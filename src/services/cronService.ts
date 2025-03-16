import cron from "node-cron";

import { updateTree } from "./treeService";

let task: cron.ScheduledTask | null = null;

export const startUpdateDaemon = () => {
    if (!task) { 
        task = cron.schedule("* * * * *", () => updateTree());
        console.log("Cron job started...");
    }
};

export const stopUpdateDaemon = () => {
    if (task) {
        task.stop(); 
        console.log("Cron job stopped...");
        task = null; 
    } else {
        console.log("No cron job running...");
    }
};

export default startUpdateDaemon;
