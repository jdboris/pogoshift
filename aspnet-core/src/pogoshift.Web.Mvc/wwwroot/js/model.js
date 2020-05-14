import { myFetch } from "./utilities.js";

export class Model {

    id = 0;

    constructor(options) {
        for (let key in options) {
            this[key] = options[key];
        }
    }

    static async get(id) {
        return myFetch(`/api/services/app/${this.name}/Get?Id=${id}`, "GET").then((result) => {
            console.log("result: ", result);
            return new this(result);
        });
    }

    static async getAll() {
        return myFetch(`/api/services/app/${this.name}/GetAll`, "GET").then((result) => {
            return result.items.map((availability) => {
                return new this(availability);
            });
        });
    }

    static async getAllByDate(month, year) {
        return myFetch(`/api/services/app/${this.name}/GetAllByDate?month=${month}&year=${year}`, "GET").then((result) => {
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

    delete() {

        return myFetch(`/api/services/app/${this.constructor.name}/Delete?Id=${this.id}`, "DELETE");
    }
}