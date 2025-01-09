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
app.use(express.json()); // parse các request gửi lên server dưới dạng json
app.use(express.urlencoded({extended: false})); // parse các request gửi lên server dưới dạng form
app.use(cookieParser()); // parse các cookie gửi lên server
app.use(express.static(path.join(__dirname, 'public'))); // có tác dụng serve các file tĩnh như css, js, images


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
