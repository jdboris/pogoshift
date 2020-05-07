import { getCookie, myFetch } from "./utilities.js";

export class Model {

    id = 0;

    constructor(options) {
        for (let key in options) {
            this[key] = options[key];
        }
    }

    static async getAll(options) {
        return myFetch(`/api/services/app/${this.name}/GetAll`, "GET").then((result) => {
            return result.items.map((availability) => {
                return new this(availability);
            });
        });
    }

    save() {

        if (this.id == 0) {
            return myFetch(`/api/services/app/${this.constructor.name}/Create`, "POST", this);
        } else {
            return myFetch(`/api/services/app/${this.constructor.name}/Update`, "PUT", this);
        }

    }
}