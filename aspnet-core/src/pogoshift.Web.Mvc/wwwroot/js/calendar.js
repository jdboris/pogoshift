import { CustomElement, AvailabilityPeriod, ShiftPeriod } from "./dom-elements.js";
import { MONTH_NAMES, formatTime, stringToDate, getDateFromQueryString, nameToColor, Event } from "./utilities.js";
import { Availability } from "./models/Availability.js";
import { User } from "./models/User.js";


const WEEKDAY_INDEXES = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

export class Calendar {

    // Strings in format "HH:MM"
    constructor(associate, availabilities, shifts, editModeDefault, closedWeekdays, dayStartTime, dayEndTime, minutesPerColumn) {

        // Require mouseup and mousedown to target the same element in order for click events to fire
        Event.preventFalseClicks();
        //Event.registerTouchEvent();

        this.associate = associate;
        this.twentyFourHourMode = true;
        this.minutesPerColumn = minutesPerColumn;

        this.dayStartTime = new Date();
        this.dayEndTime = new Date();
        this.hoursPerDay = 24;
        this.setDayStartTime(dayStartTime);
        this.setDayEndTime(dayEndTime);

        // See getters/setters below
        // this.columnsPerDay
        // this.dayStartColumn
        // this.dayEndColumn

        this.element = document.createElement("div");
        this.date = getDateFromQueryString();
        this.dayElements = null;
        this.dayList = null;

        // Used for viewing time period details
        this.focusedTimePeriod = null;

        this.currentDate = new Date();

        // TODO: Address isManager
        this.element.dataset.isManager = this.associate.isManager;

        // Objects that represent an instance of resizing or movement
        this.timePeriodResizal = null;
        this.timePeriodMovement = null;

        this.element.classList.add("calendar");
        this.element.innerHTML += `
        <div class="calendar-mobile-overlay hidden"></div>
        <div class="calendar-header">
            <a href="?m=${this.date.getMonth()}&d=${this.date.getDate()}&y=${this.date.getFullYear()}" class="calendar-month-previous"><i class="fas fa-chevron-left"></i></a>
            <a href="?m=${this.date.getMonth() + 2}&d=${this.date.getDate()}&y=${this.date.getFullYear()}" class="calendar-month-next"><i class="fas fa-chevron-right"></i></a>
            <span class="month-title h4 text-dark">${MONTH_NAMES[this.date.getMonth()]} ${this.date.getFullYear()}</span>
            <a href="?m=${this.currentDate.getMonth() + 1}&d=${this.currentDate.getDate()}&y=${this.currentDate.getFullYear()}" class="btn btn-primary">Today</a>
        </div>
        `;

        this.element.innerHTML += `
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
        `;

        this.dayListElement = this.element.getElementsByClassName("month-day-list")[0];
        this.mobileOverlay = this.element.getElementsByClassName("calendar-mobile-overlay")[0];

        // Count weekdays from the last Sunday before this month, to the 1st of this month
        let dateBuffer = new Date(this.date);
        dateBuffer.setDate(1);
        let daysBeforeMonth = dateBuffer.getDay();

        // Count days of this month
        dateBuffer = new Date(this.date);
        dateBuffer.setMonth(dateBuffer.getMonth() + 1);
        dateBuffer.setDate(0);
        let daysInMonth = dateBuffer.getDate();

        // Count weekdays from the last day of this month, to the next Saturday
        dateBuffer = new Date(this.date);
        dateBuffer.setMonth(dateBuffer.getMonth() + 1);
        dateBuffer.setDate(0);
        let daysAfterMonth = 6 - dateBuffer.getDay();

        this.addMonthDays(daysBeforeMonth, "month-day-filler");
        this.addMonthDays(daysInMonth, "month-day");
        this.addMonthDays(daysAfterMonth, "month-day-filler");

        let today = daysBeforeMonth + this.currentDate.getDate();

        if (this.date.getMonth() == this.currentDate.getMonth() && this.date.getFullYear() == this.currentDate.getFullYear()) {
            let todayElement = this.dayListElement.querySelector(".month-day:nth-child(" + today + ") .day-number");
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
        this.monthDays = this.dayListElement.getElementsByClassName("month-day");

        if (this.date.getFullYear() < this.currentDate.getFullYear() ||
            (this.date.getFullYear() == this.currentDate.getFullYear() && this.date.getMonth() < this.currentDate.getMonth())) {
            this.dayListElement.classList.add("closed-month");
        } else if (this.date.getMonth() == this.currentDate.getMonth() && this.date.getFullYear() == this.currentDate.getFullYear()) {

            for (let i = 0; i < this.currentDate.getDate() - 1; i++) {
                this.monthDays[i].classList.add("closed-day");
            }
        }


        this.associates = {};
        this.availabilities = [];
        this.shifts = [];

        if (availabilities != [] && availabilities != null) {
            // Convert the array into an object with the IDs as keys
            this.availabilities = availabilities.reduce((object, timePeriod) => {

                if ("userId" in timePeriod && !(timePeriod.userId in this.associates)) {
                    this.associates[timePeriod.userId] = new User(timePeriod.user);
                    this.associates[timePeriod.userId].name = `${timePeriod.user.name} ${timePeriod.user.surname}`;
                    this.associates[timePeriod.userId].color = nameToColor(timePeriod.userId, this.associates[timePeriod.userId].name);
                }

                object[timePeriod.id] = timePeriod;
                return object;

                // Start as empty object
            }, {});
        }

        if (shifts != [] && shifts != null) {
            // Convert the array into an object with the IDs as keys
            this.shifts = shifts.reduce((object, timePeriod) => {

                if ("userId" in timePeriod && !(timePeriod.userId in this.associates)) {
                    this.associates[timePeriod.userId] = new User(timePeriod.user);
                    this.associates[timePeriod.userId].name = `${timePeriod.user.name} ${timePeriod.user.surname}`;
                    this.associates[timePeriod.userId].color = nameToColor(timePeriod.userId, this.associates[timePeriod.userId].name);
                }

                object[timePeriod.id] = timePeriod;
                return object;

                // Start as empty object
            }, {});
        }


        // NOTE: Shifts must be loaded before availabilities
        // Load existing shifts on the calendar
        for (let id in this.shifts) {
            //let schedulingBar = this.dayListElement.querySelector(`.time-period[data-availability-id='${shift.availabilityID}'] .scheduling-bar`);
            //let associate = this.associates[shift.userId];

            //this.toggleScheduled(schedulingBar, associate, shift);

            let timePeriod = this.shifts[id];

            let time = {
                start: stringToDate(timePeriod.beginning),
                end: stringToDate(timePeriod.ending)
            };

            let associate = null;

            if ("userId" in timePeriod) {
                associate = this.associates[timePeriod.userId];
            }

            let userId = associate.id;

            timePeriod = new ShiftPeriod(this, true, time, associate);
            timePeriod.element.classList.add("associate-" + (Object.keys(this.associates).indexOf(userId.toString())));

            timePeriod.availabilityId = id;
            let monthDay = this.element.querySelector(`[data-month-day='${time.start.getDate()}']`);
            monthDay.dataset.availableAssociateCount = parseInt(monthDay.dataset.availableAssociateCount) + 1;
            monthDay.querySelector(`.time-period-section`).prepend(timePeriod.element);
        }

        // Load existing availabilities onto the calendar
        for (let id in this.availabilities) {
            let timePeriod = this.availabilities[id];

            let time = {
                start: stringToDate(timePeriod.beginning),
                end: stringToDate(timePeriod.ending)
            };

            let associate = null;

            if ("userId" in timePeriod) {
                associate = this.associates[timePeriod.userId];
            }

            let userId = associate.id;

            timePeriod = new AvailabilityPeriod(this, editModeDefault, time, associate);
            timePeriod.element.classList.add("associate-" + (Object.keys(this.associates).indexOf(userId.toString())));

            timePeriod.availabilityId = id;
            let monthDay = this.element.querySelector(`[data-month-day='${time.start.getDate()}']`);
            monthDay.dataset.availableAssociateCount = parseInt(monthDay.dataset.availableAssociateCount) + 1;
            monthDay.querySelector(`.time-period-section`).prepend(timePeriod.element);
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

                    new Availability({
                        id: timePeriod.availabilityId,
                        beginning: timePeriod.getStartTime( ),
                        ending: timePeriod.getEndTime(),
                    }).save();
                }
                this.timePeriodResizal.stop(event);
                this.timePeriodResizal = null;
            }
            if (this.timePeriodMovement != null) {
                let timePeriod = this.timePeriodMovement.timePeriod;

                if (timePeriod != this.timePeriodTemplate) {

                    new Availability({
                        id: timePeriod.availabilityId,
                        beginning: timePeriod.getStartTime(),
                        ending: timePeriod.getEndTime(),
                    }).save();
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

        this.element.ontouchmove = handler;
        this.element.onmousemove = handler;
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
        let html = "";

        for (let i = 1; i <= count; i++) {
            html += `
            <div class="${classes}" data-month-day="${i}" data-available-associate-count="0" data-associate-count="0" data-manager-count="0">
                <div class="day-number-wrapper"><span class="day-number">${i}</span></div>
                <span class="error-icons">
                    <i class="fas fa-exclamation-triangle warning-icon" data-tooltip="Not enough managers."></i>
                    <i class="fas fa-exclamation-circle error-icon" data-tooltip="Not enough associates."></i>
                </span>
                <div class="time-period-section"></div>
            </div>
            `;
        }

        this.dayListElement.innerHTML += html;
    }

    appendTo(parent) {
        parent.appendChild(this.element);
    }
}

export class AvailabilityCalendar extends Calendar {
    constructor(availabilities = [], associate = { id: 0 }, closedWeekdays = [], dayStartTime = "9:00", dayEndTime = "17:00", minutesPerColumn = 15) {
        super(associate, availabilities, [], true, closedWeekdays, dayStartTime, dayEndTime, minutesPerColumn);

        this.element.classList.add("availability-calendar");
        // NOTE: This is required to allow making new time period templates
        this.timePeriodTemplate = null;

        if (associate.id > 0) {
            associate.color = nameToColor(associate.id, `${associate.name} ${associate.surname}`);
        }

        let card = new CustomElement(`<div class="card time-period-template-card"><div class="card-body"></div></div>`);
        let cardBody = card.getElementsByClassName("card-body")[0];

        this.timePeriodTemplate = new AvailabilityPeriod(this, true, { start: null, end: null }, associate);
        this.timePeriodTemplate.element.classList.add("time-period-template");

        cardBody.appendChild(this.timePeriodTemplate.element);
        this.element.append(card);

        let monthDayElements = this.element.getElementsByClassName("month-day");

        for (let element of monthDayElements) {

            let handler = new Event.PointerHandler((event) => {

                // If the click originated directly on this element
                if (this.timePeriodResizal == null && this.timePeriodMovement == null) {

                    let day = element.getElementsByClassName("day-number")[0].innerHTML.padStart(2, "0");
                    let month = `${this.date.getMonth() + 1}`.padStart(2, "0");
                    let year = this.date.getFullYear();

                    let templateStartTime = this.timePeriodTemplate.element.getElementsByClassName("time-start")[0].innerHTML;
                    let startTime = templateStartTime + ":00";
                    startTime = `${year}-${month}-${day}T${startTime}Z`;

                    let templateEndTime = this.timePeriodTemplate.element.getElementsByClassName("time-end")[0].innerHTML;
                    let endTime = templateEndTime + ":00";
                    // NOTE: 24:00 is not a valid time
                    if (endTime.split(":")[0] == 24) endTime = "23:59:59";
                    endTime = `${year}-${month}-${day}T${endTime}Z`;

                    new Availability({
                        userId: associate.id,
                        beginning: startTime,
                        ending: endTime,
                    }).save().then((availability) => {
                        let timePeriod = new AvailabilityPeriod(this, true, { start: stringToDate(startTime), end: stringToDate(endTime) }, associate);
                        timePeriod.availabilityId = availability.id;
                        element.querySelector(".time-period-section").prepend(timePeriod.element);
                    });
                }
            });

            // NOTE: onclick will be simulated on mobile browsers
            element.onclick = handler;
        }
    }
}

