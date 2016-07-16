var chgpass = require('config/chgpass');
var chat = require('config/chat');
var account = require('config/account');

module.exports = function(app) {

    app.get('/', function(req, res)
    {
        console.log("-> url root is called \n")
        console.log("** session_id: " + req.session.id);
        res.end("Welcome to VGO server 1.0!");
    });

    app.post('/account/sendCode',function(req, res)
    {
        console.log("-> send verification code is called \n");

        var phone_number = req.body.phone_number;
        var area_code  = '+1';
        
        account.sendCode(phone_number, area_code, function (found) {
            console.log(found);
            res.json(found);
        });
    });

    app.post('/account/verify',function(req, res)
    {
        console.log("-> verify code is sent \n");

        var code  = req.body.code;
        var phone_number = req.body.phone_number;
        console.log('the code sent is '+ code);
        account.verify(code, phone_number, function (found) {
            console.log(found);
            res.json(found);
        });
    });

    app.post('/account/register',function(req, res)
    {
        console.log("-> register is called \n");
        var objectid = req.body.objectid;
        var email = req.body.email;
        var password = req.body.password;
        var first_name = req.body.first_name;
        var last_name = req.body.last_name;
        var sex = req.body.sex;
        var driver_license = req.body.driver_license;
        var plate_number = req.body.plate_number;
        var colour = req.body.colour;
        var car_model = req.body.car_model;

        account.register(objectid, email, password, first_name, last_name, sex, driver_license, plate_number, colour, car_model,function (found) {
            console.log(found);
            res.json(found);
        });
    });

    app.post('/account/getUserInfo',function(req, res)
    {
        console.log("-> getUserInfo is called \n");
        var phone_number = req.body.phone_number;
        var user_id =  req.body.user_id;
        var get_my_info = req.body.get_my_info;
        var sess = req.session;
        
        account.getUserInfo(phone_number, user_id, get_my_info, sess, function(found){
           res.json(found); 
        });
    });

    app.get('/chat', function(req, res){
        res.sendFile(__dirname + '/chat.html');
    });
    
    app.get('/online_users', function (req, res) {
        console.log("-> getOnlineUsers is called: " + onlineUsersList.length + "\n");
        res.json({current_online_users:onlineUsersList.length});
    });

    app.post('/login',function(req, res)
    {
        var sess = req.session;
        console.log("-> login is called");
        console.log("** session_id: " + sess.id);

        var phone_number = req.body.phone_number;
        var password = req.body.password;

        account.login(sess,phone_number,password,function (found){
            console.log(found);
            res.json(found);
            console.log("** user_id: " + sess.user_id + "\n");
        });
    });
    
    app.delete('/logout', function(req, res)
    {
        var sess = req.session;
        console.log("-> logout is called");
        console.log("** session_id: " + sess.id);
        console.log("** user_id: " + sess.user_id + " destroyed" + "\n");
        
        account.logout(sess, function(found) {
            res.json(found);
        });
    });



    /*
     * Upload Avatar API
     * Upload a avatar for the current logged-in user
     *
     * INPUT: a multipart jpg image
     * Please use size of 256x256 image to
     * minimize server storage usage and upload/download speed
     *
     * OUTPUT: JSON Object contains 'code' & 'msg'
     * 1 : Avatar uploaded successfully
     * -1 : Upload failed, please login first
     *
     * */
    var multer  = require('multer')
    var storage = multer.diskStorage({
        destination: 'avatars/',
        filename: function (req, file, cb) {
            cb(null, req.session.user_id + '.jpg')
        }
    });
    var upload = multer({ storage: storage });
    app.post('/upload_avatar', upload.single('avatar'), function (req, res, next) {
        // req.file is the `avatar` file
        // req.body will hold the text fields, if there were any
        if(req.session.user_id) {
            console.log("-> avatar uploaded successfully \n");
            res.json({
                "code": "1",
                "msg": "Avatar uploaded successfully"
            });
        }else{
            console.log("-> avatar upload failed \n");
            res.json({
                "code": "-1",
                "msg": "Upload failed, please login first"
            });
        }
    });

    var fs = require('fs');
    function fileExists(filePath)
    {
        try {return fs.statSync(filePath).isFile();}
        catch (err) {return false;}
    }

    /*
    * Download Avatar API
    * 
    * INPUT: 'user_id' or None if you want to get avatar for current logged-in user
    *
    * OUTPUT: .jpg image file
    *
    * If you do not pass any user_id
    * then server will return the avatar of the current logged-in user
    *
    * If the user_id you pass in is not valid/ not exist/ has no session
    * then server will return a default avatar
    *
    * */
    app.post('/get_avatar', function(req, res){
        
        console.log("-> get avatar is called \n");

        var path = require('path');
        var appDir = path.dirname(require.main.filename);

        var user_id;
        if(req.body.user_id){
            user_id = req.body.user_id;
        }else if(req.session.user_id){
            user_id = req.session.user_id;
        }else{
            res.sendFile(path.resolve(appDir + '/avatars/default.jpg'));
            return;
        }

        if(fileExists(path.resolve(appDir + '/avatars/' + user_id + '.jpg'))){
            res.sendFile(path.resolve(appDir + '/avatars/' + user_id + '.jpg'));
        }else{
            res.sendFile(path.resolve(appDir + '/avatars/default.jpg'));
        }
    });

    app.post('/add_contact', function(req, res)
    {
        console.log("-> add_contact is called \n");

        var sess = req.session;
        var other_user_id = req.body.other_user_id;

        chat.addContact(sess, other_user_id, function (found) {
            res.json(found);
        });
    });
    
    app.post('/get_contact_list', function (req, res)
    {
        console.log("-> get_contact_list is called \n");

        var sess = req.session;

        chat.getContactList(sess, function (found) {
            res.json(found);
        });
    });

    app.post('/chat_history',function(req, res)
    {
        console.log("-> get chat history is called \n");

        var sess = req.session;
        var other_user_id = req.body.other_user_id;
        var number_of_message = req.body.number_of_message;

        chat.chatHistory(sess, other_user_id, number_of_message,function (found) {
            res.json(found);
        });
    });

    /* bellow end points are currently not in used */
    app.post('/api/chgpass', function(req, res)
    {
        var id = req.body.id;
        var opass = req.body.oldpass;
        var npass = req.body.newpass;

        chgpass.cpass(id,opass,npass,function(found){
            console.log(found);
            res.json(found);
        });
    });

    app.post('/api/resetpass', function(req, res)
    {

        var email = req.body.email;

        chgpass.respass_init(email,function(found){
            console.log(found);
            res.json(found);
        });
    });

    app.post('/api/resetpass/chg', function(req, res)
    {
        var email = req.body.email;
        var code = req.body.code;
        var npass = req.body.newpass;

        chgpass.respass_chg(email,code,npass,function(found){
            console.log(found);
            res.json(found);

        });
    });
};