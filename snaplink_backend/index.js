import chalk from 'chalk';
import express from 'express';
import mysql from 'mysql';
import bodyParser from 'body-parser';
import cors from 'cors';

function print(msg){
    const p = chalk.bgRgb(50,235,255)
    const current = new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    console.log(chalk.bold(p((`SARAH @ ${current}`))) + " " + msg)
}

const app = express();
const addresses = [3050,"192.168.115.114"]

var connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"root",
    database:"snaplink"
})
connection.connect((err)=>{
    console.clear()
    if(err){
        print(chalk.red("Error occured while connecting to the database. Error: "+err))
        return
    }
    print(chalk.greenBright("Database connection established"))
    app.listen(addresses[0],addresses[1],()=>{
        print(chalk.greenBright(`Server listening on ${addresses[1]}:${addresses[0]}`))
    })
})

app.use(cors())
app.use(bodyParser.json({limit:"5mb"}));

app.post("/new",(req,res)=>{
    if(!req.body.url){
        res.sendStatus(400)
        print(chalk.magenta("POST - new >>> ")+chalk.red("400 - Bad Request"))
        return 
    }

    connection.query(`INSERT INTO links (original,redirect,token) VALUES (\"${req.body.url}\",LEFT(UUID(),8),HEX(RANDOM_BYTES(64))) RETURNING redirect,token;`,(err,results)=>{
        if(err){
            print(chalk.red("MySQL error while creating new shortcut: "+err.message))
            return 
        }
        res.setHeader("Content-Type","application/json")
        res.status(200).send(JSON.stringify({redirect:results[0].redirect,token:results[0].token}))
        print(chalk.magenta("POST - new >>> ")+chalk.green("200 - OK"))
    })
})

app.post("/original",(req,res)=>{
    if(!req.body.redirect){
        res.sendStatus(400)
        print(chalk.magenta("POST - original >>> ")+chalk.red("400 - Bad Request"))
        return 
    }

    connection.query(`SELECT original FROM links WHERE redirect = \"${req.body.redirect}\"`,(err,results)=>{
        if(err){
            print(chalk.red("MySQL error while getting the original URL: "+err.message))
            return 
        }
        let url = null
        if(results.length>0)
            url = results[0].original

        if(url!==null){
            connection.query(`UPDATE links SET visits = visits + 1 WHERE redirect = \"${req.body.redirect}\"`,(err,results)=>{
                if(err){
                    print(chalk.red("MySQL error while increasing total visits: "+err.message))
                    return 
                } 
            })
        }

        res.setHeader("Content-Type","application/json")
        res.status(200).send(JSON.stringify({url:url || null}))
        print(chalk.magenta("POST - original >>> ")+chalk.green("200 - OK"))
    })
})

app.post("/authorize",(req,res)=>{
    if(!req.body.redirect || !req.body.token){
        res.sendStatus(400)
        print(chalk.magenta("POST - authorize >>> ")+chalk.red("400 - Bad Request"))
        return 
    }

    connection.query(`SELECT visits,original FROM links WHERE redirect = \"${req.body.redirect}\" AND token = \"${req.body.token}\"`,(err,results)=>{
        if(err){
            print(chalk.red("MySQL error while authorizing URL owner: "+err.message))
            return 
        }
        let visits = -1
        let original = ""
        if(results.length>0){
            visits = results[0].visits
            original = results[0].original
        }

        res.setHeader("Content-Type","application/json")
        res.status(200).send(JSON.stringify({visits:visits,url:original}))
        print(chalk.magenta("POST - authorize >>> ")+chalk.green("200 - OK"))
    })
})

app.post("/delete",(req,res)=>{
    if(!req.body.token){
        res.sendStatus(400)
        print(chalk.magenta("POST - delete >>> ")+chalk.red("400 - Bad Request"))
        return 
    }

    connection.query(`DELETE FROM links WHERE token = \"${req.body.token}\"`,(err,results)=>{
        if(err){
            print("MySQL error while deleting shortcut: "+err.message)
            return;
        }

        res.sendStatus(200)
        print(chalk.magenta("POST - delete >>> ")+chalk.green("200 - OK"))
    })
})