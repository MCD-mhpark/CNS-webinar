var express = require('express');
var router = express.Router();
var request = require('request');
var request_promise = require('request-promise');
// var utils = require('../../common/utils');
var moment = require('moment');
var fs = require('mz/fs');

/*
    CDO의 id를 조회

    *params
        1. depth: 검색 수준을 지정. 
            minimal - partial - complete 순으로 자세한 내용을 표시.
            지정하지 않으면 minimal
        2. name: 검색할 CDO 이름
            완전히 동일한 내용만 검색. 부분 검색을 허용하지 않음
            
*/
router.get('/CDOid', function(req, res, next) {

    var searchString = "?name='" + req.query.name + "'";

    var queryString = {
        depth: req.query.depth ? req.query.depth : 'minimal', 
        search: searchString
    }

    cns_eloqua.assets.customObjects.get(queryString).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err.message);
        res.json(err);
    });
    
});

module.exports = router;