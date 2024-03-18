var express = require('express');
var router = express.Router();
var moment = require('moment-timezone');
var request = require('request');
var request_promise = require('request-promise');
var moment = require('moment');
var fs = require('mz/fs');
const { route } = require('../assets');
const { json } = require('express');
const { body, validationResult } = require('express-validator');
const logger = require('../../config/winston');
const mailer = require('../mail');
const { default: consoleStamp } = require('console-stamp');

/**
 * @api {post} /pre/login 로그인
 * @apiName Login
 * @apiGroup webinar
 *
 * @apiBody {String} webinarName=Required 웨비나명
 * @apiBody {String} webinarType=Required 웨비나종류 : Live / Ondemand
 * @apiBody {String} hphone=Required 휴대폰번호
 *
 * @apiSuccess {String} status 전송 결과
 * @apiSuccess {String} uid 메시지 고유 번호
 * @apiSuccess {String} guid 뉴모사 GUID
 *
 * @apiSuccessExample 로그인 성공
 * {
 *     "uid": "DLGC2000000093632",
 *     "status": "1",
 *     "guid" : "981d7a4a-37cf-46ea-b21a-49282b5e7658"
 * }
 *
 * @apiErrorExample 로그인 실패
 *  {
 *      "status": "0"
 *  }
 *
 * @apiErrorExample Validation Error
 * {
 *     "errors": [
 *         {
 *             "value": "010-1111-2222",
 *             "msg": "Invalid value",
 *             "param": "hphone",
 *             "location": "body"
 *         }
 *     ]
 * }
 */
router.post('/login',
    [
        body('webinarName').not().isEmpty(),
        body('webinarName').isLength({ max: 50 }),

        body('webinarType').not().isEmpty(),
        body('webinarType').isIn(['Live', 'Ondemand']),

        body('hphone').not().isEmpty(),
        body('hphone').isLength({ max: 50 }),
        body('hphone').isMobilePhone(['ko-KR']),
    ],
    async function (req, res, next) {

        //Validation check
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // logger.info('/login validation error : ' + errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        // logger.info('/login start : ' + JSON.stringify(req.body));

        //1. CDO 검색 ======== start
        const parentId = 80;
        var searchString = "?______12='" + req.body.webinarName + "'___1='" + req.body.hphone + "'";
        var queryString = {
            'search': searchString,
            'depth': 'complete'
        }
        logger.info('/login CDO 검색 : ' + searchString);

        cns_eloqua.data.customObjectData.get(parentId, queryString).then(async (result) => {
            logger.info('/login CDO 검색 성공 count: ' + result.data.total);

            var resultForm = {};

            if (result.data.total > 0) {

                var loginData = result.data.elements[0];
                //2. 라이브 로그인 성공시 해당 CDO의 참석여부, 로그인시간 필드를 업데이트 ======== start
                if (req.body.webinarType === 'Live') {
                    logger.info('/login 로그인 성공(Live) : ' + loginData.uniqueCode);
                    var loginGuid = loginData.fieldValues.filter((it) => it.id === '2809')[0].value;
                    var loginUpdateData = loginData;
                    var loginUpdateDataFields = [
                        { type: 'FieldValue', id: '822', value: 'Y' },     // 참석여부 : Y/N (default:N)
                        { type: 'FieldValue', id: '807', value: moment().tz('Asia/Seoul').unix() }     // 로그인시간
                    ];
                    loginUpdateData.fieldValues = loginUpdateDataFields;

                    await cns_eloqua.data.customObjectData.update(parentId, loginData.id, loginUpdateData).then((result) => {

                        logger.info('/login CDO 업데이트(Live) : ' + loginData.uniqueCode);
                        resultForm.uid = loginData.uniqueCode;
                        resultForm.status = '1';
                        resultForm.guid = loginGuid;

                    }).catch((err) => {

                        logger.error('/login CDO 업데이트 실패' + err.message);
                        sendMail('[웨모사 Alert] login CDO 업데이트 실패', err.message);
                        resultForm.status = '-2';
                    })
                }
                //2. 라이브 로그인 성공시 해당 CDO의 참석여부, 로그인시간 필드를 업데이트 ======== end

                //3. 다시보기 로그인 성공시 uid, status 전달 ======== start
                /**
                 * 2023.11.08
                 *
                 * 로그인 성공 시, guid 값 추가전달 코드 구현
                 *
                */
                else {
                    logger.info('/login 로그인 성공(Ondemand) : ' + loginData.uniqueCode);
                    resultForm.uid = loginData.uniqueCode;
                    resultForm.status = '1';
                    resultForm.guid = loginData.fieldValues.filter((it) => it.id === '2809')[0].value;
                }
                //3. 다시보기 로그인 성공시 uid, status 전달 ======== end

            } else {
                logger.info('/login 검색결과 0건');
                resultForm.status = '0';
            }

            res.json(resultForm);

        }).catch((err) => {

            logger.error('/login CDO 검색 실패' + err.message);
            sendMail('[웨모사 Alert] login CDO 검색 실패', err.message);
            res.json(err);

        });
        //1. CDO 검색 ======== end
    });


/**
 * @api {post} /pre/preregist 사전등록
 * @apiName Preregist
 * @apiGroup webinar
 *
 * @apiBody {String} webinarName=Required 웨비나 구분값
 * @apiBody {String} webinarType=Required 웨비나종류 : Live / Ondemand
 * @apiBody {String} ibch 유입경로
 * @apiBody {String} lastName=Required 성
 * @apiBody {String} firstName=Required 이름
 * @apiBody {String} emailAddress=Required 이메일
 * @apiBody {String} company=Required 회사명
 * @apiBody {String} title 직책
 * @apiBody {String} hphone=Required 핸드폰
 * @apiBody {String} env 서버 유형 : dev/prod
 * @apiBody {String} attendType 참여방법 : on/off
 * @apiBody {String} PP_required=Required 개인정보 수집 이용동의 (필수) : Y/N
 * @apiBody {String} PP_optional 개인정보 수집 이용동의 (선택) : Y/N
 * @apiBody {String} optin1 마케팅 정보 수신동의 (선택) : Y/N
 * @apiBody {String} to3rd 제3자정보 제공동의 : Y/N
 * @apiBody {String} sensitive 민감정보 제공동의 : Y/N
 * @apiBody {String} track 선택트랙 : (ex) 트랙1;트랙2
 * @apiBody {String} que1 질문1
 * @apiBody {String} que2 질문2
 * @apiBody {String} que3 질문3
 * @apiBody {String} guid 뉴모사GUID
 * @apiBody {String} bizno 사업자등록번호
 * @apiBody {String} etc1 추후사용
 * @apiBody {String} etc2 추후사용
 * @apiBody {String} etc3 추후사용
 * @apiBody {String} etc4 추후사용
 * @apiBody {String} etc5 추후사용
 * @apiBody {String} subject 행사 주제 : (ex) data;cloud
 *
 * @apiSuccess {String} status 전송 결과
 *
 * @apiSuccessExample 사전등록 성공
 *  {
 *     "status": "1"
 *  }
 *
 * @apiErrorExample 중복 데이터 입력
 * {
 *     "status": "-1"
 * }
 *
 * @apiErrorExample 레코드 생성 실패
 * {
 *     "status": "0"
 * }
 *
 * @apiErrorExample Validation Error
 * {
 *     "errors": [
 *         {
 *             "value": "010-1111-2222",
 *             "msg": "Invalid value",
 *             "param": "hphone",
 *             "location": "body"
 *         }
 *     ]
 * }
 *
 */
router.post('/preregist',
    [
        body('webinarName').not().isEmpty(),//필수
        body('webinarName').isLength({ max: 50 }),

        //body('ibch').not().isEmpty(),
        body('ibch').isLength({ max: 50 }),

        body('lastName').not().isEmpty(), //필수
        body('lastName').isLength({ max: 50 }),

        body('firstName').not().isEmpty(), //필수
        body('firstName').isLength({ max: 50 }),

        body('emailAddress').not().isEmpty(), //필수
        body('emailAddress').isEmail(),

        body('company').not().isEmpty(), //필수
        body('company').isLength({ max: 50 }),

        body('title').isLength({ max: 50 }),

        body('hphone').not().isEmpty(), //필수
        body('hphone').isLength({ max: 50 }),
        body('hphone').isMobilePhone(['ko-KR']),

        //24.03.12 교체 및 수정
        body('subject').isLength({ max: 50 }),
        body('env').isIn(['dev', 'prod']),

        body('PP_required').not().isEmpty(),
        body('PP_required').isIn(['Y', 'N']),
        //필수아님
        // body('PP_optional').isIn(['Y', 'N']),
        // body('optin1').isIn(['Y', 'N']),
        // body('to3rd').isIn(['Y', 'N']),
        // body('sensitive').isIn(['Y', 'N']),

        //body('attendType').isIn(['on', 'off']),
        body('attendType').isIn(['on', 'off', '']),
        body('subject').isLength({ max: 50 }),

        body('webinarType').not().isEmpty(),
        body('webinarType').isIn(['Live', 'Ondemand'])
    ]
    , async function (req, res, next) {

        //Validation check
        const errors = validationResult(req);
        //Live 의 경우에만 que1,2,3 필수 => que1,2,3 은 항상 필수가 아니도록 수정 (2022-03-10)
        // if (req.body.webinarType == 'Live') {
        //     if(!req.body.hasOwnProperty('que1') || req.body.que1 == ""){
        //         errors.errors.push({
        //             "value": "",
        //             "msg": "Invalid value",
        //             "param": "que1",
        //             "location": "body"
        //         });
        //     }
        //     if(!req.body.hasOwnProperty('que2') || req.body.que2 == ""){
        //         errors.errors.push({
        //             "value": "",
        //             "msg": "Invalid value",
        //             "param": "que2",
        //             "location": "body"
        //         });
        //     }
        //     if(!req.body.hasOwnProperty('que3') || req.body.que3 == ""){
        //         errors.errors.push({
        //             "value": "",
        //             "msg": "Invalid value",
        //             "param": "que3",
        //             "location": "body"
        //         });
        //     }
        // }
        if (!errors.isEmpty()) {
            // logger.info('/preregist validation error : ' + errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        // logger.info('/preregist start : ' + JSON.stringify(req.body));

        var resultForm = {};

        // 1. 중복 데이터 조회 ===== start
        const cdoID = 80;
        var searchString = "?______12='" + req.body.webinarName + "'___1='" + req.body.hphone + "'";
        var queryString = {
            'search': searchString,
            'depth': 'complete'
        }
        logger.info('/preregist 중복데이터 CDO 검색 : ' + searchString);

        await cns_eloqua.data.customObjectData.get(cdoID, queryString).then((result) => {

            //CDO 중복값 존재
            if (result.data.total > 0) {
                logger.info('/preregist 중복데이터 존재');
                resultForm.status = "-1";
            }

        }).catch((err) => {
            //통신에러
            logger.error('/preregist 중복데이터 CDO 검색 실패 : ' + err.message);
            sendMail('[웨모사 Alert] preregist 중복데이터 CDO 검색 실패', err.message);
            resultForm.status = "-2";
        });

        if (resultForm.hasOwnProperty('status')) {
            return res.json(resultForm);
        }

        // 1. 중복 데이터 조회 ===== end

        // 2. 폼 데이터 제출 ===== start
        const formID = 383;
        // const formID = 838;
        var insertForm = mappedForm(req.body);


        await cns_eloqua.data.formData.create(formID, insertForm).then(async (result) => {

            resultForm.status = "1";

        }).catch((err) => {
            //통신에러
            logger.error('/preregist form 데이터 제출 실패 : ' + err.message);
            logger.error(err);
            // sendMail('[웨모사 Alert] preregist form 데이터 제출 실패', err.message);
            resultForm.status = "-2";
        })

        if (resultForm.hasOwnProperty('status')) {
            if (resultForm.status === "-2") {
                return res.json(resultForm);
            }
            else if (resultForm.status === "1") {
                logger.info('/preregist form 데이터 제출 완료(' + req.body.hphone + ')');
                res.json(resultForm)
            }
        }
        // 2. 폼 데이터 제출 ===== end

        // 3. 제출 데이터 확인 ===== start

        // 엘로콰 통신 지연: 10초
        await new Promise(resolve => setTimeout(resolve, 10000));

        await cns_eloqua.data.customObjectData.get(cdoID, queryString).then(async (result) => {

            if (result.data.total > 0) {    // CDO 제출 성공

                // 4. Unique code copy 필드 업데이트 ===== start
                var updateForm = result.data.elements[0];

                updateForm.fieldValues = [
                    {
                        "type": "FieldValue",
                        "id": "838",
                        "value": updateForm.uniqueCode
                    }
                ];
                logger.info('/preregist CDO 생성 확인 성공(' + req.body.hphone + ') : ' + updateForm.uniqueCode);

                await cns_eloqua.data.customObjectData.update(cdoID, updateForm.id, updateForm).then((result) => {

                    // 업데이트 성공
                    resultForm.uid = updateForm.uniqueCode;
                    logger.info('/preregist CDO 업데이트 성공(' + req.body.hphone + ') : ' + resultForm.uid);

                }).catch((err) => {
                    //통신에러
                    logger.error('/preregist CDO 업데이트 실패(' + req.body.hphone + ') : ' + err.message);
                    sendMail('[웨모사 Alert] preregist CDO 업데이트 실패', err.message);
                })
                // 4. Unique code copy 필드 업데이트 ===== end

            } else {    // CDO 제출 실패
                logger.error('/preregist formprocessing 후 CDO 생성 실패(' + req.body.hphone + ') 1회차');
                sendMail('[웨모사 Alert] preregist formprocessing 후 CDO 생성 실패 1회차', 'formprocessing 10초 초과 레코드 발생, 2회차 시도');

                // 5. 1회 갱신 실패한 레코드는 10초를 더 기다린 후 재시도 ===== start
                await new Promise(resolve => setTimeout(resolve, 10000));

                await cns_eloqua.data.customObjectData.get(cdoID, queryString).then(async (result) => {
                    if (result.data.total > 0) {    // CDO 제출 성공

                        // 4. Unique code copy 필드 업데이트 ===== start
                        var updateForm = result.data.elements[0];

                        updateForm.fieldValues = [
                            {
                                "type": "FieldValue",
                                "id": "838",
                                "value": updateForm.uniqueCode
                            }
                        ];
                        logger.info('/preregist CDO 생성 확인 성공(' + req.body.hphone + ') : ' + updateForm.uniqueCode);

                        await cns_eloqua.data.customObjectData.update(cdoID, updateForm.id, updateForm).then((result) => {

                            // 업데이트 성공
                            resultForm.uid = updateForm.uniqueCode;
                            logger.info('/preregist CDO 업데이트 성공(' + req.body.hphone + ') : ' + resultForm.uid);

                        }).catch((err) => {
                            //통신에러
                            logger.error('/preregist CDO 업데이트 실패(' + req.body.hphone + ') : ' + err.message);
                            sendMail('[웨모사 Alert] preregist CDO 업데이트 실패', err.message);
                        })
                        // 4. Unique code copy 필드 업데이트 ===== end

                    } else {    // CDO 제출 실패
                        logger.error('/preregist formprocessing 후 CDO 생성 실패(' + req.body.hphone + ') 2회차');
                        sendMail('[웨모사 Alert] preregist formprocessing 후 CDO 생성 실패 2회차', 'formprocessing 20초 초과 레코드 발생, uid copy 수동 업데이트 필요');
                    }
                });
                // 5. 1회 갱신 실패한 레코드는 10초를 더 기다린 후 재시도 ===== end
            }

        }).catch((err) => {
            //통신에러
            logger.error('/preregist CDO 검색 실패 : ' + err.message);
            sendMail('[웨모사 Alert] preregist CDO 검색 실패', err.message);
        });

        // 3. 제출 데이터 확인 ===== end
    });

function mappedForm(data) {
    var resultform = {};

    resultform.type = "FormData";

    resultform.fieldValues =   [
        {
            "type": "FormField",
            "id": "6800",
            "name": "webinarType",
            "value": data.webinarType
        },
        {
            "type": "FormField",
            "id": "10432",
            "name": "뉴모사GUID",
            "value": data.guid
        },
        {
            "type": "FormField",
            "id": "5820",
            "name": "웨비나명",
            "value": data.webinarName
        },
        {
            "type": "FormField",
            "id": "5810",
            "name": "Email Address",
            "value": data.emailAddress
        },
        {
            "type": "FormField",
            "id": "5811",
            "name": "Last Name",
            "value": data.lastName
        },
        {
            "type": "FormField",
            "id": "5812",
            "name": "First Name",
            "value": data.firstName
        },
        {
            "type": "FormField",
            "id": "5813",
            "name": "Company",
            "value": data.company
        },
        {
            "type": "FormField",
            "id": "12211",
            "name": "BizNo",
            "value": data.bizno
        },
        {
            "type": "FormField",
            "id": "5824",
            "name": "Title",
            "value": data.title
        },
        {
            "type": "FormField",
            "id": "5815",
            "name": "Mobile Phone",
            "value": data.hphone
        },
        {
            "type": "FormField",
            "id": "5816",
            "name": "evn",
            "value": data.env
        },
        {
            "type": "FormField",
            "id": "12037",
            "name": "Subject",
            "value": data.subject
        },
        {
            "type": "FormField",
            "id": "5817",
            "name": "ibch",
            "value": data.ibch
        },
        {
            "type": "FormField",
            "id": "5826",
            "name": "폼 제출시간",
            "value": moment().tz('Canada/Eastern').format("YYYY-MM-DD HH:mm:ss")

        },
        {
            "type": "FormField",
            "id": "5821",
            "name": "개인정보 수집•이용 동의 (필수)",
            "value": data.PP_required
        },
        {
            "type": "FormField",
            "id": "5822",
            "name": "개인정보 수집•이용 동의 (선택)",
            "value": data.PP_optional
        },
        {
            "type": "FormField",
            "id": "5823",
            "name": " 마케팅 정보 수신동의 (선택)",
            "value": data.optin1
        },
        {
            "type": "FormField",
            "id": "12208",
            "name": "제3자정보 제공동의 ",
            "value": data.to3rd
        },
        {
            "type": "FormField",
            "id": "12209",
            "name": "민감정보 제공동의 ",
            "value": data.sensitive
        },
        {
            "type": "FormField",
            "id": "12038",
            "name": "참여방법",
            "value": data.attendType
        },
        {
            "type": "FormField",
            "id": "10658",
            "name": "선택트랙",
            "value": data.track
        },
        {
            "type": "FormField",
            "id": "12157",
            "name": "설문1",
            "value": data.que1
        },
        {
            "type": "FormField",
            "id": "6122",
            "name": "설문2",
            "value": data.que2
        },
        {
            "type": "FormField",
            "id": "6123",
            "name": "설문3",
            "value": data.que3
        },
        {
            "type": "FormField",
            "id": "12158",
            "name": "etc1",
            "value": data.etc1
        },
        {
            "type": "FormField",
            "id": "12159",
            "name": "etc2",
            "value": data.etc2
        },
        {
            "type": "FormField",
            "id": "12160",
            "name": "etc3",
            "value": data.etc3
        },
        {
            "type": "FormField",
            "id": "12161",
            "name": "etc4",
            "value": data.etc4
        },
        {
            "type": "FormField",
            "id": "12162",
            "name": "etc5",
            "value": data.etc5
        },
    ]



    //선택 필드
    // if (data.agree2 == 'Y') {
    //     resultform.fieldValues.push({
    //         "type": "FieldValue",
    //         "id": "12058",
    //         "name": "Title",
    //         "value": data.title
    //     });
    //     //recom 있던 위치
    // }



    return resultform;
}

router.post('/logout',
    [
        body('uid').not().isEmpty()
    ],
    async function (req, res, next) {

        //Validation check
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        var resultForm = {};

        // 1. Withyou_webinar : 기존 데이터 id 검색 ===== start
        const cdoID = 80;
        var searchString = "?uniqueCode='" + req.body.uid + "'"
        var queryString = {
            'search': searchString,
            'depth': 'minimal'
        }
        logger.info('/logout 기존 데이터 id 검색 : ' + searchString);

        await cns_eloqua.data.customObjectData.get(cdoID, queryString).then(async (result) => {

            if (result.data.total > 0) {
                //CDO 검색 완료
                var loginData = result.data.elements[0];
                logger.info('/logout 기존 CDO id : ' + loginData.id);

                // 2. Withyou_webinar : 로그아웃시간 update ===== start
                var updateData = {};
                updateData.id = loginData.id;
                updateData.fieldValues = [
                    { type: 'CustomObjectField', id: '808', value: moment().tz('Asia/Seoul').unix() }   //로그아웃 시간
                ];

                await cns_eloqua.data.customObjectData.update(cdoID, loginData.id, updateData).then((result) => {

                    logger.info('/logout CDO 업데이트 완료 : ' + loginData.id);
                    resultForm.status = "1";

                }).catch((err) => {
                    logger.error('/logout CDO 업데이트 실패 : ' + err.message);
                    resultForm.status = "0";
                });

                // 2. Withyou_webinar : 로그아웃시간 update ===== end

            } else {
                //CDO 검색 실패
                logger.info('/logout 기존 데이터 검색 결과 0건');
                resultForm.status = "0";
            }

        }).catch((err) => {
            logger.error('/logout 기존 데이터 id 검색 에러 : ' + err.message);
            resultForm.status = "0";
        })

        // 1. Withyou_webinar : uid로 CDO id 검색 ===== end

        return res.json(resultForm);
    });


router.post('/ondemand',
    [
        body('uid').not().isEmpty(),
        body('webinarName').not().isEmpty(),
    ],
    async function (req, res, next) {

        //Validation check
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        var resultForm = {};

        // 1. Withyou_webinar : 기존 데이터 EmailAddress 검색 ===== start
        const withyouCDOid = 80;
        var searchString = "?uniqueCode='" + req.body.uid + "'";
        var queryString = {
            'search': searchString,
            'depth': 'minimal'
        };
        logger.info('/ondemand 기존 데이터 Email 검색 : ' + searchString);

        await cns_eloqua.data.customObjectData.get(withyouCDOid, queryString).then(async (result) => {

            if (result.data.total > 0) {
                // 기존 데이터 검색결과 존재
                var resultEmail = result.data.elements[0].fieldValues.find(item => item.id === '778').value;
                logger.info('/ondemand 기존 데이터 Email : ' + resultEmail);

                // 2. Withyou_다시보기 create ===== start
                const ondemandCDOid = 84;
                var insertForm = {};
                insertForm.type = 'CustomObjectData';
                insertForm.fieldValues = [
                    { type: 'CustomObjectField', id: '818', value: resultEmail },   // Email Address
                    { type: 'CustomObjectField', id: '819', value: moment().tz('Asia/Seoul').unix() },   // 로그인 시간
                    { type: 'CustomObjectField', id: '820', value: req.body.webinarName }   // 시청한 웨비나명
                ];

                await cns_eloqua.data.customObjectData.create(ondemandCDOid, insertForm).then(async (createresult) => {

                    logger.info('/ondemand CDO 데이터 생성 완료 : ' + createresult.data.id);
                    resultForm.status = "1";

                }).catch((err) => {
                    //통신에러
                    logger.error('/ondemand CDO 데이터 생성 실패 : ' + err.message);
                    resultForm.status = "0";
                });

                // 2. Withyou_다시보기 insert ===== end

            } else {
                // 기존 데이터 검색결과 0건
                logger.info('/ondemand CDO 데이터 검색결과 0건');
                resultForm.status = "0";
            }

        }).catch((err) => {
            //통신에러
            logger.error('/ondemand CDO 검색 실패 : ' + err.message);
            resultForm.status = "0";
        })

        // 1. Withyou_webinar : 기존 데이터 EmailAddress 검색 ===== end

        return res.json(resultForm);
    });

/*
    메일 전송 테스트용 메소드
    Withyou_알림이메일수신목록 CDO의 메일주소로 메일을 보낸다

    title: 메일 제목
    content: 메일 내용
*/
router.get('/mailtest', function (req, res, next) {
    sendMail(req.query.title, req.query.content);
    res.json('메일전송 완료');
})

async function sendMail(title, content) {

    var searchString = "?____1='Y'";
    var queryString = {
        'search': searchString,
        'depth': 'complete'
    }
    logger.info('알림메일 수신자 검색 : ' + searchString);

    await cns_eloqua.data.customObjectData.get(117, queryString).then(async (result) => {

        var email_list = "";

        if (result.data.total > 0) {
            // 수신자 CDO 검색 완료
            var emailList = result.data.elements;
            for (var email of emailList) {
                email = email.fieldValues.find((item, idx) => { return item.id == '1117'; }).value;
                email_list += email + ", "
            }

        } else {
            // 수신자 CDO 검색 결과 0건
            logger.info('이메일 수신 리스트 검색 결과 0건');
            email_list = "mhpark@goldenplanet.co.kr";
        }

        let emailParam = {
            toEmail: email_list,
            subject: title,
            text: content
        };

        // 메일 송신
        mailer.sendGmail(emailParam);

    }).catch((err) => {
        logger.error('에러 알림 수신자 검색 에러 : ' + err.message);

        var tempEmailList = ['mhpark@goldenplanet.co.kr', 'jjjeon@goldenplanet.co.kr','sjlee@goldenplanet.co.kr','hylee@goldenplanet.co.kr'];

        let emailParam = {
            toEmail: tempEmailList,
            subject: "[웨모사 Alert] 메일 수신자 리스트 검색 불가",
            text: err.message
        };

        // 메일 송신
        mailer.sendGmail(emailParam);
    })
    return "send Alert"
}

module.exports = router;