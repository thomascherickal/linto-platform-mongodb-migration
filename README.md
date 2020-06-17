# Development local
Has a test purpose for a local setup the following step are necessary 

## Environment

The environment file need to be configured based on your personal mongo configuration
`cp .envdefault .env`
Then you can edit the `.env` file based on you settings.

## User

An user root is needed to be created in mongo:
```
db.createUser({
	user: "root",
	pwd: "example",
	roles: ["readWrite"]
})
```

## RUN

Last step is to simply run de mongodb migration : `npm run migrate`
You should be able to see a new database based on your new settings
