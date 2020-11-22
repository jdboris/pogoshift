// NOTE: This code is auto-generated. Do not modify.

import { Model } from '../model.js';
import { stringToDate, dateToString } from '../utilities.js';

export class User extends Model {

	constructor( options = {"postalCode":null,"addressLine1":null,"addressLine2":null,"birthDate":null,"employeeNumber":null,"normalizedUserName":null,"normalizedEmailAddress":null,"concurrencyStamp":"dfa233c2-3c07-4d78-8c71-be3204e9f37c","tokens":null,"deleterUser":null,"creatorUser":null,"lastModifierUser":null,"authenticationSource":null,"userName":null,"tenantId":null,"emailAddress":null,"name":null,"surname":null,"fullName":" ","password":null,"emailConfirmationCode":null,"passwordResetCode":null,"lockoutEndDateUtc":null,"accessFailedCount":0,"isLockoutEnabled":false,"phoneNumber":null,"isPhoneNumberConfirmed":false,"securityStamp":"6c5ece3c-25a2-a42a-4a55-39f90105eeb5","isTwoFactorEnabled":false,"logins":null,"roles":null,"claims":null,"permissions":null,"settings":null,"isEmailConfirmed":false,"isActive":true,"isDeleted":false,"deleterUserId":null,"deletionTime":null,"lastModificationTime":null,"lastModifierUserId":null,"creationTime":"2020-11-22T02:26:45.9268248-05:00","creatorUserId":null,"id":0} ){
		super( options );
	}
	backToFront(){
		this.creationTime = 'creationTime' in this ? stringToDate(this.creationTime) : null;
	}
	frontToBack(){
		this.creationTime = 'creationTime' in this ? dateToString(this.creationTime) : null;
	}
}