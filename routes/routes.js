var chgpass = require('config/chgpass');
var register = require('config/register');
var login = require('config/login');
var logout = require('config/logout');
var chatHistory = require('config/chatHistory');
var sendCode = require('config/sendCode');
var vertify = require('config/vertify');

module.exports = function(app) {

    app.get('/', function(req, res)
    {
        console.log("-> root called")
        console.log("** session_id: " + req.session.id);
        res.end("Welcome to VGO server 1.0!");
    });

    app.post('/sendCode',function(req, res)
    {
        console.log("->send verification code called");

        var phone_number = req.body.phone_number;
        var area_code  = '+1';
        
        sendCode.sendCode(phone_number, area_code, function (found) {
            console.log(found);
            res.json(found);
        });
    });

    app.post('/vertify',function(req, res)
    {
        console.log("->vertify code is sent");

        var code  = req.body.code;
        var objectid = req.body.objectid;
        console.log('the code sent is '+ code);
        vertify.vertify(code, objectid, function (found) {
            console.log(found);
            res.json(found);
        });
    });

    app.get('/chat', function(req, res){
        res.sendFile(__dirname + '/chat.html');
    });
    
    app.get('/online_users', function (req, res) {
        console.log("-> onlineUsers called: " + onlineUsersList.length);
        res.json({current_online_users:onlineUsersList.length});
    });

    app.post('/login',function(req, res)
    {
        var sess = req.session;
        console.log("-> login called");
        console.log("** session_id: " + sess.id);

        var phone_number = req.body.phone_number;
        var password = req.body.password;

        login.login(sess,phone_number,password,function (found){
            console.log(found);
            res.json(found);
            console.log("** user_id: " + sess.user_id);
        });
    });
    
    app.delete('/logout', function(req, res)
    {
        var sess = req.session;
        console.log("-> logout called");
        console.log("** session_id: " + sess.id);
        console.log("** user_id: " + sess.user_id + " destroyed");
        
        logout.logout(sess, function(found) {
            console.log(found);
            res.json(found);
        });
    });

    app.post('/register',function(req, res)
    {
        console.log("-> register called");

        var phone_number = req.body.phone_number;
        var email = req.body.email;
        var password = req.body.password;
        var first_name = req.body.first_name;
        var last_name = req.body.last_name;

        register.register(phone_number,email,password, first_name, last_name,function (found) {
            console.log(found);
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
            res.json({
                "code": "1",
                "msg": "Avatar uploaded successfully"
            });
        }else{
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
    * INPUT: user_id
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
    app.get('/get_avatar', function(req, res){

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

    app.post('/chat_history',function(req, res)
    {
        console.log("-> get chat history called");

        var sess = req.session;
        var other_user_id = req.body.other_user_id;
        var number_of_message = req.body.number_of_message;

        chatHistory.chatHistory(sess, other_user_id, number_of_message,function (found) {
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