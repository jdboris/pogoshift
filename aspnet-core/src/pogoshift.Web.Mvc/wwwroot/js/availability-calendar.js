import { E, AvailabilityPeriod } from "./dom-elements.js";
import { Event, stringToDate } from "./utilities.js";
import { Availability } from "./models/Availability.js";
import { Calendar } from "./calendar.js";

export class AvailabilityCalendar extends Calendar {
    constructor(date, availabilities = [], closedWeekdays = [], dayStartTime = "9:00", dayEndTime = "17:00", minutesPerColumn = 15) {
        super(date, availabilities, [], true, closedWeekdays, dayStartTime, dayEndTime, minutesPerColumn);

        this.associates[abp.session.user.id] = abp.session.user;

        this.element.classList.add("availability-calendar");
        // NOTE: This is required to allow making new time period templates
        this.timePeriodTemplate = null;

        let card = new E(`<div class="card time-period-template-card"><div class="card-body"></div></div>`);
        let cardBody = card.getElementsByClassName("card-body")[0];

        this.timePeriodTemplate = new AvailabilityPeriod(this, true, { beginning: this.dayStartTime, ending: this.dayEndTime, user: abp.session.user });
        this.timePeriodTemplate.element.classList.add("time-period-template");

        cardBody.appendChild(this.timePeriodTemplate.element);
        this.element.append(card);

        for (let dayNumber in this.monthDays) {
            let monthDay = this.monthDays[dayNumber];
            let element = monthDay.element;

            let handler = new Event.PointerHandler((event) => {

                if (monthDay.timePeriodCrudPromise == null) {
                    // If the click originated directly on this element
                    if ((this.timePeriodResizal == null && this.timePeriodMovement == null) &&
                        element.dataset.availabilityCount == 0) {

                        let day = element.getElementsByClassName("day-number")[0].innerHTML;
                        let start = stringToDate(this.timePeriodTemplate.element.querySelector(".time-start").innerHTML);
                        start.setFullYear(this.date.getFullYear(), this.date.getMonth(), day);
                        let end = stringToDate(this.timePeriodTemplate.element.querySelector(".time-end").innerHTML);
                        end.setFullYear(this.date.getFullYear(), this.date.getMonth(), day);

                        monthDay.timePeriodCrudPromise = new Availability({
                            userId: abp.session.userId,
                            beginning: start,
                            ending: end,
                            note: ""
                        }).save().then((availability) => {
                            this.focusTimePeriod(this.addAvailability(availability).element);
                            
                        }).finally(() => {
                            monthDay.timePeriodCrudPromise = null;
                        });
                    }
                }
            });


            // NOTE: onclick will be simulated on mobile browsers
            element.onclick = handler;
        }
    }
}

