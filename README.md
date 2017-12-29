# Alvis Web Editor
Alvis Web Editor is application for managing Alvis projects. Alvis is programming language, which syntax consists of two layers:
- graphical - graphs
- normal code   

## Installation

Application needed to be installed before you can run app: Node.js, npm, webpack, typescript (can it be in dependencies?).

To run app after cloning repository execute:
```
$> npm install
```
to get npm packages.

```
$> git submodule update --recursive
```
in order to get git submodule with TypeScript types declarations for mxGraph library.
**Be careful! These declaration files in order to work (mxGraph exports function as module) were placed in _node\_modules_ so if you delete this directory you have to again execute this command to get mxGraph Typescript types.**

To compile code and create bundle execute:
```
$> webpack
```

In Order to run fronend dev server execute:
```
$> node dev-server.js
```

In Order to run backend server execute:
```
$> node dist/server.js
```


To Do:
- do we need to call "git submodule init" ???
