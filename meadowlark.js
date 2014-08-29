/**
 * Created by randre03 on 8/23/14.
 */
var express = require('express');
var connect = require('connect');
var handlebars = require('express3-handlebars');
var fortune = require('./lib/fortune');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');
var nodemailer = require('nodemailer');
var credentials = require('./credentials');
var session = require('express-session');


var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(session({
    secret: credentials.cookieSecret,
    resave: true,
    saveUninitialized: true
}));

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

//set-up logging
switch(app.get('env')){
    case 'development':
        //compact, colorful dev logging brought to you by Morgan
        app.use(require('morgan')('dev'));
        break;
    case 'production':
        //module express-logger will rotate log every 24 hours
        app.use(require('express-logger')({
            path: __dirname + 'log/requests.log'
        }));
        break;
}

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

//middleware for pretty-file-upload; //TODO implement the jQuery File Upload described in Chapter 8
app.use('/upload', function(req, res, next) {
    var now = Date.now();
    jqupload.fileHandler({
        uploadDir: function() {
            return __dirname + '/public/uploads' + now;
        },
        uploadUrl: function() {
            return '/uploads/' + now;
        },
    })(req, res, next);
});

//set-up a nodemailer instance
var mailTransport = nodemailer.createTransport('SMTP', {
    service:    'Gmail',
    auth:       {
                    user:   credentials.gmail.user,
                    pass:   credentials.gmail.password
    }
}); //TODO create an example email

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

app.get('/jquery-test', function(req, res) {
    res.render('jquery-test');
});

app.get('/tours/request-group-rate', function(req, res) {
    res.render('tours/request-group-rate');
});

app.get('/newsletter', function(req, res) {
    //we will learn about csrf later
    //need to just pass a dummy value at this point
    res.render('newsletter', { csrf: 'dummyValue918273645' });
});

app.get('/contest/vacation-photo', function(req, res) {
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),month: now.getMonth()
    });
});

app.post('/contest/vacation-photo/:year/:month', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if(err) return res.redirect(303, '/error');
        console.log('received fields');
        console.log(fields);
        console.log('received files');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});

app.post('/process', function(req, res) {
    console.log('Form (from querystring): ' + req.query.form);
    console.log('CSRF token (from hidden form field: ' + req.query._csrf);
    console.log('Name (from visible form field): ' + req.body.name);
    console.log('Email (from visible form field): ' + req.body.email);

    if(req.xhr || req.accepts('json,html')==='json') {
        //if there was an error we would send { error: 'error description }
        res.send({ success: true });
    } else {
        //if there was an error we would redirect to an error page
        res.redirect(303, '/thank-you');
    }
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

function startServer() {
    app.listen(app.get('port'), function() {
        console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
    });
}

if(require.main === module) {
    ///the application is being run directly so just start it up
    startServer();
} else {
    //application was started as a module
    module.exports = startServer;
}


//weather function dummy data
function getWeatherData() {
    return {
        locations: [
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
            }
        ]
    };
}