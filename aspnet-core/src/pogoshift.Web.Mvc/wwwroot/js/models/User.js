// NOTE: This code is auto-generated. Do not modify.

import { Model } from '../model.js';
import { stringToDate, dateToString } from '../utilities.js';

export class User extends Model {

	constructor( options = {"postalCode":null,"addressLine1":null,"addressLine2":null,"birthDate":null,"employeeNumber":null,"normalizedUserName":null,"normalizedEmailAddress":null,"concurrencyStamp":"4732dce7-41f1-45eb-b7b0-4eab575f37f7","tokens":null,"deleterUser":null,"creatorUser":null,"lastModifierUser":null,"authenticationSource":null,"userName":null,"tenantId":null,"emailAddress":null,"name":null,"surname":null,"fullName":" ","password":null,"emailConfirmationCode":null,"passwordResetCode":null,"lockoutEndDateUtc":null,"accessFailedCount":0,"isLockoutEnabled":false,"phoneNumber":null,"isPhoneNumberConfirmed":false,"securityStamp":"00e5c131-306a-8748-f655-39f90094e69c","isTwoFactorEnabled":false,"logins":null,"roles":null,"claims":null,"permissions":null,"settings":null,"isEmailConfirmed":false,"isActive":true,"isDeleted":false,"deleterUserId":null,"deletionTime":null,"lastModificationTime":null,"lastModifierUserId":null,"creationTime":"2020-11-22T00:23:18.2864481-05:00","creatorUserId":null,"id":0} ){
		super( options );
	}
	backToFront(){
		this.creationTime = 'creationTime' in this ? stringToDate(this.creationTime) : null;
	}
	frontToBack(){
		this.creationTime = 'creationTime' in this ? dateToString(this.creationTime) : null;
	}
}