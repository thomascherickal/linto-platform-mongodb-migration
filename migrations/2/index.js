const MongoMigration = require(`../../model/migration.js`)
const schemas = {
    clientsStatic: require('./schemas/clients_static.json'),
    dbVersion: require('./schemas/db_version.json'),
    flowTmp: require('./schemas/flow_tmp.json'),
    users: require('./schemas/users.json'),
    workflowsStatic: require('./schemas/workflows_static.json'),
    workflowsTemplates: require('./schemas/workflows_templates.json')
}

class Migrate extends MongoMigration {
    constructor() {
        super()
        this.version = 2
    }
    async migrateUp() {
        try {
            const collections = await this.listCollections()
            const collectionNames = []
            let migrationErrors = []
            collections.map(col => {
                collectionNames.push(col.name)
            })


            /************/
            /* FLOW_TMP */
            /************/
            if (collectionNames.indexOf('flow_tmp') >= 0) { // collection exist
                const flowTmp = await this.mongoRequest('flow_tmp', {})
                if (flowTmp.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(flowTmp, schemas.flowTmp)
                    if (schemaValid.valid) { // schema is valid
                        const neededVal = flowTmp.filter(ct => ct.id === 'tmp')
                        if (neededVal.length === 0) {
                            const payload = {
                                id: "tmp",
                                flow: [],
                                workspaceId: ""
                            }
                            await this.mongoInsert('flow_tmp', payload)
                        }
                    } else { // Schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'flow_tmp',
                            errors: schemaValid.errors
                        })
                    }
                } else  { // collection exist but empty
                    const payload = {
                        id: "tmp",
                        flow: [],
                        workspaceId: ""
                    }

                    // Insert default data
                    await this.mongoInsert('flow_tmp', payload)
                }
            } else { // collection does not exist
                const payload = {
                    id: "tmp",
                    flow: [],
                    workspaceId: ""
                }

                // Create collection and insert default data
                await this.mongoInsert('flow_tmp', payload)
            }

            /***********************/
            /* WORKFLOWS_TEMAPLTES */
            /***********************/
            const WorkflowsTemplatesPayload = require('./json/linto-static-default-flow.json')
            if (collectionNames.indexOf('workflows_templates') >= 0) { // collection exist
                const flowPattern = await this.mongoRequest('workflows_templates', {})
                if (flowPattern.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(flowPattern, schemas.workflowsTemplates)
                    if (schemaValid.valid) { // schema is invalid
                        const neededVal = flowPattern.filter(ct => ct.name === 'linto-fleet-default')
                        if (neededVal.length === 0) { // required value doesn't exist
                            await this.mongoInsert('workflows_templates', WorkflowsTemplatesPayload)
                        }
                    } else { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'workflows_templates',
                            errors: schemaValid.errors
                        })
                    }
                } else { //collection exist but empty
                    await this.mongoInsert('workflows_templates', WorkflowsTemplatesPayload)
                }
            } else { // collection doesn't exist
                await this.mongoInsert('workflows_templates', WorkflowsTemplatesPayload)
            }

            /*********/
            /* USERS */
            /*********/
            if (collectionNames.indexOf('users') >= 0) { // collection exist
                const users = await this.mongoRequest('users', {})
                if (users.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(users, schemas.users)
                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'users',
                            errors: schemaValid.errors
                        })
                    }
                }
            }

            /******************/
            /* CLIENTS_STATIC */
            /******************/
            if (collectionNames.indexOf('clients_static') >= 0) { // collection exist
                const clientsStatic = await this.mongoRequest('clients_static', {})

                if (clientsStatic.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(clientsStatic, schemas.clientsStatic)

                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'clients_static',
                            errors: schemaValid.errors
                        })
                    }
                }
            }

            /********************/
            /* WORKFLOWS_STATIC */
            /********************/
            if (collectionNames.indexOf('workflows_static') >= 0) { // collection exist
                const workflowsStatic = await this.mongoRequest('workflows_static', {})
                if (clientsStatic.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(workflowsStatic, schemas.workflowsStatic)

                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'workflows_static',
                            errors: schemaValid.errors
                        })
                    }
                }
            }

            /*************/
            /* DBVERSION */
            /*************/
            if (collectionNames.indexOf('dbversion') >= 0) { // collection exist
                const dbversion = await this.mongoRequest('dbversion', {})

                const schemaValid = this.testSchema(dbversion, schemas.dbVersion)
                if (schemaValid.valid) { // schema valid
                    await this.mongoUpdate('dbversion', { id: 'current_version' }, { version: this.version })
                } else { // schema is invalid
                    migrationErrors.push({
                        collectionName: 'dbversion',
                        errors: schemaValid.errors
                    })
                }
            } else { // collection doesn't exist
                await this.mongoInsert('dbversion', {
                    id: 'current_version',
                    version: this.version
                })
            }

            /**************************/
            /* REMOVE OLD COLLECTIONS */
            /**************************/
            if (collectionNames.indexOf('context_types') >= 0) { // collection exist
                await this.mongoDrop('context_types')
            }
            if (collectionNames.indexOf('context') >= 0) { // collection exist
                await this.mongoDrop('context')
            }
            if (collectionNames.indexOf('flow_pattern_tmp') >= 0) { // collection exist
                await this.mongoDrop('flow_pattern_tmp')
            }
            if (collectionNames.indexOf('flow_pattern') >= 0) { // collection exist
                await this.mongoDrop('flow_pattern')
            }
            if (collectionNames.indexOf('lintos') >= 0) { // collection exist
                await this.mongoDrop('lintos')
            }
            if (collectionNames.indexOf('linto_users') >= 0) { // collection exist
                await this.mongoDrop('linto_users')
            }

            // RETURN
            if (migrationErrors.length > 0) {
                throw migrationErrors
            } else {
                await this.mongoUpdate('dbversion', { id: 'current_version' }, { version: this.version })
                console.log(`> MongoDB migration to version "${this.version}": Success `)
                return true
            }
        } catch (error) {
            console.error(error)
            if (typeof(error) === 'object' && error.length > 0) {
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
            if (collectionNames.indexOf('clients_static') >= 0) { // collection exist
                await this.mongoDrop('clients_static')
            }
            if (collectionNames.indexOf('db_version') >= 0) { // collection exist
                await this.mongoDrop('db_version')
            }
            if (collectionNames.indexOf('flow_tmp') >= 0) { // collection exist
                await this.mongoDrop('flow_tmp')
            }
            if (collectionNames.indexOf('workflows_static') >= 0) { // collection exist
                await this.mongoDrop('workflows_static')
            }
            if (collectionNames.indexOf('workflows_templates') >= 0) { // collection exist
                await this.mongoDrop('workflows_templates')
            }

            return true
        } catch (error) {
            console.error(error)
            return false
        }

    }
}

module.exports = new Migrate()