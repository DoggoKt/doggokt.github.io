function makeDate(date, time){
    const splitted = date.split(".")
    if (splitted.length !== 3 || time.split(":").length !== 2) return 0;
    const [hours, mins] = time.split(":")
    return new Date(Date.parse(`${splitted[2]}-${splitted[1].padStart(2, "0")}-${splitted[0].padStart(2, "0")}T${hours.padStart(2, "0")}:${mins.padStart(2, "0")}`));
}

const FIREBASE_BASEURL = "https://europe-west4-pristine-sphere-435312-g4.cloudfunctions.net/"
const MATCH_TEMPLATE = `<div data-matchid="{ID}" class="wp-block-group alignfull has-primary-background-color has-background has-global-padding is-layout-constrained wp-container-core-group-is-layout-5 wp-block-group-is-layout-constrained" style="{STYLE}">
            <!--{FIRST}-->
            <!--{DATE}-->
            <!--{TIME}-->
            <div class="match-div" style="display: flex; align-items: center;">
                <div class="team-wrapper team-left">
                    <img style="flex-basis:0;" src="{LEFT_URL}" alt="{LEFT_NAME}"/>
                    <h3 style="flex-grow:1;flex-basis:0;color: #fff;text-align: center;">{LEFT_NAME}</h3>
                </div>
                <div class="score-wrapper">
                {SCORE}
                </div>
                <div class="team-wrapper team-right">
                    <h3 style="flex-grow: 1;flex-basis:0;color: #fff;text-align: center;">{RIGHT_NAME}</h3>
                    <img style="flex-basis:0;" src="{RIGHT_URL}" alt="{RIGHT_NAME}"/>
                </div>
            </div>
            <div class="match-event-wrapper {IS_EMPTY_EVENTS}">
                <div class="left">
                    {LEFT_EVENTS}
                </div>
                <div class="right">
                    {RIGHT_EVENTS}
                </div>
            </div>
            
         </div>`;

const STYLE = `
<style>

.match-event-wrapper {
    display: flex;
    gap: 200px;
}

.match-event-wrapper.empty {
    height: 0;
    margin: 0;
}

.match-event-wrapper .left {
    text-align: right;
    flex-grow: 1;
    flex-basis: 0;
}
.match-event-wrapper .right {
    text-align: left;
    flex-grow: 1;
    flex-basis: 0;
}

.match-event-wrapper p {
    margin:5px;
    font-size:20px;
    color: #fff;
}

.match-div {
    gap: 50px;
}
 
.match-div > div {
    display:contents;
}

.match-div img {
    width:0;
    margin:10px;
    flex-grow: 1.5;
}
@media only screen and (max-width: 910px) {
    .match-div {
        gap: 0;
    }
    
    .match-div h1 {
        margin: 20px; 
    }
}    

@media only screen and (max-width: 790px){
    .match-div h3 {
        font-size: 20px;
    }
    .match-div h1 {
        font-size: 37px;
    }
    .match-div img {
        flex-grow: 1;
    }
}

@media only screen and (max-width: 630px){
    
    .match-div h3 {
        font-size: 15px;
    }
    .match-div h1 {
        font-size: 25px;
    }
}



@media only screen and (max-width:570px){

    .match-event-wrapper {
        gap: 80px;
    }


    .match-div .team-wrapper {
        display: flex;
        margin: 10px;
    }
    
    .match-div .team-wrapper.team-left {
        flex-direction: column;
    }
    
    .match-div .team-wrapper.team-right {
        flex-direction: column-reverse;
    }
    
    .match-div .team-wrapper {
        flex-basis: 0;
        flex-grow: 1;
    }
    
    
    .match-div img {
        width:100%;
        margin:0;
    }
}
</style>
`

let localMatchesCache = [];
async function loadMatches(unclean = false, filter = null, insertBefore = false, maxLength = null) {
    return new Promise(async (resolve, _) => {
        let data;
        if (unclean && Object.keys(localMatchesCache.length) > 0) {
            data = localMatchesCache;
        } else {
            data = await fetch(FIREBASE_BASEURL + "getMatches").then(r => r.json());
            localMatchesCache = data; // before filter
            if (!unclean) {
                data = data.filter(l => !!l.date && !!l.time);
            }
        }

        if (filter) {
            data = data.filter(filter);
        }

        if(maxLength){
            data = data.slice(0, maxLength)
        }

        let foundFirst = false;
        const elements = data.map(l => {
            const date = l.date || "BEZ DANÉHO DATA";
            const time = l.time || "BEZ DANÉHO ČASU";

            let returnValue = MATCH_TEMPLATE
                .replaceAll("{STYLE}", `padding: 30px var(--wp--preset--spacing--50) 50px;`)
                .replaceAll("{LEFT_URL}", `/images/${formatImageURL(l.team_left)}.png`)
                .replaceAll("{LEFT_NAME}", l.team_left)
                .replaceAll("{RIGHT_URL}", `/images/${formatImageURL(l.team_right)}.png`)
                .replaceAll("{RIGHT_NAME}", l.team_right)
                .replaceAll("{SCORE}", `<h1 ${unclean ? "class='settable-score'" : ""} style="color: #fff;white-space:pre;">${l.score || "- : -"}</h1>`)
                .replaceAll("<!--{DATE}-->", `<h3 ${unclean ? "class='settable-date'" : ""} style="${unclean ? "height:40px" : ""};  color: #fff; text-align: center; font-weight: normal; margin-top: 5px;">${date}</h3>`)
                .replaceAll("<!--{TIME}-->", `<h3 ${unclean ? "class='settable-time'" : ""} style="${unclean ? "height:40px" : ""}; color: #fff; text-align: center; font-weight: normal; margin-top: 15px; margin-bottom: 40px;">${time}</h3>`)
                .replaceAll("{LEFT_EVENTS}", l.events?.left?.split("\n").map(e => `<p>${e}</p>`).join("\n") || "<p></p>")
                .replaceAll("{RIGHT_EVENTS}", l.events?.right?.split("\n").map(e => `<p>${e}</p>`).join("\n") || "<p></p>")
                .replaceAll("{IS_EMPTY_EVENTS}", (!l.events || (!l.events.left && !l.events.right)) ? "empty" : "")
                .replaceAll("{ID}", l.id)

            if (!foundFirst && makeDate(l.date, l.time).getTime() > Date.now()) {
                returnValue = returnValue
                    .replaceAll("<!--{FIRST}-->", STYLE + (unclean ? "" : "<h2 style=\"color: #fff; text-align: center;margin-bottom: 30px;\">Příští zápas</h2>"))
                    .replaceAll(/padding: .*;/g, "padding: 60px var(--wp--preset--spacing--50) 60px;");
                foundFirst = true;
            }

            return returnValue;
        });

        const container = document.getElementById("matches-container");

        if (elements.length === 0) {
            container.innerHTML = `<h3 style="text-align: center">Ještě nejsou naplánované žádné zápasy.</h3>`;

            if (!unclean) {
                container.innerHTML += `<a style="cursor: pointer; border-bottom: 2px solid black;" onclick='loadMatches(true)'>Zobrazit všechny budoucí (BEZ pořadí)</a>`
            }
        } else {
            if (insertBefore) {
                elements[elements.length - 1] = elements[elements.length - 1]
                    .replace(/padding: .*;/, "padding: 30px var(--wp--preset--spacing--50) 0;")
                container.innerHTML = elements.join("<br/><br/>") + container.innerHTML;
            } else {
                container.innerHTML = elements.join("<br/><br/>");
            }
        }
        resolve(data.length ? data[0] : null)
    })
}

function formatImageURL(teamName){
    return teamName.toLowerCase().normalize("NFD").replace(/[\p{Diacritic}|\s]/gu, "");
}