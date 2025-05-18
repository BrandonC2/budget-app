import socket
import ipaddress

"""
Client: 
1.	Prompts the user to input the IP address, port number of the server, 
    and a message to send to that server. 
2.	Sends the message to the server. 
3.	Display the server reply by using the same socket. 
4.	Displays an error message if the IP address or 
    port number were entered incorrectly. 
5.	The client should be able to send multiple messages to the server. 
    You may need to consider using the infinite loop as we discussed in the class
    
    User Manual:
    1. input a valid IP address
    2. input a valid/open port
    3. input a message
    4. If all conditions met, wait for server response
    5. Upon successful reply from server, user can continue to message or
       cut connection 

**** For assignment 8:
        Update your TCP client from Assignment 6 to:
    • Accept and process the following three queries only:
    1. What is the average moisture inside my kitchen fridge in the past three hours?
    2. What is the average water consumption per cycle in my smart dishwasher?
    3. Which device consumed more electricity among my three IoT devices (two
    refrigerators and a dishwasher)?
    • Reject any other input with a user-friendly message, e.g., 'Sorry, this query cannot be
    processed. Please try one of the following: [list the valid queries].'
    • Send valid queries to your TCP server for processing.
    • Display results from the server to the user.
"""

# Messaged to Server Info
# Router: 192.168.1.14
# valid port: 4226
# 23.243.109.2


def client():
    serverIP = input("What is the IP address of the server: ")

    # Checks if an IP address was input by user
    try:
        ipaddress.IPv4Address(serverIP)

    except ipaddress.AddressValueError:
        print("Invalid IP, Try Again")
        return

    # Checks if a valid integer was input by user
    try:
        serverPort = int(input("Port number: "))

        # Prevents an invalid (out of bounds) Port number
        if serverPort >= 2 ** 16 or serverPort <= 0:
            print("Invalid Port, Try Again")
            return

    # Catches if User inputs a non integer
    except ValueError:
        print("Invalid Port, Try Again")
        return

    # Create a TCP socket
    myTCPSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Connects Client to Server given their IP addressing and Port
    myTCPSocket.connect((serverIP, serverPort))

    print("Connected to server.")
    # 45.50.84.18

    print("Please select one of the three options by typing only the number \n")
    print("Type '1' for: What is the average moisture inside my kitchen fridge in the past three hours? \n")
    print("Type '2' for: What is the average water consumption per cycle in my smart dishwasher? \n")
    print("Type '3' for: Which device consumed more electricity among my three IoT devices (two refrigerators and a dishwasher)? \n")

    # Infinite loop
    running = True
    while running:

        # Send the data to the server
        someData = input("Query to send (Enter '4' to quit): ")

        # Quits when user types exit statement
        if someData == "4":
            print("Server Disconnect")
            break
    
        while someData not in ["1", "2", "3"]:
            if someData == "4":
                print("Server Disconnect")
                running = False
                break
            print("Invalid input. Please select '1', '2', '3', or '4' to EXIT.\n")
            someData = input("Query to send (Enter '4' to quit): ")

        myTCPSocket.send(bytearray(str(someData), encoding="utf-8"))

        # Receive the server's reply
        packetData = myTCPSocket.recv(1024)

        # Quits when Server is shut/does not respond
        if not packetData:
            print("Server Disconnect")
            break

        print("Fetching results... \n", packetData.decode("utf-8"))

    # Close connection once done
    myTCPSocket.close()
    print("Connection closed.")


if __name__ == "__main__":
    # Run client function
    client()
