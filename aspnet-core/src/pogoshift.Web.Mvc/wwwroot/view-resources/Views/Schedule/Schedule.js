﻿import { ScheduleCalendar } from "/js/schedule-calendar.js";
import { Shift } from "/js/models/Shift.js";
import { Availability } from "/js/models/Availability.js";
import { getDateFromQueryString } from "/js/utilities.js";

let date = getDateFromQueryString();
if (!date) {
    date = new Date();
    history.replaceState(null, '', `?m=${date.getMonth() + 1}&y=${date.getFullYear()}`);
}
let links = document.querySelectorAll(`[href$="/Availability"],[href$="/Schedule"]`);
for (let link of links) {
    link.href += `?m=${date.getMonth() + 1}&y=${date.getFullYear()}`;
}

Shift.getAllOfAllUsersByDate(date.getMonth() + 1, date.getFullYear()).then(async shifts => {

    let availabilities = [];

    if ("HasUser.CrudAll" in abp.auth.grantedPermissions) {
        availabilities = await Availability.getAllOfAllUsersByDate(date.getMonth() + 1, date.getFullYear());
    }

    // Get the current login information for later use
    abp.services.app.session.getCurrentLoginInformations().then((data) => {
        Object.assign(abp.custom, data);
    });

    let workingHoursStart = "8:00";
    let workingHoursEnd = "24:00";
    let closedWeekdays = [];

    let associateMinimum = 5;
    let managerMinimum = 1;


    let container = document.getElementById("schedule-calendar");
    let calendar = new ScheduleCalendar(date, associateMinimum, managerMinimum, availabilities, shifts, closedWeekdays, workingHoursStart, workingHoursEnd, 15);
    calendar.appendTo(container);
});

