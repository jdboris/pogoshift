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
            result = new this(result);
            result.backToFront();
            return result;
        });
    }

    static async getAll() {
        return myFetch(`/api/services/app/${this.name}/GetAll`, "GET").then((result) => {
            return result.items.map((item) => {
                item = new this(item);
                item.backToFront();
                return item;
            });
        });
    }

    static async getAllByDate(month, year) {
        return myFetch(`/api/services/app/${this.name}/GetAllByDate?month=${month}&year=${year}`, "GET").then((result) => {
            return result.items.map((item) => {
                item = new this(item);
                item.backToFront();
                return item;
            });
        });
    }

    static async getAllOfAllUsersByDate(month, year) {
        return myFetch(`/api/services/app/${this.name}/GetAllOfAllUsersByDate?month=${month}&year=${year}`, "GET").then((result) => {
            return result.items.map((item) => {
                item = new this(item);
                item.backToFront();
                return item;
            });
        });
    }

    save() {
        this.frontToBack();

        if (this.id == 0) {
            return myFetch(`/api/services/app/${this.constructor.name}/Create`, "POST", this).then((result) => {
                result = new this.constructor(result);
                result.backToFront();
                return result;
            });
        } else {
            return myFetch(`/api/services/app/${this.constructor.name}/Update`, "PUT", this).then((result) => {
                result = new this.constructor(result);
                result.convertToFrontEnd();
                return result;
            });
        }

    }

    delete() {
        return myFetch(`/api/services/app/${this.constructor.name}/Delete?Id=${this.id}`, "DELETE");
    }
}