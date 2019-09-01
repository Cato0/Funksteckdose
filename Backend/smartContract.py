import pywaves as pw

# Andre
# Address: 	   3MwXvspLKJMdrkjveS3T4WKvjN3tWdgAq8U
# Public Key:  74gVmjC1eSMB4DWiczqW4XyU1wLpPKqY5KnbBg1DQiZf
# Private Key: 6wtSrJhE6NRZju6Wpzj1hwcyn72vHwTknM2RpVCyGp7W

# Joel
# Address: 	   3N1fDFhqCpSqUascfa1nAjQvpcagndBPhRG
# Public Key:  ???
# Private Key: ???


node1  = 'http://testnode1.wavesnodes.com'
chain1 = 'testnet'
pw.setNode(node = node1, chain=chain1)

andreAddress = pw.Address(privateKey='6wtSrJhE6NRZju6Wpzj1hwcyn72vHwTknM2RpVCyGp7W')    # Andre
joelAddress =  pw.Address('3N1fDFhqCpSqUascfa1nAjQvpcagndBPhRG')    # Joel

#if __name__ == "__main__":
#	print("Test")
	
#socketKey = 'CtMQWJZqfc7PRzSWiMKaGmWFm4q2VN5fMcYyKDBPDx6S'
socketKey = '3N1fDFhqCpSqUascfa1nAjQvpcagndBPhRG'
socketAddress = pw.Address(socketKey)

def getBalance(address):
	if (len(address) == 35):	# Address
		address  = pw.Address(address)
		balance = address.balance(assetId='', confirmations=0)
		return balance
	elif (len(address) == 44):	# Private Key
		address  = pw.Address(privateKey=address)
		balance = address.balance(assetId='', confirmations=0)
		return balance

def getAllBalances():
	address1Balance  = andreAddress.balance()
	address2Balance  = joelAddress.balance()
	allJSONBalances  = {'Andre': address1Balance, 
						'Joel' : address2Balance}
	return allJSONBalances
		
def send(senderAddress, receiverAddress, value):	
	senderAddress   = pw.Address(senderAddress)
	receiverAddress = pw.Address(receiverAddress)
	senderAddress.sendWaves(receiverAddress, value)
	
def payForSocket(senderKey, value):	
	senderAddress   = pw.Address(privateKey=senderKey)
	#print(senderKey)
	#print(value)
	#print(socketAddress)
	#print(senderAddress)
	senderAddress.sendWaves(socketAddress, value)
	return True
	
def sendWaves(fromAdress, value):

    '''
    myAddress = pw.Address(privateKey='3MwXvspLKJMdrkjveS3T4WKvjN3tWdgAq8U')    # Andre
    otherAddress = pw.Address('3N1fDFhqCpSqUascfa1nAjQvpcagndBPhRG')            # Joel
    myAddress.sendWaves(otherAddress, 1)
    myToken = myAddress.issueAsset('Token1', 'My Token', 1000, 0)
    while not myToken.status():
        pass
    myAddress.sendAsset(otherAddress, myToken, 50)								# Why do i need a Token???
    '''
    print("Pay")	

''' PAY
	
print("Before: %s" % (andreAddress.balance()) )
print("Before: %s" % (joelAddress.balance()) )

andreAddress.sendWaves(joelAddress, 500)

print("After : %s" % (andreAddress.balance()) )
print("After : %s" % (joelAddress.balance()) )
'''


#  if Balance is higher than value, then sendWaves
'''
myAddress.sendWaves(otherAddress, 10000000)
myToken = myAddress.issueAsset('Token1', 'My Token', 1000, 0)
while not myToken.status():
	pass
myAddress.sendAsset(otherAddress, myToken, 50)
'''