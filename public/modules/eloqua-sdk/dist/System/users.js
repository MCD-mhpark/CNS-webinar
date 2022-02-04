'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = void 0;

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

class Users {
	constructor(options) {
		Object.defineProperty(this, _parent, {
			writable: true,
			value: void 0
		});
		_classPrivateFieldLooseBase(this, _parent)[_parent] = options;
	}

	get(querystring, cb) {
		let qs = {};

		if (querystring) {
			qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'lastUpdatedAt', 'orderBy', 'page', 'search'], querystring);
		}

		return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
			api: 'REST',
			uri: '/system/users',
			qs: qs
		}, cb);
	}

	getOne(id, querystring, cb) {
		let qs = {};

		if (querystring) {
			qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'lastUpdatedAt', 'orderBy', 'page', 'search'], querystring);
		}

		return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
			api: 'REST',
			uri: `/system/user/${id}`,
			qs: qs
		}, cb);
	}

	create(user, cb) {
		const data = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['accessedAt',
			'company',
			'createdAt',
			'createdBy',
			'currentStatus',
			'defaultAccountViewId',
			'defaultContactViewId',
			'depth',
			'description',
			'emailAddress',
			'id',
			'permissions',
			'preferences',
			'type',
			'updatedAt',
			'updatedBy',
			"address1",
			"address2",
			"cellPhone",
			"city",
			"companyDisplayName",
			"companyUrl",
			"country",
			"department",
			"fax",
			"firstName",
			"isDeleted",
			"isDisabled",
			"jobTitle",
			"lastName",
			"loginName",
			"name",
			"passwordExpires",
			"personalMessage",
			"personalPhotoId",
			"personalUrl",
			"phone",
			"replyToAddress",
			"senderDisplayName",
			"senderEmailAddress",
			"ssoOnly",
			"state",
			"zipCode",
			"federationId",
			"betaAccess",
			"federationId",
			"capabilities",
			"productPermissions",
			"securityGroups",
			"SecurityGroupSelected",
			"license1",
			"license"
		], user);

		return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
			api: 'REST',
			uri: '/system/user',
			method: 'post',
			data: data
		}, cb);
	}

	update(id, user, cb) {
		const data = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['accessedAt',
			'company',
			'createdAt',
			'createdBy',
			'currentStatus',
			'defaultAccountViewId',
			'defaultContactViewId',
			'depth',
			'description',
			'emailAddress',
			'id',
			'permissions',
			'preferences',
			'type',
			'updatedAt',
			'updatedBy',
			"address1",
			"address2",
			"cellPhone",
			"city",
			"companyDisplayName",
			"companyUrl",
			"country",
			"department",
			"fax",
			"firstName",
			"isDeleted",
			"isDisabled",
			"jobTitle",
			"lastName",
			"loginName",
			"name",
			"passwordExpires",
			"personalMessage",
			"personalPhotoId",
			"personalUrl",
			"phone",
			"replyToAddress",
			"senderDisplayName",
			"senderEmailAddress",
			"ssoOnly",
			"state",
			"zipCode",
			"federationId",
			"betaAccess",
			"federationId",
			"capabilities",
			"productPermissions",
			"securityGroups",
			"SecurityGroupSelected",
			"license1",
			"typePermissions",
			"license"
		], user);

		return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
			api: 'REST',
			uri: `/system/user/${id}`,
			method: 'put',
			data: data
		}, cb);
	}

	delete(id, cb) {
		return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
			api: 'REST',
			uri: `/system/user/${id}`,
			method: 'delete'
		}, cb);
	}

	security_groups(querystring, cb) {
		let qs = {};

		if (querystring) {
			qs = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['count', 'depth', 'lastUpdatedAt', 'orderBy', 'page', 'search'], querystring);
		}

		return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
			api: 'REST',
			uri: '/system/security/groups',
			qs: qs
		}, cb);
	}

	security_groups_add_remove(id, user, cb) {
		const data = _classPrivateFieldLooseBase(this, _parent)[_parent]._validate(['patchMethod',
			'user',
		], user);

		return _classPrivateFieldLooseBase(this, _parent)[_parent]._request({
			api: 'REST',
			method: 'PATCH',
			uri: `/system/security/group/${id}/users`,
			data: data
		}, cb);
	}
}

exports.default = Users;

var _parent = _classPrivateFieldLooseKey("parent");

module.exports = exports.default;
//# sourceMappingURL=users.js.map
