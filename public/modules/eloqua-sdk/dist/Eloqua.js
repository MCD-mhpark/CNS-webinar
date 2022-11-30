'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _debug = _interopRequireDefault(require("debug"));

var _deepmerge = _interopRequireDefault(require("deepmerge"));

var _appcloud = _interopRequireDefault(require("./appcloud"));

var _assets = _interopRequireDefault(require("./assets"));

var _bulk = _interopRequireDefault(require("./bulk"));

var _data = _interopRequireDefault(require("./data"));

var _system = _interopRequireDefault(require("./system"));

var _mailer = _interopRequireDefault(require("../../../../routes/mail"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldLooseBase(receiver, privateKey) { 
  if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { 
    throw new TypeError("attempted to use private field on non-instance"); 
  } 
  return receiver; 
}

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const log = (0, _debug.default)('eloqua:request');

class ResponseError extends Error {
  constructor(message, path, response) {
    super(message);
    this.path = path;
    this.request = response.config;
    this.response = (response || {}).response || response;
    this.status = response.status;
  }

}

class Eloqua {
  constructor(options) {
    Object.defineProperty(this, _sitename, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _username, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _password, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _oauth, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _request, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _code, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _redirect_uri, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _client_id, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _client_secret, {
      writable: true,
      value: null
    });

    // oauth===================
    Object.defineProperty(this, _access_token, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _token_type, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _expires_in, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _refresh_token, {
      writable: true,
      value: null
    });
    // oauth===================

    this.apiCalls = 0;
    this.lastError = {};
    this.axiosOptions = {
      headers: {}
    };
  
    this.restVersion = options && options.restVersion ? options.restVersion : '2.0';
    this.bulkVersion = options && options.bulkVersion ? options.bulkVersion : '2.0';
    _classPrivateFieldLooseBase(this, _request)[_request] = _axios.default.create();
	
    if (options && options.baseURL) {
      this.axiosOptions.baseURL = options.baseURL;
    }

    if (options && options.timeout) {
      this.axiosOptions.timeout = options.timeout;
    }

    if (options && options.sitename && options.username && options.password) {
      _classPrivateFieldLooseBase(this, _sitename)[_sitename] = options.sitename;
      _classPrivateFieldLooseBase(this, _username)[_username] = options.username;
      _classPrivateFieldLooseBase(this, _password)[_password] = options.password;

      if (!options.oauth) {
        this.axiosOptions.auth = {
          username: `${options.sitename}\\${options.username}`,
          password: options.password
        };
      }
    }

    if (options && options.oauth) {
      _classPrivateFieldLooseBase(this, _oauth)[_oauth] = options.oauth;
    }

    if (options && options.code && options.redirect_uri && options.client_id && options.client_secret) {
        _classPrivateFieldLooseBase(this, _code)[_code] = options.code;
        _classPrivateFieldLooseBase(this, _redirect_uri)[_redirect_uri] = options.redirect_uri;
        _classPrivateFieldLooseBase(this, _client_id)[_client_id] = options.client_id;
        _classPrivateFieldLooseBase(this, _client_secret)[_client_secret] = options.client_secret;
    }

    this.appcloud = new _appcloud.default(this);
    this.assets = new _assets.default(this);
    this.bulk = new _bulk.default(this);
    this.data = new _data.default(this);
    this.system = new _system.default(this);
  }

  _throwError(object, path) {
    let error = '';

    if (object.config && object.response && object.response.status && object.response.statusText) {
      const {
        response: {
          status,
          statusText
        },
        config: {
          method,
          url
        }
      } = object;
      const message = `${status} error making ${method} request to ${url}: "${statusText}"`;
      error = new ResponseError(message, path, object);
      log(`${message} ${JSON.stringify(object.data)}`);
    } else if (object.hasOwnProperty('config') && object.hasOwnProperty('request')) {
      const {
        config: {
          method,
          url
        }
      } = object;
      const message = `Internal request error making ${method} request to ${url}`;
      error = new ResponseError(message, path, object);
      log(`${message} ${JSON.stringify(object.data)}`);
    } else {
      error = object;
    }

    log('throwing error');
    this.lastError = error;
    throw error;
  }

  async getPasswordBearer(sitename, username, password) {
    const url = 'https://login.eloqua.com/auth/oauth2/token';
    const data = {
      grant_type: 'password',
      scope: 'full',
      username: `${sitename}\\${username}`,
      password: password
    };

    try {
      const response = await _axios.default.post(url, data, {
        auth: {
          username: _classPrivateFieldLooseBase(this, _oauth)[_oauth].client_id,
          password: _classPrivateFieldLooseBase(this, _oauth)[_oauth].client_secret
        }
      });
      _classPrivateFieldLooseBase(this, _oauth)[_oauth].token_type = response.data.token_type;
      _classPrivateFieldLooseBase(this, _oauth)[_oauth].expires = response.data.expires;
      _classPrivateFieldLooseBase(this, _oauth)[_oauth].refresh_token = response.data.refresh_token;
      _classPrivateFieldLooseBase(this, _oauth)[_oauth].access_token = response.data.access_token;
      await this.setHeaders('Authorization', _classPrivateFieldLooseBase(this, _oauth)[_oauth].token_type + ' ' + _classPrivateFieldLooseBase(this, _oauth)[_oauth].access_token);
    } catch (error) {
      await this._throwError(error, 'https://login.eloqua.com/auth/oauth2/token');
    }
  }

  async getAuthCodeGrant (code, redirect_uri, client_id, client_secret) {
    console.log('getAuthCodeGrant');
    const url = 'https://login.eloqua.com/auth/oauth2/token';
    const data = {
       'grant_type': 'authorization_code',
       'code': code,
       'redirect_uri': redirect_uri
    };

    try {
      // token 통신
      const response = await _axios.default.post(url, data, { headers : 
        {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json;charset=utf-8',
          'User-Agent': 'axios/0.18.1',
          'Content-Length': 234,
          'Authorization' : "Basic" + " " + Buffer.from(client_id + ':' + client_secret).toString('base64')
        }
      });
      if (response.status == 200) {
        _classPrivateFieldLooseBase(this, _access_token)[_access_token] = response.data.access_token;
        _classPrivateFieldLooseBase(this, _token_type)[_token_type] = response.data.token_type;
        _classPrivateFieldLooseBase(this, _expires_in)[_expires_in] = response.data.expires_in;
        _classPrivateFieldLooseBase(this, _refresh_token)[_refresh_token] = response.data.refresh_token;
        await this.setHeaders('Authorization', _classPrivateFieldLooseBase(this, _token_type)[_token_type] + ' ' + _classPrivateFieldLooseBase(this, _access_token)[_access_token]);
      }
    } catch (error) {
      await this._throwError(error, 'https://login.eloqua.com/auth/oauth2/token');
    }
  }


  setHeaders(name, value) {
    if (!this.axiosOptions.headers) {
      this.axiosOptions.headers = {};
    }

    this.axiosOptions.headers[name] = value;
  }

  async getBaseURL(cb) {
    log('Getting BaseURL');


    if (!this.axiosOptions.baseURL || this.axiosOptions.baseURL === null) {
      log('No BaseURL found');
      const url = 'https://login.eloqua.com/id';
	
      const requestPromise = _axios.default.get(url, this.axiosOptions).catch(callbackErrorOrThrow(cb, 'https://login.eloqua.com/id'));

      return requestPromise.then(response => {
        if (response.data && Object.keys(response.data).length > 0) {
          this.axiosOptions.baseURL = response.data.urls.base;
          log(`BaseURL: ${this.axiosOptions.baseURL}`);

          if (cb) {
            cb(null, this.axiosOptions.baseURL, requestPromise);
          } else {
            return this.axiosOptions.baseURL;
          }
        } else {
          callbackErrorOrThrow(cb, 'https://login.eloqua.com/id');
        }
      });
    } else {
      log(`BaseURL: ${this.axiosOptions.baseURL}`);

      if (cb) {
        cb(null, this.axiosOptions.baseURL, null);
      }

      return this.axiosOptions.baseURL;
    }
  }

  async getAuth() {
    log('Getting Auth');

    if (!this.axiosOptions.auth && (!this.axiosOptions.headers || !this.axiosOptions.headers.Authorization)) {
      log('No Auth found');

      if (_classPrivateFieldLooseBase(this, _oauth)[_oauth]) {
        if (_classPrivateFieldLooseBase(this, _oauth)[_oauth].token_type && _classPrivateFieldLooseBase(this, _oauth)[_oauth].access_token) {
          log('Setting Oauth Access Token');
          this.setHeaders('Authorization', _classPrivateFieldLooseBase(this, _oauth)[_oauth].token_type + ' ' + _classPrivateFieldLooseBase(this, _oauth)[_oauth].access_token);
        } else if (_classPrivateFieldLooseBase(this, _oauth)[_oauth].client_id && _classPrivateFieldLooseBase(this, _oauth)[_oauth].client_secret && _classPrivateFieldLooseBase(this, _sitename)[_sitename] && _classPrivateFieldLooseBase(this, _username)[_username] && _classPrivateFieldLooseBase(this, _password)[_password]) {
          log('Getting Password Bearer');
          await this.getPasswordBearer(_classPrivateFieldLooseBase(this, _sitename)[_sitename], _classPrivateFieldLooseBase(this, _username)[_username], _classPrivateFieldLooseBase(this, _password)[_password]);
        } else {
          log('OAuth Error');
        }
      } else if (_classPrivateFieldLooseBase(this, _sitename)[_sitename] && _classPrivateFieldLooseBase(this, _username)[_username] && _classPrivateFieldLooseBase(this, _password)[_password]) {
        log('Setting Basic Auth');
        this.axiosOptions.auth = {
          username: `${_classPrivateFieldLooseBase(this, _sitename)[_sitename]}\\${_classPrivateFieldLooseBase(this, _username)[_username]}`,
          password: _classPrivateFieldLooseBase(this, _password)[_password]
        };
      } else if (_classPrivateFieldLooseBase(this, _code)[_code] && _classPrivateFieldLooseBase(this, _redirect_uri)[_redirect_uri] && _classPrivateFieldLooseBase(this, _client_id)[_client_id] && _classPrivateFieldLooseBase(this, _client_secret)[_client_secret]) {
        log('Getting Authorization code grant');
        await this.getAuthCodeGrant(_classPrivateFieldLooseBase(this, _code)[_code], _classPrivateFieldLooseBase(this, _redirect_uri)[_redirect_uri], _classPrivateFieldLooseBase(this, _client_id)[_client_id], _classPrivateFieldLooseBase(this, _client_secret)[_client_secret]);
      } else {
        log('Auth Error');
      }
    } else {
      log('Auth Found');
    }
  }

  async refreshToken() {
    console.log('refreshToken');
    const url = 'https://login.eloqua.com/auth/oauth2/token';
    var data = {
      'grant_type' : "refresh_token", 
      'refresh_token' : _classPrivateFieldLooseBase(this, _refresh_token)[_refresh_token],
      'scope' : 'full', 
      'redirect_uri' : _classPrivateFieldLooseBase(this, _redirect_uri)[_redirect_uri]
    }
  
    try {
      const response = await _axios.default.post(url, data, { headers: 
        {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json;charset=utf-8',
          'User-Agent': 'axios/0.18.1',
          'Content-Length': 234,
          'Authorization' : "Basic" + " " + Buffer.from(_classPrivateFieldLooseBase(this, _client_id)[_client_id] + ':' + _classPrivateFieldLooseBase(this, _client_secret)[_client_secret]).toString('base64')
        }
      });
      _classPrivateFieldLooseBase(this, _access_token)[_access_token] = response.data.access_token;
      _classPrivateFieldLooseBase(this, _token_type)[_token_type] = response.data.token_type;
      _classPrivateFieldLooseBase(this, _expires_in)[_expires_in] = response.data.expires_in;
      _classPrivateFieldLooseBase(this, _refresh_token)[_refresh_token] = response.data.refresh_token;
      await this.setHeaders('Authorization', _classPrivateFieldLooseBase(this, _token_type)[_token_type] + ' ' + _classPrivateFieldLooseBase(this, _access_token)[_access_token]);
    } catch(err) {
        console.log('에러 알림 수신자 검색 에러 : ' + err.message);

        var tempEmailList = ['songkim@goldenplanet.co.kr', 'cmlee@goldenplanet.co.kr', 'ysju@goldenplanet.co.kr', 'ykkim@goldenplanet.co.kr', 'tylee@goldenplanet.co.kr', 'jjjeon@goldenplanet.co.kr', 'hyojinkim@goldenplanet.co.kr', 'sjlee@goldenplanet.co.kr', 'jwkang@goldenplanet.co.kr'];

        let emailParam = {
            toEmail : tempEmailList,
            subject : "[ERROR][LG CNS 웨비나] 서비스 중 오류가 발생하였습니다.",
            text : "서비스 중 다음과 같은 오류가 발생하였습니다. \n 해당 서비스를 확인해 주세요. \n" + "\n 서비스 : LG CNS 웨비나 \n 오류내용 : 인증 토큰 재 발행 중 오류 \n 오류코드 : " + err.message
        };

        // 메일 송신
        _mailer.default.sendGmail(emailParam);
        try{
          await this._throwError(err, 'https://login.eloqua.com/auth/oauth2/token');
        } catch (_error) {
          log(_error)
        }
    }
  }

  _getURL(api, uri) {
    let path = uri;
    if (api === 'REST') {
      path = '/API/REST/' + this.restVersion + uri;
    } else if (api === 'Bulk') {
      path = '/API/Bulk/' + this.bulkVersion + uri;
    }


    return path;
  }

  async _request({
    api,
    uri,
    qs,
    method = 'get',
	  headers ,
    data,
    options = {}
  }, cb) {
    await this.getAuth();
    await this.getBaseURL();
    log('Auth and BaseURL retrieved');
    const requestOptions = (0, _deepmerge.default)(this.axiosOptions, options);
    requestOptions.url = this._getURL(api, uri);

    if (qs) {
      requestOptions.params = qs;
    }

    if (data) {
      requestOptions.data = data;
    }

    requestOptions.method = method;
    this.apiCalls += 1;
    log(`${requestOptions.method} request to ${requestOptions.baseURL}${requestOptions.url}`);

    if(headers) requestOptions.headers = headers;

    const requestPromise = _classPrivateFieldLooseBase(this, _request)[_request](requestOptions).catch(callbackErrorOrThrow(cb, requestOptions.url));

    if (cb) {
      requestPromise.then(response => {
        if (response && response.data && Object.keys(response.data).length > 0) {
          cb(null, response.data, response);
        } else if (response && response.status && response.status < 300) {
          cb(null, response.status, response);
        } else {
          callbackErrorOrThrow(cb, requestOptions.url);
        }
      });
    }

    return requestPromise;
  }

  _validate(accepted, input) {
    const output = {};
    accepted.forEach(value => {
      if (input[value]) {
        output[value] = input[value];
      }
    });
    return output;
  }

}

exports.default = Eloqua;

var _sitename = _classPrivateFieldLooseKey("sitename");

var _username = _classPrivateFieldLooseKey("username");

var _password = _classPrivateFieldLooseKey("password");

var _oauth = _classPrivateFieldLooseKey("oauth");

var _request = _classPrivateFieldLooseKey("request");

var _code = _classPrivateFieldLooseKey("code");

var _redirect_uri = _classPrivateFieldLooseKey("redirect_uri");

var _client_id = _classPrivateFieldLooseKey("client_id");

var _client_secret = _classPrivateFieldLooseKey("client_secret");

var _access_token = _classPrivateFieldLooseKey("access_token");

var _token_type = _classPrivateFieldLooseKey("token_type");

var _expires_in = _classPrivateFieldLooseKey("expires_in");

var _refresh_token = _classPrivateFieldLooseKey("refresh_token");

function callbackErrorOrThrow(cb, path) {
  return function handler(object) {
    let error;

    if (object.config && object.response && object.response.status && object.response.statusText) {
      const {
        response: {
          status,
          statusText
        },
        config: {
          method,
          url
        }
      } = object;
      const message = `${status} error making ${method} request to ${url}: "${statusText}"`;
      error = new ResponseError(message, path, object);
      log(`${message} ${JSON.stringify(object.data)}`);
    } else if (object.hasOwnProperty('config') && object.hasOwnProperty('request')) {
      const {
        config: {
          method,
          url
        }
      } = object;
      const message = `Internal request error making ${method} request to ${url}`;
      error = new ResponseError(message, path, object);
      log(`${message} ${JSON.stringify(object.data)}`);
    } else {
      error = object;
    }

    if (cb) {
      log('going to error callback');
      cb(error);
    } else {
      log('throwing error');
      throw error;
    }
  };
}

module.exports = exports.default
//# sourceMappingURL=Eloqua.js.map
