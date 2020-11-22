
export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Source: https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
// This converts a given string to a color (hexidecimal format) that's unique to that string
export function getUserColor(user) {

    // TODO: Store the color in the database

    if (user.color)
        return user.color;

    let id = user.id;
    let name = user.name + " " + user.surname;
    let str = name.slice(0, name.length / 2) + id + name.slice(name.length / 2);
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var color = "#";
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        color += ("00" + value.toString(16)).substr(-2);
    }
    user.color = color;
    return color;
}

// Expects: Date object
// Returns: "HH:MM"
export function formatTime(datetime) {

    let millisecondsPerMinute = 1000 * 60 * 1;
    let timeBuffer = new Date(Math.ceil(datetime.getTime() / millisecondsPerMinute) * millisecondsPerMinute);
    let hours = timeBuffer.getHours();

    if (datetime.getHours() == 23 && hours == 0)
        hours = 24;

    return String(hours).padStart(2, "0") + ":" + String(timeBuffer.getMinutes()).padStart(2, "0");
}

// Expects:
// "YYYY-MM-DDTHH:MM:SS"
// "HH:MM"
// Returns: Date object
export function stringToDate(string) {
    let buffer = String(string).split("Z")[0].split("T");

    if (buffer.length == 1) {
        let timeParts = buffer[0].split(":");

        if (timeParts[0] == "24") {
            timeParts[0] = "23";
            timeParts[1] = "59";
            timeParts[2] = "59";
        }

        return new Date(1971, 0, 1, timeParts[0], timeParts[1], timeParts[2] || 0);
    }

    let timeParts = buffer[1].split(":");
    let dateParts = buffer[0].split("-");

    return new Date(dateParts[0], dateParts[1]-1, dateParts[2], timeParts[0], timeParts[1], timeParts[2]);
}

// Expects: Date object
// Returns: "YYYY-MM-DDTHH:MM:SS"
export function dateToString(d) {
    let string = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T`;
    string += `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    return string;
}

export function getDateFromQueryString() {
    let requestData = new URLSearchParams(location.search);
    let date = null;

    if (requestData.has("m") && requestData.has("y")) {
        date = new Date(requestData.get("y"), requestData.get("m") - 1, 1);
    }

    return date;
}

export function preventDefault(event) {
    event.preventDefault();
    event.stopPropagation();
}

export const Event = {

    areFalseClicksPrevented: false,
    pointerDownElement: null,

    // NOTE: Calling this function changes the way click events are fired. 
    // It will prevent any click events from firing unless the mousedown and mouseup
    // both directly targetted the same element.
    // This is useful for apps with "click and drag" behavior
    preventFalseClicks: function () {

        if (this.areFalseClicksPrevented == false) {
            this.areFalseClicksPrevented = true;

            document.body.addEventListener("mousedown", (event) => {
                this.pointerDownElement = event.target;
            }, true);

            document.body.addEventListener("click", (event) => {
                if (event.target != this.pointerDownElement) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                this.pointerDownElement = null;
            }, true);
        }
    },

    // Wrapper function for mouse/touch events
    // NOTE: This function does not account for multi-touching
    PointerHandler: function (callback, doDefault = false) {

        return (event) => {

            // Reassign the event object to the appropriate event (either the touch or the original mouse event)
            if ("changedTouches" in event && event.changedTouches.length > 0) {
                event.clientX = event.changedTouches[0].clientX;
                event.clientY = event.changedTouches[0].clientY;
                if (!("pageX" in event)) event.pageX = event.changedTouches[0].pageX;
                if (!("pageY" in event)) event.pageY = event.changedTouches[0].pageY;
                event.screenX = event.changedTouches[0].screenX;
                event.screenY = event.changedTouches[0].screenY;

                if (doDefault == false) {
                    event.stopPropagation();
                    // Don't prevent default on mobile, to allow scrolling
                    //event.preventDefault();
                }
            } else {

                if (doDefault == false) {
                    event.stopPropagation();
                    event.preventDefault();
                }
            }

            callback(event);
        }
    }
};

export function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

export function myFetch(url, method = "GET", body = null) {

    let options = {
        method: method,
        body: JSON.stringify(this),
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            "X-XSRF-TOKEN": getCookie("XSRF-TOKEN")
        },
    };

    if (method.toUpperCase() != "GET")
        options.body = JSON.stringify(body);

    return fetch(url, options)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`${url} responded with ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            throw new Error(error);
        })
        .then((abpResponse) => {
            if (abpResponse.unAuthorizedRequest) {
                location.href = "/Account/Login";

            } else if (!abpResponse.success) {
                throw new Error(abpResponse.error);
            } else {
                return abpResponse.result;
            }
        });
}

// Triggers the given element's "reflow" to restart its CSS animations/transitions
export function restartAnimations(element) {
    element.style.animation = "none";
    element.style.transition = "none";
    element.offsetHeight; /* trigger reflow */
    element.style.animation = null;
    element.style.transition = null;
}