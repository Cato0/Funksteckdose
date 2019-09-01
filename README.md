# Waves Platform (2016)

- Dezentralized Exchange
- Platform Client
- Cross Blockchain Cryptocurrency Capabilities
- large Bandwidth & fast Transaction / Conformations

Proof of Make

Proof of State (Leasing)
- you need another Persons Adress
- you need to Stake some amount of your Coins

Create Token
- it creates its own Coins 
- fee to create Tokens costs 1 Waves
- 

Smart Contracts
- they have Turing Complete and Non-Turing Complete Contracts 


# Information

Socket that can be bought with Crypto Curreny via the Waves Platform.
Creates Multisigniture Accounts, creates transactions and transfers waves token automatically based on the electricity used.


# Frontend

	1. Install ionic cli
	2. Workaround if module crypto not found: https://github.com/ethereum/web3.js/issues/1555#issuecomment-443989251
	3. Start Service:
			-> cd zu funksteckdose
			-> ionic serve
    6. http://localhost:8100/socket/1

# Backend - REST-API

## Start Flask Server

	python app.py
	
## Database:

1. MySQL start server
2. Start Python-File "createDatabase.py"
	- databse will be created with all tables
  - the table "Transactions" is empty and will automatically be filled with each transaction that is booked
3. The queries to connect the Flask REST API are in "database_queries.py"

	
### Add Transaktion to Database

	http://localhost:5000/addTransaction/<int:socket_id>/<int:customer_address>/<int:used_energy>/<int:token>/<float:energy_to_token>
	
	e.g.
	http://localhost:5000/addTransaction/4/46/4/2/3.2

### Delete Transaktion to Database

	http://127.0.0.1:5000/deleteTransaction/<transaction_id>

### Get Socket Status (Available / Unavailable)

	http://127.0.0.1:5000/getSocketsStatus/
	http://127.0.0.1:5000/getSocketStatus/1

### Select All Sockets / Transactions

	http://127.0.0.1:5000/selectAllSockets/
	http://127.0.0.1:5000/selectAllTransactions/


### Select Socket / Transaction by Id

	http://127.0.0.1:5000/selectSocket/1
	http://127.0.0.1:5000/selectTransactions/1
	
### Select specific Data ()

	http://127.0.0.1:5000/select/<attributeName>/<value>	

	e.g.
	http://127.0.0.1:5000/select/transaction_id/1	# SQL:	SELECT * Transaction WHERE transaction_id = 1
	http://127.0.0.1:5000/select/socket_id/2		  # SQL:	SELECT * Transaction WHERE socket_id = 2
	

	
