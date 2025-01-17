const FIREBASE_BASEURL = "https://europe-west4-pristine-sphere-435312-g4.cloudfunctions.net/"
const TEAM_TEMPLATE =
    `<tr>
<td class="{COLOR}" style="font-weight: bold">{POS}</td>
<td class="{COLOR}">{TEAM}</td>
<td class="hide">{COUNT}</td>
<td>{WON}</td>
<td>{LOST}</td>
<td class="hide">{DRAWN}</td>
<td class="hide">{GOALS}</td>
<td class="points" style="font-weight: bold">{POINTS}</td>
</tr>`;

const SHOOTER_TEMPLATE = `
<tr>
<td style="font-weight: bold">{POS}</td>
<td>{SHOOTER}</td>
<td>{GOALS}</td>
<td>{ASSISTS}</td>
</tr>`


const GREEN_MAX = 4
const YELLOW_MAX = 12

function reverseChildren(parent){
    for (let i = 1; i < parent.childNodes.length; i++){
        parent.insertBefore(parent.childNodes[i], parent.firstChild);
    }
}

let teams = {};
async function loadTeams() {
    teams = await fetch(FIREBASE_BASEURL + "getTeams").then(r => r.json());
    sort("teams", (a,b) => (b.points - a.points) || ((b.goalsGiven-b.goalsReceived) - (a.goalsGiven-a.goalsReceived)))
}

let shooters = {}
async function loadShooters() {
    const data = await fetch(FIREBASE_BASEURL + "getMatches").then(r => r.json());

    for (const match of Object.values(data)){
        if (!match.events) continue;
        for (const event of [...match.events.left?.split("\n")||[], ...match.events.right?.split("\n")||[]]){
            if (event.length < 1) continue;
            if (!event.includes("⚽")) continue;
            const splitted = event.split("(").map(e => e.replaceAll("⚽", "").trim())

            shooters[splitted[0]] ??= {name: splitted[0], goals: 0, assists: 0/*, team: match.events.left.includes(event) ? match.team_left : match.team_right*/}
            shooters[splitted[0]].goals++;

            if (splitted.length > 1) {
                const assistName = splitted[1].slice(0,-1);
                shooters[assistName] ??= {name: assistName, goals: 0, assists: 0}
                shooters[assistName].assists++
            }
        }
    }

    sort("shooters", (a,b) => (b.goals - a.goals) || (b.assists - a.assists), true);
}

// whichTable = "shooters"  || "teams"
function sort(whichTable, sortFunction, calculatePositions = false){
    const selector = `#table-container .table.${whichTable} .body`;
    let elements;

    switch (whichTable){
        case "shooters":
            let toBeMapped = Object.values(shooters).sort(sortFunction)
            if (!calculatePositions) toBeMapped = toBeMapped.slice(0,30)
            elements = toBeMapped.map((plr, idx) => {

                if (!plr.position) {
                    plr.position = idx+1;
                    shooters[plr.name].position = plr.position;
                }
                return SHOOTER_TEMPLATE
                    .replaceAll("{POS}", String(plr.position))
                    .replaceAll("{SHOOTER}", plr.name)
                    .replaceAll("{GOALS}", plr.goals)
                    .replaceAll("{ASSISTS}", plr.assists)
            })
            break;
        case "teams":
            elements = Object.values(teams).sort(sortFunction).map((team, idx)=> {
                if (!team.position) {
                    team.position = idx + 1;
                    teams[team.name].position = team.position;
                }
                if (!team.color) {
                    team.color = (idx+1) <= GREEN_MAX ? "green" : (idx+1) <= YELLOW_MAX ? "yellow" : "red"
                    teams[team.name].color = team.color;
                }

                return TEAM_TEMPLATE
                    .replaceAll("{POS}", String(team.position))
                    .replaceAll("{COLOR}", String(team.color))
                    .replaceAll("{TEAM}", team.name)
                    .replaceAll("{COUNT}", team.playedCount)
                    .replaceAll("{WON}", team.winCount)
                    .replaceAll("{LOST}", team.loseCount)
                    .replaceAll("{DRAWN}", team.drawCount)
                    .replaceAll("{GOALS}", `${team.goalsGiven}:${team.goalsReceived}`)
                    .replaceAll("{POINTS}", team.points);
            });
            break;
        default:
            throw Error("Invalid sorting call.")
    }
    const container = document.querySelector(selector);

    if (elements.length === 0) {
        container.innerHTML = `<h3 style="text-align: center">Ještě nejsou odehrané žádné zápasy.</h3>`;
    } else {
        container.innerHTML = elements.join("\n");
    }


}

loadTeams().then(() => console.log("teams loaded"))
loadShooters().then(() => console.log("shooters loaded"))

document.querySelectorAll(`#table-container .table th[data-property]`).forEach(el => el.addEventListener("click", _ => {
    const table = el.closest("table");
    // DEFAULT ASCENDING
    const sortByProperty = (a,b) => (a[el.dataset.property] - b[el.dataset.property]) || (a.position - b.position)

    const tableType = table.className.includes("teams") ? "teams" : "shooters";
    if (el.dataset.property){
        let sortDirection;
        switch (el.innerText.slice(0,2)){
            case "▼ ":
                el.innerText = "▲ " + el.innerText.slice(2)
                sortDirection = "asc";
                break;
            case "▲ ":
                el.innerText = "▼ " + el.innerText.slice(2);
                sortDirection = "dsc"
                break;
            default:
                el.innerText = "▲  " + el.innerText.slice();
                sortDirection = "asc"
                break;
        }

        const previouslySorted = table.querySelector("th.sorted")
        if (previouslySorted && previouslySorted !== el) {
            previouslySorted.classList.remove("sorted");
            previouslySorted.innerText = previouslySorted.innerText.slice(2);
        }
        if (!el.classList.contains("sorted")) el.classList.add("sorted")

        sort(tableType, (a,b) => sortDirection === "asc" ? sortByProperty(a,b) : sortByProperty(b,a))
    }
}));