console.log('Starting password manager.');

var crypto = require('crypto-js');
var storage = require('node-persist'); // integrates node-persist module into this application
storage.initSync(); // prepares the computer to write and save variables

/*
var retrievedAccount = storage.getItemSync('account');
console.log("Account is ", retrievedAccount);
*/

var argv = require('yargs')
		.command('create','Creates a user account', function(yargs){
			yargs.options({
				name: {
					demand: true,
					alias: 'n',
					type: 'string',
					description: 'name eg Facebook or Twitter'
				},
				username: {
					demand: true,
					alias: 'u',
					type: 'string',
					description: 'username eg user12! or user12@gmail.com'
				},
				password: {
					demand: true,
					alias: 'p',
					type: 'string',
					description: 'password for account access'
				},
				masterPassword:{
					demand: true,
					alias: 'm',
					type: 'string',
					description: 'Master password is required for encryption / decryption'
				}
			}).help('help');
		})
		.command('get', 'get accounts with a matching name', function(yargs){
			yargs.options({
				name: {
					demand: true,
					alias: 'n',
					type: 'string',
					description: 'Specify an account name like Twitter, Facebook etc'
				},
				masterPassword:{
					demand: true,
					alias: 'm',
					type: 'string',
					description: 'Master password is required for encryption / decryption'
				}
			}).help('help');
		})
		.help('help')
		.argv;

var command = argv._[0];
//console.log('From create function:  account = ' , argv);

/* 
 - Create a function called 'create'
 - The create function will require 3 arguments
 - 1) --name (as in Twitter, Facebook etc)
 - 2) --username (like user12 or an email address)
 - 3) --password

 - Create a function called 'get'
 - requires one argument ie --name

 Example
 account.name = 'Facebook'
 account.username = 'User21'
 account.password = 'Passwrd 123!'
*/

function getAccounts(masterPassword){
	var accounts = [];

	// use getItemSync to fetch accounts
	var encryptedAccount = storage.getItemSync('accounts');
	// DECRYPT
	if (typeof accounts !== 'undefined'){
		var bytes = crypto.AES.decrypt(encryptedAccount,masterPassword);
		var accounts = JSON.parse(bytes.toString(crypto.enc.Utf8));	
	}

	// return accounts array
	return accounts;
}

function saveAccounts(accounts, masterPassword){
	// encrypt accounts
	var encryptedAccounts = crypto.AES.encrypt(JSON.stringify(accounts), masterPassword);

	// setItemSync ie saving encrypted Accounts
	storage.setItemSync('accounts', encryptedAccounts.toString());
	console.log('Account saved.');
	// return accounts
	return accounts;
}

function createAccount(account, masterPassword){
	var accounts = getAccounts(masterPassword);

	// push on new account
	accounts.push(account);

	// save the account
	saveAccounts(accounts, masterPassword);

	// return account
	return account;
}

function getAccount(accountName){
	var accounts = getAccounts(argv.masterPassword);
	var matchedAccount;

	accounts.forEach(function(account){
		if(account.name === accountName) {
			matchedAccount = account;
		}
	});
	return matchedAccount;
}

if(command === 'create'){
	//console.log("Coming from 1st if statement ie command === !!!!");
	var createdAccount = createAccount({
		name: argv.name,
		username: argv.username,
		password: argv.password
	}, argv.masterPassword);
	console.log("createdAccount datatype : " + typeof createdAccount);
	console.log("Account created: " );
} else if( command === 'get'){
	var fetchedAccount = getAccount(argv.name, argv.masterPassword);

	if(typeof fetchedAccount === 'undefined'){
		console.log("Account not found.");
	} else {
		console.log('Account found');
		console.log(fetchedAccount);
	}
}