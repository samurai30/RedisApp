const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis  =require('redis');
const router = express.Router();

//Client Redis

let client = redis.createClient();

client.on('connect', function () {
  console.log('Connected to redis');
});


// port
const port = 3000;

//Init App

const app = express();

//View Engine\

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'hbs');

//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//methodOv
app.use(methodOverride('_method'));
//Search Page
app.get('/', function(req, res, next) {
  res.render('searchusers');
});


//Search Process
app.post('/user/search', function (req, res, next) {
   let id = req.body.id;
   client.hgetall(id, function (err, obj) {
       if(!obj){
           res.render('searchusers',{
               error: 'User does not exist'
           })
       }else {
           obj.id = id;
           res.render('details',{
               user: obj
           });

       }
   })
});
//add user

app.get('/user/add', function(req, res, next) {
    res.render('adduser');
});

// process add user

app.post('/user/add', function(req, res, next) {

    let id = req.body.userid;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;


    client.hmset(id,[
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ], function (err, reply) {
        if (err){
            console.log(err);
        }
        console.log(reply);
        res.redirect('/')
    });

});

// delete user

app.delete('/user/delete/:id', function(req, res, next) {
    client.del(req.params.id);

    res.redirect('/');
});

app.listen(port, function () {
  console.log('Server started on: '+port)
})
