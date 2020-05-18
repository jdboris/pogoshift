import { CustomElement } from "./dom-elements.js";
import { Availability } from "./models/Availability.js";
import { createShift } from "./database.js";
import { Calendar } from "./calendar.js";

export class ScheduleCalendar extends Calendar {
    constructor(associate = null, storeId = 0, associateMinimum = 1, managerMinimum = 1, shifts = [], availabilities = [], closedWeekdays = [], dayStartTime = "9:00", dayEndTime = "17:00", minutesPerColumn = 15) {
        super(associate, availabilities, closedWeekdays, dayStartTime, dayEndTime, minutesPerColumn);
        this.storeId = storeId;

        this.element.classList.add("scheduling-calendar");

        this.associateMinimum = associateMinimum;
        this.managerMinimum = managerMinimum;


        // Load existing shifts on the calendar
        for (let shift of shifts) {
            let schedulingBar = this.dayListElement.querySelector(`.time-period[data-availability-id='${shift.availabilityID}'] .scheduling-bar`);
            let associate = this.associates[shift.userId];

            this.toggleScheduled(schedulingBar, associate, shift);
        }

        // Show list of available associates
        let card = new CustomElement(`<div class="card associate-list-card"><div class="card-body"></div></div>`);
        let cardBody = card.getElementsByClassName("card-body")[0];

        for (let id in this.associates) {
            let associate = this.associates[id];

            let associateElement = new CustomElement(`
                <span class="associate-list-item"><i class="fas fa-circle" style="color: ${associate.color}"></i><span>${associate.name}</span></span>
            `);
            cardBody.appendChild(associateElement);
        }

        this.element.append(card);

        for (let monthDay of this.monthDays) {
            this.checkSchedulingErrors(monthDay);
        }
    }

    toggleScheduled(timePeriodBar, associate, shift = null) {

        let monthDay = timePeriodBar.closest(".month-day");
        let timePeriod = timePeriodBar.closest(".time-period");

        if (timePeriodBar.classList.contains("scheduled") == false) {

            if (shift == null) {
                if (this.associate.isManager == 1) {
                    createShift(associate, timePeriod, monthDay, this).then(() => {
                        timePeriodBar.classList.add("scheduled");
                        this.addAssociateToDay(monthDay, associate);
                    });
                }
            } else {
                timePeriodBar.classList.add("scheduled");
                this.addAssociateToDay(monthDay, associate);
                timePeriod.shiftId = shift.id;
            }

        } else {
            if (this.associate.isManager == 1) {

                new Availability({
                    id: timePeriod.shiftId,
                    userId: timePeriod.associateId
                }).delete().then((data) => {
                    timePeriodBar.classList.remove("scheduled");
                    this.removeAssociateFromDay(monthDay, associate);

                    timePeriod.shiftId = null;
                });
            }
        }
    }


    addAssociateToDay(monthDay, associate) {
        let associateCount = parseInt(monthDay.dataset.associateCount) + 1;
        monthDay.dataset.associateCount = associateCount;

        if (associate.isManager == true) {
            let managerCount = parseInt(monthDay.dataset.managerCount) + 1;
            monthDay.dataset.managerCount = managerCount;
        }
        this.checkSchedulingErrors(monthDay);
    }

    removeAssociateFromDay(monthDay, associate) {
        let associateCount = parseInt(monthDay.dataset.associateCount) - 1;
        monthDay.dataset.associateCount = associateCount;

        if (associate.isManager == true) {
            let managerCount = parseInt(monthDay.dataset.managerCount) - 1;
            monthDay.dataset.managerCount = managerCount;
        }
        this.checkSchedulingErrors(monthDay);
    }

    checkSchedulingErrors(monthDay) {
        if (monthDay.dataset.associateCount < this.associateMinimum) {
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
