import chalk from "chalk";

export const alert = (msg: string) => {
    console.log(chalk.red(msg));
}

export const status = (msg: string) => {
    console.log(chalk.yellow(msg));
}

export const success = (msg: string) => {
    console.log(chalk.green(msg));
}

export const info = (msg: string) => {
    console.log(chalk.blue(msg));
}
