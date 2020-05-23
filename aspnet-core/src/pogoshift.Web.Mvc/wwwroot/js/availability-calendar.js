import { CustomElement, AvailabilityPeriod } from "./dom-elements.js";
import { Event } from "./utilities.js";
import { Availability } from "./models/Availability.js";
import { Calendar } from "./calendar.js";

export class AvailabilityCalendar extends Calendar {
    constructor(availabilities = [], closedWeekdays = [], dayStartTime = "9:00", dayEndTime = "17:00", minutesPerColumn = 15) {
        super(availabilities, [], true, closedWeekdays, dayStartTime, dayEndTime, minutesPerColumn);

        this.element.classList.add("availability-calendar");
        // NOTE: This is required to allow making new time period templates
        this.timePeriodTemplate = null;

        let card = new CustomElement(`<div class="card time-period-template-card"><div class="card-body"></div></div>`);
        let cardBody = card.getElementsByClassName("card-body")[0];

        this.timePeriodTemplate = new AvailabilityPeriod(this, true, { beginning: dayStartTime, ending: dayEndTime });
        this.timePeriodTemplate.element.classList.add("time-period-template");

        cardBody.appendChild(this.timePeriodTemplate.element);
        this.element.append(card);

        for (let dayNumber in this.monthDays) {
            let monthDay = this.monthDays[dayNumber];
            let element = monthDay.element;

            let handler = new Event.PointerHandler((event) => {

                // If the click originated directly on this element
                if ((this.timePeriodResizal == null && this.timePeriodMovement == null) &&
                    element.dataset.availabilityCount == 0 ) {

                    let day = element.getElementsByClassName("day-number")[0].innerHTML.padStart(2, "0");
                    let month = `${this.date.getMonth() + 1}`.padStart(2, "0");
                    let year = this.date.getFullYear();

                    let templateStartTime = this.timePeriodTemplate.element.getElementsByClassName("time-start")[0].innerHTML;
                    let startTime = templateStartTime + ":00";
                    startTime = `${year}-${month}-${day}T${startTime}Z`;

                    let templateEndTime = this.timePeriodTemplate.element.getElementsByClassName("time-end")[0].innerHTML;
                    let endTime = templateEndTime + ":00";
                    // NOTE: 24:00 is not a valid time
                    if (endTime.split(":")[0] == 24) endTime = "23:59:59";
                    endTime = `${year}-${month}-${day}T${endTime}Z`;

                    new Availability({
                        userId: abp.session.userId,
                        beginning: startTime,
                        ending: endTime,
                    }).save().then((availability) => {
                        this.addAvailability(availability);
                    });
                }
            });

            // NOTE: onclick will be simulated on mobile browsers
            element.onclick = handler;
        }
    }
}

