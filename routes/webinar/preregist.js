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

/**
 *  로그인 API
 *  
 *  * body sample
 *    {
 *      "webinarName": "A", 
 *      "webinarType": "Live",
 *      "hphone":"01011112222"
 *    }
 */
router.post('/login', async function (req, res, next) {

    //1. CDO 검색 ======== start
    const parentId = 80;
    var searchString = "?______12='" + req.body.webinarName + "'___1='" + req.body.hphone + "'";
    var queryString = {
        'search' : searchString, 
        'depth' : 'complete'
    }
    
    cns_eloqua.data.customObjectData.get(parentId, queryString).then(async (result) => {
        console.log(result.data);

        var resultForm = {};
        
        if (result.data.total > 0) {

            var loginData = result.data.elements[0];

            //2. 라이브 로그인 성공시 해당 CDO의 참석여부, 로그인시간 필드를 업데이트 ======== start
            if (req.body.webinarType == 'Live') {
                var loginUpdateData = loginData;
                var loginUpdateDataFields = [
                    { type: 'FieldValue', id: '822', value: 'Y' },     // 참석여부 : Y/N (default:N)
                    { type: 'FieldValue', id: '807', value: moment().tz('Asia/Seoul').unix() }     // 로그인시간
                ];
                loginUpdateData.fieldValues = loginUpdateDataFields;

                await cns_eloqua.data.customObjectData.update(parentId, loginData.id, loginUpdateData).then((result) => {

                    console.log(loginData.uniqueCode + " : 업데이트");
                    resultForm.uid = loginData.uniqueCode;
                    resultForm.status = '1';

                }).catch((err) => {

                    console.log(err.message);

                    //TODO: 갱신 실패에 대한 에러코드 협의
                    resultForm.status = '-1';
                })
            }
            //2. 라이브 로그인 성공시 해당 CDO의 참석여부, 로그인시간 필드를 업데이트 ======== end

            //3. 다시보기 로그인 성공시 uid, status 전달 ======== start
            else {
                resultForm.uid = loginData.uniqueCode;
                resultForm.status = '1';
            }
            //3. 다시보기 로그인 성공시 uid, status 전달 ======== end

        } else {
            resultForm.status = '0';
        }

        res.json(resultForm);

    }).catch((err) => {

        console.error(err.message);
        res.json(err);

    });
    //1. CDO 검색 ======== end
});


/**
 *  사전등록 API
 */
router.post('/preregist', 
        [
            body('webinarName').not().isEmpty(),
            body('webinarName').isLength({max: 50}),

            body('ibch').not().isEmpty(),
            body('ibch').isLength({max: 50}),

            body('lastname').not().isEmpty(),
            body('lastname').isLength({max: 50}),

            body('name').not().isEmpty(),
            body('name').isLength({max: 50}),

            body('email').not().isEmpty(),
            body('email').isEmail(),

            body('company').not().isEmpty(),
            body('company').isLength({max: 50}),

            //TODO: 타이틀 picklist
            body('title').isLength({max: 50}),

            body('hphone').not().isEmpty(),
            body('hphone').isNumeric({no_symbols: true}),

            body('recom').isLength({max: 50}),

            body('agree1').not().isEmpty(),
            body('agree1').isIn(['Y','N']),
            body('agree2').isIn(['Y','N']),
            body('agree3').isIn(['Y','N'])
        ]
        , async function(req, res, next) {
        
    //Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    
    var resultForm = {};
    
    // 1. 중복 데이터 조회 ===== start
    const cdoID = 80;
    var searchString = "?______12='" + req.body.webinarName + "'___1='" + req.body.hphone + "'";
    var queryString = {
        'search' : searchString, 
        'depth' : 'complete'
    }

    await cns_eloqua.data.customObjectData.get(cdoID, queryString).then((result) => {
        console.log(result.data);

        //CDO 중복값 존재
        if (result.data.total > 0) {
            resultForm.status = "-1";
        }

    }).catch((err) => {
        //통신에러
        console.log(err);
        resultForm.status = "-2";
    });

    if (resultForm.hasOwnProperty('status')) {
        return res.json(resultForm);
    }

    // 1. 중복 데이터 조회 ===== end

    // 2. 폼 데이터 제출 ===== start
    const formID = 383;
    var insertForm = mappedForm(req.body);
    console.log(insertForm);
    await cns_eloqua.data.formData.create(formID, insertForm).then(async (result) => {

        console.log('form 데이터 제출 완료');
    
    }).catch((err) => {
        //통신에러
        console.log(err);
        resultForm.status = "-2";
    })

    if (resultForm.hasOwnProperty('status')) {
        return res.json(resultForm);
    }
    // 2. 폼 데이터 제출 ===== end

    // 3. 제출 데이터 확인 ===== start

    // 엘로콰 통신 지연: 5초
    await new Promise(resolve => setTimeout(resolve, 5000));

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

            await cns_eloqua.data.customObjectData.update(cdoID, updateForm.id, updateForm).then((result) => {
                
                // 업데이트 성공
                resultForm.status = "1";
                resultForm.uid = updateForm.uniqueCode;
                
            }).catch((err) => {
                //통신에러
                console.log(err);
                resultForm.status = "-2";
            })
            // 4. Unique code copy 필드 업데이트 ===== end

        } else {    // CDO 제출 실패
            resultForm.status = "0";
        }

    }).catch((err) => {
        //통신에러
        console.log(err);
        resultForm.status = "-2";
    });

    // 3. 제출 데이터 확인 ===== end

    // JSON 리턴
    res.send(resultForm);
});

function mappedForm(data) {

    //Validation check
    // data.validate('webinarformdata');

    var resultform = {};

    resultform.type = "FormData";
    
    resultform.fieldValues = [
        {
            "type": "FieldValue",
            "id": "5820",
            "name": "웨비나명",
            "value": data.webinarName
        },{
            "type": "FieldValue",
            "id": "5811",
            "name": "Last Name",
            "value": data.lastname
        },{
            "type": "FieldValue",
            "id": "5812",
            "name": "First Name",
            "value": data.name
        },{
            "type": "FieldValue",
            "id": "5810",
            "name": "Email Address",
            "value": data.email
        },{
            "type": "FieldValue",
            "id": "5813",
            "name": "Company",
            "value": data.company
        },{
            "type": "FieldValue",
            "id": "5815",
            "name": "Mobile Phone",
            "value": data.hphone
        },{
            "type": "FieldValue",
            "id": "5821",
            "name": "개인정보 수집•이용 동의 (필수)",
            "value": data.agree1
        },{
            "type": "FieldValue",
            "id": "5822",
            "name": "개인정보 수집•이용 동의 (선택)",
            "value": data.agree2
        },{
            "type": "FieldValue",
            "id": "5823",
            "name": " 마케팅 정보 수신동의 (선택)",
            "value": data.agree3
        },{
            "type": "FieldValue",
            "id": "5817",
            "name": "ibch",
            "value": data.ibch
        },{
            "type": "FieldValue",
            "id": "5826",
            "name": "폼 제출시간",
            "value": moment().tz('Asia/Seoul').unix()
        }
    ];

    //선택 필드
    if (data.agree2 == 'Y') {
        resultform.fieldValues.push({
            "type": "FieldValue",
            "id": "5824",
            "name": "Title",
            "value": data.title
        });
        resultform.fieldValues.push({
            "type": "FieldValue",
            "id": "5816",
            "name": "추천인",
            "value": data.recom
        });
    }

    return resultform;
}


module.exports = router;