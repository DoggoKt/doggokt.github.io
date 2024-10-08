const pass = prompt("Heslo")
if (pass==="") throw Error();

const prompts = {
    "date": "Nové datum ve formátu DD.MM.YYYY (např. 28.9.2024)",
    "time": "Nový čas ve 24-hodinovém formátu (např: 14:25)",
    "score": "Nové skóre rozdělené dvojtečkou (např: 8:2)"
}
const sucessTexts = {
    "date": "Nové datum: {0}",
    "time": "Nový čas: {0}",
    "score": "{0}"
}
function onClick(e, dataType){
    const value = prompt(prompts[dataType])
    if(!value) return;
    const obj = { id: dataType === "score" ? e.target.parentNode.parentNode.dataset.matchid : e.target.parentNode.dataset.matchid };
    obj[dataType] = value;

    e.target.style.color = "#ffffff";
    e.target.innerText = "Načítání..."
    fetch(FIREBASE_BASEURL + "updateMatch?pass="+pass, {method: "PATCH", body: JSON.stringify(obj)})
        .then((res) => {
            switch (res.status) {
                case 204:
                case 200:
                    e.target.style.color = "#166e00";
                    e.target.innerText = sucessTexts[dataType].replace("{0}", value);
                    return;
                case 401:
                    e.target.style.color = "#920000"
                    e.target.innerText = "Nesprávné heslo";
                    return;
                default:
                    e.target.style.color = "#920000"
                    e.target.innerText = "Neznámá chyba"
                    console.error(res.body.toString());
                    return;
            }
        }).catch((err) => {
        e.target.style.color = "#920000"
        e.target.innerText = "Neznámá chyba"
        console.error(err);
    })
}


loadMatches(true).then(() => {
    const dateEl = document.getElementsByClassName("settable-date");
    const timeEl = document.getElementsByClassName("settable-time");
    const scoreEl = document.getElementsByClassName("settable-score")
    for (const el of [...dateEl, ...timeEl, ...scoreEl]) {
        el.addEventListener("mouseover", (e) => {
            if (e.target.innerText.startsWith("BEZ DANÉHO")) {
                e.target.innerText = "NASTAVIT";
            }
            e.target.style.outline = "2px solid white"
            e.target.style.cursor = "pointer"

            e.target.onclick = (e)=>onClick(e, el.className.split(" ").find(cl => cl.startsWith("settable")).split("-")[1], {once:true})
        })

        if (el.classList.contains("settable-date")){
            el.addEventListener("mouseout", (e) => {
                if (e.target.innerText === "NASTAVIT") {
                    e.target.innerText = "BEZ DANÉHO DATA";
                }
                e.target.style.outline = "none"
                e.target.style.cursor = "auto"
                e.target.onclick = null;
            })
        } else if (el.classList.contains("settable-time")) {
            el.addEventListener("mouseout", (e) => {
                if (e.target.innerText === "NASTAVIT") {
                    e.target.innerText = "BEZ DANÉHO ČASU";
                }
                e.target.style.outline = "none"
                e.target.style.cursor = "auto"
                e.target.onclick = null
            })
        } else {
            el.addEventListener("mouseout", (e) => {
                if (e.target.innerText === "NASTAVIT"){
                    e.target.innerText = "- : -";
                }
                e.target.style.outline = "none"
                e.target.style.cursor = "auto"
                e.target.onclick = null
            })
        }
    }
});