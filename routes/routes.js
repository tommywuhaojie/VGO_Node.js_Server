var chgpass = require('config/chgpass');
var register = require('config/register');
var login = require('config/login');
//var session = require('express-session');

module.exports = function(app) {

    app.get('/', function(req, res)
    {
        console.log("user_id " + req.session.user_id);
        console.log("has " + req.session.id + " session");
        req.session.user_id = "123";
        res.end("Welcome to VGO server 1.0!");
    });

    app.get('/chat', function(req, res){
        res.sendFile(__dirname + '/chat.html');
    });

    app.post('/login',function(req, res)
    {
        var sess = req.session;
        if(sess.user_id){
            console.log("has session!");
        }else{
            console.log("has NO session");
        }
        console.log(sess.user_id);
        
        var phone_number = req.body.phone_number;
        var password = req.body.password;

        login.login(sess,phone_number,password,function (found){
            console.log(found);
            res.json(found);
            console.log(sess.user_id);
        });
    });

    app.get('/logout', function(req, res)
    {
        console.log(req.session.id + " session destroy");
        req.session.destroy(function(err){
            res.json({
                'code' : "1",
                'msg'  : "Successfully logged out"
            })
        });
    });

    app.post('/register',function(req, res)
    {
        console.log(req.body);

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