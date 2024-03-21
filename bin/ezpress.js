#! /usr/bin/env node

// import { generatePackage } from './generatePackage';
import promptSync from 'prompt-sync';
import minimist from 'minimist';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prompt = promptSync();
const argv = minimist(process.argv.slice(2));

const log = console.log;
const succ = chalk.green;
const err = chalk.red;
const cancel = process.exit;

const templates = "templates/";

console.log(argv);



const scriptTypes = ['service', 's', 'controller', 'c', 'model', 'm'];

// const positionArgs = argv._;

const script = argv._[0];

if(script === "create") {
    
    console.log('Creating new project');
    const workingDir = path.join(process.cwd(), argv._[1]);
    log(succ('Current working dir ', workingDir));
    
    const dirs = ['src', 'src/controllers', 'src/db', 'src/logger', 'src/middleware', 'src/models', 'src/services', 'src/utils'];
    const sourceDir = path.join(__dirname, "..", templates, 'typescript', 'express');
    
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
            from: '',
            to: '',
        }
    ];

   

    try {

        // * CREATE PROJECT DIR

        if(fs.existsSync(workingDir)) {
            log(err("already exists"));

            // TODO ask if you want to overwrite 
        } else {
            fs.mkdirSync(workingDir);
        }


        // * CREATE DIRS
        
        dirs.forEach(dir => {
            fs.mkdirSync(path.join(workingDir, dir));
        });

        // * CREATE FILEs
        files.forEach(file => {
            const currPath = path.join(sourceDir, file.from);
            const copyPath = path.join(workingDir, file.to);

            fs.copyFileSync(currPath, copyPath);
        });

    } catch(e) {
        log(err(e));
    }
    

} else if (script === "genereate" || script === 'g') {
    
    console.log('Generating new file');
    const scriptType = argv._[1];

    if (!scriptTypes.includes(scriptType)) console.error('Unknown function');



} else {
    // Unknown script, display help;
    console.error('No Script');
}


// console.log(workingDir);


// function getInputs() {
//     const name = prompt('Project name (arg) => ') || 'arg';
//     const version = prompt('Version (1.0.0) => ') || '1.0.0';
//     const description = prompt('Description => ') || '';
//     const main = prompt('Main File: (index.js) => ') || 'index.js';
//     const author = prompt('Author => ') || 'arg';
//     const license = prompt('License (ISIC) => ') || 'ISIC';

//     generatePackage(name, description, version, main, author, license);
// }



function generateStructure() {

}











// console.log("Hello, World!");


