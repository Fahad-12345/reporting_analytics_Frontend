#!/bin/bash

# Update Git repo
git pull origin develop

# install any missing dependancy
npm install

# Make Build
npm run build:stage