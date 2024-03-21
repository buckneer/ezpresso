


function generatePackage(name, description, version, main, author, license) {
    const packageJson = {
        name: name,
        version: version,
        description: description,
        main: main,
        scripts: {
            "start": "node dist/app.js",
            "postinstall": "tsc",
            "build": "tsc",
            "dev": "nodemon --config nodemon.json src/app.ts"
        },
        author: author,
        license: license,
        dependencies: {
            "bcrypt": "^5.1.1",
            "cloudinary": "^1.41.0",
            "dayjs": "^1.11.10",
            "dotenv": "^16.3.1",
            "jsonwebtoken": "^9.0.2",
            "mongoose": "^7.6.3",
            "nodemon": "^3.0.1",
            "ts-node": "^10.9.1",
            "yup": "^1.3.2"
        },
        devDependencies: {
            "@types/bcrypt": "^5.0.1",
            "@types/cors": "^2.8.15",
            "@types/express": "^4.17.20",
            "@types/jsonwebtoken": "^9.0.4",
            "cors": "^2.8.5",
            "express": "^4.18.2",
            "pino": "^8.16.1",
            "pino-pretty": "^10.2.3"
        }

    };

    console.log(packageJson);
}

module.exports = {generatePackage};