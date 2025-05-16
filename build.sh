#!/bin/bash

# Update Git repo
git pull origin development

# install any missing dependancy
npm install

# Make Build
npm run build:prod