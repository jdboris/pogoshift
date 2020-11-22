// NOTE: This code is auto-generated. Do not modify.

import { Model } from '../model.js';
import { stringToDate, dateToString } from '../utilities.js';

export class User extends Model {

	constructor( options = {"postalCode":null,"addressLine1":null,"addressLine2":null,"birthDate":null,"employeeNumber":null,"normalizedUserName":null,"normalizedEmailAddress":null,"concurrencyStamp":"8990f539-74ce-485b-967f-84aae518b1bf","tokens":null,"deleterUser":null,"creatorUser":null,"lastModifierUser":null,"authenticationSource":null,"userName":null,"tenantId":null,"emailAddress":null,"name":null,"surname":null,"fullName":" ","password":null,"emailConfirmationCode":null,"passwordResetCode":null,"lockoutEndDateUtc":null,"accessFailedCount":0,"isLockoutEnabled":false,"phoneNumber":null,"isPhoneNumberConfirmed":false,"securityStamp":"101b24a1-1de6-7f01-f94e-39f9006cb1c6","isTwoFactorEnabled":false,"logins":null,"roles":null,"claims":null,"permissions":null,"settings":null,"isEmailConfirmed":false,"isActive":true,"isDeleted":false,"deleterUserId":null,"deletionTime":null,"lastModificationTime":null,"lastModifierUserId":null,"creationTime":"2020-11-21T23:39:23.3196077-05:00","creatorUserId":null,"id":0} ){
		super( options );
	}
	backToFront(){
		this.creationTime = 'creationTime' in this ? stringToDate(this.creationTime) : null;
	}
	frontToBack(){
		this.creationTime = 'creationTime' in this ? dateToString(this.creationTime) : null;
	}
}