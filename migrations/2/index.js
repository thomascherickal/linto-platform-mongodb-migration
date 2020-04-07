const MongoMigration = require(`../../model/migration.js`)
const schemas = {
    context: require('./schemas/context.json'),
    context_types: require('./schemas/context_types.json'),
    flow_pattern: require('./schemas/flow_pattern.json'),
    flow_pattern_tmp: require('./schemas/flow_pattern_tmp.json'),
    lintos: require('./schemas/lintos.json'),
    users: require('./schemas/users.json')
}

class Migrate extends MongoMigration {
    constructor() {
        super()
        this.version = '2'
    }
    async migrateUp() {
        try {
            const collections = await this.listCollections()
            const collectionNames = []
            let migrationErrors = []
            collections.map(col => {
                collectionNames.push(col.name)
            })

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
                        await this.mongoUpdateMany('context_types', {}, { test: 'test' })
                        const contextTypes = await this.mongoRequest('context_types', {})
                        const schemaValid = this.testSchema(contextTypes, schemas.context_types)
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
                await this.mongoUpdate('dbversion', { id: 'current_version' }, { version: 2 })
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
    async migrateDown() {
        try {
            const collections = await this.listCollections()
            const collectionNames = []
            let migrationErrors = []
            collections.map(col => {
                collectionNames.push(col.name)
            })

            /*****************/
            /* CONTEXT_TYPES */
            /*****************/
            if (collectionNames.indexOf('context_types') >= 0) { // collection exist
                const contextTypes = await this.mongoRequest('context_types', {})
                if (contextTypes.length > 0) { // collection exist and not empty
                    await this.mongoUnset('context_types', {}, { test: '' })
                }

                // RETURN
                if (migrationErrors.length > 0) {
                    throw migrationErrors
                } else {
                    console.log(`> MongoDB migration to version "${this.version}": Success `)
                    return true
                }
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
}

module.exports = new Migrate()