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
        this.version = '2'
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
            const collections = await this.listCollections()
            const collectionNames = []
            let migrationErrors = []
            collections.map(col => {
                collectionNames.push(col.name)
            })
            console.log(collectionNames)
                /*****************/
                /* CONTEXT_TYPES */
                /*****************/
            if (collectionNames.indexOf('context_types') >= 0) { // collection exist
                const contextTypes = await this.mongoRequest('context_types', {})
                if (contextTypes.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(contextTypes, schemas.context_types)
                    if (schemaValid.valid) { // schema is valid
                        const fleetVal = contextTypes.filter(ct => ct.name === 'Fleet')
                        if (fleetVal.length === 0) {
                            await this.mongoInsert('context_types', { name: 'Fleet' })
                        }

                        const applicationVal = contextTypes.filter(ct => ct.name === 'Application')
                        if (applicationVal.length === 0) {
                            await this.mongoInsert('context_types', { name: 'Application' })
                        }

                    } else { // schema is invalid
                        console.log('SCHEMA IBALID')
                        await this.mongoUpdateMany('context_types', {}, { test: 'test' })
                        const contextTypes = await this.mongoRequest('context_types', {})
                        const schemaValid = this.testSchema(contextTypes, schemas.context_types)
                        console.log('post modif', schemaValid)
                        if (!schemaValid.valid) {
                            migrationErrors.push({
                                collectionName: 'context_types',
                                errors: schemaValid.errors
                            })
                        }
                    }
                } else  { // collection exist but empty
                    const payload = [
                        { name: 'Fleet' },
                        { name: 'Application' }
                    ]
                    this.mongoInsertMany('context_types', payload)
                }
            } else { // collection does not exist
                const payload = [
                    { name: 'Fleet' },
                    { name: 'Application' }
                ]
                this.mongoInsertMany('context_types', payload)
            }

            // RETURN
            if (migrationErrors.length > 0) {
                throw migrationErrors
            } else {
                console.log(`> MongoDB migration to version "${this.version}": Success `)
                return true
            }

        } catch (error) {
            console.error(error)
            if (typeof(error) === 'object') {
                console.error('======== Migration ERROR ========')
                error.map(err => {
                    if (!!err.collectionName && !!err.errors) {
                        console.error('> Collection: ', err.collectionName)
                        err.errors.map(e => {
                            console.error('Error: ', e)
                        })
                    }
                })
                console.error('=================================')
            }
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