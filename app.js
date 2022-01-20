var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var EloquaApi = require('./public/modules/eloqua-sdk');
var moment = require('moment');
const bodyParser = require('body-parser');
require('console-stamp')(console, {
    formatter: function() {
        return moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
    }
});
var os = require('os');

const schedule = require('node-schedule-tz');

var FolderPath = '../';
var fs = require('fs');


// 회사명 : LGCNS
var cns_eloqua_config = {
	sitename: 'LGCNS',
	username: 'GP.MCD',
	password: 'Gp6875@@'
};

global.cns_eloqua = new EloquaApi(cns_eloqua_config);

// Data/contacts 만 쓰는 project
var cns_assets = require('./routes/assets');
// var b2bgerp_global_data_contacts = require('./routes/b2bgerp_global/Data/contacts');
// var b2bgerp_kr_us_data_contacts = require('./routes/b2bgerp_kr_us/Data/contacts');
// var cs_integration_data_contacts = require('./routes/cs_integration/Data/contacts');
// var cs_integration_data_activities = require('./routes/cs_integration/Data/activities');
// var cs_integration_Assets_campaign = require('./routes/cs_integration/Assets/campaigns');
// var integrated_pipeline_data_contacts = require('./routes/integrated_pipeline/Data/Contact');

// bulk 혹은 system user 를 사용하는 project
// var bscard_app_bulk_contacts= require('./routes/bscard_app/Bulk/contacts/imports');
// var bscard_app_bulk_syncAction= require('./routes/bscard_app/Bulk/contacts/syncAction');
// var bscard_app_data_contacts = require('./routes/bscard_app/Data/contacts');

// var etc_function = require('./routes/common/etc_function');

// var iam_system_users = require('./routes/iam/system/users');


const dbconfig = require('./config/dbconfig.js');
const { url } = require('inspector');

var app = express();

var module_files = path.join(process.cwd(), '../modules');

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/modules', express.static(module_files));
app.use(bodyParser.json({limit: '50mb'})); //body 의 크기 설정
app.use(bodyParser.urlencoded({limit: '50mb', extended: true})); //url의 크기 설정
 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/index', index);
// app.use('/log', log);
app.use('/assets', cns_assets);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;