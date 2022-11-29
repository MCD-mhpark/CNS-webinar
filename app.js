var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var EloquaApi = require('./public/modules/eloqua-sdk');
var moment = require('moment');
const bodyParser = require('body-parser');
const mailer = require('./routes/mail');

require('console-stamp')(console, {
    formatter: function() {
        return moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
    }
});
var os = require('os');
const expressValidator = require('express-validator');
const userInfo = require('./config/userinfo.json');
const apiInfo = require('./config/apiInfo.json');

var FolderPath = '../';
var fs = require('fs');

const schedule = require('node-schedule-tz');
var schedule_webinar_Jobs;

// basic Auth
// var cns_eloqua_config = userInfo;
// global.cns_eloqua = new EloquaApi(cns_eloqua_config);

// oAuth Auth => 배포 이후 token 발행 과정 필요
var cns_eloqua_config = apiInfo;
global.cns_eloqua = {};

var cns_assets = require('./routes/assets');
var cns_webinar_preregist = require('./routes/webinar/preregist');

const { url } = require('inspector');

var app = express();

app.get('/oauth', function(req, res, next) {

    console.log('oAuth 토큰 발행');

    //이하 임의 1회 통신하여 oAuth 토큰 발행 확인
	var code = req.query.code;
	cns_eloqua_config['code'] = code;
	global.cns_eloqua = new EloquaApi(cns_eloqua_config);

    var queryString = { depth: req.query.depth ? req.query.depth : 'minimal', search: "?name='Withyou_알림이메일수신목록'" }

    cns_eloqua.assets.customObjects.get(queryString).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.log('에러 알림 수신자 검색 에러 : ' + err.message);

        var tempEmailList = ['songkim@goldenplanet.co.kr', 'cmlee@goldenplanet.co.kr', 'ysju@goldenplanet.co.kr', 'ykkim@goldenplanet.co.kr', 'tylee@goldenplanet.co.kr', 'jjjeon@goldenplanet.co.kr', 'hyojinkim@goldenplanet.co.kr', 'sjlee@goldenplanet.co.kr', 'jwkang@goldenplanet.co.kr'];

        let emailParam = {
            toEmail : tempEmailList,
            subject : "[ERROR][LG CNS 웨비나] 서비스 중 오류가 발생하였습니다.",
            text : "서비스 중 다음과 같은 오류가 발생하였습니다. \n 해당 서비스를 확인해 주세요. \n" + "\n 서비스 : LG CNS 웨비나 \n 오류내용 : 인증 토큰 재 발행 중 오류 \n 오류코드 : " + err.message
        };

        // 메일 송신
        mailer.sendGmail(emailParam);
    });
});

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

app.use('/assets', cns_assets);
app.use('/pre', cns_webinar_preregist);
app.use('/apidoc', express.static(__dirname + '/apidoc'));



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
	res.json({ error: err })
});

// app.use(expressValidator());

// token refresh scheduler
function schedule_oAuth_Token_Refresh() {
    let unique_jobs_name = "WITHYOU_WEBINAR" +  moment().format('YYYYMMDD_HH');
	let second = "0";
    let minutes = "0";
	let hours = "*/6";
	let dayofmonth = "*";
	let month = "*";
	let weekindex = "*";
	var schedate = second + ' ' + minutes + ' ' + hours + ' ' + dayofmonth + ' ' + month + ' ' + weekindex;
    
    schedule_webinar_Jobs = schedule.scheduleJob(unique_jobs_name, schedate, "Asia/Seoul", async function() {
        await cns_eloqua.refreshToken();
    });
}

schedule_oAuth_Token_Refresh();

module.exports = app;