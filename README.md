##Dedicated VGO Server using Node.js and MongoDB to achieve real-time backend and database on the cloud 

##Some useful URLs:  
* HOST_URL: http://ec2-52-40-59-253.us-west-2.compute.amazonaws.com:8080
* CHAT_ROOM_URL(for testing only, you can browse this via your browser): http://ec2-52-40-59-253.us-west-2.compute.amazonaws.com:8080/chat
* CHECK_ONLINE_USERS_URL: http://ec2-52-40-59-253.us-west-2.compute.amazonaws.com:8080/online_users

##Socket.io Client Side Documentation (For all Android and iOS App clients):  
** Note that the code bellow may be varied between Android/iOS and different socket.io libraries, please use them as a reference only.  
  
**socket** is your socket.io object


###Connect/Disconnect

** Note that before you can communicate with server via socket you must first login using http://HOST_URL/login and then connect, otherwise you won't be authenticated to make any valid communication with VGO server. ** 

* Initialize connection with VGO server:
```
socket.connect("HOST_URL");
```

* Disconnect from VGO server:
```
socket.disconnect();
```


###Instant Chat Message

* To send a private message to specific online client (every sent/received private message will be saved in server's database):  
```
socket.emit("private message", jsonObj);  
jsonObj format:  
 {
  "receiver_user_id" : "user_id of the person who will be receiving the message",  
  "message" : "the private message you want to send",
  "message_id" : "an unique ID of each message you send, recommend to use GUID for this ID" (Optional field) 
 }
```

* To receive a private message from a specific online client:  
```
socket.on("private message", jsonObj);
jsonObj format:  
{
 "sender_user_id": "user_id of the person who sent the message",  
 "message": "the private message you received"
}
```

* To receive a confirmation that your private message is successfully delivered to server
```
socket.on("delivery confirmation", "message_id");
"message_id" : (String) the unique message ID that you send together with the private message  
```

* To notify the other user that you are typing:
```
socket.emit("is typing", "user_id");
"user_id" : (String) the user_id of who you are chatting to
```

* To notify the other user that you stop typing:
```
socket.emit("stop typing", "user_id");
"user_id" : (String) the user_id of who you are chatting to
```

* To be notified that the other user is typing:
```
socket.on("is typing", "user_id");
"user_id" : (String) the user_id of who you are chatting to
```

* To be notified that the other user stops typing:
```
socket.on("stop typing", "user_id");
"user_id" : (String) the user_id of who you are chatting to
```

* Error Handling: All the server errors will be sent back to this listener
```
socket.on("server error", jsonObj);
jsonObj format:  
{
 "code": "error code",  
 "msg": "error description"
}

Details:
-1 -> Failed to authenticate
-2 -> Required field not set
-3 -> Invalid receiver_user_id
```

### For Testing 
* To send a public message to the chat room (testing only)  
```
socket.emit("chat message", "message");
message format: regular string
```

* To receive a public message in the chat room(testing only)  
```
socket.on("chat message", "message");
"message" format: regular string  
```



(more socket methods are comming, stay tuned...)  



##Some Server & Database Instructions:  

###How to connect to our server linux machine through PuTTY:

1. Download 'putty.exe' from this Google Drive (Windows Version) or from web (if you use Mac)
2. Download the 'vgo_putty_keypair.ppk' from Google Drive
3. Open 'putty.exe'
4. Enter Host Name as ec2-52-40-59-253.us-west-2.compute.amazonaws.com , use Port 22
5. On the left-side Category bar expand "SSH" tag and click on "Auth"
6. Click on "Browse..." to browse the 'vgo_putty_keypair.ppk'  
7. Go back to "Session" tag and click on "Open" to connect to our server
8. When you see "login as: " in linux terminal, type in "bitnami" and press Enter


###How to deploy Github project:

1. Log in to Bitnami linux machine (complete the steps above)
2. Run $ls
3. Run $cd apps
4. Run $cd VGO_Node.js_Server
5. Run $sudo git pull (to pull changes, require to enter Github credentials)
6. Run $sudo forever stopall (to stop node.js app)
7. Run $sudo node app.js (to test if server runs properly, press CRTL+C to stop)
8. Run $sudo forever start app.js (to keep server app running)
9. Close PuTTY to finish

Some Tips:
* If you encounter "Error: listen EADDRINUSE :::8080", try to run '$killall -9 node' to kill the process and try again



###How to access our VGO Database (through GUI):

1. Make sure you've downloaded and installed Robomongo, see https://robomongo.org/
2. Open Robomongo
3. Create a connection, Address: ec2-52-40-59-253.us-west-2.compute.amazonaws.com , use Default Port 27017
4. Click on Authentication tab, check "Perform authentication" and enter following information  
	Database: vgoDB  
       User Name: vgo  
	Password: thomas  
  Auth Mechanism: use default  
5. Click on "Save"
6. Click on "Connect"


###How to access our VGO Database (through command line):

1. Make sure you've downloaded and installed MongoDB on your local machine, see https://www.mongodb.com/
2. In your local terminal execute command: 
mongo ec2-52-40-59-253.us-west-2.compute.amazonaws.com:27017/vgoDB -u vgo -p thomas

3. If you see
```
connecting to: ec2-52-40-59-253.us-west-2.compute.amazonaws.com:27017/vgoDB
```
then you are connected successfully

4. Learn how to manipulate DB through command line you can go to
http://www.tutorialspoint.com/mongodb/mongodb_create_database.htm
