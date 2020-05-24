import { getUserColor } from "./utilities.js";
import { CustomElement } from "./dom-elements.js";
import { Shift } from "./models/Shift.js";
import { Calendar } from "./calendar.js";


export class ScheduleCalendar extends Calendar {
    constructor(date, associateMinimum = 1, managerMinimum = 1, availabilities = [], shifts = [], closedWeekdays = [], dayStartTime = "9:00", dayEndTime = "17:00", minutesPerColumn = 15) {
        super(date, availabilities, shifts, false, closedWeekdays, dayStartTime, dayEndTime, minutesPerColumn, createShiftFromAvailability);
        this.storeId = abp.session.tenantId;

        this.element.classList.add("scheduling-calendar");

        this.associateMinimum = associateMinimum;
        this.managerMinimum = managerMinimum;


        // Show list of available associates
        let card = new CustomElement(`<div class="card associate-list-card"><div class="card-body"></div></div>`);
        let cardBody = card.getElementsByClassName("card-body")[0];

        for (let id in this.associates) {
            let associate = this.associates[id];

            let associateElement = new CustomElement(`
                <span class="associate-list-item"><i class="fas fa-circle" style="color: ${getUserColor(associate)}"></i><span>${associate.name}</span></span>
            `);
            cardBody.appendChild(associateElement);
        }

        this.element.append(card);

        for (let dayNumber in this.monthDays) {
            this.checkSchedulingErrors(this.monthDays[dayNumber]);
        }
    }

    checkSchedulingErrors(monthDay) {
        monthDay = monthDay.element;
        if (monthDay.dataset.shiftCount < this.associateMinimum) {
            monthDay.classList.add("associate-minimum-error");
        } else {
            monthDay.classList.remove("associate-minimum-error");
        }

        if (monthDay.dataset.managerCount < this.managerMinimum) {
            monthDay.classList.add("manager-minimum-error");
        } else {
            monthDay.classList.remove("manager-minimum-error");
        }
    }
}


function createShiftFromAvailability(calendar, availabilityPeriod) {
    if ("HasUser.CrudAll" in abp.auth.grantedPermissions) {
        new Shift({
            userId: availabilityPeriod.user.id,
            date: availabilityPeriod.getStartTime(),
            beginning: availabilityPeriod.getStartTime(),
            ending: availabilityPeriod.getEndTime(),
        }).save().then((shift) => {
            if (!(shift.userId in calendar.associates)) {
                console.error("Error: Shift User is not listed on this Calendar.");
            } else {
                calendar.addShift(shift);

                //availabilityPeriod.element.parentNode.insertBefore(shiftPeriod.element, availabilityPeriod.element.nextSibling);
            }
        });
    }
}