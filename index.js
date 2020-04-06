require('./config.js')
const MongoDriver = require('./model/driver')
const migration = require(`./migrations/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/index.js`)
const path = './migrations/';
const fs = require('fs');

function migrateUp() {
    return new Promise((resolve, reject) => {
        try {
            setTimeout(async() => {
                // Check if MongoDriver is connected
                if (!MongoDriver.constructor.checkConnection()) {
                    console.log('MongoDb migrate : Not connected')
                    migrateUp()
                } else {
                    const currentVersion = await migration.getCurrentVersion()
                    if (currentVersion > process.env.LINTO_STACK_MONGODB_TARGET_VERSION) {
                        // DOWN

                    } else if (currentVersion < process.env.LINTO_STACK_MONGODB_TARGET_VERSION) {
                        console.log('MIGRATE UP')
                            // UP
                        let versions = parseFolders()
                        const indexStart = versions.indexOf(currentVersion)
                        const indexEnd = versions.indexOf(process.env.LINTO_STACK_MONGODB_TARGET_VERSION)
                        try {
                            for (let iteration of generatorMigrateUp(versions, indexStart, indexEnd)) {
                                const res = await iteration
                                if (res !== true) {
                                    throw res
                                }
                            }
                        } catch (error) {
                            console.error('catch 2 ', error)
                            return error
                        }
                    }
                }
            }, 500)
        } catch (error) {
            reject(error)
        }
    })
}

// Generator function to chain promises
function* generatorMigrateUp(versions, indexStart, indexEnd) {
    console.log('allo')
    for (let i = indexStart + 1; i <= indexEnd; i++) {
        yield(new Promise(async(resolve, reject) => {
            try {
                console.log('> Migrate up to version :', versions[i])
                const migrationFile = require(`./migrations/${versions[i]}/index.js`)
                const mig = await migrationFile.migrateUp()
                if (mig === true) {
                    return mig
                } else {
                    throw mig
                }
            } catch (err) {
                console.error(err)
            }
        }))
    }
}

function parseFolders() {
    try {
        return fs.readdirSync(path).filter(function(file) {
            return fs.statSync(path + '/' + file).isDirectory();
        })
    } catch (error) {
        return error
    }
}

migrateUp()