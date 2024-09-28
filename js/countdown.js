function makeDate(date, time){
    const splitted = date.split(".")
    if (splitted.length !== 3 || time.split(":").length !== 2) return 0;
    const [hours, mins] = time.split(":")
    return new Date(Date.parse(`${splitted[2]}-${splitted[1].padStart(2, "0")}-${splitted[0].padStart(2, "0")}T${hours.padStart(2, "0")}:${mins.padStart(2, "0")}`));
}

function registerCountdown(date){
    const cdEl = document.getElementById("countdown");
    if (!cdEl) throw Error("No countdown element.");


    const days = cdEl.querySelector("#days")
    const hours = cdEl.querySelector("#hours")
    const minutes = cdEl.querySelector("#minutes")
    const seconds = cdEl.querySelector("#seconds")

    const daysWord = days.querySelector("span")
    const hoursWord = hours.querySelector("span")
    const minutesWord = minutes.querySelector("span")
    const secondsWord = seconds.querySelector("span")

    const refresh = () => {
        const timezoneOffset = new Date().getTimezoneOffset(); // minutes
        const now = Date.now() + (-timezoneOffset*60*1000);
        const distance = date.getTime() - now;


        if (distance > 0) {
            const daysVal = Math.floor(distance / (24 * 60 * 60 * 1000));
            if (daysVal === 1){
                daysWord.innerText = "den";
            } else {
                daysWord.innerText = "dní";
            }
            days.innerHTML = daysVal.toString() + daysWord.outerHTML;

            const hoursVal = Math.floor((distance / (60 * 60 * 1000) - (daysVal*24)));
            if (hoursVal === 1){
                hoursWord.innerText = "hodina";
            } else {
                hoursWord.innerText = "hodin";
            }
            hours.innerHTML = hoursVal.toString() + hoursWord.outerHTML;

            const minutesVal = Math.floor((distance / (60 * 1000)) - (daysVal*24*60) - (hoursVal * 60))
            if (minutesVal === 1){
                minutesWord.innerText = "minuta"
            } else {
                minutesWord.innerText = "minut"
            }
            minutes.innerHTML = minutesVal.toString() + minutesWord.outerHTML;

            const secondsVal = Math.floor((distance / 1000) - (daysVal*24*60*60) - (hoursVal*60*60) - (minutesVal * 60));
            if (secondsVal === 1){
                secondsWord.innerText = "sekunda"
            } else {
                secondsWord.innerText = "sekund"
            }
            seconds.innerHTML = secondsVal.toString() + secondsWord.outerHTML;
        } else {
            cdEl.querySelector(".finished").style.display = "block";
            cdEl.querySelector(".unfinished").style.display = "none";
            clearInterval(int);

        }
    }

    refresh();
    const int = setInterval(refresh, 1000);

}