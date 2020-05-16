import { ScheduleCalendar } from "/js/calendar.js";
import { Shift } from "/js/models/Shift.js";
import { getDateFromQueryString, myFetch } from "/js/utilities.js";

let date = getDateFromQueryString();

myFetch(`/api/services/app/Session/GetCurrentLoginInformations`).then((loginData) => {

    Shift.getAllByDate(date.getMonth() + 1, date.getFullYear()).then((shifts) => {

        const data = {
            associate: loginData.user,
            shifts: shifts,
        };

        let workingHoursStart = "17:00";
        let workingHoursEnd = "24:00";
        let closedWeekdays = ["Saturday", "Sunday"];

        let container = document.getElementById("schedule-calendar");
        let calendar = new ScheduleCalendar(data.shifts, data.associate, closedWeekdays, workingHoursStart, workingHoursEnd, 15);
        calendar.appendTo(container);

    });

});
