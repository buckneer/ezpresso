# Express Project CLI Generator

## Introduction

**ezpresso** is an npm package designed to streamline your workflow, making development faster and more efficient. This guide will walk you through installation, commands, project structure, and troubleshooting common issues.



## Features

* **Project Creation:** Quickly generate a new Express project with a pre-defined folder structure and essential configuration files.
* **File Generation:** Create individual components (controller, service, model, or router) based on customizable Handlebars templates.
* **Interactive Prompts:** Answer prompts to provide package details and model fields when generating files.
* **TypeScript Support:** The generated project uses TypeScript for type safety and maintainability.
* **Colorful Console Output:** Uses chalk for improved readability during CLI operations.


## Prerequisites
- Node.js (v12 or above)
- npm (Node Package Manager)
- Basic knowledge of TypeScript and Express

## Installation

### NPM

To install **ezpresso**, ensure you have Node.js installed on your system. Then, run the following command:
``` bash
npm install -g ezpresso
```

### Manual Build
1. Clone Repository:
``` bash
git clone https://github.com/yourusername/express-cli-generator.git
cd express-cli-generator
```
2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```


This will install **ezpresso** globally, allowing you to use it from any project.


## Usage
The CLI tool supports two main commands: create and generate (alias g).


### 1. Create new project
```bash
ezpresso create <project-name>
```
example:
```bash
ezpresso create my-express-app
```

This command will:

- Prompt you for package details (name, version, description, main file, author, and license).
- Create a new project directory with the given name.
- Set up the following folder structure:
```
my-express-app/
├── src/
│   ├── controllers/
│   ├── db/
│   ├── logger/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   └── utils/
├── .env
├── .gitignore
├── nodemon.json
├── tsconfig.json
└── package.json
```
- Copy required template files (like app.ts, routes.ts, etc.) into the appropriate locations.
- Automatically run npm install inside the new project directory.

### 2. Generate a Component File

You can also generate new components inside an existing project. Make sure you run this command from your project root (where package.json and src exist).

```bash
ezpresso generate <type> <entity-name>
```

Supported Types:
- controller (or c)
- service (or s)
- model (or m)
- router

If you do not specify a valid type, the script defaults to generating all components.

For example, to generate a new controller for a user entity:

```bash
ezpresso generate controller user
```

Or, to generate all components for the user entity:
```bash
ezpresso generate all user
```

**Generating a Model with Fields**

When generating a model (or when generating all components), the CLI will prompt you to enter model fields. Enter fields in the following format:
```bash
fieldName:Type:required, anotherField:Type:required
```

for example:
```bash
email:String:true, name:String:false
```

This input will be parsed into an array of field objects and used to generate the model file.

## Console Feedback
The tool uses color-coded logs to indicate progress:

- Green: Successful creation of directories and files.
- Blue: Informational messages (like running npm install).
- Red: Errors or missing requirements.

## Customizing Templates

Templates are stored in the /templates/typescript/express directory. You can modify these Handlebars (.hbs) templates to change the boilerplate code for your controllers, services, models, and routers.

### Adding Helpers
The script includes a Handlebars helper (capitalize) which capitalizes the first letter of a string. You can add more helpers as needed.

## Troubleshooting
Project Directory Exists:
If you try to create a project in a directory that already exists, the tool will output an error. Consider renaming the project or deleting the existing directory if you wish to overwrite it.

Invalid Project Structure:
When generating files, the CLI checks for the existence of a package.json and src folder to ensure you're in a valid project directory.

## License
Distributed under the ISC License. See LICENSE for more information.

## Contributing
Feel free to submit issues or pull requests if you have improvements or suggestions!
