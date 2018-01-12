# Alvis Web Editor
Alvis Web Editor is application for managing Alvis projects. Alvis is programming language, which syntax consists of two layers:
- graphical - diagrams
- normal code   

## Installation

Applications needed to be installed before you can run the app: **Node.js, npm, webpack, typescript, PortgreSQL**. 

After you installed required software you can go to main app folder and...

In order to install required npm dependencies execute:
```
$> npm install
```

Run these commands:
```
$> git submodule init
$> git submodule update --recursive
```
in order to get git submodule with TypeScript types declarations for mxGraph library.
**Be careful!** These declaration files in order to work (because mxGraph exports function as module) were placed in _node\_modules_ so if you delete this directory or you will run _npm install_ you have to again execute this git command to get mxGraph Typescript types.

### Database

To create database:
- open terminal in folder: _./src/server_
- open Postgres terminal
- run in postgres' terminal command: 
```
postgres=# \i db.sql
```

------------------------------------

To open Posgres terminal on Ubuntu run:
```
sudo -u postgres psql
```

------------------------------------

If you are using Ubuntu and you will ecounter authentication error during **server startup** (npm run server:server) check this topic:
https://stackoverflow.com/questions/18664074/getting-error-peer-authentication-failed-for-user-postgres-when-trying-to-ge

Also, remember to check host, username, password etc. properties in application's database config file.
Database's config file for server application is ./src/server/config.ts

**!!! Currently only developement config is being used from ./src/server/config.ts**

## Running the app

There are few npm commands and you run them by executing:
```
$> npm run <command\_name>
```
Commands are:
- client:build - builds production client
- client:builddev - builds dev client
- server:build - builds production server
- server:builddev - builds dev server
- client:server - builds and runs dev client
- server:server - runs servers, dev or production depending on build

--------------------------------------

To set up app in **developement** environment run (e.g. npm run client:devserver):
- client:devserver
- server:builddev
- server:server

Now the app should be available at: http://localhost:3000 (**wihtout slash at the end**)

--------------------------------------

To set up app in **production** environment run (e.g. npm run client:build):
- client:build (execution of this command may take a while)
- server:build
- server:server

Now the app should be available at: http://localhost:3001/client/ (**remember about slash at the end**)

--------------------------------------

Default user, which is insertred into database during creation is:
- email: admin@agh.edu.pl
- password: admin (if you change salt for SHA-512 algorithm it will stop woriking)


--------------------------------------