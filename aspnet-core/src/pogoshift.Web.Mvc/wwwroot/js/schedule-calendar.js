import { getUserColor, Event } from "./utilities.js";
import { E, Input } from "./dom-elements.js";
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
        let card = E(`<div class="card associate-list-card"><div class="card-body"></div></div>`);
        let cardBody = card.getElementsByClassName("card-body")[0];

        for (let id in this.associates) {
            let associate = this.associates[id];

            let associateElement = E(`
                <span class="associate-list-item" data-associate-id="${id}"><i class="fas fa-circle" style="color: ${getUserColor(associate)}"></i><span>${associate.surname} ${associate.name}</span></span>
            `);

            let handler = new Event.PointerHandler((event) => {
                this.toggleUserFilter(id);
            });

            associateElement.onclick = handler;

            cardBody.appendChild(associateElement);
        }

        this.element.append(card);

        for (let dayNumber in this.monthDays) {
            this.checkSchedulingErrors(this.monthDays[dayNumber]);
        }

        
        if ("HasUser.CrudAll" in abp.auth.grantedPermissions) {
            //this.header.append(BreakControls());
        }
        
        this.header.append(E(`
            <button class="btn btn-link print-button">Print&nbsp;<i class="fas fa-print"></i></button>
        `, {
                onclick: () => {

                    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];
                    // Temporarily change the document title and print, for the printed/downloaded file name
                    let oldTitle = document.title;
                    document.title = `${abp.custom.tenant.name}-Schedule-${monthNames[this.date.getMonth()]}-${this.date.getFullYear()}`;
                    print();
                    document.title = oldTitle;
                }
        }));

        this.addUserFilter(abp.session.userId);
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

    toggleUserFilter(id) {
        id = Number(id);
        let url = new URL(location);
        let params = new URLSearchParams(url.search.slice(1));
        let userIds = params.get("f");
        userIds = userIds ? userIds.split(",") : [];
        userIds = userIds.map((value) => { return Number(value); });

        if (userIds.indexOf(id) == -1) {
            userIds.push(id);
        } else {
            userIds.splice(userIds.indexOf(id), 1);
        }

        params.set("f", userIds);
        history.replaceState(null, "", "?" + params);
        this.highlightAllFromFilter();
    }

    addUserFilter(id) {
        id = Number(id);
        let url = new URL(location);
        let params = new URLSearchParams(url.search.slice(1));
        let userIds = params.get("f");
        userIds = userIds ? userIds.split(",") : [];
        userIds = userIds.map((value) => { return Number(value); });

        if (userIds.indexOf(id) == -1) {
            userIds.push(id);
        }

        params.set("f", userIds);
        history.replaceState(null, "", "?" + params);
        this.highlightAllFromFilter();
    }

    // Highlight the users whose IDs appear in the query string
    highlightAllFromFilter() {
        let url = new URL(location);
        let params = new URLSearchParams(url.search.slice(1));
        let userIds = params.get("f");
        userIds = userIds ? userIds.split(",") : [];
        userIds = userIds.map((value) => { return Number(value); });
        let newUserIds = [];

        let timePeriods = this.element.querySelectorAll(`.time-period.highlighted-period`);
        for (let timePeriod of timePeriods) {
            timePeriod.classList.remove("highlighted-period");
        }
        let listItems = this.element.querySelectorAll(`.associate-list-item.highlighted-list-item`);
        for (let listItem of listItems) {
            listItem.classList.remove("highlighted-list-item");
        }

        if (userIds.length > 0) {
            for (let id of userIds) {
                if (id in this.associates) {
                    newUserIds.push(id);

                    let timePeriods = this.element.querySelectorAll(`.time-period[data-associate-id="${id}"]`);
                    for (let timePeriod of timePeriods) {
                        timePeriod.classList.add("highlighted-period");
                    }
                    let listItems = this.element.querySelectorAll(`.associate-list-item[data-associate-id="${id}"]`);
                    for (let listItem of listItems) {
                        listItem.classList.add("highlighted-list-item");
                    }
                }
            }
        }

        if (newUserIds.length > 0) {
            this.element.classList.add("highlighted");
        } else {
            this.element.classList.remove("highlighted");
        }

        // Update query string
        params.set("f", newUserIds);
        history.replaceState(null, '', "?" + params);
    }
    
}


function BreakControls() {

    let element = E(`<div class="break-controls">Breaks: </div>`);
    let state = {
        breaks: [],
        newBreakHours: null,
        newBreakMinutes: 15,
        breakHours: null,
        breakMinutes: null,
        selectedBreak: null
    };

    let ddl;

    render();

    function render() {
        element.innerHTML = "";

        element.append(
            "Breaks: ",

            Input(`<input type="number" name="newBreakHours" class="form-control" placeholder="HH" min="0" max="24" />`, {}, state),
            E(`<span class="input-combinator">:</span>`),
            Input(`<input type="number" name="newBreakMinutes" class="form-control" placeholder="MM" min="0" max="60" />`, {}, state),
        
            E(`<button class="btn btn-primary"><i class="fas fa-minus"></i></button>`, {
                onclick: () => {
                    breaks.pop();
                    render();
                }
            }),

            E(`<input type="number" class="form-control" value="${state.breaks.length}" disabled/>`),

            E(`<button class="btn btn-primary"><i class="fas fa-plus"></i></button>`, {
                onclick: () => {
                    state.breaks.push({
                        hours: Number(state.newBreakHours),
                        minutes: Number(state.newBreakMinutes),
                        hourString: function() {
                            return String(this.hours).padStart(2, "0");
                        },
                        minuteString: function () {
                            return String(this.minutes).padStart(2, "0");
                        }
                    });
                    render();
                }
            }),

            ddl = Input(`<select name="selectedBreak" class="custom-select" ${state.breaks.length ? "" : "disabled"}></select>`, {
                children: state.breaks.map((b, index) => {
                    return E(`<option value="${index}">Break ${index + 1} (${b.hourString()}:${b.minuteString()})</option>`);
                }),
                onchange: (e) => {
                    state.breakHours = state.breaks[e.target.selectedIndex].hourString();
                    state.breakMinutes = state.breaks[e.target.selectedIndex].minuteString();
                    render();
                }
            }, state),

            Input(`
                <input type="number" name="breakHours" class="form-control" placeholder="HH" min="0" max="24" ${state.breaks.length ? "" : "disabled"} />
            `, {}, state),
            E(`<span class="input-combinator">:</span>`),
            Input(`
                <input type="number" name="breakMinutes" class="form-control" placeholder="MM" min="0" max="60" ${state.breaks.length ? "" : "disabled"} />
            `, {}, state),
        );

        //ddl.append(E(`<option value="7">Break 7 (5:5)</option>`));
    }

    return element;
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