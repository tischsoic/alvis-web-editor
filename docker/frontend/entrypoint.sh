#!/bin/sh

git submodule init
git submodule update --recursive

# yarn run client:devserver
tail -f /dev/null