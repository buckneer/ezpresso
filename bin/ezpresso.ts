#!/usr/bin/env node

import Handlebars from 'handlebars';
import promptSync from 'prompt-sync';
import minimist from 'minimist';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// Determine __filename and __dirname for ES modules.
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

const prompt = promptSync();
const argv = minimist(process.argv.slice(2));

const log = console.log;
const done = chalk.green;
const err = chalk.red;
const info = chalk.blueBright;

// Templates are located in the /templates/express folder.
const templates: string = path.join(__dirname, "..", "templates");

Handlebars.registerHelper('capitalize', function(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
});

const scriptTypes: string[] = ['service', 's', 'controller', 'c', 'model', 'm'];
const script: string = argv._[0];

if (script === "create") {
    console.log('Creating new project');
    const projectName: string = argv._[1];
    const workingDir: string = path.join(process.cwd(), projectName);

    const dirs: string[] = [
        'src',
        'src/controllers',
        'src/db',
        'src/logger',
        'src/middleware',
        'src/models',
        'src/services',
        'src/utils'
    ];
    // Source directory for project templates (adjust if needed)
    const sourceDir: string = path.join(templates, 'typescript', 'express');

    const files: Array<{ from: string; to: string }> = [
        { from: '.env', to: './.env' },
        { from: '.gitignore', to: "./.gitignore" },
        { from: 'nodemon.json', to: './nodemon.json' },
        { from: 'tsconfig.json', to: './tsconfig.json' },
        { from: './db.txt', to: 'src/db/connect.ts' },
        { from: 'logger.txt', to: 'src/logger/index.ts' },
        { from: 'app.txt', to: 'src/app.ts' },
        { from: 'routes.txt', to: 'src/routes.ts' },
        { from: 'utils.txt', to: 'src/utils/index.ts' }
    ];

    try {
        // * GENERATE PACKAGE JSON
        const jsonData: PackageData = getInputs(projectName);
        const generatedPackage: string = parseTemplate(path.join(sourceDir, 'package.hbs'), jsonData);

        // * CREATE PROJECT DIR
        if (fs.existsSync(workingDir)) {
            log(err("Project directory already exists."));
            // TODO: Ask if you want to overwrite.
        } else {
            fs.mkdirSync(workingDir);
        }
        log(done('CREATED project directory'));

        // * CREATE DIRECTORIES
        dirs.forEach((dir) => {
            fs.mkdirSync(path.join(workingDir, dir));
            log(done('CREATED directory: '), dir);
        });
        log(done('CREATED project structure'));

        // * COPY FILES
        files.forEach((file) => {
            const currPath: string = path.join(sourceDir, file.from);
            const copyPath: string = path.join(workingDir, file.to);
            fs.copyFileSync(currPath, copyPath);
            log(done('CREATED file: '), file.to);
        });
        log(done('CREATED files'));

        fs.writeFileSync(path.join(workingDir, 'package.json'), generatedPackage);
        log(done('CREATED file: '), 'package.json');

        // * NPM INSTALL SCRIPT
        log(info("RUNNING "), 'npm install');
        process.chdir(path.join(workingDir));
        const npmInstall = spawn('npm', ['install'], { stdio: 'inherit' });

        npmInstall.on('error', (error: Error) => {
            log(err(`Error: ${error.message}`));
        });

        npmInstall.on('exit', (code: number | null) => {
            if (code === 0) {
                console.log(done('npm install completed successfully.'));
            } else {
                console.error(`npm install failed with code ${code}`);
            }
        });
    } catch (e: any) {
        log(err(e));
    }
} else if (script === "generate" || script === 'g') {

    // Ensure the user is inside a valid project directory.
    const currentDir = process.cwd();
    if (!fs.existsSync(path.join(currentDir, 'package.json')) || !fs.existsSync(path.join(currentDir, 'src'))) {
        console.error(err("Error: You must be inside a valid project directory (with package.json and src folder) to run this command."));
        process.exit(1);
    }



    const validTypes = ["controller", "service", "model", "router", "all"];

    let scriptType = argv._[1]; // Could be "all", "service", "controller", etc.
    let scriptName = argv._[2]; // The entity name (e.g., "user")
    const projectDir: string = path.join(currentDir, 'src');

// If first argument is NOT a valid type, treat it as the script name instead
    if (!validTypes.includes(scriptType)) {
        scriptName = scriptType;
        scriptType = "all"; // Default to "all" if no specific type is provided
    }

// Convert script type to boolean flags
    const all = scriptType === "all";
    const controller = scriptType === "controller";
    const service = scriptType === "service";
    const model = scriptType === "model";
    const router = scriptType === "router";

    if (!scriptName) {
        console.error(chalk.red("❌ Error: No entity name provided!"));
        process.exit(1);
    }



    console.log(chalk.yellow(`🛠️ Processing: scriptName=${scriptName}, all=${all}, controller=${controller}, service=${service}, model=${model}, router=${router}`));

    // Base context for all templates
    const contextBase = {
        name: scriptName,
        Name: scriptName.charAt(0).toUpperCase() + scriptName.slice(1)
    };

    let modelFields: Array<{ name: string, mongooseType: string, required: boolean }> = [];
    // If generating a model (or using "all"), prompt for model fields.
    if (all || model) {
        modelFields = getModelFields();
    }
    // Extend context for model template
    const modelContext = { ...contextBase, fields: modelFields };

    if (all) {
        generateFile(projectDir, scriptName, 'router', contextBase);
        generateFile(projectDir, scriptName, 'model', modelContext);
        generateFile(projectDir, scriptName, 'service', contextBase);
        generateFile(projectDir, scriptName, 'controller', contextBase);
    } else {
        if (controller) {
            generateFile(projectDir, scriptName, 'controller', contextBase);
        }
        if (service) {
            generateFile(projectDir, scriptName, 'service', contextBase);
        }
        if (model) {
            generateFile(projectDir, scriptName, 'model', modelContext);
        }
        if (router) {
            generateFile(projectDir, scriptName, 'router', contextBase);
        }
    }
} else {
    console.error('No Script');
}

// Helper: Parse a Handlebars template file with given data.
function parseTemplate(templateLoc: string, data: any): string {
    const templateString: string = fs.readFileSync(templateLoc, 'utf-8');
    const template = Handlebars.compile(templateString);
    return template(data);
}

// Helper: Create a directory if it does not exist.
function generateDir(dirName: string): void {
    if (fs.existsSync(dirName)) return;
    fs.mkdirSync(dirName);
}

// Helper: Generate a file from a Handlebars template.
function generateFile(projectDir: string, scriptName: string, type: string, context: any): void {
    console.log(chalk.blueBright(`\n📌 Starting file generation for ${type}...`));

    // Ensure we have a valid script name
    if (!scriptName) {
        console.error(chalk.red("❌ Error: No script name provided!"));
        return;
    }

    // Template file name (e.g., controller.hbs)
    const tempType: string = `${type}.hbs`;

    // Construct full path to the template
    const templateFile: string = path.join(templates, 'typescript', 'express', tempType);

    console.log(chalk.cyan(`🔍 Looking for template: ${templateFile}`));

    // Check if template exists
    if (!fs.existsSync(templateFile)) {
        console.error(chalk.red(`❌ Template not found: ${templateFile}`));
        return;
    }
    console.log(chalk.green(`✅ Template found: ${templateFile}`));

    // Parse template with provided context
    let fileContent: string;
    try {
        fileContent = parseTemplate(templateFile, context);
        console.log(chalk.green(`✅ Template parsed successfully.`));
    } catch (error) {
        console.error(chalk.red(`❌ Error parsing template: ${error}`));
        return;
    }

    // Define output file name
    const fileName: string = `${scriptName}.${type}.ts`;

    // Determine target directory (e.g., src/controllers, src/models)
    const contDir: string = path.join(projectDir, `${type}s`);

    console.log(chalk.cyan(`📂 Target directory: ${contDir}`));

    // Create the directory if it does not exist
    try {
        generateDir(contDir);
        console.log(chalk.green(`✅ Directory ensured: ${contDir}`));
    } catch (error) {
        console.error(chalk.red(`❌ Error creating directory: ${error}`));
        return;
    }

    // Define final output path
    const finalPath = path.join(contDir, fileName);

    console.log(chalk.cyan(`📝 Writing file to: ${finalPath}`));

    // Write file
    try {
        fs.writeFileSync(finalPath, fileContent);
        console.log(chalk.green(`🎉 File successfully created: ${finalPath}`));
    } catch (error) {
        console.error(chalk.red(`❌ Error writing file: ${error}`));
    }
}


// Function to prompt for model fields. Expect input like:
// "email:String:true, name:String:false" (fields separated by commas)
function getModelFields(): Array<{ name: string, mongooseType: string, required: boolean }> {
    const fieldsInput: string = prompt('Enter model fields in the format fieldName:Type:required (comma-separated, e.g., email:String:true, name:String:false): ');
    if (!fieldsInput.trim()) return [];
    const fields = fieldsInput.split(',').map(fieldStr => {
        const parts = fieldStr.trim().split(':');
        return {
            name: parts[0].trim(),
            mongooseType: parts[1] ? parts[1].trim() : 'String',
            required: parts[2] ? parts[2].trim().toLowerCase() === 'true' : false
        };
    });
    return fields;
}

// Define an interface for the package data.
interface PackageData {
    name: string;
    version: string;
    description: string;
    main: string;
    author: string;
    license: string;
}

// Prompt the user for package details.
function getInputs(setName: string): PackageData {
    const name: string = prompt(`Project name (${setName}) => `) || setName;
    const version: string = prompt('Version (1.0.0) => ') || '1.0.0';
    const description: string = prompt('Description => ') || '';
    const main: string = prompt('Main File (index.js) => ') || 'index.js';
    const author: string = prompt('Author => ') || '';
    const license: string = prompt('License (ISC) => ') || 'ISC';

    return { name, version, description, main, author, license };
}
