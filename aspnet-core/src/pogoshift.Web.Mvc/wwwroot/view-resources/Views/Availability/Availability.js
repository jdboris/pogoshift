import { Calendar } from "/js/calendar-custom-element.js";
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

    document.querySelector("#availability-calendar").append(
        new Calendar({
            mode: Calendar.Modes.AVAILABILITY,
            date: date,
            availabilities: availabilities,
            closedWeekdays: [],
            dayStartTime: "08:00",
            dayEndTime: "24:00",
            minutesPerColumn: 15
        })
    );

});
