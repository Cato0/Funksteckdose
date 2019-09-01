#!/usr/bin/env python

import sys
import socket
import struct
import json 


port = 9999

command_dictionary = {
	'status'	:	'{	"system"	:{	"get_sysinfo":{}	}	}',
	1	:	'{"system":{"set_relay_state":{"state":1}}}',
	0	:	'{"system":{"set_relay_state":{"state":0}}}',
	'read_power'	:	'{"emeter":{"get_realtime":{}}}',
	'read_energy'	:	'{"emeter":{"get_realtime":{}}}'
}

# XOR Autokey Cipher with starting key = -85 which equals 171=(256-85)

def encrypt(string):
	key = 256-85
	#result = ""
	# print (len(string))
	output = bytearray(struct.pack(">I", len(string)))	#number = int(len(string))
	#number = [0, 0, 0, 30]
	#bytestring = bytes(number)
	# print("integer {int} in bytes is {bytes}".format(int=number, bytes=bytestring))
	#bytestring = number.to_bytes(5, 'big')

	for plainchar in string:
		# ^ is used for an XOR in Python
		cryptchar = key ^ ord(plainchar)
		key = cryptchar
		output.append(cryptchar)
	return bytes(output)

def decrypt(string):
	key = 256-85
	output = []
	for cryptchar in string:
		plainchar = key ^ cryptchar
		key = cryptchar
		output.append(plainchar)
	output=bytes(output).decode("utf-8")
	return str(output)
	
	
def data(ip, command):
	sendingcommand = command_dictionary[command]

	sock_tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	sock_tcp.connect((ip, port))
	sock_tcp.send(encrypt(sendingcommand))
	data = sock_tcp.recv(2048)
	sock_tcp.close()

	decrypt(data[4:])
	output = json.loads(decrypt(data[4:]))
	
	#print ("Sent command: ", sendingcommand)
	#print ("Received information: ", output)
	
	if command == "status":
		return(output["system"]["get_sysinfo"]["relay_state"])
	elif (command == "read_power"):
		return(output["emeter"]["get_realtime"]["power_mw"])
	elif (command == "read_energy"):
		return(output["emeter"]["get_realtime"]["total_wh"])
	elif (command == 0) or (command == 1):
		return(output["system"]["set_relay_state"]["err_code"])
	
	
try:
	#print (len(sys.argv))
	if len(sys.argv) > 1:
		ip = ip_dictionary[sys.argv[1]]
		command = sys.argv[2]
		sendingcommand = command_dictionary[command]
		# print(command)

		sock_tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		sock_tcp.connect((ip, port))
		sock_tcp.send(encrypt(sendingcommand))
		data = sock_tcp.recv(2048)
		sock_tcp.close()

		decrypt(data[4:])
		
		#print ("Sent command: ", sendingcommand)
		#print ("Received information: ", decrypt(data[4:]))
		
		output = json.loads(decrypt(data[4:]))
		
		if command == "status":
			print(output["system"]["get_sysinfo"]["relay_state"])
		elif (command == "read_energy"):
			print(output["emeter"]["get_realtime"]["total_wh"])
		elif (command == "on") or (command == "off"):
			print(output["system"]["set_relay_state"]["err_code"])

	
except socket.error:
	quit("Cound not connect to host " + ip + ":" + str(port))

