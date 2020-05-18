import { SchedulingCalendar } from "/js/calendar.js";
import { Shift } from "/js/models/Shift.js";
import { Availability } from "/js/models/Availability.js";
import { getDateFromQueryString, myFetch } from "/js/utilities.js";

let date = getDateFromQueryString();

myFetch(`/api/services/app/Session/GetCurrentLoginInformations`).then((loginData) => {

    console.log("abp:",abp);
    console.log(loginData);

    Availability.getAllByDate(date.getMonth() + 1, date.getFullYear()).then((availabilities) => {

        Shift.getAllByDate(date.getMonth() + 1, date.getFullYear()).then((shifts) => {

            const data = {
                associate: loginData,
                availabilities: availabilities,
                shifts: shifts,
                storeId: loginData.tenant.id,
            };

            let workingHoursStart = "17:00";
            let workingHoursEnd = "24:00";
            let closedWeekdays = ["Saturday", "Sunday"];

            let associateMinimum = 2;
            let managerMinimum = 1;

            let container = document.getElementById("schedule-calendar");
            let calendar = new SchedulingCalendar(data.associate, data.storeId, associateMinimum, managerMinimum, data.shifts, data.availabilities, closedWeekdays, workingHoursStart, workingHoursEnd, 15);
            calendar.appendTo(container);
        });
    });

});
