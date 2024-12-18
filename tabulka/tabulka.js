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

async function loadTeams() {
    const data = await fetch(FIREBASE_BASEURL + "getTeams").then(r => r.json());


    const elements = Object.values(data).sort((a,b) => (b.points - a.points) || (b.goalsGiven-b.goalsReceived) - (a.goalsGiven-a.goalsReceived)).map((team, idx)=> {
        return TEAM_TEMPLATE
            .replaceAll("{POS}", String(idx + 1))
            .replaceAll("{COLOR}", (idx+1) <= GREEN_MAX ? "green" : (idx+1) <= YELLOW_MAX ? "yellow" : "red")
            .replaceAll("{TEAM}", team.name)
            .replaceAll("{COUNT}", team.playedCount)
            .replaceAll("{WON}", team.winCount)
            .replaceAll("{LOST}", team.loseCount)
            .replaceAll("{DRAWN}", team.drawCount)
            .replaceAll("{GOALS}", `${team.goalsGiven}:${team.goalsReceived}`)
            .replaceAll("{POINTS}", team.points);
    });

    const container = document.querySelector("#table-container .table.teams .body");

    if (elements.length === 0) {
        container.innerHTML = `<h3 style="text-align: center">Ještě nejsou odehrané žádné zápasy.</h3>`;
    } else {
        container.innerHTML = elements.join("\n");
    }
}

async function loadShooters() {
    const data = await fetch(FIREBASE_BASEURL + "getMatches").then(r => r.json());

    const counted = {};

    for (const match of Object.values(data)){
        if (!match.events) continue;
        for (const event of [...match.events.left?.split("\n")||[], ...match.events.right?.split("\n")||[]]){
            if (event.length < 1) continue;
            if (!event.includes("⚽")) continue;
            const splitted = event.split("(").map(e => e.replaceAll("⚽", "").trim())

            console.log(match)
            counted[splitted[0]] ??= {goals: 0, assists: 0/*, team: match.events.left.includes(event) ? match.team_left : match.team_right*/}
            counted[splitted[0]].goals++;

            if (splitted.length > 1) {
                const assistName = splitted[1].slice(0,-1);
                counted[assistName] ??= {goals: 0, assists: 0}
                counted[assistName].assists++
            }
        }
    }

    console.log(counted)

    const elements = Object.keys(counted).sort((a,b) => (counted[b].goals - counted[a].goals) || (counted[b].assists - counted[a].assists)).slice(0,30).map((plr, idx) => {
      return SHOOTER_TEMPLATE
          .replaceAll("{POS}", String(idx+1))
          .replaceAll("{SHOOTER}", `${plr}`)
          .replaceAll("{GOALS}", counted[plr].goals)
          .replaceAll("{ASSISTS}", counted[plr].assists)
    })

    const container = document.querySelector("#table-container .table.shooters .body");

    if (elements.length === 0) {
        container.innerHTML = `<h3 style="text-align: center">Ještě nejsou odehrané žádné zápasy.</h3>`;
    } else {
        container.innerHTML = elements.join("\n");
    }
}


loadTeams().then(() => console.log("teams loaded"))
loadShooters().then(() => console.log("shooters loaded"))