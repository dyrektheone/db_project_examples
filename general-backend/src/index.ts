import express, { Express } from 'express';
import bodyParser from 'body-parser';

import auth from './routes/auth';

import dotenv from 'dotenv';
import { logger } from './utils/logger';
import chalk from 'chalk';
import { LogType } from './models/LogType';
import cors from 'cors';

dotenv.config();

const app: Express = express();
let port:number = Number(process.env.PORT) || 3000;

app.use(bodyParser.json());
app.use(cors());

app.use("/auth",auth);

console.clear();
console.log(chalk.red(`

   ███████╗███████╗██╗   ██╗███████╗              ███╗   ██╗██╗     
   ╚══███╔╝██╔════╝██║   ██║██╔════╝              ████╗  ██║██║     
     ███╔╝ █████╗  ██║   ██║███████╗    █████╗    ██╔██╗ ██║██║      
    ███╔╝  ██╔══╝  ██║   ██║╚════██║    ╚════╝    ██║╚██╗██║██║     
   ███████╗███████╗╚██████╔╝███████║              ██║ ╚████║███████╗
   ╚══════╝╚══════╝ ╚═════╝ ╚══════╝              ╚═╝  ╚═══╝╚══════╝

`));


process.on("uncaughtException",(error:Error)=>{
  if(error.message.includes("EADDRINUSE")){
    logger(`Port ${port} already in use, increasing and trying again!`,LogType.Error);
    port++;
    startApp();
  }
})
startApp();

function startApp(){
  app.listen(port, () => {
   logger("General backend server starting up...");
   setTimeout(() => {
    logger(`Listening on [...]:${port}`);
    logger("Registered category from auth.ts")
   }, 250);
})
}