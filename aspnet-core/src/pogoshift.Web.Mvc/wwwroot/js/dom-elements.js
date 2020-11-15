import { formatTime, Event, stringToDate, getUserColor, restartAnimations } from "./utilities.js";
import { Availability } from "./models/Availability.js";
import { Shift } from "./models/Shift.js";

class TimePeriodResizal {
    // NOTE: This class assumes event is a mouse event targeting the handle element inside a time period
    constructor(calendar, timePeriod, event = null) {
        this.calendar = calendar;
        this.timePeriod = timePeriod;
        this.bar = timePeriod.element.getElementsByClassName("time-period-bar")[0];
        this.leftHandle = this.bar.getElementsByClassName("left-handle")[0];
        this.rightHandle = this.bar.getElementsByClassName("right-handle")[0];
        if (event != null) {
            this.start(event);
        }
    }

    start(event) {
        this.startX = event.clientX;
        if (event.target.classList.contains("left-handle")) {
            this.side = "Start";
        } else {
            this.side = "End";
        }

        this.startColumn = parseInt(this.bar.style["gridColumn" + this.side]);
    }

    stop(event) {
        this.bar = null;
    }

    resize(event) {

        let parentWidth = this.bar.parentElement.clientWidth;
        let offset = event.clientX - this.startX;
        // parseInt to use addition rather than concatenation
        let start = parseInt(this.bar.style["gridColumn" + this.side]);
        let rightColumn = parseInt(this.bar.style.gridColumnEnd);
        let leftColumn = parseInt(this.bar.style.gridColumnStart);

        let newStart = this.startColumn + this.calendar.pixelsToColumns(offset, parentWidth);

        // The margin between the start and end times
        //let margin = parseInt(0.15 * this.calendar.columnsPerDay);
        //let margin = this.calendar.pixelsToColumns(2 * this.leftHandle.offsetWidth + 26, parentWidth);
        let margin = this.calendar.hoursToColumns(2.5);

        if (this.side == "Start") {
            if (newStart < 1) newStart = 1;
            else if (newStart >= rightColumn - margin) newStart = rightColumn - margin;
        } else {
            if (newStart <= leftColumn + margin) newStart = leftColumn + margin;
            else if (newStart > this.calendar.columnsPerDay + 1) newStart = this.calendar.columnsPerDay + 1;
        }

        this.setColumn(newStart);
    }

    // side: "Left" or "Right"
    setColumn(column, side = this.side) {
        let timeElement = this.bar.parentElement.getElementsByClassName("time-" + side.toLowerCase())[0];
        timeElement.innerHTML = this.calendar.columnToTime(column - 1);

        this.bar.style["gridColumn" + side] = column;
    }
}

class TimePeriodMovement {
    // NOTE: This class assumes the events are mouse events targeting a time period element

    constructor(calendar, timePeriod, event = null) {
        this.calendar = calendar;
        this.timePeriod = timePeriod;
        this.bar = timePeriod.element.getElementsByClassName("availability-bar")[0];
        if (event != null) {
            this.start(event);
        }
    }

    start(event) {

        this.element = event.target;
        this.startX = event.clientX;

        this.startColumn = parseInt(this.element.style.gridColumnStart);
        this.endColumn = parseInt(this.element.style.gridColumnEnd);
    }

    stop(event) {
        this.element = null;
    }

    move(event) {

        let parentWidth = this.element.parentElement.clientWidth;
        let offset = event.clientX - this.startX;
        let start = this.element.style.gridColumnStart;
        let end = this.element.style.gridColumnEnd;
        let rightColumn = this.element.style.gridColumnEnd;
        let leftColumn = this.element.style.gridColumnStart;

        let newStart = this.startColumn + parseInt((offset / parentWidth) * this.calendar.columnsPerDay);
        let newEnd = this.endColumn + parseInt((offset / parentWidth) * this.calendar.columnsPerDay);

        let boundaryOffset = 0;
        if (newStart < 1) {
            boundaryOffset = newStart - 1;
            newStart = 1;
            newEnd -= boundaryOffset;
        } else if (newEnd > this.calendar.columnsPerDay + 1) {
            boundaryOffset = newEnd - this.calendar.columnsPerDay - 1;
            newEnd = this.calendar.columnsPerDay + 1;
            newStart -= boundaryOffset;
        }

        let timeElement = this.element.parentElement.getElementsByClassName("time-start")[0];
        timeElement.innerHTML = this.calendar.columnToTime(newStart - 1);

        timeElement = this.element.parentElement.getElementsByClassName("time-end")[0];
        timeElement.innerHTML = this.calendar.columnToTime(newEnd - 1);

        this.element.style.gridColumnStart = newStart;
        this.element.style.gridColumnEnd = newEnd;
    }
}

export function E(html, properties = {}) {
    let template = document.createElement("template");
    // Prevent returning a text node of whitespace as the result
    html = html.trim();
    template.innerHTML = html;
    let element = template.content.firstChild;
    if ("children" in properties) {
        if (Array.isArray(properties.children)) {
            for (let child of properties.children) {
                element.appendChild(child);
            }
        } else {
            element.appendChild(properties.children);
        }
        delete properties.children;
    }

    Object.assign(element, properties);
    return element;
}

export function Input(html, properties = {}, data = {}) {
    let input = E(html, properties);
    let value = "";

    // "Bind" the input to the data property with the same name as the "name" attribute
    if (input.name && input.name in data) {
        value = data[input.name];

        if (input.tagName == "SELECT") {

            let observer = new MutationObserver(tryToInitialize);
            observer.observe(input, {
                attributes: true,
                childList: true,
                characterData: true
            });

            tryToInitialize();

            function tryToInitialize() {
                console.log("value: ", value);
                for (let option of input.children) {
                    console.log("option.value: ", option.value);
                    if (option.value == value) {
                        option.selected = true;
                        observer.disconnect();
                        console.log("FOUND IT");
                        break;
                    }
                }
            }
            
            input.addEventListener("change", () => {
                value = input.value;
                data[input.name] = value;
                observer.disconnect();
                console.log(data[input.name]);
            });

        } else if (input.type == "checkbox" || input.type == "radio") {
            input.checked = value;
            input.addEventListener("change", () => {
                value = input.checked;
                data[input.name] = value;
            });
        } else {
            input.value = value;
            input.addEventListener("input", () => {
                value = input.checked;
                data[input.name] = value;
            });
        }

    }

    if (input.type == "number") {
        input.oninput = () => {
            if (input.value.length > input.max.length) {
                if (+input.value == 0) {
                    input.value = "0".repeat(input.max.length);
                } else {
                    input.value = input.value.replace(/^0+/, "");
                }
            }

            if (input.value.length < input.max.length) {
                input.value = input.value.padStart(2, "0");
            }

            if (input.checkValidity() == false) {
                input.classList.add("invalid-flash");
                restartAnimations(input);
                input.value = value;
            } else {
                value = input.value;
            }
        }
    }

    return input;
}

class TimePeriod {

    constructor(calendar, isInEditMode = true, time = { beginning: null, ending: null, user: null }) {

        this.user = time.user;
        this.calendar = calendar;
        if (time.beginning != null && time.ending == null) throw "Error: you must provide a start AND end time to create a TimePeriod.";
        time = { start: stringToDate(time.beginning), end: stringToDate( time.ending ) };

        let columnStart = 1;
        let columnEnd = calendar.columnsPerDay + 1;

        if (time.start == null && time.end == null) {
            // If there's no time period template
            if (calendar.timePeriodTemplate == null) {
                time.start = formatTime(calendar.dayStartTime);
                time.end = formatTime(calendar.dayEndTime);
            } else {
                columnStart = calendar.timePeriodTemplate.getElementsByClassName("time-period-bar")[0].style.gridColumnStart;
                columnEnd = calendar.timePeriodTemplate.getElementsByClassName("time-period-bar")[0].style.gridColumnEnd;
                time.start = calendar.timePeriodTemplate.getElementsByClassName("time-start")[0].innerHTML;
                time.end = calendar.timePeriodTemplate.getElementsByClassName("time-end")[0].innerHTML;
            }
        } else {
            columnStart = calendar.timeToColumns(time.start);
            columnEnd = calendar.timeToColumns(time.end);
            time.start = formatTime(time.start);
            time.end = formatTime(time.end);
        }


        // NOTE: Must use inline CSS for the grid-column property in order for resizing to work
        // NOTE: Must use appendChild instead of innerHTML in order for the time periods to retain their click handlers 
        // NOTE: The order of the time period bars matters
        let element = new E(`
        <div class="time-period">
            <div class="time-period-inner" style="grid-template-columns: repeat( ${calendar.columnsPerDay}, 1fr );">
                <div class="time-period-heading">

                    <span class="time-period-copy">
                        <i class="far fa-copy"></i>
                    </span>

                    <span class="time-period-time">
                        <span class="time-start">${time.start}</span> - <span class="time-end">${time.end}</span>
                    </span>

                    <span class="time-period-delete">
                        <i class="fas fa-trash-alt"></i>
                    </span>

                </div>

                <div class="time-period-bar text-light" style="grid-column: ${columnStart} / ${columnEnd};">
                    <i class="fas fa-grip-lines-vertical left-handle"></i>
                    <i class="fas fa-grip-lines-vertical right-handle"></i>
                </div>
            </div>
        </div>
        `);

        if (isInEditMode) {
            element.classList.add("edit-mode");
        }

        if (this.user) {
            element.classList.add("associate-" + (Object.keys(calendar.associates).indexOf(this.user.id.toString())));
        }

        let left = element.getElementsByClassName("left-handle")[0];
        let right = element.getElementsByClassName("right-handle")[0];
        let copyButton = element.querySelector(".time-period-copy i");
        let deleteButton = element.querySelector(".time-period-delete i");
        let bar = element.getElementsByClassName("time-period-bar")[0];


        // To prevent adding a new time period when clicking this time period
        // NOTE: onclick will be simulated on mobile browsers
        element.onclick = (event) => {
            event.stopPropagation();
        }

        let handler = new Event.PointerHandler((event) => {

            // If the time period is editable 
            if (element.classList.contains("edit-mode")) {
                calendar.timePeriodMovement = new TimePeriodMovement(calendar, this, event);
            }
        });

        bar.ontouchstart = handler;
        bar.onmousedown = handler;

        handler = new Event.PointerHandler((event) => {
            calendar.timePeriodResizal = new TimePeriodResizal(calendar, this, event);
        });

        left.ontouchstart = handler;
        left.onmousedown = handler;

        right.ontouchstart = handler;
        right.onmousedown = handler;

        handler = new Event.PointerHandler((event) => {
            let resizal = new TimePeriodResizal(calendar, calendar.timePeriodTemplate );
            resizal.setColumn(bar.style.gridColumnStart, "Start");
            resizal.setColumn(bar.style.gridColumnEnd, "End");
        });

        // NOTE: onclick will be simulated on mobile browsers
        copyButton.onclick = handler;

        handler = new Event.PointerHandler((event) => {

            this.delete();

        });

        // NOTE: onclick will be simulated on mobile browsers
        deleteButton.onclick = handler;

        handler = new Event.PointerHandler((event) => {

            if (element.classList.contains("time-period-template") == false &&
                element.classList.contains("edit-mode") == true) {
                if (calendar.focusedTimePeriod != null) calendar.focusedTimePeriod.classList.remove("focused");
                calendar.focusedTimePeriod = element;
                element.classList.add("focused");
                element.prepend(calendar.mobileOverlay);
                calendar.mobileOverlay.classList.remove("hidden");
            }
        });

        bar.onclick = handler;

        this.element = element;
    }

    getStartTime() {
        let monthDay = this.element.closest(".month-day");
        let dayNumberElement = monthDay.getElementsByClassName("day-number")[0];
        let startTime = this.element.getElementsByClassName("time-start")[0].innerHTML.padStart(5, "0") + ":00";
        startTime = `${this.calendar.date.getFullYear()}-${this.calendar.date.getMonth() + 1}-${dayNumberElement.innerHTML}T${startTime}Z`;
        return startTime;
    }

    getEndTime() {
        let monthDay = this.element.closest(".month-day");
        let dayNumberElement = monthDay.getElementsByClassName("day-number")[0];
        let endTime = this.element.getElementsByClassName("time-end")[0].innerHTML.padStart(5, "0") + ":00";
        // NOTE: 24:00 is not a valid time
        if (endTime.split(":")[0] == 24) endTime = "23:59:59";
        endTime = `${this.calendar.date.getFullYear()}-${this.calendar.date.getMonth() + 1}-${dayNumberElement.innerHTML}T${endTime}Z`;
        return endTime;
    }
}

export class AvailabilityPeriod extends TimePeriod {
    constructor(calendar, isInEditMode = true, availability = { beginning: null, ending: null, user: null }) {
        super(calendar, isInEditMode, availability);
        this.availability = availability;

        let element = this.element;
        element.dataset.availabilityId = availability.id;
        element.classList.add("availability");

        let bar = element.getElementsByClassName("time-period-bar")[0];

        if (availability.user) {
            this.associateId = availability.user.id;
            bar.style.backgroundColor = getUserColor( availability.user );
        } else {
            let id = Object.keys(calendar.associates)[0];
            bar.style.backgroundColor = getUserColor( calendar.associates[id] );
        }
    }

    save() {
        new Availability({
            id: this.availabilityId,
            beginning: this.getStartTime(),
            ending: this.getEndTime(),
        }).save();
    }

    delete() {
        new Availability({
            id: this.availabilityId
        }).delete().then((data) => {
            this.calendar.removeAvailability(this.availability);
        });
    }
}

export class ShiftPeriod extends TimePeriod {
    constructor(calendar, isInEditMode = true, shift = { beginning: null, ending: null, user: null }) {
        super(calendar, isInEditMode, shift );
        this.shift = shift;

        let element = this.element;
        element.dataset.shiftId = shift.id;
        element.classList.add("shift");
        let bar = element.getElementsByClassName("time-period-bar")[0];

        if (shift.user != null) {
            this.associateId = shift.user.id;
            bar.style.backgroundColor = getUserColor( shift.user );
        } else {
            bar.classList.add("bg-primary");
        }
    }

    save() {
        new Shift({
            id: this.shiftId,
            beginning: this.getStartTime(),
            ending: this.getEndTime(),
        }).save();
    }

    delete() {
        if ("HasUser.CrudAll" in abp.auth.grantedPermissions) {

            new Shift({
                id: this.shiftId
            }).delete().then((data) => {
                this.calendar.removeShift(this.shift);
            });
        }
    }
}


export class MonthDay {

    constructor(calendar, day) {

        this.calendar = calendar;
        this.users = {};
        this.day = day;
        
        let element = new E(`
        <div class="month-day" data-month-day="${day}" data-user-count="0"
            data-availability-count="0" data-shift-count="0" data-manager-count="0"
            data-this-week-user-count="0">
            <div class="day-number-wrapper"><span class="day-number">${day}</span></div>
            <span class="error-icons">
                <i class="fas fa-exclamation-triangle warning-icon" data-tooltip="Not enough managers."></i>
                <i class="fas fa-exclamation-circle error-icon" data-tooltip="Not enough associates."></i>
            </span>
            <div class="time-period-section"></div>
        </div>
        `);


        this.element = element;
    }

    getStartTime() {
        let monthDay = this.element.closest(".month-day");
        let dayNumberElement = monthDay.getElementsByClassName("day-number")[0];
        let startTime = this.element.getElementsByClassName("time-start")[0].innerHTML.padStart(5, "0") + ":00";
        startTime = `${this.calendar.date.getFullYear()}-${this.calendar.date.getMonth() + 1}-${dayNumberElement.innerHTML}T${startTime}Z`;
        return startTime;
    }

    getEndTime() {
        let monthDay = this.element.closest(".month-day");
        let dayNumberElement = monthDay.getElementsByClassName("day-number")[0];
        let endTime = this.element.getElementsByClassName("time-end")[0].innerHTML.padStart(5, "0") + ":00";
        // NOTE: 24:00 is not a valid time
        if (endTime.split(":")[0] == 24) endTime = "23:59:59";
        endTime = `${this.calendar.date.getFullYear()}-${this.calendar.date.getMonth() + 1}-${dayNumberElement.innerHTML}T${endTime}Z`;
        return endTime;
    }

    getThisWeekUserCount() {

        return Object.keys(this.calendar.associates).length;
    }
}