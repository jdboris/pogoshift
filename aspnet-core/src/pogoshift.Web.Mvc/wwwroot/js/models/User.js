// NOTE: This code is auto-generated. Do not modify.

import { Model } from '../model.js';
import { stringToDate, dateToString } from '../utilities.js';

export class User extends Model {

	constructor( options = {"userName":null,"name":null,"surname":null,"birthDate":"0001-01-01T00:00:00","emailAddress":null,"phoneNumber":null,"addressLine1":null,"addressLine2":null,"postalCode":null,"isActive":false,"fullName":null,"lastLoginTime":null,"creationTime":"0001-01-01T00:00:00","roleNames":null,"id":0} ){
		super( options );
	}
	backToFront(){
		this.birthDate = 'birthDate' in this ? stringToDate(this.birthDate) : null;
		this.creationTime = 'creationTime' in this ? stringToDate(this.creationTime) : null;
	}
	frontToBack(){
		this.birthDate = 'birthDate' in this ? dateToString(this.birthDate) : null;
		this.creationTime = 'creationTime' in this ? dateToString(this.creationTime) : null;
	}
}