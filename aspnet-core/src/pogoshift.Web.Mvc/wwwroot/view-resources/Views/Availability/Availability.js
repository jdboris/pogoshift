import { AvailabilityCalendar } from "/js/availability-calendar.js";
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

Availability.getAllByDate(date.getMonth() + 1, date.getFullYear()).then(async (availabilities) => {

    let loginInfo = await abp.services.app.session.getCurrentLoginInformations();

    abp.session = {
        ...abp.session, 
        ...loginInfo
    };

    let workingHoursStart = "17:00";
    let workingHoursEnd = "24:00";
    let closedWeekdays = ["Saturday", "Sunday"];

    let container = document.getElementById("availability-calendar");
    let calendar = new AvailabilityCalendar(date, availabilities, closedWeekdays, workingHoursStart, workingHoursEnd, 15);
    calendar.appendTo(container);

});
