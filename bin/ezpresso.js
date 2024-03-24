#! /usr/bin/env node

import Handlebars from 'handlebars';
import promptSync from 'prompt-sync';
import minimist from 'minimist';
import path, { dirname } from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prompt = promptSync();
const argv = minimist(process.argv.slice(2));

const log = console.log;
const done = chalk.green;
const err = chalk.red;
const info = chalk.blueBright;
const cancel = process.exit;

const templates = path.join(__dirname, "..", '/templates');


Handlebars.registerHelper('capitalize', function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
});



const scriptTypes = ['service', 's', 'controller', 'c', 'model', 'm'];



const script = argv._[0];

if(script === "create") {
    
    console.log('Creating new project');
    const projectName =  argv._[1];
    const workingDir = path.join(process.cwd(), projectName);
    
    const dirs = ['src', 'src/controllers', 'src/db', 'src/logger', 'src/middleware', 'src/models', 'src/services', 'src/utils'];
    const sourceDir = path.join(templates, 'typescript', 'express');
    
    const files = [
        {
            from: '.env',
            to: './.env'
        },
        {
            from: '.gitignore',
            to: "./.gitignore"
        },
        {
            from: 'nodemon.json',
            to: './nodemon.json'
        },
        {
            from: 'tsconfig.json',
            to: './tsconfig.json'
        },
        {
            from: './db.txt',
            to: 'src/db/connect.ts',
        },
        {
            from: 'logger.txt',
            to: 'src/logger/index.ts'
        },
        {
            from: 'app.txt',
            to: 'src/app.ts'
        },
        {
            from: 'routes.txt',
            to: 'src/routes.ts'
        },
        {
            from: 'utils.txt',
            to: 'src/utils/index.ts'
        }
    ];

   

    try {

        // * GENERATE PACKAGE JSON

        const jsonData = getInputs(projectName);
        

        const generatedPackage = parseTemplate(path.join(sourceDir, 'package.hbs'), jsonData);

        

        // * CREATE PROJECT DIR

        if(fs.existsSync(workingDir)) {
            log(err("already exists"));

            // TODO ask if you want to overwrite 
        } else {
            fs.mkdirSync(workingDir);
        }

        log(done('CREATED project dir'));

        // * CREATE DIRS
        
        dirs.forEach(dir => {
            fs.mkdirSync(path.join(workingDir, dir));
            log(done(`CREATED `), dir);
        });

        log(done('CREATED Structure'));

        // * CREATE FILEs
        files.forEach(file => {
            const currPath = path.join(sourceDir, file.from);
            const copyPath = path.join(workingDir, file.to);


            fs.copyFileSync(currPath, copyPath);

            log(done('CREATED '), file.to);

        });

        log(done('CREATED files'));

        fs.writeFileSync(path.join(workingDir, 'package.json'), generatedPackage);
        log(done('CREATED '), 'package.json');

        // * NPM INSTALL SCRIPT

        log(info("RUNNING "), 'npm install');

        
        process.chdir(path.join(workingDir));
        const npmInstall = spawn('npm', ['install'], { stdio: 'inherit' });
        
        npmInstall.on('error', (error) => {
            log(err(`Error: ${error.message}`));
        });

        npmInstall.on('exit', (code, signal) => {
            if (code === 0) {
                console.log(done('npm install completed successfully.'));
            } else {
                console.error(`npm install failed with code ${code}`);
            }
        });
    
    } catch(e) {
        log(err(e));
    }
    

} else if (script === "generate" || script === 'g') {

    const scriptName = argv._[1];

    const controller = argv.c || argv.controller;
    const service = argv.s || argv.service;
    const model = argv.m || argv.model;
    const all = argv.a || argv.all;

    const projectDir = path.join(process.cwd(), 'src');
    
    if(all) {
        generateFile(projectDir, scriptName, 'model');
        generateFile(projectDir, scriptName, 'service');
        generateFile(projectDir, scriptName, 'controller');
    } else {
        if(controller) {
            generateFile(projectDir, scriptName, 'controller');
        }
        
        if(service) {
            generateFile(projectDir, scriptName, 'service');
        }
    
        if(model) {
            generateFile(projectDir, scriptName, 'model');
        }
    }

    


    // if(controller) {
    //     generateFile(projectDir, scriptName, 'controller');
    // } else if (service) {
    //     generateFile(projectDir, scriptName, 'service');
    // } else if (model) {
    //     generateFile(projectDir, scriptName, 'model');
    // } else if (all) {
    //     generateFile(projectDir, scriptName, 'model');
    //     generateFile(projectDir, scriptName, 'service');
    //     generateFile(projectDir, scriptName, 'controller');
    // } else {
    //     log(err('Unknown flags'));
    //     process.exit(1);
    // }


} else {
    // Unknown script, display help;
    console.error('No Script');
}

function parseTemplate(templateLoc, data) {
    const templateString = fs.readFileSync(templateLoc, 'utf-8');
    const template = Handlebars.compile(templateString);
    return template(data);
}

function generateDir(dirName) {
    
    if(fs.existsSync(dirName)) return

    fs.mkdirSync(dirName);
}

function generateFile(projectDir, name, type) {

    let tempType = `${type}.hbs`

    const templateFile = path.join(templates, 'typescript', tempType);
    const file = parseTemplate(templateFile, {name});
    const fileName = `${name}.${type}.ts`;
    let contDir = path.join(projectDir, `${type}s`);


    generateDir(contDir);

    fs.writeFileSync(path.join(contDir, fileName), file);

    log(done("CREATED "), `src/${type}s/${fileName}`)

}




function getInputs(setName) {
    const name = prompt(`Project name (${setName}) => `) || setName;
    const version = prompt('Version (1.0.0) => ') || '1.0.0';
    const description = prompt('Description => ') || '';
    const main = prompt('Main File: (index.js) => ') || 'index.js';
    const author = prompt('Author => ') || '';
    const license = prompt('License (ISIC) => ') || 'ISIC';

    return {
        name,
        version,
        description,
        main,
        author,
        license
    }
}



