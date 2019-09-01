import tplink
import netio

def getPlugStatus(Ip_Address, Plug_Id, Manufacturer):
	if (Manufacturer == 'TP_Link_HS110'): 
		status = tplink.data(Ip_Address, 'status') 
	elif (Manufacturer == 'NETIO_4All'):
		status = netio.getSocketState(Ip_Address, Plug_Id) 
	return status
	
def getPlugEnergy(Ip_Address, Plug_Id, Manufacturer):
	if (Manufacturer == 'TP_Link_HS110'): 
		energycount = tplink.data(Ip_Address, 'read_energy')
	elif (Manufacturer == 'NETIO_4All'):
		energycount = netio.getEnergyCounter(Ip_Address, Plug_Id) 
	return energycount
	
def setPlugData(Ip_Address, Plug_Id, Manufacturer, data):
	if (data == 1) or (data == 0):
		if (Manufacturer == 'TP_Link_HS110'): 
			reply = tplink.data(Ip_Address, data)
		elif (Manufacturer == 'NETIO_4All'):
			reply = netio.switchSocketState(Ip_Address, Plug_Id, data) 
		return reply
		
def getAllPlugData(type):
	#all
	for plug in range(plugs):
		if (type == 'all'): 
			print('Plug:', plug)
			print ('Status:', getPlugStatus(plug))
			print ('Energycount:',getPlugEnergy(plug), 'Wh')

			
if __name__ == "__main__":

	#print(getPlugStatus(1))
	#getAllPlugData('all')
	#print(setPlugData(1, 'off'))

	print(setPlugData('192.168.178.33', 0, 'TP_Link_HS110', 1))
	print(getPlugStatus('192.168.178.33', 0, 'TP_Link_HS110'))
	print(getPlugEnergy('192.168.178.33', 0, 'TP_Link_HS110'))
	print(setPlugData('192.168.178.33', 0, 'TP_Link_HS110', 0))

	print(getPlugStatus('192.168.178.37', 0, 'TP_Link_HS110'))
	print(getPlugEnergy('192.168.178.37', 0, 'TP_Link_HS110'))

	# setPlugData NETIO4All?
	print(getPlugStatus('178.200.73.205', 1, 'NETIO_4All'))
	print(getPlugEnergy('178.200.73.205', 1, 'NETIO_4All'))
	print(getPlugStatus('178.200.73.205', 2, 'NETIO_4All'))
	print(getPlugEnergy('178.200.73.205', 2, 'NETIO_4All'))
	print(getPlugStatus('178.200.73.205', 3, 'NETIO_4All'))
	print(getPlugEnergy('178.200.73.205', 3, 'NETIO_4All'))
	print(getPlugStatus('178.200.73.205', 4, 'NETIO_4All'))
	print(getPlugEnergy('178.200.73.205', 4, 'NETIO_4All'))
