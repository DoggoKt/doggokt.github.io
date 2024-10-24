const FIREBASE_BASEURL = "https://europe-west4-pristine-sphere-435312-g4.cloudfunctions.net/"
const TEAM_TEMPLATE =
    `<tr>
<td>{POS}</td>
<td>{TEAM}</td>
<td class="hide">{COUNT}</td>
<td>{WON}</td>
<td>{LOST}</td>
<td class="hide">{DRAWN}</td>
<td>{POINTS}</td>
</tr>`;


async function loadTeams() {
    const data = await fetch(FIREBASE_BASEURL + "getTeams").then(r => r.json());

    const elements = Object.values(data).sort((a,b) => b.points - a.points).map((team, idx)=> {
        console.log(team.points)
        return TEAM_TEMPLATE
            .replaceAll("{POS}", String(idx + 1))
            .replaceAll("{TEAM}", team.name)
            .replaceAll("{COUNT}", team.playedCount)
            .replaceAll("{WON}", team.winCount)
            .replaceAll("{LOST}", team.loseCount)
            .replaceAll("{DRAWN}", team.drawCount)
            .replaceAll("{POINTS}", team.points);
    });

    const container = document.querySelector("#table-container .body");

    if (elements.length === 0) {
        container.innerHTML = `<h3 style="text-align: center">Ještě nejsou odehrané žádné zápasy.</h3>`;
    } else {
        container.innerHTML = elements.join("\n");
    }
}

loadTeams().then(() => console.log("Teams loaded."))