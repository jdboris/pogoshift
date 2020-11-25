import { MONTH_NAMES, formatTime, Event, getUserColor, stringToDate } from "./utilities.js";
import { E } from "./dom-elements.js";
import { Availability } from "./models/Availability.js";
import { Shift } from "./models/Shift.js";

const WEEKDAY_INDEXES = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

export class Calendar extends HTMLElement {

    static get Modes() {
        const modes = {
            AVAILABILITY: 1,
            SCHEDULE: 2
        }
        Object.freeze(modes);
        return modes;
    };

    constructor(state = { }) {
        super();
        let {
            mode,
            date,
            availabilities = [],
            shifts = [],
            editModeDefault = false,
            closedWeekdays = [],
            dayStartTime = "09:00",
            dayEndTime = "17:00",
            minutesPerColumn = 15,
            availabilityClick = () => { }
        } = state;

        // Require mouseup and mousedown to target the same element in order for click events to fire
        Event.preventFalseClicks();
        this.availabilityClick = availabilityClick;

        this.minutesPerColumn = minutesPerColumn;
        this.editModeDefault = editModeDefault;

        this.dayStartTime = new Date(date);
        this.dayEndTime = new Date(date);
        this.hoursPerDay = 24;
        this.setDayStartTime(dayStartTime);
        this.setDayEndTime(dayEndTime);

        // See getters/setters below
        // this.columnsPerDay
        // this.dayStartColumn
        // this.dayEndColumn

        this.date = date;

        // Used for viewing time period details
        this.focusedTimePeriod = null;

        this.currentDate = new Date();

        // Objects that represent an instance of resizing or movement
        this.timePeriodResizal = null;
        this.timePeriodMovement = null;

        this.classList.add("calendar");
        this.append(
            E(`
                <div class="date-controls">
                    <a href="?m=${this.date.getMonth()}&y=${this.date.getFullYear()}" class="calendar-month-previous"><i class="fas fa-chevron-left"></i></a>
                    <a href="?m=${this.date.getMonth() + 2}&y=${this.date.getFullYear()}" class="calendar-month-next"><i class="fas fa-chevron-right"></i></a>
                    <span class="month-title h4 text-dark">${MONTH_NAMES[this.date.getMonth()]} ${this.date.getFullYear()}</span>
                    <a href="?m=${this.currentDate.getMonth() + 1}&y=${this.currentDate.getFullYear()}" class="btn btn-primary">Today</a>
                <div>
            `),

            E(`
                <button class="btn btn-outline-secondary print-button">Past&nbsp;<i class="fas fa-eye-slash"></i></button>
            `, {
                onclick: (event) => {

                    this.classList.toggle("show-past");
                    event.currentTarget.classList.toggle("btn-outline-primary");
                    event.currentTarget.classList.toggle("btn-outline-secondary");
                    event.currentTarget.querySelector("i").classList.toggle("fa-eye");
                    event.currentTarget.querySelector("i").classList.toggle("fa-eye-slash");
                }
            }),

            mode == Calendar.Modes.SCHEDULE ? E(`
                <button class="btn btn-link">Print&nbsp;<i class="fas fa-print"></i></button>
            `, {
                onclick: () => {

                    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];
                    // Temporarily change the document title and print, for the printed/downloaded file name
                    let oldTitle = document.title;
                    document.title = `${abp.custom.tenant.name}-Schedule-${monthNames[this.date.getMonth()]}-${this.date.getFullYear()}`;
                    print();
                    document.title = oldTitle;
                }
            }) : "",

            E(`
                <div class="weekday-headers">
                    <div>S</div>
                    <div>M</div>
                    <div>T</div>
                    <div>W</div>
                    <div>T</div>
                    <div>F</div>
                    <div>S</div>
                </div>
            `),

            this.dayListElement = E(`<div class="month-day-list"></div>`),

            this.mobileOverlay = E(`
                <div class="calendar-mobile-overlay hidden"></div>
            `),
        );

        // Count weekdays from the last Sunday before this month, to the 1st of this month
        let dateBuffer = new Date(this.date);
        dateBuffer.setDate(1);
        let runningDate = dateBuffer;
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
        this.addMonthDays(runningDate, daysBeforeMonth, "month-day-filler");
        this.monthDays = this.addMonthDays(runningDate, daysInMonth, "month-day");
        this.addMonthDays(runningDate, daysAfterMonth, "month-day-filler");

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
            let days = this.querySelectorAll(`.month-day-list > :nth-child(7n+${offset})`);

            for (let day of days) {
                day.classList.add("closed-day");
            }
        }

        // Mark past days as past days
        if (this.date.getFullYear() < this.currentDate.getFullYear() ||
            (this.date.getFullYear() == this.currentDate.getFullYear() && this.date.getMonth() < this.currentDate.getMonth())) {
            this.dayListElement.classList.add("past-month");
        } else if (this.date.getMonth() == this.currentDate.getMonth() && this.date.getFullYear() == this.currentDate.getFullYear()) {

            for (let i = 1; i < this.currentDate.getDate(); i++) {
                this.monthDays[i].element.classList.add("past-day");
            }
        }

        // Mark weeks as past weeks
        {
            let firstDayOfWeek = 1;
            let days = null;

            do {
                // Get all the days that are past in each week
                days = this.querySelectorAll(`.month-day:nth-child(n+${firstDayOfWeek}):nth-child(-n+${firstDayOfWeek + 6}).past-day`);
                // If all 7 days are past or closed
                if (days.length + closedWeekdays.length == 7) {
                    for (let day of days) {
                        day.classList.add("past-week");
                    }
                }

                firstDayOfWeek += 7;
            } while (days.length);
        }

        this.associates = {};
        this.availabilities = [];
        this.shifts = [];

        if (availabilities != [] && availabilities != null) {
            // Convert the array into an object with the IDs as keys
            this.availabilities = availabilities.reduce((object, timePeriod) => {
                // Only add the availability and its associate if the date is in the future
                let midnight = new Date();
                midnight.setHours(0, 0, 0, 0);
                if ("user" in timePeriod && !(timePeriod.user.id in this.associates)) {
                    this.associates[timePeriod.user.id] = timePeriod.user;
                }

                object[timePeriod.id] = timePeriod;
                return object;

                // Start as empty object
            }, {});
        }

        if (shifts != [] && shifts != null) {
            // Convert the array into an object with the IDs as keys
            this.shifts = shifts.reduce((object, timePeriod) => {
                // Only add the shift and its associate if the date is in the future
                let midnight = new Date();
                midnight.setHours(0, 0, 0, 0);
                // If this timePeriod has a user and the user is not in the list of associates yet
                if ("user" in timePeriod && !(timePeriod.user.id in this.associates)) {
                    this.associates[timePeriod.user.id] = timePeriod.user;
                }

                object[timePeriod.id] = timePeriod;
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

        this.onmousemove = handler;

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

        this.ontouchmove = handler;

        if (mode == Calendar.Modes.AVAILABILITY) {

            this.classList.add("availability-calendar");

            this.associates[abp.session.user.id] = abp.session.user;

            // NOTE: This is required to allow making new time period templates
            this.timePeriodTemplate = null;

            let card = new E(`<div class="card time-period-template-card"><div class="card-body"></div></div>`);
            let cardBody = card.getElementsByClassName("card-body")[0];

            this.timePeriodTemplate = new AvailabilityPeriod(this, true, { beginning: this.dayStartTime, ending: this.dayEndTime, user: abp.session.user });
            this.timePeriodTemplate.element.classList.add("time-period-template");

            cardBody.appendChild(this.timePeriodTemplate.element);
            this.append(card);

            for (let dayNumber in this.monthDays) {
                let monthDay = this.monthDays[dayNumber];
                let element = monthDay.element;

                let handler = new Event.PointerHandler((event) => {

                    if (monthDay.timePeriodCrudPromise == null) {
                        // If the click originated directly on this element
                        if ((this.timePeriodResizal == null && this.timePeriodMovement == null) &&
                            element.dataset.availabilityCount == 0) {

                            let day = element.getElementsByClassName("day-number")[0].innerHTML;
                            let start = stringToDate(this.timePeriodTemplate.element.querySelector(".time-start").innerHTML);
                            start.setFullYear(this.date.getFullYear(), this.date.getMonth(), day);
                            let end = stringToDate(this.timePeriodTemplate.element.querySelector(".time-end").innerHTML);
                            end.setFullYear(this.date.getFullYear(), this.date.getMonth(), day);

                            monthDay.timePeriodCrudPromise = new Availability({
                                userId: abp.session.userId,
                                beginning: start,
                                ending: end,
                                note: ""
                            }).save().then((availability) => {
                                this.focusTimePeriod(this.addAvailability(availability).element);

                            }).finally(() => {
                                monthDay.timePeriodCrudPromise = null;
                            });
                        }
                    }
                });


                // NOTE: onclick will be simulated on mobile browsers
                element.onclick = handler;
            }
        }
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
        if (time == "00:00" && column > 1) {
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

    addMonthDays(runningDate, count, classes) {

        let monthDays = {};
        let totalCount = this.dayListElement.children.length;

        for (let i = 1; i <= count; i++) {

            monthDays[i] = new MonthDay(this, i);
            monthDays[i].element.className += " " + classes;
            let week = Math.floor((totalCount + i - 1) / 7);
            monthDays[i].element.dataset.week = week;
            this.dayListElement.appendChild(monthDays[i].element);
        }

        return monthDays;
    }

    focusTimePeriod(timePeriod) {
        if (timePeriod.classList.contains("time-period-template") == false) {
            // timePeriod.classList.contains("edit-mode") == true
            if (this.focusedTimePeriod != null) this.focusedTimePeriod.classList.remove("focused");
            this.focusedTimePeriod = timePeriod;
            timePeriod.classList.add("focused");
            timePeriod.prepend(this.mobileOverlay);
            this.mobileOverlay.classList.remove("hidden");
        }
    }

    addShift(shift) {

        let monthDay = this.monthDays[shift.beginning.getDate()];
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

        let daysOfWeek = this.querySelectorAll(`[data-week="${monthDay.element.dataset.week}"]`);
        for (let day of daysOfWeek) {
            day.dataset.thisWeekUserCount = monthDay.getThisWeekUserCount();
        }
        this.checkSchedulingErrors(monthDay);

        return timePeriod;
    }

    addAvailability(availability) {
        // TODO: Make the back-end return the whole User object when you create a Shift, then remove this work-around
        if (!availability.user) {
            availability.user = this.associates[availability.userId];
        }

        let timePeriod = new AvailabilityPeriod(this, this.editModeDefault, availability);
        let bar = timePeriod.element.getElementsByClassName("time-period-bar")[0];
        bar.addEventListener("click", () => { this.availabilityClick(this, timePeriod) });

        timePeriod.availabilityId = availability.id;

        let monthDay = this.monthDays[availability.beginning.getDate()];
        let element = monthDay.element;

        element.querySelector(`.time-period-section`).prepend(timePeriod.element);

        element.dataset.availabilityCount = parseInt(element.dataset.availabilityCount) + 1;

        monthDay.users[availability.user.id] = availability.user;
        element.dataset.userCount = Object.keys(monthDay.users).length;

        let daysOfWeek = this.querySelectorAll(`[data-week="${monthDay.element.dataset.week}"]`);
        for (let day of daysOfWeek) {
            day.dataset.thisWeekUserCount = monthDay.getThisWeekUserCount();
        }

        return timePeriod;
    }

    removeShift(shift) {
        let monthDay = this.monthDays[shift.beginning.getDate()];
        let element = monthDay.element;

        let timePeriod = element.querySelector(`[data-shift-id='${shift.id}']`);
        element.querySelector(`.time-period-section`).removeChild(timePeriod);

        element.dataset.shiftCount = parseInt(element.dataset.shiftCount) - 1;

        if (shift.user.roleNames.includes("MANAGER")) {
            element.dataset.managerCount = parseInt(element.dataset.managerCount) - 1;
        }

        delete monthDay.users[shift.userId];

        let daysOfWeek = this.querySelectorAll(`[data-week="${monthDay.element.dataset.week}"]`);
        for (let day of daysOfWeek) {
            day.dataset.thisWeekUserCount = monthDay.getThisWeekUserCount();
        }
        this.checkSchedulingErrors(monthDay);
    }

    removeAvailability(availability) {
        let monthDay = this.monthDays[availability.beginning.getDate()];
        let element = monthDay.element;

        let timePeriod = element.querySelector(`[data-availability-id='${availability.id}']`);
        element.querySelector(`.time-period-section`).removeChild(timePeriod);

        element.dataset.availabilityCount = parseInt(element.dataset.availabilityCount) - 1;

        delete monthDay.users[availability.userId];

        let daysOfWeek = this.querySelectorAll(`[data-week="${monthDay.element.dataset.week}"]`);
        for (let day of daysOfWeek) {
            day.dataset.thisWeekUserCount = monthDay.getThisWeekUserCount();
        }
    }
}


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

class TimePeriod {

    constructor(calendar, isInEditMode = true, time = { beginning: null, ending: null, user: null, note: null }) {

        this.user = time.user;
        this.calendar = calendar;
        if (time.beginning != null && time.ending == null) throw "Error: you must provide a start AND end time to create a TimePeriod.";
        time.note = time.note || "";

        let columnStart = 1;
        let columnEnd = calendar.columnsPerDay + 1;
        let startString = null;
        let endString = null;

        if (time.beginning == null && time.ending == null) {
            // If there's no time period template
            if (calendar.timePeriodTemplate == null) {
                startString = formatTime(calendar.dayStartTime);
                endString = formatTime(calendar.dayEndTime);
            } else {
                columnStart = calendar.timePeriodTemplate.getElementsByClassName("time-period-bar")[0].style.gridColumnStart;
                columnEnd = calendar.timePeriodTemplate.getElementsByClassName("time-period-bar")[0].style.gridColumnEnd;
                startString = calendar.timePeriodTemplate.getElementsByClassName("time-start")[0].innerHTML;
                endString = calendar.timePeriodTemplate.getElementsByClassName("time-end")[0].innerHTML;
            }
        } else {
            columnStart = calendar.timeToColumns(time.beginning);
            columnEnd = calendar.timeToColumns(time.ending);
            startString = formatTime(time.beginning);
            endString = formatTime(time.ending);
        }


        // NOTE: Must use inline CSS for the grid-column property in order for resizing to work
        // NOTE: Must use appendChild instead of innerHTML in order for the time periods to retain their click handlers 
        // NOTE: The order of the time period bars matters
        let element = new E(`
        <div class="time-period" data-associate-id="${this.user.id}">
            <div class="time-period-inner" style="grid-template-columns: repeat( ${calendar.columnsPerDay}, 1fr );">
                <div class="time-period-heading">

                    <div class="time-period-user">
                        ${this.user.surname} ${this.user.name}
                    </div>

                    <span class="time-period-copy">
                        <i class="far fa-copy"></i>
                    </span>

                    <span class="time-period-time">
                        <span class="time-start">${startString}</span>-<span class="time-end">${endString}</span>
                    </span>

                    <span class="time-period-delete">
                        <i class="fas fa-trash-alt"></i>
                    </span>

                </div>

                <div class="time-period-bar text-light" style="grid-column: ${columnStart} / ${columnEnd};">
                    <i class="fas fa-grip-lines-vertical left-handle"></i>
                    <i class="fas fa-grip-lines-vertical right-handle"></i>
                </div>

                <div class="time-period-footer">

                    <div class="time-period-note"></div>

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
        let note = element.querySelector(".time-period-note");

        let noteInput = E(`<textarea placeholder="Notes..."></textarea>`);
        if (!element.classList.contains("edit-mode")) {
            noteInput.disabled = true;
            if (!time.note) {
                noteInput.hidden = true;
            }
        }
        noteInput.value = time.note;
        noteInput.onchange = () => {
            time.note = noteInput.value;
            this.save();
        }
        note.append(noteInput);


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
            let resizal = new TimePeriodResizal(calendar, calendar.timePeriodTemplate);
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

            calendar.focusTimePeriod(element);
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
    constructor(calendar, isInEditMode = true, availability = { beginning: null, ending: null, user: null, note: null }) {
        super(calendar, isInEditMode, availability);
        this.availability = availability;

        let element = this.element;
        element.dataset.availabilityId = availability.id;
        element.classList.add("availability");

        let bar = element.getElementsByClassName("time-period-bar")[0];

        if (availability.user) {
            this.associateId = availability.user.id;
            bar.style.backgroundColor = getUserColor(availability.user);
        } else {
            let id = Object.keys(calendar.associates)[0];
            bar.style.backgroundColor = getUserColor(calendar.associates[id]);
        }
    }

    save() {
        new Availability({
            id: this.availabilityId,
            date: stringToDate(this.getStartTime()),
            beginning: stringToDate(this.getStartTime()),
            ending: stringToDate(this.getEndTime()),
            note: this.availability.note
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
    constructor(calendar, isInEditMode = true, shift = { beginning: null, ending: null, user: null, note: null }) {
        super(calendar, isInEditMode, shift);
        this.shift = shift;

        let element = this.element;
        element.dataset.shiftId = shift.id;
        element.classList.add("shift");
        let bar = element.getElementsByClassName("time-period-bar")[0];

        if (shift.user != null) {
            this.associateId = shift.user.id;
            bar.style.backgroundColor = getUserColor(shift.user);
        } else {
            bar.classList.add("bg-primary");
        }
    }

    save() {
        new Shift({
            id: this.shiftId,
            date: stringToDate(this.getStartTime()),
            beginning: stringToDate(this.getStartTime()),
            ending: stringToDate(this.getEndTime()),
            note: this.shift.note
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
        // The promise returned by a fetch that is performing CRUD on an availability/shift on this day
        this.timePeriodCrudPromise = null;

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

customElements.define("scheduling-calendar", Calendar);