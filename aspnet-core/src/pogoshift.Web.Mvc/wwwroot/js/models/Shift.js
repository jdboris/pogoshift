// NOTE: This code is auto-generated. Do not modify.

import { Model } from '../model.js';
import { stringToDate, dateToString } from '../utilities.js';

export class Shift extends Model {

	constructor( options = {"beginning":"0001-01-01T00:00:00","ending":"0001-01-01T00:00:00","date":"0001-01-01T00:00:00","user":null,"userId":0,"breaks":null,"note":null,"id":0} ){
		super( options );
	}
	backToFront(){
		this.beginning = 'beginning' in this ? stringToDate(this.beginning) : null;
		this.ending = 'ending' in this ? stringToDate(this.ending) : null;
		this.date = 'date' in this ? stringToDate(this.date) : null;
	}
	frontToBack(){
		this.beginning = 'beginning' in this ? dateToString(this.beginning) : null;
		this.ending = 'ending' in this ? dateToString(this.ending) : null;
		this.date = 'date' in this ? dateToString(this.date) : null;
	}
}