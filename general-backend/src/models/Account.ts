export class Account {
    identifier:string;
    email:string;
    username:string;

    constructor(identifier: string, email: string, username: string){
        this.identifier = identifier;
        this.email = email;
        this.username = username;
    }
}