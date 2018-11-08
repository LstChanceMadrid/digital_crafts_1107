const express = require('express');
const mustacheExpress = require('mustache-express');
const app = express();
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const connectionString = "postgres://localhost:5432/blogs";
const db = pgp(connectionString);
const session = require('express-session');
const sess = {secret: 'keyboard cat', resave: false, saveUninitialized: false}
const models = require('./models');

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/styles', express.static('styles'));
app.use(session(sess));

app.engine('mustache', mustacheExpress());

app.set('views', "./views"); 
app.set('view engine', 'mustache');

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/register', (req, res) => {

    let username = req.body.username;
    let password = req.body.password;

    let user = models.user.build({
        username : username,
        password : password
    });


    user.save().then(newUser => {
        res.redirect('/home');
    }).catch(error => {
        console.log(error);
    });
});

app.post('/log-in', (req, res) => {

    let username = req.body.username;
    let password = req.body.password;

    models.user.findOne({
        where : {
            username : username,
            password : password
        }
    }).then(user => {
        if (user) {
            res.redirect('/home');
        } else {
            res.send('Those credentials do not exist');
        }
    });
});










app.get('/home', (req, res) => {

    models.store.findAll().then(stores => {
        res.render('home', {stores:stores, });
    }).catch(error => {
        console.log('searching error', error);
    });
});

app.post('/add-store', (req, res) => {
    let name = req.body.name;
    let street = req.body.street;
    let city = req.body.city;
    let state = req.body.state;

    const store = models.store.build({
        name: name,
        street: street,
        city: city,
        state: state
    });

    store.save().then(newStore => {
        res.redirect('/home');
    }).catch(error => {
        console.log('adding error', error);
    });
});

app.post('/remove-store/:id', (req, res) => {

    let id = req.params.id;

    models.store.destroy({
        where : {
            id : id
        }
    }).then(() => {
        res.redirect('/home');
    });
});

app.get('/modify-store/:id', (req, res) => {

    let id = req.params.id;

    models.store.findOne({
        where : {
            id : id
        }
    }).then(store => {
        res.render('modify-store', {store : store});
    })
});

app.post('/update-store/:id', (req, res) => {
        let id = req.params.id;

        models.store.findOne({
            where : {
                id : id
            }
        }).then(store => {
            let name = req.body.name;
            let street = req.body.street;
            let city = req.body.city;
            let state = req.body.state;
            store.updateAttributes({
                name : name,
                street : street,
                city : city,
                state : state
            })
            console.log(store)
            res.redirect('/home')
        })

})










app.listen(3000, (req, res) => {
    console.log('Server running...');
});