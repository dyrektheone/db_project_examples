import mysql from 'mysql2/promise';

export async function db(){
    const connection = await mysql.createConnection({
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        connectTimeout: 30000
    });
    return connection;
}