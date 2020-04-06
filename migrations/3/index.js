const MongoMigration = require(`../../model/migration.js`)
const ZSchema = require("z-schema");
const validator = new ZSchema({});

const schemas = {
    context: require('./schemas/context.json'),
    context_types: require('./schemas/context_types.json'),
    flow_pattern: require('./schemas/flow_pattern.json'),
    flow_pattern_tmp: require('./schemas/flow_pattern_tmp.json'),
    lintos: require('./schemas/lintos.json'),
    users: require('./schemas/users.json')
}

class Migrate001 extends MongoMigration {
    constructor() {
        super()
        this.version = '3'
    }
    testSchema(json, schema) {
        const schemaValid = validator.validate(json, schema)
        var schemaErrors = validator.getLastErrors() // this will return an array of validation errors encountered
        if (schemaValid) {
            return {
                valid: schemaValid,
                errors: null
            }
        } else {
            return {
                valid: schemaValid,
                errors: schemaErrors
            }
        }
    }
    async migrateUp() {
        try {
            console.log('MIG : 3')
            return true
        } catch (error) {
            return error
        }
    }
    migrateDown() {
        const versionCollections = [
            'context',
            'contetxt_types',
            'flow_pattern',
            'flow_pattern_tmp',
            'lintos',
            'users'
        ]

        // TODO : remove collection if not in the array
    }
}

module.exports = new Migrate001()