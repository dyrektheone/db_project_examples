import chalk from "chalk";
import { LogType } from "../models/LogType";

export function logger(text: string, type: LogType = LogType.Info){
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const time:string = `[${chalk.blueBright(`${hours}:${minutes}:${seconds}`)}]`;

    let typeText:string = `[${chalk.blue("INFO")}]`

    switch(type){
        case LogType.Success:
            typeText = `[${chalk.green("SUCCESS")}]`
            break;
        case LogType.Error:
            typeText = `[${chalk.red("ERROR")}]`
            break;    
        case LogType.Warning:
            typeText = `[${chalk.yellow("WARNING")}]` 
            break;
    }


    console.log(`      ${time} ${typeText} ${text}`)
}