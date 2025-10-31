#!/usr/bin/env bash

DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -ex

giturl=$(git config --get remote.origin.url)

git clone -b dev ${giturl%.git}_conf.git conf
