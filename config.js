/*
 * Copyright (c) 2017 Linagora.
 *
 * This file is part of Business-Logic-Server
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const debug = require('debug')('linto-admin:config')
const dotenv = require('dotenv')
const path = require('path');
const fs = require('fs')

function ifHasNotThrow(element, error) {
    if (!element) throw error
    return element
}

function ifHas(element, defaultValue) {
    if (!element) return defaultValue
    return element
}

function configureDefaults() {
    try {
        dotenv.config()
        const envdefault = dotenv.parse(fs.readFileSync('.envdefault'))

        // Database (mongodb)
        process.env.LINTO_STACK_MONGODB_DBNAME = ifHas(process.env.LINTO_STACK_MONGODB_DBNAME, envdefault.LINTO_STACK_MONGODB_DBNAME)
        process.env.LINTO_STACK_MONGODB_SERVICE = ifHas(process.env.LINTO_STACK_MONGODB_SERVICE, envdefault.LINTO_STACK_MONGODB_SERVICE)
        process.env.LINTO_STACK_MONGODB_PORT = ifHas(process.env.LINTO_STACK_MONGODB_PORT, envdefault.LINTO_STACK_MONGODB_PORT)
        process.env.LINTO_STACK_MONGODB_USE_LOGIN = ifHas(process.env.LINTO_STACK_MONGODB_USE_LOGIN, envdefault.LINTO_STACK_MONGODB_USE_LOGIN)
        process.env.LINTO_STACK_MONGODB_USER = ifHas(process.env.LINTO_STACK_MONGODB_USER, envdefault.LINTO_STACK_MONGODB_USER)
        process.env.LINTO_STACK_MONGODB_PASSWORD = ifHas(process.env.LINTO_STACK_MONGODB_PASSWORD, envdefault.LINTO_STACK_MONGODB_PASSWORD)
        process.env.LINTO_STACK_MONGODB_TARGET_VERSION = ifHas(process.env.LINTO_STACK_MONGODB_TARGET_VERSION, envdefault.LINTO_STACK_MONGODB_TARGET_VERSION)


        process.env.LINTO_STACK_MONGODB_USER_ANDROID_EMAIL = ifHas(process.env.LINTO_STACK_MONGODB_USER_ANDROID_EMAIL, envdefault.LINTO_STACK_MONGODB_USER_ANDROID_EMAIL)
        process.env.LINTO_STACK_MONGODB_USER_ANDROID_PASWORD = ifHas(process.env.LINTO_STACK_MONGODB_USER_ANDROID_PASWORD, envdefault.LINTO_STACK_MONGODB_USER_ANDROID_PASWORD)
    } catch (e) {
        console.error(debug.namespace, e)
        process.exit(1)
    }
}
module.exports = configureDefaults()