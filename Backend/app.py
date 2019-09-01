from flask import Flask
from flask_restful import Api
from flask_cors import CORS
import script
import sys
import os
sys.path.append( os.getcwd() + '/DatabaseScripts')
from DatabaseScripts import database_queries as db

from threading import Thread
import time
import sleepTimer

#import energychecker


'''
from script import HelloWorld
from script import Pay
from script import AllBalances
from script import Balance
from script import Sockets
'''

app = Flask(__name__)
api = Api(app)

#CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})

api.add_resource(script.HelloWorld, '/')

# Socket Functions

api.add_resource(script.SocketsStatus, '/getSocketsStatus/')  # Get Status of all Sockets 
api.add_resource(script.SocketStatus, '/getSocketStatus/<int:id>/')  # Get Status of all Sockets 
api.add_resource(script.GetAsset, '/getAsset/')
# Database Functions

api.add_resource(db.GetSocketLoad, '/getSocketLoad/<int:id>')

api.add_resource(db.Select, '/select/<string:attribute>/<int:value>')
api.add_resource(db.SelectSocket, '/selectSocket/<int:id>')
api.add_resource(db.SelectTransaction, '/selectTransaction/<int:id>')
api.add_resource(db.SelectAllTransactions, '/selectAllTransactions/')
api.add_resource(db.SelectAllSockets, '/selectAllSockets/')
api.add_resource(db.DeleteTransaction, '/deleteTransaction/<int:id>')

api.add_resource(db.GetTrader, '/getTrader/<string:key>')
api.add_resource(db.SaveCompleteTransaction, '/saveCompleteTransaction/<int:transaction_id>/<string:complete_transaction_id>')

api.add_resource(db.AddTransaction, '/addTransaction/') # TODO Change energy_to_token to float
#api.add_resource(db.AddTransaction, '/addTransaction/<int:socket_id>/<string:customer_address>/<string:customer_publicKey>/<string:multi_address>/<string:multi_publicKey>/<string:multi_seed>/<string:backup_transaction>/<string:initial_customer_transaction_id>/<string:setup_transaction_id>/<string:script_transaction_id>/<string:complete_transaction_id>/<int:socket_energy>/<int:token>/<float:energy_to_token>') # TODO Change energy_to_token to float

api.add_resource(db.StartLoadingProcess, '/startLoadingProcess/<int:transaction_id>')
api.add_resource(db.StopLoadingProcess, '/stopLoadingProcess/<int:transaction_id>')


# onTransactionStart / startLoadingProcess
# onTransactionEnd   / stopLoadingProcess

'''
# PyWaves Functions

api.add_resource(script.AllBalances, '/allBalances/')
api.add_resource(script.Balance, '/balance/<string:key>')
api.add_resource(script.Pay, "/paySocket/<int:value>") 
'''

threads = []

#threads.append(Thread(target=energychecker.start))
threads.append(Thread(target=sleepTimer.start_sleep))
threads.append(Thread(target=app.run)) # args=(debug=True)


# Fix Cross Origin Error - Source: https://stackoverflow.com/a/42286498

#@app.after_request
#def after_request(response):
#  response.headers.add('Access-Control-Allow-Origin', '*')
#  response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
#  return response

if __name__ == "__main__":
  
  #for thread in threads:
  #  thread.start()
  app.run(host='127.0.0.1', debug=True)
  #app.run(ssl_context='adhoc', debug=True) #, host='0.0.0.0')  