# AN SEBASTIAN:
# um die Socket Daten zu bekommen nutze Funktion in database_queries: selectDatabaseData
# je nachdem welche Daten du haben willst

# db.selectDatabaseData('Socket') 												   # Alle Sockets
# db.selectDatabaseData('Socket', 'Ip_Address') 								   # Ein Attribut von allen Sockets
# db.selectDatabaseData('Socket', where_attribute = 'Socket_Id', where_value = 1)  # Ein Socket mit WHERE Abfrage

# e.g. Ip Address
import os, sys, re, threading, time

sys.path.append( os.getcwd() + '/Classes/')

sys.path.append( os.getcwd() + '/DatabaseScripts/')		# For Production, when starting from app.py
import database_queries as db

import script as status

#from DatabaseScripts import database_queries as db		# For Testing

#import DatabaseScripts.database_queries as db

data = db.selectDatabaseData('Socket')
# data2 = db.selectDatabaseData('Socket', where_attribute = 'Socket_Id', where_value = 1)

#import weakref
import json
import power_outlet
import plug_connector as pc

power_outlets = []

#power_outlets.append(power_outlet.PowerOutlet(1,2,3,4,5,6,7,8))

# Load all sockets into the Plug object/ plug instance
for sockets in range(len(data)):
	# print("Power Outlet ID:")
	# print(data[sockets]['Socket_Id'])	# Hier hole ich nur die IP aus der DB
	# print(data[sockets]['Ip_Address'])	# Hier hole ich nur die IP aus der DB
	# print(data[sockets]['Manufacturer'])	# Hier hole ich nur die IP aus der DB
	#print(data[sockets]['Socket_Id'], data[sockets]['Plug_Id'], data[sockets]['Ip_Address'],data[sockets]['Manufacturer'], 'noname', 0, 0, 'startedenergy',0, 0)

	
	#started_energy_count = pc.getPlugEnergy(data[sockets]['Ip_Address'],data[sockets]['Plug_Id'],data[sockets]['Manufacturer'])
	started_energy_count = 0
	#print(data[sockets]['Socket_Id']-1)
	power_outlets.append(power_outlet.PowerOutlet(data[sockets]['Socket_Id'], data[sockets]['Plug_Id'], data[sockets]['Ip_Address'],data[sockets]['Manufacturer'], 'noname', 0, 0, started_energy_count,0, 0))
	#print("\n")

# print(data2[0]['Ip_Address'])	# Hier lade ich zuerst alle Daten vom Socket aus der DB
#print(data2[0]['Plug_Id'])
#print(data2[0]['Manufacturer'])


# print ("Print all sockets")
# for instance in power_outlet.PowerOutlet.instances:
	# print(instance.socket_id)
	# print(instance.plug_id)
	# print(instance.name)
	# print(instance.ip_address)
	# print(instance.state)
	# print(instance.started_energy_count)
	# print(instance.manufacturer)
	# print("\n")

# print("power_outlet 0, IP:")
# print(power_outlets[0].ip_address)

import plug_connector as pc
import time

class energyChecker(threading.Thread):

	def __init__ (self, id, charge_energy):
		threading.Thread.__init__(self)
		id = id-1
		self.id = id
		self._is_running = True

		#print("Started energychecker thread with id", id, "and instance",  self)
		pc.setPlugData(power_outlets[self.id].ip_address, power_outlets[self.id].plug_id, power_outlets[self.id].manufacturer, 1)
		power_outlets[self.id].state = 1
		power_outlets[self.id].start_time = time.time()
		power_outlets[self.id].charge_energy = charge_energy
		power_outlets[self.id].started_energy_count = pc.getPlugEnergy(power_outlets[self.id].ip_address, power_outlets[self.id].plug_id, power_outlets[self.id].manufacturer,)


	def run(self):
		print("Check for run")
		while(self._is_running):
			#print("Still running ID", self.id," and instance", self)
			#print(power_outlets[self.id].socket_id, power_outlets[self.id].plug_id, power_outlets[self.id].ip_address, power_outlets[self.id].manufacturer, power_outlets[self.id].charge_energy)

			checkSocketOnce(self, power_outlets[self.id].socket_id, power_outlets[self.id].plug_id, power_outlets[self.id].ip_address, power_outlets[self.id].manufacturer, power_outlets[self.id].charge_energy)
			if (self._is_running):
				time.sleep(1)
		#print("Stopped,", self)
		running_sockets[self.id-1]=0
		pc.setPlugData(power_outlets[self.id].ip_address, power_outlets[self.id].plug_id, power_outlets[self.id].manufacturer, 0)
		power_outlets[self.id].state = 0
						
	def status(self):
		return ("Status", self)
	
	def stop(self):
		self._is_running = False
		pc.setPlugData(power_outlets[self.id].ip_address, power_outlets[self.id].plug_id, power_outlets[self.id].manufacturer, 0)
		checkSocketOnce(self, power_outlets[self.id].socket_id, power_outlets[self.id].plug_id, power_outlets[self.id].ip_address, power_outlets[self.id].manufacturer, power_outlets[self.id].charge_energy)
		power_outlets[self.id].state = 0
		print("Stopping energychecker for plug", self.id, ", charged ", power_outlets[self.id].used_energy, "Wh")
		return power_outlets[self.id].used_energy
		
	def startCheckSocketThread(id, charge_energy):
		current = energyChecker(id, charge_energy)
		running_sockets[id-1] = current
		current.start()
		
	def stopCheckSocketThread(id):
		#print( energyChecker.stop(running_sockets[id-1]) )	
		return energyChecker.stop(running_sockets[id-1])
		
	def getUsedEnergy(id):
		return power_outlets[id-1].used_energy	
		
	def getEnergyCount(id):
		return pc.getPlugEnergy(power_outlets[id-1].ip_address, power_outlets[id-1].plug_id, power_outlets[id-1].manufacturer)		
	
running_sockets = list(range(len(data)))

def checkSocketOnce(self, socket_id, plug_id, ip_address, manufacturer, charge_energy):
	
	#print("Running energycheck/ checkPlug for Socket", socket_id, "and Plug", plug_id, "Array-ID:", socket_id-1, "IP:", ip_address)
	array_id=socket_id-1
	start_energycount = power_outlets[array_id].started_energy_count
	start_timeticks = time.time()
	current_energycount = pc.getPlugEnergy(ip_address, plug_id, manufacturer)
	used_energy = current_energycount-start_energycount
	power_outlets[array_id].used_energy = used_energy
	current_timeticks = time.time()

	#print(" Debugging: Current mean power is ",(current_energycount-start_energycount)/((current_timeticks-start_timeticks)/3600), "w")
	#print(" Debugging: Current power", 	tplink.data(1, 'read_power')/1000, "w")
	#print(" Debugging: charged time", current_timeticks-start_timeticks, "s")
	print(" Debugging: Starting energy was:", start_energycount, "Wh and last energycount:", current_energycount, "Wh to charge:", charge_energy, "Wh and already charged:", current_energycount-start_energycount, "Wh")
	#last_timeticks = time.time()

	status.socketStatus[socket_id - 1]['to_charge'] = charge_energy
	status.socketStatus[socket_id - 1]['already_charged'] = current_energycount-start_energycount
	
	if used_energy >= charge_energy:
		print("Stopping charge process")
		self._is_running = False
		#energyChecker.stopCheckSocketThread(socket_id)
		
	print("Starting energy was: ", start_energycount, "and last energycount: ", current_energycount)

if __name__ == "__main__":
	
	energyChecker.startCheckSocketThread(1, 1)
	
	time.sleep(60)
	
	print(energyChecker.getEnergyCount(1))
	print(energyChecker.getUsedEnergy(1))
			
	# energyChecker.stopCheckSocketThread(1)	
	
