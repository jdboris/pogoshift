// NOTE: This code is auto-generated. Do not modify.

import { Model } from '../model.js';
import { stringToDate, dateToString } from '../utilities.js';

export class User extends Model {

	constructor( options = {"postalCode":null,"addressLine1":null,"addressLine2":null,"birthDate":null,"employeeNumber":null,"normalizedUserName":null,"normalizedEmailAddress":null,"concurrencyStamp":"598e8e51-cde8-4cf0-a98c-1fa6638d19d9","tokens":null,"deleterUser":null,"creatorUser":null,"lastModifierUser":null,"authenticationSource":null,"userName":null,"tenantId":null,"emailAddress":null,"name":null,"surname":null,"fullName":" ","password":null,"emailConfirmationCode":null,"passwordResetCode":null,"lockoutEndDateUtc":null,"accessFailedCount":0,"isLockoutEnabled":false,"phoneNumber":null,"isPhoneNumberConfirmed":false,"securityStamp":"c7d9b73d-72d8-4a95-2c9b-39f9028f0fe2","isTwoFactorEnabled":false,"logins":null,"roles":null,"claims":null,"permissions":null,"settings":null,"isEmailConfirmed":false,"isActive":true,"isDeleted":false,"deleterUserId":null,"deletionTime":null,"lastModificationTime":null,"lastModifierUserId":null,"creationTime":"2020-11-22T09:36:10.0662243-05:00","creatorUserId":null,"id":0} ){
		super( options );
	}
	backToFront(){
		this.creationTime = 'creationTime' in this ? stringToDate(this.creationTime) : null;
	}
	frontToBack(){
		this.creationTime = 'creationTime' in this ? dateToString(this.creationTime) : null;
	}
}