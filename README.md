# Alvis Web Editor
Alvis Web Editor is application for managing Alvis projects. Alvis is programming language, which syntax consists of two layers:
- graphical - diagrams
- normal code   

## Running the app using Docker

To start the application run: 
```
$>  git clone https://github.com/tischsoic/alvis-web-editor.git app
$>  cd app
$>  sudo docker-compose up
```

in another terminal session:
```
$>  sudo docker exec --user 1000 -it awe-docker-test_frontend_1 sh
$>  yarn install
$>  git submodule init
$>  git submodule update --recursive
$>  yarn client:devserver
```

in another terminal session:
```
$>  sudo docker exec --user 1000 -it awe-docker-test_backend_1 sh
$>  yarn install
$>  yarn server:builddev
$>  yarn server:server
```

Now the app should be available at: http://localhost:3001/client/ (**remember about slash at the end**)

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

## Good to know

When it comes to providing static files for website in dev-mode it is managed by dev-server.js from client; in case of production mode, static files are managed by server.

Hmmmm, when you place `dist` directory for `server` bundle in root folder of the project, you would get errors because `require` does not find packages from `node_modules`. It's because `__dirname` points to directory in which the bundle is located and when it looks for `node_modules` it looks in `__dirname` directory and subderectories. So, if server `bundle` is located in `/home/b27/Documents/alvis-web-editor/dist/server/bundle.js` it looks for it in `/home/b27/Documents/alvis-web-editor/dist/server`, `/home/b27/Documents/alvis-web-editor/dist/`, `/home/b27/Documents/alvis-web-editor/` and so on... but node_modules for server are actually in another branch - `/home/b27/Documents/alvis-web-editor/server/node_modules`.
I didn't tested it precisely but it seems to be right explanation to problem which I encountered.

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
- maybe set UUIDs in constructor of every record automatically?
- what about cases when you are adding connected items - e.g. agent with port - then agent will have id of the port
  how we can ensure that during processing modification to agent, which already has assigned port, won't be assigned port again?
  we should use Sets instead of lists, and we should use union, intersection etc. with set
  Actually, we do not have this problem, we don't need to save in agent record information that it is connected to port.
  We had problem, but it was caused by undefined ID of agent during creation of agent and port - this problem was
  solved by using UUID.
  We have small performance problem if during removing hierarchy we dont want to copy whole tree, but we dont need to copy
  whole tree actually; we only need to change records of agents from subpage, the rest sub-pages of sub-page (and deeper)
  stay unchanged and we don't need to modify them and Immutable should keep track of them - it won't duplicate them.
- I should acquaint more carefully with Immutable.js to use its full potential
- instead of making Electron app, for desktop, better solution might be PWA - Progressive Web App
  
  One more problem, which we have is providing undo-redo for single page - so that you can undo-redo withing single page,
  this can be solved by assuming that every change is happening within every page and by saving information about
  which page is affected by given modification withing modification record.
  Removing hierarchy would be cross-page modification but it should be fine - we delete page BUT! During modification like that 
  (removing hierarchy) should we also remove subpage modifications from list of modifications?
  We don't have to - they will disappear after closing of the application

  When it comes to cross-page modifications we may mark them as global modifications, this should work.

  No, better idea would be to mark each modification to which pages it belongs.
  - Deleting agent with subpage will belong only to page with the agent, but
  - modification of position of two agents from two different pages would belong to two different pages.

  This makes sense to me, and
  - removing hierarchy would belong to THE agent's page and modification would consist of removing old agent and replacing it with copied items from its subpage.
