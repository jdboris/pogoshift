
export function createShift(associate, timePeriod, monthDay, calendar) {

    let dayNumberElement = monthDay.getElementsByClassName("day-number")[0];

    let startTime = timePeriod.getElementsByClassName("time-start")[0].innerHTML + ":00";
    startTime = `${calendar.date.getFullYear()}-${calendar.date.getMonth() + 1}-${dayNumberElement.innerHTML}T${startTime}Z`;
    let endTime = timePeriod.getElementsByClassName("time-end")[0].innerHTML + ":00";
    // NOTE: 24:00 is not a valid time
    if (endTime.split(":")[0] == 24) endTime = "23:59:59";
    endTime = `${calendar.date.getFullYear()}-${calendar.date.getMonth() + 1}-${dayNumberElement.innerHTML}T${endTime}Z`;

    let shift = new ShiftModel({
        date: startTime,
        beginning: startTime,
        ending: endTime,
        availabilityId: timePeriod.dataset.availabilityId
    });

    return fetch("Create", {
        method: "POST",
        body: JSON.stringify(shift),
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        },
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Shift/Create responded with ' + response.status);
            }
            return response.json();
        })
        .then(function (response) {
            if (response.status == "AUTHENTICATION_FAILED") {
                location.href = "/Profile/SignIn";
            } else if (response.status == "INSERT_FAILED") {
                // TODO: Tell the user something went wrong
                console.error("/Profile/SignIn returned INSERT_FAILED");
            } else if (response.status == "SUCCESS") {
                shift.id = response.id;
                timePeriod.dataset.shiftId = response.id;
            }
        });
}