var express = require('express');
var router = express.Router();
var moment = require('moment-timezone');
var request = require('request');
var request_promise = require('request-promise');
var moment = require('moment');
var fs = require('mz/fs');
const { route } = require('../assets');

/**
 *  로그인 API
 *  
 *  * body sample
 *    {
 *      "webinarName": "A", 
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

            //2. 로그인 성공시 해당 CDO의 참석여부, 로그인시간 필드를 업데이트 ======== start
            var loginUpdateData = loginData;
            var loginUpdateDataFields = [
                { type: 'FieldValue', id: '822', value: 'Y' },     // 참석여부 : Y/N (default:N)
                { type: 'FieldValue', id: '807', value: moment().tz('Asia/Seoul').unix() }     // 로그인시간
            ];
            loginUpdateData.fieldValues = loginUpdateDataFields;

            await cns_eloqua.data.customObjectData.update(parentId, loginData.id, loginUpdateData).then((result) => {

                resultForm.uid = loginData.uniqueCode;
                resultForm.status = '1';

            }).catch((err) => {

                console.log(err.message);

                //TODO: 갱신 실패에 대한 에러코드 협의
                resultForm.status = '-1';
            })

            //2. 로그인 성공시 해당 CDO의 참석여부, 로그인시간 필드를 업데이트 ======== end
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
 *  사전등록
 * 
 */
router.post('/preregist', function(req, res, next) {
    
    var resultForm = {};

    var hphone = req.body.hphone;
    var formID = req.body.elqFormID;
    var cdoID = req.body.elqCDOID;

    // 1. 중복 데이터 조회 ===== start
    var searchString = "?Mobile_Phone1='" + hphone + "'";
    var queryString = {
        'search' : searchString, 
        'depth' : 'complete'
    }

    cns_eloqua.data.customObjectData.get(cdoID, queryString).then((result) => {
        console.log(result.data);

        if (result.data.total > 0) {
            resultForm.status = "-1";
            res.json(resultForm);
        }

    }).catch((err) => {
        console.log(err);
        resultForm.status = "0";
        res.json(resultForm);
    });
    // 1. 중복 데이터 조회 ===== end

    // 2. 폼 데이터 제출 ===== start
    var insertForm = mappedForm(req.body);
    cns_eloqua.data.formData.create(formID, insertForm).then((result) => {
    
        // 3. 제출 데이터 확인 ===== start
        cns_eloqua.data.customObjectData.get(cdoID, queryString).then((result) => {
            if (result.data.total > 0) {
                resultForm.status = "1";
                resultForm.uid = result.data.elements[0].uniqueCode;
            } else {
                resultForm.status = "0";
                res.json(resultForm);
            }
            
        }).catch((err) => {


        });
        // 3. 제출 데이터 확인 ===== end

    }).catch((err) => {
        
    })
    // 2. 폼 데이터 제출 ===== end
});

function mappedForm(data) {

    var resultForm = {};

    resultForm.type = "FormData";
    resultForm.fieldValues = [
        {
            "type": "FieldValue",
            "id": "0",
            "name": "lastname",
            "value": data.lastname
        },{
            "type": "FieldValue",
            "id": "0",
            "name": "name",
            "value": data.name
        },{
            "type": "FieldValue",
            "id": "0",
            "name": "email",
            "value": data.email
        },{
            "type": "FieldValue",
            "id": "0",
            "name": "company",
            "value": data.company
        },{
            "type": "FieldValue",
            "id": "0",
            "name": "title",
            "value": data.title
        },{
            "type": "FieldValue",
            "id": "0",
            "name": "hphone",
            "value": data.hphone
        },{
            "type": "FieldValue",
            "id": "0",
            "name": "recom",
            "value": data.recom
        },{
            "type": "FieldValue",
            "id": "0",
            "name": "agree1",
            "value": data.agree1
        },{
            "type": "FieldValue",
            "id": "0",
            "name": "agree2",
            "value": data.agree2
        },{
            "type": "FieldValue",
            "id": "0",
            "name": "agree3",
            "value": data.agree3
        }
    ];
}

module.exports = router;