#!/bin/sh

git submodule init
git submodule update --recursive

yarn run server:builddev
yarn run server:server

# tail -f /dev/null