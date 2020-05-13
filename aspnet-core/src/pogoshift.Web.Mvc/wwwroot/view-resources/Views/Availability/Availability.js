import { AvailabilityCalendar } from "/js/calendar.js";
import { User } from "/js/models/User.js";
import { Availability } from "/js/models/Availability.js";
import { getDateFromQueryString } from "/js/utilities.js";

let associate = JSON.parse(document.getElementById("availability-data").dataset.associate);
let date = getDateFromQueryString();

Availability.getAllByDate(date.getMonth( )+1, date.getFullYear( )).then((availabilities) => {

    const data = {
        associate: new User(associate),
        availabilities: availabilities,
    };

    console.log(data);

    let workingHoursStart = "17:00";
    let workingHoursEnd = "24:00";
    let closedWeekdays = ["Saturday", "Sunday"];

    let container = document.getElementById("availability-calendar");
    let calendar = new AvailabilityCalendar(data.availabilities, data.associate, closedWeekdays, workingHoursStart, workingHoursEnd, 15);
    calendar.appendTo(container);

});
