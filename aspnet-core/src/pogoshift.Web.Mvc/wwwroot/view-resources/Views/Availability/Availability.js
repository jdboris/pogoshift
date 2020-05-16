import { AvailabilityCalendar } from "/js/calendar.js";
import { Availability } from "/js/models/Availability.js";
import { getDateFromQueryString, myFetch } from "/js/utilities.js";

let date = getDateFromQueryString();

myFetch(`/api/services/app/Session/GetCurrentLoginInformations`).then((loginData) => {

    Availability.getAllByDate(date.getMonth() + 1, date.getFullYear()).then((availabilities) => {

        const data = {
            associate: loginData.user,
            availabilities: availabilities,
        };

        let workingHoursStart = "17:00";
        let workingHoursEnd = "24:00";
        let closedWeekdays = ["Saturday", "Sunday"];

        let container = document.getElementById("availability-calendar");
        let calendar = new AvailabilityCalendar(data.availabilities, data.associate, closedWeekdays, workingHoursStart, workingHoursEnd, 15);
        calendar.appendTo(container);

    });

});
