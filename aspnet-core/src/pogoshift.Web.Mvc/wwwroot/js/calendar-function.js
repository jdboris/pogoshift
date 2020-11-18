import { AvailabilityPeriod, ShiftPeriod, MonthDay } from "./dom-elements.js";
import { MONTH_NAMES, formatTime, stringToDate, Event } from "./utilities.js";
import { E } from "./dom-elements.js";

const WEEKDAY_INDEXES = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

export function Calendar(options = {}) {

    let {
        date,
        availabilities = [],
        shifts = [],
        editModeDefault,
        closedWeekdays,
        dayStartTime,
        dayEndTime,
        minutesPerColumn,
        availabilityClick = () => { },
        canCrudAvailabilities = false
    } = options;

    // Require mouseup and mousedown to target the same element in order for click events to fire
    Event.preventFalseClicks();
    //Event.registerTouchEvent(); 

    let twentyFourHourMode = true;

    let dayStartTime = new Date();
    let dayEndTime = new Date();
    let hoursPerDay = 24;
    setDayStartTime(dayStartTime);
    setDayEndTime(dayEndTime);
    let header = null;

    let calendar = document.createElement("div");

    // Used for viewing time period details
    let focusedTimePeriod = null;

    let currentDate = new Date();

    // Objects that represent an instance of resizing or movement
    let timePeriodResizal = null;
    let timePeriodMovement = null;

    calendar.classList.add("calendar");
    calendar.append(E( `
        <div class="calendar-mobile-overlay hidden"></div>
    `));

    header = E(`
        <div class="calendar-header">
            <div>
                <a href="?m=${date.getMonth()}&y=${date.getFullYear()}" class="calendar-month-previous"><i class="fas fa-chevron-left"></i></a>
                <a href="?m=${date.getMonth() + 2}&y=${date.getFullYear()}" class="calendar-month-next"><i class="fas fa-chevron-right"></i></a>
                <span class="month-title h4 text-dark">${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}</span>
                <a href="?m=${currentDate.getMonth() + 1}&y=${currentDate.getFullYear()}" class="btn btn-primary">Today</a>
            <div>
        </div>
    `);
    calendar.append(header);


    calendar.append(E(`
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

    let dayListElement = calendar.getElementsByClassName("month-day-list")[0];
    let mobileOverlay = calendar.getElementsByClassName("calendar-mobile-overlay")[0];

    // Count weekdays from the last Sunday before this month, to the 1st of this month
    let dateBuffer = new Date(date);
    dateBuffer.setDate(1);
    let daysBeforeMonth = dateBuffer.getDay();

    // Count days of this month
    dateBuffer = new Date(date);
    // NOTE: Must set to day 1 before incrementing month, since the day is carried over
    dateBuffer.setDate(1);
    dateBuffer.setMonth(dateBuffer.getMonth() + 1);
    dateBuffer.setDate(0);
    let daysInMonth = dateBuffer.getDate();
    let daysAfterMonth = 6 - dateBuffer.getDay();

    let monthDays = {};
    addMonthDays(daysBeforeMonth, "month-day-filler");
    monthDays = addMonthDays(daysInMonth, "month-day");
    addMonthDays(daysAfterMonth, "month-day-filler");

    //let today = daysBeforeMonth + currentDate.getDate();
    let today = currentDate.getDate();

    if (date.getMonth() == currentDate.getMonth() && date.getFullYear() == currentDate.getFullYear()) {
        let todayElement = monthDays[today].element.querySelector(".day-number");
        todayElement.classList.add("bg-primary");
        todayElement.classList.add("text-light");
    }


    // Mark the closed days as closed
    for (let weekday of closedWeekdays) {
        let offset = 1 + WEEKDAY_INDEXES[weekday];
        let days = calendar.querySelectorAll(`.month-day-list > :nth-child(7n+${offset})`);

        for (let day of days) {
            day.classList.add("closed-day");
        }
    }


    // Mark past days as "closed"
    if (date.getFullYear() < currentDate.getFullYear() ||
        (date.getFullYear() == currentDate.getFullYear() && date.getMonth() < currentDate.getMonth())) {
        dayListElement.classList.add("closed-month");
    } else if (date.getMonth() == currentDate.getMonth() && date.getFullYear() == currentDate.getFullYear()) {

        for (let i = 1; i < currentDate.getDate(); i++) {
            monthDays[i].element.classList.add("closed-day");
        }
    }


    associates = {};
    availabilities = [];
    shifts = [];

    if (availabilities != [] && availabilities != null) {
        // Convert the array into an object with the IDs as keys
        availabilities = availabilities.reduce((object, timePeriod) => {
            // Only add the availability and its associate if the date is in the future
            if (new Date(timePeriod.beginning) >= new Date()) {
                if ("user" in timePeriod && !(timePeriod.user.id in associates)) {
                    associates[timePeriod.user.id] = timePeriod.user;
                }

                object[timePeriod.id] = timePeriod;
            }
            return object;

            // Start as empty object
        }, {});
    }

    if (shifts != [] && shifts != null) {
        // Convert the array into an object with the IDs as keys
        shifts = shifts.reduce((object, timePeriod) => {
            // Only add the shift and its associate if the date is in the future
            if (new Date(timePeriod.beginning) >= new Date()) {
                // If this timePeriod has a user and the user is not in the list of associates yet
                if ("user" in timePeriod && !(timePeriod.user.id in associates)) {
                    associates[timePeriod.user.id] = timePeriod.user;
                }

                object[timePeriod.id] = timePeriod;
            }
            return object;

            // Start as empty object
        }, {});
    }


    // NOTE: Shifts must be loaded before availabilities
    // Load existing shifts on the calendar
    for (let id in shifts) {
        addShift(shifts[id]);
    }

    // Load existing availabilities onto the calendar
    for (let id in availabilities) {
        addAvailability(availabilities[id]);
    }


    let handler = new Event.PointerHandler((event) => {
        mobileOverlay.classList.add("hidden");
        focusedTimePeriod.classList.remove("focused");
        focusedTimePeriod = null;
    });

    mobileOverlay.onclick = handler;

    handler = new Event.PointerHandler((event) => {

        if (timePeriodResizal != null) {
            let timePeriod = timePeriodResizal.timePeriod;

            if (timePeriod != timePeriodTemplate) {

                timePeriod.save();
            }
            timePeriodResizal.stop(event);
            timePeriodResizal = null;
        }
        if (timePeriodMovement != null) {
            let timePeriod = timePeriodMovement.timePeriod;

            if (timePeriod != timePeriodTemplate) {

                timePeriod.save();
            }
            timePeriodMovement.stop(event);
            timePeriodMovement = null;
        }
    }, true); // Allow default to allow the click event to fire on mobile

    // Add this to the body in case the user's mouse leaves the calendar
    document.body.addEventListener("touchend", handler);
    document.body.addEventListener("mouseup", handler);

    handler = new Event.PointerHandler((event) => {
        if (timePeriodResizal != null) {
            timePeriodResizal.resize(event);
        }
        else if (timePeriodMovement != null) {
            timePeriodMovement.move(event);
        }
    });

    calendar.onmousemove = handler;

    handler = new Event.PointerHandler((event) => {
        // Only drag if the shift is focused
        if (( event.target.classList.contains("time-period-bar") || event.target.parentElement.classList.contains("time-period-bar") )
            && event.target.closest(".time-period").classList.contains("focused")) {
            if (timePeriodResizal != null) {
                timePeriodResizal.resize(event);
            }
            else if (timePeriodMovement != null) {
                timePeriodMovement.move(event);
            }
        }
    });

    calendar.ontouchmove = handler;

    function getDayStartColumn() {
        return (dayStartTime.getHours() * 60 + dayStartTime.getMinutes()) / minutesPerColumn;
    }

    function getDayEndColumn() {
        return (dayEndTime.getHours() * 60 + dayEndTime.getMinutes()) / minutesPerColumn;
    }

    function getColumnsPerDay() {
        let startMinutes = dayStartTime.getHours() * 60 + Math.round(dayStartTime.getMinutes() / 60) * 60;
        let endMinutes = dayEndTime.getHours() * 60 + Math.round(dayEndTime.getMinutes() / 60) * 60;
        return (endMinutes - startMinutes) / minutesPerColumn;
    }

    function columnToTime(column) {
        let timeStart = new Date(dayStartTime.getTime());
        timeStart.setMinutes(timeStart.getMinutes() + (column * minutesPerColumn));
        let time = formatTime(timeStart);
        if (time == "0:00" && column > 1) {
            time = "24:00";
        }
        return time;
    }

    function pixelsToColumns(pixels, parentWidth) {
        return parseInt((pixels / parentWidth) * getColumnsPerDay());
    }

    function hoursToColumns(hours) {
        return parseInt((hours / hoursPerDay) * getColumnsPerDay());
    }

    function timeToColumns(datetime) {
        let hour = datetime.getHours() + datetime.getMinutes() / 60 + datetime.getSeconds() / 60 / 60 + datetime.getMilliseconds() / 1000 / 60 / 60;
        let startHour = dayStartTime.getHours() + dayStartTime.getMinutes() / 60 + dayStartTime.getSeconds() / 60 / 60 + dayStartTime.getMilliseconds() / 1000 / 60 / 60;

        return Math.round(((hour - startHour) / hoursPerDay) * getColumnsPerDay()) + 1;
    }

    // Expected format: "HH:MM"
    function setDayStartTime(time) {
        let hours = time.split(":")[0];
        let minutes = time.split(":")[1];
        dayStartTime.setHours(hours, minutes, 0, 0);

        hoursPerDay = (dayEndTime.getTime() - dayStartTime.getTime()) / 1000 / 60 / 60;
    }

    // Expected format: "HH:MM"
    function setDayEndTime(time) {
        let hours = time.split(":")[0];
        let minutes = time.split(":")[1];

        if (hours == 24)
            dayEndTime.setHours(23, 59, 59, 999);
        else
            dayEndTime.setHours(hours, minutes, 0, 0);

        hoursPerDay = (dayEndTime.getTime() - dayStartTime.getTime()) / 1000 / 60 / 60;
    }

    function addMonthDays(count, classes) {

        let monthDays = {};
        let totalCount = dayListElement.children.length;

        for (let i = 1; i <= count; i++) {

            monthDays[i] = new MonthDay(this, i);
            monthDays[i].element.className += " " + classes;
            let week = Math.floor((totalCount + i - 1) / 7);
            console.log(totalCount);
            console.log(i);
            console.log((totalCount + i) / 7);
            monthDays[i].element.dataset.week = week;
            dayListElement.appendChild(monthDays[i].element);
        }

        return monthDays;
    }

    if (canCrudAvailabilities) {
        let timePeriodTemplate = new AvailabilityPeriod(this, true, { beginning: dayStartTime, ending: dayEndTime, user: abp.session.user });
        timePeriodTemplate.element.classList.add("time-period-template");

        let card = E(`<div class="card time-period-template-card"><div class="card-body"></div></div>`);
        let cardBody = card.getElementsByClassName("card-body")[0];

        cardBody.appendChild(timePeriodTemplate.element);
        calendar.append(card);

        for (let dayNumber in monthDays) {
            let monthDay = monthDays[dayNumber];
            let element = monthDay.element;

            let handler = new Event.PointerHandler((event) => {

                // If the click originated directly on this element
                if ((timePeriodResizal == null && timePeriodMovement == null) &&
                    element.dataset.availabilityCount == 0) {

                    let day = element.getElementsByClassName("day-number")[0].innerHTML.padStart(2, "0");
                    let month = `${date.getMonth() + 1}`.padStart(2, "0");
                    let year = date.getFullYear();

                    let templateStartTime = timePeriodTemplate.element.getElementsByClassName("time-start")[0].innerHTML.padStart(5, "0");
                    let startTime = templateStartTime + ":00";
                    startTime = `${year}-${month}-${day}T${startTime}Z`;

                    let templateEndTime = timePeriodTemplate.element.getElementsByClassName("time-end")[0].innerHTML.padStart(5, "0");
                    let endTime = templateEndTime + ":00";
                    // NOTE: 24:00 is not a valid time
                    if (endTime.split(":")[0] == 24) endTime = "23:59:59";
                    endTime = `${year}-${month}-${day}T${endTime}Z`;

                    new Availability({
                        userId: abp.session.userId,
                        beginning: startTime,
                        ending: endTime,
                    }).save().then((availability) => {
                        addAvailability(availability);
                    });
                }
            });

            // NOTE: onclick will be simulated on mobile browsers
            element.onclick = handler;
        }
    }

    function addShift(shift) {

        let monthDay = monthDays[stringToDate(shift.beginning).getDate()];
        let element = monthDay.element;

        // TODO: Make the back-end return the whole User object when you create a Shift, then remove this work-around
        if (!shift.user) {
            if (shift.userId == abp.session.user.id) {
                shift.user = abp.session.user;
            } else {
                shift.user = associates[shift.userId];
            }
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

        let daysOfWeek = calendar.querySelectorAll(`[data-week="${monthDay.element.dataset.week}"]`);
        for (let day of daysOfWeek) {
            day.dataset.thisWeekUserCount = monthDay.getThisWeekUserCount();
        }
        checkSchedulingErrors(monthDay);
    }

    function addAvailability(availability) {
        // TODO: Make the back-end return the whole User object when you create a Shift, then remove this work-around
        if (!availability.user) {
            if (availability.userId == abp.session.user.id) {
                availability.user = abp.session.user;
            } else {
                availability.user = associates[availability.userId];
            }
        }

        let timePeriod = new AvailabilityPeriod(this, editModeDefault, availability);
        let bar = timePeriod.element.getElementsByClassName("time-period-bar")[0];
        bar.addEventListener("click", () => { availabilityClick(this, timePeriod) });

        timePeriod.availabilityId = availability.id;

        let monthDay = monthDays[stringToDate(availability.beginning).getDate()];
        let element = monthDay.element;

        element.querySelector(`.time-period-section`).prepend(timePeriod.element);

        element.dataset.availabilityCount = parseInt(element.dataset.availabilityCount) + 1;

        monthDay.users[availability.user.id] = availability.user;
        element.dataset.userCount = Object.keys(monthDay.users).length;

        let daysOfWeek = calendar.querySelectorAll(`[data-week="${monthDay.element.dataset.week}"]`);
        for (let day of daysOfWeek) {
            day.dataset.thisWeekUserCount = monthDay.getThisWeekUserCount();
        }
    }

    function removeShift(shift) {
        let monthDay = monthDays[stringToDate(shift.beginning).getDate()];
        let element = monthDay.element;

        let timePeriod = element.querySelector(`[data-shift-id='${shift.id}']`);
        element.querySelector(`.time-period-section`).removeChild(timePeriod);

        element.dataset.shiftCount = parseInt(element.dataset.shiftCount) - 1;

        if (shift.user.roleNames.includes("MANAGER")) {
            element.dataset.managerCount = parseInt(element.dataset.managerCount) - 1;
        }

        delete monthDay.users[shift.userId];

        let daysOfWeek = calendar.querySelectorAll(`[data-week="${monthDay.element.dataset.week}"]`);
        for (let day of daysOfWeek) {
            day.dataset.thisWeekUserCount = monthDay.getThisWeekUserCount();
        }
        checkSchedulingErrors(monthDay);
    }

    function removeAvailability(availability) {
        let monthDay = monthDays[stringToDate(availability.beginning).getDate()];
        let element = monthDay.element;

        let timePeriod = element.querySelector(`[data-availability-id='${availability.id}']`);
        element.querySelector(`.time-period-section`).removeChild(timePeriod);

        element.dataset.availabilityCount = parseInt(element.dataset.availabilityCount) - 1;

        delete monthDay.users[availability.userId];

        let daysOfWeek = calendar.querySelectorAll(`[data-week="${monthDay.element.dataset.week}"]`);
        for (let day of daysOfWeek) {
            day.dataset.thisWeekUserCount = monthDay.getThisWeekUserCount();
        }
    }


    function appendTo(parent) {
        parent.appendChild(calendar);
    }
}

