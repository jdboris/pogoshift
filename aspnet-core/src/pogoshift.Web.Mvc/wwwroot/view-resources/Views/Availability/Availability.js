import { AvailabilityCalendar } from "/js/availability-calendar.js";
import { Availability } from "/js/models/Availability.js";
import { getDateFromQueryString, myFetch } from "/js/utilities.js";

let date = getDateFromQueryString();

Availability.getAllByDate(date.getMonth() + 1, date.getFullYear()).then((availabilities) => {

    let workingHoursStart = "17:00";
    let workingHoursEnd = "24:00";
    let closedWeekdays = ["Saturday", "Sunday"];

    let container = document.getElementById("availability-calendar");
    let calendar = new AvailabilityCalendar(availabilities, closedWeekdays, workingHoursStart, workingHoursEnd, 15);
    calendar.appendTo(container);

});
