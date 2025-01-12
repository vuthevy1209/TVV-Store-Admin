require('dotenv').config(); // load the env variables
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {connect} = require("./config/database/index.js");
const hbsHelpers = require('handlebars-helpers');
const { engine } = require('express-handlebars');
const router = require('./routes/index');

const app = express();

require('dotenv').config();

// Connect to database
connect();


// passport
const passport = require('./config/auth/passport');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const {sequelize} = require('./config/database'); // Adjust the path to your Sequelize instance
const MongoStore = require('connect-mongo');
const mongoDb = require('./config/database/mongo');
mongoDb.connect();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: parseInt(process.env.COOKIE_MAX_AGE, 10) // 24 hours
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions', // Optional, default is 'sessions'
        ttl: parseInt(process.env.SESSION_TTL, 10)
    }),
}));


app.use(passport.initialize());
// app.use(passport.authenticate('session'));
app.use(passport.session());

// view engine setup
const viewsPath = path.join(__dirname, 'views');
const layoutsPath = path.join(viewsPath, 'layouts');
const partialsPath = path.join(viewsPath, 'partials');

const hbs = engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: layoutsPath,
    partialsDir: partialsPath,
    helpers: {
        ...hbsHelpers(),
        includes: function (array, value) {
            return array && array.includes(value);
        },
        eq: function (a, b) {
            return a === b;
        },
        // Add the formatCurrency helper
        formatCurrency: function (value, locale = 'en-US', currency = 'USD') {
            if (typeof value !== 'number') {
                return value; // Return unformatted value if it's not a number
            }
            // Use Math.round to remove the fractional part
            const integerValue = Math.round(value);
            // Format with Intl.NumberFormat
            let formattedCurrency = new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0, // No decimal places
                maximumFractionDigits: 0, // No decimal places
            }).format(integerValue);

            return formattedCurrency;
        }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    onPartialNotFound: function (name) {
        console.error(`Partial not found: ${name}`);
    }
});

app.engine('.hbs', hbs);
app.set('view engine', '.hbs');
app.set('views', viewsPath);

app.use(logger('dev')); // log ra console các request đến server
app.use(cookieParser()); // parse các cookie gửi lên server
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // có tác dụng serve các file tĩnh như css, js, images
// Global variables


// flash
const flash = require('connect-flash');
app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    next();
});


require('./utils/node-cron.js');

router(app);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('page/error/error');
});

module.exports = app;
