'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accounts = _interopRequireDefault(require("./Data/accounts"));

var _activities = _interopRequireDefault(require("./Data/activities"));

var _contacts = _interopRequireDefault(require("./Data/Contacts/contacts"));

var _customObjects = _interopRequireDefault(require("./Data/CustomObjects/customObjects"));

var _events = _interopRequireDefault(require("./Data/Events/events"));

var _externalActivities = _interopRequireDefault(require("./Data/externalActivities"));

var _forms = _interopRequireDefault(require("./Data/Forms/forms"));

var _visitors = _interopRequireDefault(require("./Data/visitors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

class Data {
  constructor(options) {
    Object.defineProperty(this, _parent, {
      writable: true,
      value: void 0
    });
    this.accounts = new _accounts.default(options);
    this.activities = new _activities.default(options);
    this.contacts = new _contacts.default(options);
    this.customObjects = new _customObjects.default(options);
    this.events = new _events.default(options);
    this.externalActivities = new _externalActivities.default(options);
    this.forms = new _forms.default(options);
    this.visitors = new _visitors.default(options);
  }

}

exports.default = Data;

var _parent = _classPrivateFieldLooseKey("parent");

module.exports = exports.default;
//# sourceMappingURL=data.js.map
