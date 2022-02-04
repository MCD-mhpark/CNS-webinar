var express = require('express');
var router = express.Router();
var request = require('request');
var request_promise = require('request-promise');
var moment = require('moment');
var fs = require('mz/fs');
const { route } = require('../assets');

/**
 *  로그인 API
 *  
 *  - body
 *      1. webinar: 웨비나의 대상 CDOid (GP전달) 
 *      2. hphone: 핸드폰번호
 *      3. regGBN: 웨비나 - webinar / 온디멘드 - ondemand
 */
router.get('/login', function (req, res, next) {

    
    //1. CDO 검색 ======== start
    var parentId = req.body.webinar;
    //TODO: 1:1대응 등으로 수정된다면 검색 로직이 바뀜 => searchString이 바뀌어야함
    // var searchString = '?uniqueCode=' + req.body.hphone + '';
    var searchString = '?Mobile_Phone1=' + req.body.hphone + '';
    var queryString = {
        'search' : searchString, 
        'depth' : 'complete'
    }
    
    cns_eloqua.data.customObjectData.get(parentId, queryString).then((result) => {
        console.log(result.data);

        var resultForm = {};
        var loginData = result.data.elements[0];
        
        if (result.data.total > 0) {

            //2. 로그인 성공시 해당 CDO의 webinar / ondemand 필드를 업데이트
            if (loginData.regGBN == 'webinar') {
                loginData.fieldValues.push({
                    "type":"FieldValue",
                    "id":"0",   //FIXME: webinar field id
                    "value":"Y"
                });
            } 
            if (loginData.regGBN == 'ondemand') {
                loginData.fieldValues.push({
                    "type":"FieldValue",
                    "id":"0",   //FIXME: ondemand field id
                    "value":"Y"
                });
            }

            cns_eloqua.data.customObjectData.update(parentId, loginData.id, loginData).then((result) => {
                
                resultForm.uid = result.data.elements[0].uniqueCode;
                resultForm.status = '1';

            }).catch((err) => {
                resultForm.status = '0';
            })

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