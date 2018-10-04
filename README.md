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

To open Postgres terminal on Ubuntu run:
```
$> sudo -u postgres psql
```
or in Windows:
```
$> psql -h localhost -p 5432 -U postgres
```

------------------------------------

If you are using Ubuntu and you will ecounter authentication error during **server startup** (npm run server:server) check this topic:
https://stackoverflow.com/questions/18664074/getting-error-peer-authentication-failed-for-user-postgres-when-trying-to-ge

Also, remember to check host, username, password etc. properties in application's database config file.
Database's config file for server application is ./src/server/config.ts

**!!! Currently only developement config is being used from ./src/server/config.ts**

## Running the app

PS C:\Users\Jakub\Documents\alvis-web-editor> docker exec -it alviswebeditor_frontend_1 sh
PS C:\Users\Jakub\Documents\alvis-web-editor> docker-compose up


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


TO DO:
- create interfaces with fields which can be modified in Records related to Alvis project; for example for IAgent
- store internalId as number not string
- add yarn.lock in backend Docker file
- think about searching agents by name not by ids in tests and use in tests some realworld examples, not abstract ones to make tets more clear.
- allow editing the same diagram by many people like in Draw.io
- implement checking syntax correctness of model (maybe using window.requestIdleCallback() ?)


To test app:
docker exec -it alviswebeditor_frontend_1 sh
yarn test

INTERESTING IDEA:
- what about using GUID as id for elements of Alvis diagram? We would not have to keep lastInternalId in store.
  We would also be able to assign IDs without knowing the last assigned ID. 
  Should we care about uniqueness of GUID?
  What about performance of generating UID during applying modification? Maybe it might be optimized by generating 
  some quantity before (on the off-chance - na zapas)?;
  https://stackoverflow.com/questions/39771/is-a-guid-unique-100-of-the-time
- what about storing Alvis diagram elements in maps, so that to get element by ID we basically need constant time?