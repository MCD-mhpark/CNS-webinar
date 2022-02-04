'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _debug = _interopRequireDefault(require("debug"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const log = (0, _debug.default)('eloqua:assets:folders');

class Folders {
  constructor(options) {
    Object.defineProperty(this, _parent, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldLooseBase(this, _parent)[_parent] = options;
  }

  campaign(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/campaign/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  contactList(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/contact/list/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  contactFilter(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/contact/filter/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  contactSegment(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/contact/segment/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  contentSection(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/contentSection/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  dynamicContent(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/dynamicContent/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  email(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/email/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  emailFooter(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/email/footer/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  emailHeaders(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/email/header/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  form(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/form/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  fieldMerge(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/fieldMerge/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  hyperlink(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/hyperlink/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  image(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/image/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  importedFile(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/importedFile/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  landingPage(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/landingPage/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

  program(querystring, id = 'root', cb) {
    let qs = {};

    if (querystring) {
      qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'page'], querystring);
    }

    return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
      api: 'REST',
      uri: `/assets/program/folder/${id}/contents`,
      qs: qs
    }, cb);
  }

}

exports.default = Folders;

var _parent = _classPrivateFieldLooseKey("parent");

module.exports = exports.default;
//# sourceMappingURL=folders.js.map
