import { Request, Response } from "express";
import { IRegisterBody } from "../models/IRegisterBody";
import { db } from "../utils/db";
import { v4 } from "uuid";
import config from "../utils/config";
import bcrypt from 'bcrypt';
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { IVerifyBody } from "../models/IVerifyBody";
import { ILoginBody } from "../models/ILoginBody";
import { ExecException } from "child_process";

export async function register(request: Request, response: Response) {
    const { email, password, username }: IRegisterBody = request.body;
    const conn = await db();

    if (!email || !password || !username) {
        response.status(400).send({ success: false, message: "Minden mező kitöltése kötelező!" });
        console.log(`register route handled (400) user error`)

        return;
    }

    if (username.length < config.RegisterOptions.Username_Length[0] || username.length > config.RegisterOptions.Username_Length[1]) {
        response.status(400).send({ success: false, message: "A felhasználónév nem felel meg a kritériumoknak!" });
        console.log(`register route handled (400) user error`)

        return;
    }

    if (password.length < config.RegisterOptions.Password_Length[0] || password.length > config.RegisterOptions.Password_Length[1] || !config.RegisterOptions.Password_Regex.test(password)) {
        response.status(400).send({ success: false, message: "A jelszó nem felel meg a kritériumoknak!" });
        console.log(`register route handled (400) user error`)

        return;
    }

    if (!config.RegisterOptions.Email_Regex.test(email)) {
        response.status(400).send({ success: false, message: "Érvénytelen e-mail cím!" });
        console.log(`register route handled (400) user error`)

        return;
    }

    const [rows] = await conn.execute<RowDataPacket[]>("SELECT identifier FROM accounts WHERE email = ? OR username = ?", [email, username]);
    if (rows.length !== 0) {
        response.status(400).send({ success: false, message: "Az e-mail cím és/vagy a felhasználónév már használatban van!" })
        console.log(`register route handled (400) user error`)
        
        return;
    }

    try {
        const identifier = v4();

        const salt = await bcrypt.genSalt(Math.floor(Math.random() * 10));
        const verifyToken = await bcrypt.hash(email, salt);

        await conn.execute("INSERT INTO accounts (identifier, email, username, password, verify) VALUES(?, ?, ?, SHA2(?,512), ?)", [
            identifier, email, username, password, verifyToken
        ]);

        response.status(200).send({ success: true, message: "Sikeres regisztráció", verify: verifyToken });
        console.log(`register route handled (200) OK`);
        return;
    } catch (ex) {
        console.log(`Error while registering user: ${ex}`)
        response.status(500).send({ success: false, message: "Szerver hiba" });
        console.log(`register route handled (500) SQL error`)
        return;
    }
}

export async function verify(request: Request, response: Response){
    const { token }: IVerifyBody = request.body;

    if(!token){
        response.status(400).send({success:false,message:"Hiányzó token!"});
        return;
    }

    const conn = await db();
    try{
        const rows = await conn.execute<ResultSetHeader>("UPDATE accounts SET verify = NULL WHERE verify = ?",[token]);
        if(rows[0].affectedRows===0){
            response.status(400).send({success:false,message:"Érvénytelen token!"})
            return;  
        }
        response.status(200).send({success:false,message:"Sikeres megerősítés!"})
        return;
    } catch {
        response.status(500).send({success:false,message:"Szerver hiba"});
        return;
    }
}