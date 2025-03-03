import chalk from "chalk";

export const alert = (msg: string) => {
    console.log(chalk.red(msg));
}

export const status = (msg: string) => {
    console.log(chalk.bgYellow(msg));
}

export const success = (msg: string) => {
    console.log(chalk.bgGreen(msg));
}

export const info = (msg: string) => {
    console.log(chalk.bgBlue(msg));
}
