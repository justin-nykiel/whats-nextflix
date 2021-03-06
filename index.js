const express = require('express')
const app = express()
const ejsLayouts = require('express-ejs-layouts')
const session = require('express-session')
const passport = require(__dirname+'/config/ppConfig.js')
const flash = require('connect-flash')
const isLoggedIn = require('./middleware/isLoggedIn')
const db = require('./models')
require('dotenv').config()
const methodOverride = require('method-override')

app.set('view engine', 'ejs')
app.use(ejsLayouts)
app.use(methodOverride('_method'))

app.use(express.static(__dirname + '/public/'))

//body parser
app.use(express.urlencoded({extended:false}))

//session middelware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))
//passport middleware
app.use(passport.initialize())
app.use(passport.session())
//flash middleware
app.use(flash())

//custom middleware
app.use((req, res, next)=>{
    //before every route it as attaching the flas mesage as well as the user data to res.locals
    res.locals.alerts = req.flash()
    res.locals.currentUser = req.user

    next() //moves along to next piece of middleware
})



app.use('/auth', require('./controllers/auth'))

app.get('/', (req, res)=>{
    res.render('home')
    
})
app.get('/profile', isLoggedIn, (req, res)=>{
    res.render('profile')
})

app.get('/genres', (req, res)=>{
    let options = {
            method: 'GET',
            url: 'https://unogsng.p.rapidapi.com/genres',
            headers: {
                'x-rapidapi-key': process.env.KEY,
                'x-rapidapi-host': 'unogsng.p.rapidapi.com'
            }
            };
        
        
            axios.request(options)
            .then(function (response) {
               res.send(response.data)
            })
})



const axios = require("axios").default;

app.get('/search/title', (req,res)=>{
    const options = {
    method: 'GET',
    url: 'https://unogsng.p.rapidapi.com/search',
    params: {
        query :req.query.searchTerm,
        limit : "10",
        countrylist : "78, 46",
        orderby : "rating"
    },
    headers: {
        'x-rapidapi-key': process.env.KEY,
        'x-rapidapi-host': 'unogsng.p.rapidapi.com'
    }
    };
    axios.request(options).then(function (response) {
        let results = response.data.results;
        return results
    }).then(results=>{
        res.render('results', {results})
    })
    .catch(function (error) {
        console.error(error);
    });
    

})

app.get('/search/genre', (req,res)=>{
   
    let options = {
        method: 'GET',
        url: 'https://unogsng.p.rapidapi.com/genres',
        headers: {
            'x-rapidapi-key': process.env.KEY,
            'x-rapidapi-host': 'unogsng.p.rapidapi.com'
        }
    };
        
        
    axios.request(options)
    .then(function (response) {
       let genreId = 0
        response.data.results.forEach(genre =>{
            if(genre.genre == req.query.genre){
                genreId = genre.netflixid
            }
        })
        console.log(genreId)
        return genreId
    })
    .then((genreId)=>{
        let optionsId = {
        method: 'GET',
        url: 'https://unogsng.p.rapidapi.com/search',
        params: {
            genrelist: genreId,
            limit : "10",
            countrylist : "78, 46",
            orderby : "rating"
        },
        headers: {
            'x-rapidapi-key': process.env.KEY,
            'x-rapidapi-host': 'unogsng.p.rapidapi.com'
        }
        };


        axios.request(optionsId).then(function (response) {
            let results = response.data.results;
            return results
        }).then(results=>{
            res.render('results', {results})
        })
        .catch(function (error) {
            console.error(error);
        });
    })
    .catch(function (error) {
        console.error(error);
    })
    

   
        
       
    

})

app.use('/watchlist', require('./controllers/watchlist'))


app.listen(process.env.PORT || 8000)

