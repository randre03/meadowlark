/**
 * Created by randre03 on 8/23/14.
 */
var express = require('express');
var handlebars = require('express3-handlebars');
var fortune = require('./lib/fortune');
var app = express();

app.use(require('body-parser')()); //safe to use with Express 4.0

//set-up the Handlebars view engine
app.engine('handlebars', handlebars({
    defaultLayout: 'main',
    helpers:    {
        section: function(name, options) {
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }}
));

app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

//set-up Testing
app.use(function(req, res, next) {
    res.locals.showTests = app.get('env') != 'production' && req.query.test === '1';
    next();
});

//middleware to allow for the weather partial to work
app.use(function(req, res, next) {
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weather = getWeatherData();
    next();
});

//Routes
app.get('/', function(req, res) {
    res.render('home');
});

app.get('/about', function(req, res) {
    res.render('about', {
        fortune: fortune.getFortune(),
        pageTestScript: 'qa/tests-about.js'
    });
});

app.get('/nursery-rhyme', function(req, res) {
    res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme', function(req, res) {
    res.json({
        animal:     'squirrel',
        bodyPart:   'tail',
        adjective:  'bushy',
        noun:       'heck'
    });
});

app.get('/tours/hood-river', function(req, res) {
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function(req, res) {
    res.render('tours/request-group-rate');
});

app.get('newsletter', function(req, res) {
    //we will learn about csrf later
    //need to just pass a dummy value at this point
    res.render('newsleter', { csrf: 'dummyValue918273645' });
});

app.post('/process', function(req, res) {
    console.log('Form (from querystring): ' + req.query.form);
    console.log('CSRF token (from hidden form field: ' + req.query._csrf);
    console.log('Name (from visible form field): ' + req.body.name);
    console.log('Email (from visible form field): ' + req.body.email);
    res.redirect(303, '/thank-you');
});

//custom 404 Page
app.use(function(req, res, next) {
    res.status(404);
    res.render('404');
});

//Custom 500 Page
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

//weather function dummy data
function getWeatherData(){
    return {
        locations:
            [
                {
                    name: 'Portland',
                    forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                    iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                    weather: 'Overcast',
                    temp: '54.1 F (12.3 C)'
                },
                {
                    name: 'Bend',
                    forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                    iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                    weather: 'Partly Cloudy',
                    temp: '55.0 F (12.8 C)'
                },
                {
                    name: 'Manzanita',
                    forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                    iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                    weather: 'Light Rain',
                    temp: '55.0 F (12.8 C)'
                },
            ]
    };
}