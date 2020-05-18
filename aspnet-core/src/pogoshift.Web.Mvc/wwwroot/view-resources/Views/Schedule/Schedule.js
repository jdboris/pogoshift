import { SchedulingCalendar } from "/js/calendar.js";
import { Shift } from "/js/models/Shift.js";
import { Availability } from "/js/models/Availability.js";
import { getDateFromQueryString, myFetch } from "/js/utilities.js";

let date = getDateFromQueryString();

let loginDataPromise = myFetch(`/api/services/app/Session/GetCurrentLoginInformations`);
let shiftsPromise = Shift.getAllByDate(date.getMonth() + 1, date.getFullYear());

Promise.all([loginDataPromise, shiftsPromise]).then(async data => {
    const loginData = data[0];
    const shifts = data[1];

    let availabilities = [];

    if ("HasUser.CrudAll" in abp.auth.grantedPermissions) {
        availabilities = await Availability.getAllByDate(date.getMonth() + 1, date.getFullYear());
    }

    let workingHoursStart = "17:00";
    let workingHoursEnd = "24:00";
    let closedWeekdays = ["Saturday", "Sunday"];

    let associateMinimum = 2;
    let managerMinimum = 1;

    let container = document.getElementById("schedule-calendar");
    let calendar = new SchedulingCalendar(loginData.user, loginData.tenant.id, associateMinimum, managerMinimum, shifts, availabilities, closedWeekdays, workingHoursStart, workingHoursEnd, 15);
    calendar.appendTo(container);

});

