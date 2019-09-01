from flask import Flask, jsonify, request
from flask_restful import Resource, Api

# import smartContract as sc 


app = Flask(__name__)
api = Api(app)

senderAddress = '6wtSrJhE6NRZju6Wpzj1hwcyn72vHwTknM2RpVCyGp7W'
token = 'HFEYr85ey8mEWdhXx5r3xD9VycTcc7yfHcpygdMhPodp'
exchange_rate = 0.1

#socketStatus = { 0 : 'AVAILABLE', 1 : 'AVAILABLE', 2 : 'AVAILABLE', 3 : 'AVAILABLE', 4 : 'AVAILABLE', 5 : 'AVAILABLE'}

socketStatus = [ { "id": 1, "status": "AVAILABLE", "already_charged" : 1, "to_charge" : 1}, { "id": 2, "status": "AVAILABLE", "already_charged" : 1, "to_charge" : 1 }, { "id": 3, "status": "AVAILABLE", "already_charged" : 1, "to_charge" : 1 },
                 { "id": 4, "status": "AVAILABLE", "already_charged" : 1, "to_charge" : 1}, { "id": 5, "status": "AVAILABLE", "already_charged" : 1, "to_charge" : 1 }]


# GET, POST
class HelloWorld(Resource):
    def get(self):
        return {'hello': 'world'}

    def post(self):
        some_json = request.get_json()
        return( {'you_sent': some_json})

class GetAsset(Resource):
	def get(self):
		return( {'token': token, 'exchangeRate' : exchange_rate})

# Get status of a single Socket
class SocketStatus(Resource):
	def get(self, id):
		return socketStatus[id]['status']
        # return socketStatus[id].get('status')

# Get status of all Sockets
class SocketsStatus(Resource):
	def get(self):
		return socketStatus

'''
# GET mit Inputs
class Pay(Resource):
    def get(self, value):
        res = sc.payForSocket(senderAddress, value)
        if (res == True):
            return 'Payment Received'
        else:
            return 'Paymend Denied'

# GET mit Inputs
class Balance(Resource):
    def get(self, key):
        return sc.getBalance(key)
		
# GET mit Inputs
class AllBalances(Resource):
    def get(self):
        return sc.getAllBalances()
'''
if __name__ == "__main__":
  app.run(debug=True)
  
  