import { AvailabilityPeriod, ShiftPeriod, MonthDay } from "./dom-elements.js";
import { MONTH_NAMES, formatTime, stringToDate, Event } from "./utilities.js";
import { E } from "./dom-elements.js";

const WEEKDAY_INDEXES = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

export class Calendar {

    // Strings in format "HH:MM"
    constructor(date, availabilities, shifts, editModeDefault, closedWeekdays, dayStartTime, dayEndTime, minutesPerColumn, availabilityClick = () => { }) {

        // Require mouseup and mousedown to target the same element in order for click events to fire
        Event.preventFalseClicks();
        this.availabilityClick = availabilityClick;
        //Event.registerTouchEvent(); 

        this.twentyFourHourMode = true;
        this.minutesPerColumn = minutesPerColumn;
        this.editModeDefault = editModeDefault;

        this.dayStartTime = new Date();
        this.dayEndTime = new Date();
        this.hoursPerDay = 24;
        this.setDayStartTime(dayStartTime);
        this.setDayEndTime(dayEndTime);
        this.header = null;

        // See getters/setters below
        // this.columnsPerDay
        // this.dayStartColumn
        // this.dayEndColumn

        this.element = document.createElement("div");
        this.date = date;

        // Used for viewing time period details
        this.focusedTimePeriod = null;

        this.currentDate = new Date();

        // Objects that represent an instance of resizing or movement
        this.timePeriodResizal = null;
        this.timePeriodMovement = null;

        this.element.classList.add("calendar");
        this.element.append(E( `
            <div class="calendar-mobile-overlay hidden"></div>
        `));

        this.header = E(`
            <div class="calendar-header">
                <div>
                    <a href="?m=${this.date.getMonth()}&y=${this.date.getFullYear()}" class="calendar-month-previous"><i class="fas fa-chevron-left"></i></a>
                    <a href="?m=${this.date.getMonth() + 2}&y=${this.date.getFullYear()}" class="calendar-month-next"><i class="fas fa-chevron-right"></i></a>
                    <span class="month-title h4 text-dark">${MONTH_NAMES[this.date.getMonth()]} ${this.date.getFullYear()}</span>
                    <a href="?m=${this.currentDate.getMonth() + 1}&y=${this.currentDate.getFullYear()}" class="btn btn-primary">Today</a>
                <div>
            </div>
        `);
        this.element.append(this.header);


        this.element.append(E(`
            <div class="day-list">
                <div class="weekday-headers">
                    <div>S</div>
                    <div>M</div>
                    <div>T</div>
                    <div>W</div>
                    <div>T</div>
                    <div>F</div>
                    <div>S</div>
                </div>
                <div class="month-day-list">
                </div>
            </div>
        `));

        this.dayListElement = this.element.getElementsByClassName("month-day-list")[0];
        this.mobileOverlay = this.element.getElementsByClassName("calendar-mobile-overlay")[0];

        // Count weekdays from the last Sunday before this month, to the 1st of this month
        let dateBuffer = new Date(this.date);
        dateBuffer.setDate(1);
        let daysBeforeMonth = dateBuffer.getDay();

        // Count days of this month
        dateBuffer = new Date(this.date);
        // NOTE: Must set to day 1 before incrementing month, since the day is carried over
        dateBuffer.setDate(1);
        dateBuffer.setMonth(dateBuffer.getMonth() + 1);
        dateBuffer.setDate(0);
        let daysInMonth = dateBuffer.getDate();
        let daysAfterMonth = 6 - dateBuffer.getDay();

        this.monthDays = {};
        this.addMonthDays(daysBeforeMonth, "month-day-filler");
        this.monthDays = this.addMonthDays(daysInMonth, "month-day");
        this.addMonthDays(daysAfterMonth, "month-day-filler");

        //let today = daysBeforeMonth + this.currentDate.getDate();
        let today = this.currentDate.getDate();

        if (this.date.getMonth() == this.currentDate.getMonth() && this.date.getFullYear() == this.currentDate.getFullYear()) {
            let todayElement = this.monthDays[today].element.querySelector(".day-number");
            todayElement.classList.add("bg-primary");
            todayElement.classList.add("text-light");
        }


        // Mark the closed days as closed
        for (let weekday of closedWeekdays) {
            let offset = 1 + WEEKDAY_INDEXES[weekday];
            let days = this.element.querySelectorAll(`.month-day-list > :nth-child(7n+${offset})`);

            for (let day of days) {
                day.classList.add("closed-day");
            }
        }


        // Mark past days as "closed"
        if (this.date.getFullYear() < this.currentDate.getFullYear() ||
            (this.date.getFullYear() == this.currentDate.getFullYear() && this.date.getMonth() < this.currentDate.getMonth())) {
            this.dayListElement.classList.add("closed-month");
        } else if (this.date.getMonth() == this.currentDate.getMonth() && this.date.getFullYear() == this.currentDate.getFullYear()) {

            for (let i = 1; i < this.currentDate.getDate(); i++) {
                this.monthDays[i].element.classList.add("closed-day");
            }
        }


        this.associates = {};
        this.availabilities = [];
        this.shifts = [];

        if (availabilities != [] && availabilities != null) {
            // Convert the array into an object with the IDs as keys
            this.availabilities = availabilities.reduce((object, timePeriod) => {
                // Only add the availability and its associate if the date is in the future
                if (new Date(timePeriod.beginning) >= new Date()) {
                    if ("user" in timePeriod && !(timePeriod.user.id in this.associates)) {
                        this.associates[timePeriod.user.id] = timePeriod.user;
                    }

                    object[timePeriod.id] = timePeriod;
                }
                return object;

                // Start as empty object
            }, {});
        }

        if (shifts != [] && shifts != null) {
            // Convert the array into an object with the IDs as keys
            this.shifts = shifts.reduce((object, timePeriod) => {
                // Only add the shift and its associate if the date is in the future
                if (new Date(timePeriod.beginning) >= new Date()) {
                    // If this timePeriod has a user and the user is not in the list of associates yet
                    if ("user" in timePeriod && !(timePeriod.user.id in this.associates)) {
                        this.associates[timePeriod.user.id] = timePeriod.user;
                    }

                    object[timePeriod.id] = timePeriod;
                }
                return object;

                // Start as empty object
            }, {});
        }


        // NOTE: Shifts must be loaded before availabilities
        // Load existing shifts on the calendar
        for (let id in this.shifts) {
            this.addShift(this.shifts[id]);
        }

        // Load existing availabilities onto the calendar
        for (let id in this.availabilities) {
            this.addAvailability(this.availabilities[id]);
        }


        let handler = new Event.PointerHandler((event) => {
            this.mobileOverlay.classList.add("hidden");
            this.focusedTimePeriod.classList.remove("focused");
            this.focusedTimePeriod = null;
        });

        this.mobileOverlay.onclick = handler;

        handler = new Event.PointerHandler((event) => {

            if (this.timePeriodResizal != null) {
                let timePeriod = this.timePeriodResizal.timePeriod;

                if (timePeriod != this.timePeriodTemplate) {

                    timePeriod.save();
                }
                this.timePeriodResizal.stop(event);
                this.timePeriodResizal = null;
            }
            if (this.timePeriodMovement != null) {
                let timePeriod = this.timePeriodMovement.timePeriod;

                if (timePeriod != this.timePeriodTemplate) {

                    timePeriod.save();
                }
                this.timePeriodMovement.stop(event);
                this.timePeriodMovement = null;
            }
        }, true); // Allow default to allow the click event to fire on mobile

        // Add this to the body in case the user's mouse leaves the calendar
        document.body.addEventListener("touchend", handler);
        document.body.addEventListener("mouseup", handler);

        handler = new Event.PointerHandler((event) => {
            if (this.timePeriodResizal != null) {
                this.timePeriodResizal.resize(event);
            }
            else if (this.timePeriodMovement != null) {
                this.timePeriodMovement.move(event);
            }
        });

        this.element.onmousemove = handler;

        handler = new Event.PointerHandler((event) => {
            // Only drag if the shift is focused
            if (( event.target.classList.contains("time-period-bar") || event.target.parentElement.classList.contains("time-period-bar") )
                && event.target.closest(".time-period").classList.contains("focused")) {
                if (this.timePeriodResizal != null) {
                    this.timePeriodResizal.resize(event);
                }
                else if (this.timePeriodMovement != null) {
                    this.timePeriodMovement.move(event);
                }
            }
        });

        this.element.ontouchmove = handler;
    }

    get dayStartColumn() {
        return (this.dayStartTime.getHours() * 60 + this.dayStartTime.getMinutes()) / this.minutesPerColumn;
    }

    get dayEndColumn() {
        return (this.dayEndTime.getHours() * 60 + this.dayEndTime.getMinutes()) / this.minutesPerColumn;
    }

    get columnsPerDay() {
        let startMinutes = this.dayStartTime.getHours() * 60 + Math.round(this.dayStartTime.getMinutes() / 60) * 60;
        let endMinutes = this.dayEndTime.getHours() * 60 + Math.round(this.dayEndTime.getMinutes() / 60) * 60;
        return (endMinutes - startMinutes) / this.minutesPerColumn;
    }

    columnToTime(column) {
        let timeStart = new Date(this.dayStartTime.getTime());
        timeStart.setMinutes(timeStart.getMinutes() + (column * this.minutesPerColumn));
        let time = formatTime(timeStart);
        if (time == "0:00" && column > 1) {
            time = "24:00";
        }
        return time;
    }

    pixelsToColumns(pixels, parentWidth) {
        return parseInt((pixels / parentWidth) * this.columnsPerDay);
    }

    hoursToColumns(hours) {
        return parseInt((hours / this.hoursPerDay) * this.columnsPerDay);
    }

    timeToColumns(datetime) {
        let hour = datetime.getHours() + datetime.getMinutes() / 60 + datetime.getSeconds() / 60 / 60 + datetime.getMilliseconds() / 1000 / 60 / 60;
        let startHour = this.dayStartTime.getHours() + this.dayStartTime.getMinutes() / 60 + this.dayStartTime.getSeconds() / 60 / 60 + this.dayStartTime.getMilliseconds() / 1000 / 60 / 60;

        return Math.round(((hour - startHour) / this.hoursPerDay) * this.columnsPerDay) + 1;
    }

    // Expected format: "HH:MM"
    setDayStartTime(time) {
        let hours = time.split(":")[0];
        let minutes = time.split(":")[1];
        this.dayStartTime.setHours(hours, minutes, 0, 0);

        this.hoursPerDay = (this.dayEndTime.getTime() - this.dayStartTime.getTime()) / 1000 / 60 / 60;
    }

    // Expected format: "HH:MM"
    setDayEndTime(time) {
        let hours = time.split(":")[0];
        let minutes = time.split(":")[1];

        if (hours == 24)
            this.dayEndTime.setHours(23, 59, 59, 999);
        else
            this.dayEndTime.setHours(hours, minutes, 0, 0);

        this.hoursPerDay = (this.dayEndTime.getTime() - this.dayStartTime.getTime()) / 1000 / 60 / 60;
    }

    addMonthDays(count, classes) {

        let monthDays = {};

        for (let i = 1; i <= count; i++) {

            monthDays[i] = new MonthDay(this, i);
            monthDays[i].element.className += " " + classes;
            this.dayListElement.appendChild(monthDays[i].element);
        }

        return monthDays;
    }

    addShift(shift) {

        let monthDay = this.monthDays[stringToDate(shift.beginning).getDate()];
        let element = monthDay.element;

        // TODO: Make the back-end return the whole User object when you create a Shift, then remove this work-around
        if (!shift.user) {
            shift.user = this.associates[shift.userId];
        }

        let timePeriod = new ShiftPeriod(this, ("Shifts.CrudAll" in abp.auth.grantedPermissions), shift);

        timePeriod.shiftId = shift.id;

        element.querySelector(`.time-period-section`).append(timePeriod.element);

        element.dataset.shiftCount = parseInt(element.dataset.shiftCount) + 1;

        monthDay.users[shift.user.id] = shift.user;
        element.dataset.userCount = Object.keys(monthDay.users).length;

        if (shift.user.roleNames.includes("MANAGER")) {
            element.dataset.managerCount = parseInt(element.dataset.managerCount) + 1;
        }

        element.dataset.thisWeekUserCount = monthDay.getThisWeekUserCount();
        this.checkSchedulingErrors(monthDay);
    }

    addAvailability(availability) {

        let timePeriod = new AvailabilityPeriod(this, this.editModeDefault, availability);
        let bar = timePeriod.element.getElementsByClassName("time-period-bar")[0];
        bar.addEventListener("click", () => { this.availabilityClick(this, timePeriod) });

        timePeriod.availabilityId = availability.id;

        // TODO: Make the back-end return the whole User object when you create a Shift, then remove this work-around
        if (!availability.user) {
            availability.user = this.associates[availability.userId];
        }

        let monthDay = this.monthDays[stringToDate(availability.beginning).getDate()];
        let element = monthDay.element;

        element.querySelector(`.time-period-section`).prepend(timePeriod.element);

        element.dataset.availabilityCount = parseInt(element.dataset.availabilityCount) + 1;

        monthDay.users[availability.user.id] = availability.user;
        element.dataset.userCount = Object.keys(monthDay.users).length;

        element.dataset.thisWeekUserCount = monthDay.getThisWeekUserCount();
    }

    removeShift(shift) {
        let monthDay = this.monthDays[stringToDate(shift.beginning).getDate()];
        let element = monthDay.element;

        let timePeriod = element.querySelector(`[data-shift-id='${shift.id}']`);
        element.querySelector(`.time-period-section`).removeChild(timePeriod);

        element.dataset.shiftCount = parseInt(element.dataset.shiftCount) - 1;

        if (shift.user.roleNames.includes("MANAGER")) {
            element.dataset.managerCount = parseInt(element.dataset.managerCount) - 1;
        }

        delete monthDay.users[shift.userId];

        element.dataset.thisWeekUserCount = monthDay.getThisWeekUserCount();
        this.checkSchedulingErrors(monthDay);
    }

    removeAvailability(availability) {
        let monthDay = this.monthDays[stringToDate(availability.beginning).getDate()];
        let element = monthDay.element;

        let timePeriod = element.querySelector(`[data-availability-id='${availability.id}']`);
        element.querySelector(`.time-period-section`).removeChild(timePeriod);

        element.dataset.availabilityCount = parseInt(element.dataset.availabilityCount) - 1;

        delete monthDay.users[availability.userId];

        element.dataset.thisWeekUserCount = monthDay.getThisWeekUserCount();
    }

    highlightFromFilter() {
        let url = new URL(location);
        let params = new URLSearchParams(url.search.slice(1));
        let userIds = params.get("f");
        userIds = userIds ? userIds.split(",") : [];

        let timePeriods = this.element.querySelectorAll(`.time-period.highlighted-period`);
        for (let timePeriod of timePeriods) {
            timePeriod.classList.remove("highlighted-period");
        }
        let listItems = this.element.querySelectorAll(`.associate-list-item.highlighted-list-item`);
        for (let listItem of listItems) {
            listItem.classList.remove("highlighted-list-item");
        }

        if (userIds.length > 0) {
            this.element.classList.add("highlighted");
            for (let id of userIds) {
                let timePeriods = this.element.querySelectorAll(`.time-period[data-associate-id="${id}"]`);
                for (let timePeriod of timePeriods) {
                    timePeriod.classList.add("highlighted-period");
                }
                let listItems = this.element.querySelectorAll(`.associate-list-item[data-associate-id="${id}"]`);
                for (let listItem of listItems) {
                    listItem.classList.add("highlighted-list-item");
                }
            }

        } else {
            this.element.classList.remove("highlighted");
        }
    }

    appendTo(parent) {
        parent.appendChild(this.element);
    }
}

