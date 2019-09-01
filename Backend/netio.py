import requests
import json
import sys
	
#ipadress = '178.200.73.205'

def getEnergyCounter(ipadress, socketID):
	if (socketID > 0 and socketID <= 4):	
		response = requests.get ("http://" + ipadress + ":100/netio.json")
		dict = response.json()
			
		if (response.status_code == 200):
			thisCount = (dict['Outputs'][(socketID - 1)]['Energy'])
			#print ('Current Energycounter of the Socket is: ' + str(thisCount) + ' Wh')	
		else :	
			thisCount = 'Error Code: ' + response.status_code;
			print ('Error Code: ' + response.status_code)	
			
	else :
		thisCount = "Methods needs a available SocketID!"
	
	return thisCount

def getSocketState(ipadress, socketID):
	int(socketID)
	if (socketID > 0 and socketID <= 4):	
		response = requests.get ("http://" + ipadress + ":100/netio.json")
		dict = response.json()
			
		if (response.status_code == 200):
			thisState = (dict['Outputs'][(socketID - 1)]['State'])
			print ('Current State of the Socket: ' + str(thisState))	
		else :	
			thisState = 'Error Code: ' + response.status_code;
			print ('Error Code: ' + response.status_code)	
		
	else :
		thisState = "Methods needs a available SocketID!"
		
	return thisState
	
def switchSocketState(ipadress, socketID, switchState):
	if (socketID > 0 and socketID <= 4):
		return (requests.get("http://" + str(ipadress) + ":100/netio.cgi?pass=24A42C392368&output" + str(socketID) + "=" + str(switchState))).status_code
	else :
		return "Methods needs a available SocketID!"
		
	
#print(getEnergyCounter(int(sys.argv[1])))
	
#print (getSocketState(int(sys.argv[1])))

#print (switchSocketState(int(sys.argv[1]), str(sys.argv[2])))
#print (switchSocketState(1, 0))
