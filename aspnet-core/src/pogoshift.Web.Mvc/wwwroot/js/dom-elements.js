import { MONTH_NAMES, formatTime, getDateFromQueryString, preventDefault, Event } from "./utilities.js";
import { deleteTimePeriod } from "./database.js";

class TimePeriodResizal {
    // NOTE: This class assumes event is a mouse event targeting the handle elment inside a time period
    constructor(calendar, timePeriodBar, event = null) {
        this.calendar = calendar;
        this.bar = timePeriodBar;
        this.timePeriod = this.bar.closest(".time-period");
        this.leftHandle = this.bar.getElementsByClassName("left-handle")[0];
        this.rightHandle = this.bar.getElementsByClassName("right-handle")[0];
        if (event != null) {
            this.start(event);
        }
    }

    start(event) {
        this.startX = event.clientX;
        if (event.target.classList.contains("left-handle")) {
            this.side = "Start";
        } else {
            this.side = "End";
        }

        this.startColumn = parseInt(this.bar.style["gridColumn" + this.side]);
    }

    stop(event) {
        this.bar = null;
    }

    resize(event) {

        let parentWidth = this.bar.parentElement.clientWidth;
        let offset = event.clientX - this.startX;
        // parseInt to use addition rather than concatenation
        let start = parseInt(this.bar.style["gridColumn" + this.side]);
        let rightColumn = parseInt(this.bar.style.gridColumnEnd);
        let leftColumn = parseInt(this.bar.style.gridColumnStart);

        let newStart = this.startColumn + this.calendar.pixelsToColumns(offset, parentWidth);

        // The margin between the start and end times
        //let margin = parseInt(0.15 * this.calendar.columnsPerDay);
        //let margin = this.calendar.pixelsToColumns(2 * this.leftHandle.offsetWidth + 26, parentWidth);
        let margin = this.calendar.hoursToColumns(2.5);

        if (this.side == "Start") {
            if (newStart < 1) newStart = 1;
            else if (newStart >= rightColumn - margin) newStart = rightColumn - margin;
        } else {
            if (newStart <= leftColumn + margin) newStart = leftColumn + margin;
            else if (newStart > this.calendar.columnsPerDay + 1) newStart = this.calendar.columnsPerDay + 1;
        }

        this.setColumn(newStart);
    }

    // side: "Left" or "Right"
    setColumn(column, side = this.side) {
        let timeElement = this.bar.parentElement.getElementsByClassName("time-" + side.toLowerCase())[0];
        timeElement.innerHTML = this.calendar.columnToTime(column - 1);

        this.bar.style["gridColumn" + side] = column;
    }
}

class TimePeriodMovement {
    // NOTE: This class assumes the events are mouse events targeting a time period element

    constructor(calendar, timePeriodBar, event = null) {
        this.calendar = calendar;
        this.bar = timePeriodBar;
        this.timePeriod = this.bar.closest(".time-period");
        if (event != null) {
            this.start(event);
        }
    }

    start(event) {

        this.element = event.target;
        this.startX = event.clientX;

        this.startColumn = parseInt(this.element.style.gridColumnStart);
        this.endColumn = parseInt(this.element.style.gridColumnEnd);
    }

    stop(event) {
        this.element = null;
    }

    move(event) {

        let parentWidth = this.element.parentElement.clientWidth;
        let offset = event.clientX - this.startX;
        let start = this.element.style.gridColumnStart;
        let end = this.element.style.gridColumnEnd;
        let rightColumn = this.element.style.gridColumnEnd;
        let leftColumn = this.element.style.gridColumnStart;

        let newStart = this.startColumn + parseInt((offset / parentWidth) * this.calendar.columnsPerDay);
        let newEnd = this.endColumn + parseInt((offset / parentWidth) * this.calendar.columnsPerDay);

        let boundaryOffset = 0;
        if (newStart < 1) {
            boundaryOffset = newStart - 1;
            newStart = 1;
            newEnd -= boundaryOffset;
        } else if (newEnd > this.calendar.columnsPerDay + 1) {
            boundaryOffset = newEnd - this.calendar.columnsPerDay - 1;
            newEnd = this.calendar.columnsPerDay + 1;
            newStart -= boundaryOffset;
        }

        let timeElement = this.element.parentElement.getElementsByClassName("time-start")[0];
        timeElement.innerHTML = this.calendar.columnToTime(newStart - 1);

        timeElement = this.element.parentElement.getElementsByClassName("time-end")[0];
        timeElement.innerHTML = this.calendar.columnToTime(newEnd - 1);

        this.element.style.gridColumnStart = newStart;
        this.element.style.gridColumnEnd = newEnd;
    }
}


export function CustomElement(html) {
    let template = document.createElement("template");
    // Prevent returning a text node of whitespace as the result
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

export function TimePeriod(calendar, timeBuffer = { start: null, end: null }, associate = null) {

    let time = { start: timeBuffer.start, end: timeBuffer.end };
    if (time.start != null && time.end == null) throw "Error: you must provide a start AND end time (or neither) to create a TimePeriod.";

    let columnStart = 1;
    let columnEnd = calendar.columnsPerDay + 1;

    if (time.start == null && time.end == null) {
        // If there's no time period template
        if (calendar.timePeriodTemplate == null) {
            time.start = formatTime(calendar.dayStartTime);
            time.end = formatTime(calendar.dayEndTime);
        } else {
            columnStart = calendar.timePeriodTemplate.getElementsByClassName("time-period-bar")[0].style.gridColumnStart;
            columnEnd = calendar.timePeriodTemplate.getElementsByClassName("time-period-bar")[0].style.gridColumnEnd;
            time.start = calendar.timePeriodTemplate.getElementsByClassName("time-start")[0].innerHTML;
            time.end = calendar.timePeriodTemplate.getElementsByClassName("time-end")[0].innerHTML;
        }
    } else {
        columnStart = calendar.timeToColumns(time.start);
        columnEnd = calendar.timeToColumns(time.end);
        time.start = formatTime(time.start);
        time.end = formatTime(time.end);
    }


    // NOTE: Must use inline CSS for the grid-column property in order for resizing to work
    // NOTE: Must use appendChild instead of innerHTML in order for the time periods to retain their click handlers 
    // NOTE: The order of the time period bars matters
    let timePeriod = new CustomElement(`
    <div class="time-period">
        <div class="time-period-inner" style="grid-template-columns: repeat( ${calendar.columnsPerDay}, 1fr );">
            <div class="time-period-heading">

                <span class="time-period-copy">
                    <i class="far fa-copy"></i>
                </span>

                <span class="time-period-time">
                    <span class="time-start">${time.start}</span> - <span class="time-end">${time.end}</span>
                </span>

                <span class="time-period-delete">
                    <i class="fas fa-trash-alt"></i>
                </span>

            </div>
            <div class="time-period-bar availability-bar bg-primary text-light" style="grid-column: ${columnStart} / ${columnEnd};">
                <i class="fas fa-grip-lines-vertical left-handle"></i>
                <i class="fas fa-grip-lines-vertical right-handle"></i>
            </div>
            <div class="time-period-bar scheduling-bar bg-primary text-light" style="grid-column: ${columnStart} / ${columnEnd};">
                <i class="fas fa-grip-lines-vertical left-handle"></i>
                <i class="fas fa-grip-lines-vertical right-handle"></i>
            </div>
        </div>
    </div>
    `);

    let left = timePeriod.getElementsByClassName("left-handle")[0];
    let right = timePeriod.getElementsByClassName("right-handle")[0];
    let schedulingBar = timePeriod.getElementsByClassName("scheduling-bar")[0];
    let availabilityBar = timePeriod.getElementsByClassName("availability-bar")[0];
    let heading = timePeriod.getElementsByClassName("time-period-heading")[0];
    let copyButton = timePeriod.getElementsByClassName("time-period-copy")[0];
    let deleteButton = timePeriod.getElementsByClassName("time-period-delete")[0];

    if (associate != null) {
        timePeriod.dataset.associateId = associate.id;
        schedulingBar.style.backgroundColor = associate.color;
        availabilityBar.style.backgroundColor = associate.color;
    } else if (Object.keys(calendar.associates).length > 0) {
        let id = Object.keys(calendar.associates)[0];
        schedulingBar.style.backgroundColor = calendar.associates[id].color;
        availabilityBar.style.backgroundColor = calendar.associates[id].color;
    }

    let handler = new Event.PointerHandler((event) => {

        // If the time is visible   
        if (getComputedStyle(heading).display != "none") {
            calendar.timePeriodMovement = new TimePeriodMovement(calendar, availabilityBar, event);
        }
    });

    availabilityBar.ontouchstart = handler;
    availabilityBar.onmousedown = handler;

    handler = new Event.PointerHandler((event) => {

        if (timePeriod.classList.contains("time-period-template") == false) {
            if (calendar.focusedTimePeriod != null) calendar.focusedTimePeriod.classList.remove("focused");
            calendar.focusedTimePeriod = timePeriod;
            timePeriod.classList.add("focused");
            timePeriod.prepend(calendar.mobileOverlay);
            calendar.mobileOverlay.classList.remove("hidden");
        }
    });

    availabilityBar.onclick = handler;


    handler = new Event.PointerHandler((event) => {

        calendar.toggleScheduled(schedulingBar, associate);
    });

    schedulingBar.onclick = handler;

    // To prevent adding a new time period when clicking this time period
    // NOTE: onclick will be simulated on mobile browsers
    timePeriod.onclick = (event) => {
        event.stopPropagation();
    }

    handler = new Event.PointerHandler((event) => {
        calendar.timePeriodResizal = new TimePeriodResizal(calendar, availabilityBar, event);
    });

    left.ontouchstart = handler;
    left.onmousedown = handler;

    right.ontouchstart = handler;
    right.onmousedown = handler;

    handler = new Event.PointerHandler((event) => {
        let resizal = new TimePeriodResizal(calendar, calendar.timePeriodTemplate.getElementsByClassName("time-period-bar")[0]);
        resizal.setColumn(availabilityBar.style.gridColumnStart, "Start");
        resizal.setColumn(availabilityBar.style.gridColumnEnd, "End");
    });

    // NOTE: onclick will be simulated on mobile browsers
    copyButton.onclick = handler;

    handler = new Event.PointerHandler((event) => {
        deleteTimePeriod(timePeriod.dataset.availabilityId).then(() => {
            timePeriod.parentElement.removeChild(timePeriod);
        });
    });

    // NOTE: onclick will be simulated on mobile browsers
    deleteButton.onclick = handler;

    return timePeriod;
}
