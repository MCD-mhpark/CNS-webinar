'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _accounts = _interopRequireDefault(require("./Assets/Accounts/accounts"));

var _campaigns = _interopRequireDefault(require("./Assets/campaigns"));

var _contacts = _interopRequireDefault(require("./Assets/Contacts/contacts"));

var _contentSections = _interopRequireDefault(require("./Assets/contentSections"));

var _customObjects = _interopRequireDefault(require("./Assets/customObjects"));

var _emails = _interopRequireDefault(require("./Assets/Emails/emails"));

var _events = _interopRequireDefault(require("./Assets/events"));

var _externalAssets = _interopRequireDefault(require("./Assets/ExternalAssets/externalAssets"));

var _favorites = _interopRequireDefault(require("./Assets/favorites"));

var _folders = _interopRequireDefault(require("./Assets/folders"));

var _forms = _interopRequireDefault(require("./Assets/Forms/forms"));

var _images = _interopRequireDefault(require("./Assets/images"));

var _landingPages = _interopRequireDefault(require("./Assets/landingPages"));

var _microsites = _interopRequireDefault(require("./Assets/microsites"));

var _optionLists = _interopRequireDefault(require("./Assets/optionLists"));

var _programs = _interopRequireDefault(require("./Assets/programs"));

var _trackedUrls = _interopRequireDefault(require("./Assets/trackedUrls"));

var _visitors = _interopRequireDefault(require("./Assets/visitors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

class Assets {
  constructor(options) {
    Object.defineProperty(this, _parent, {
      writable: true,
      value: void 0
    });
    this.accounts = new _accounts.default(options);
    this.campaigns = new _campaigns.default(options);
    this.contacts = new _contacts.default(options);
    this.contentSections = new _contentSections.default(options);
    this.customObjects = new _customObjects.default(options);
    this.emails = new _emails.default(options);
    this.events = new _events.default(options);
    this.externalAssets = new _externalAssets.default(options);
    this.favorites = new _favorites.default(options);
    this.folders = new _folders.default(options);
    this.forms = new _forms.default(options);
    this.images = new _images.default(options);
    this.landingPages = new _landingPages.default(options);
    this.microsites = new _microsites.default(options);
    this.optionLists = new _optionLists.default(options);
    this.programs = new _programs.default(options);
    this.trackedUrls = new _trackedUrls.default(options);
    this.visitors = new _visitors.default(options);
  }

}

exports.default = Assets;

var _parent = _classPrivateFieldLooseKey("parent");

module.exports = exports.default;
//# sourceMappingURL=assets.js.map
