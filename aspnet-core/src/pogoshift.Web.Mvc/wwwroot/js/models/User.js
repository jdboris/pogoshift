// NOTE: This code is auto-generated. Do not modify.

import { Model } from '../model.js';
import { stringToDate, dateToString } from '../utilities.js';

export class User extends Model {

	constructor( options = {"postalCode":null,"addressLine1":null,"addressLine2":null,"birthDate":null,"employeeNumber":null,"normalizedUserName":null,"normalizedEmailAddress":null,"concurrencyStamp":"48c63a4f-9cd2-4b04-9f3f-3dd4e220e484","tokens":null,"deleterUser":null,"creatorUser":null,"lastModifierUser":null,"authenticationSource":null,"userName":null,"tenantId":null,"emailAddress":null,"name":null,"surname":null,"fullName":" ","password":null,"emailConfirmationCode":null,"passwordResetCode":null,"lockoutEndDateUtc":null,"accessFailedCount":0,"isLockoutEnabled":false,"phoneNumber":null,"isPhoneNumberConfirmed":false,"securityStamp":"8a073f74-33dc-a5f0-fc08-39f900d0f882","isTwoFactorEnabled":false,"logins":null,"roles":null,"claims":null,"permissions":null,"settings":null,"isEmailConfirmed":false,"isActive":true,"isDeleted":false,"deleterUserId":null,"deletionTime":null,"lastModificationTime":null,"lastModifierUserId":null,"creationTime":"2020-11-22T01:28:55.0273027-05:00","creatorUserId":null,"id":0} ){
		super( options );
	}
	backToFront(){
		this.creationTime = 'creationTime' in this ? stringToDate(this.creationTime) : null;
	}
	frontToBack(){
		this.creationTime = 'creationTime' in this ? dateToString(this.creationTime) : null;
	}
}