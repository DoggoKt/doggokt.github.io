const FIREBASE_BASEURL = "https://europe-west4-pristine-sphere-435312-g4.cloudfunctions.net/"
const IMAGE_TEMPLATE = `<a href="{0}", title="{1}"><img src={0} alt="{1}" /></a>`;

let currentHeading = "";
const images = fetch(FIREBASE_BASEURL + "getImages?getlinks=true").then(res => res.json()).then(data => {
    const container = document.getElementById("gallery_container");
    container.innerHTML = "";

    for (const image of data) {
        if (image.heading !== currentHeading) {
            if (currentHeading !== ""){
                container.innerHTML += "<br/>"
            }
            currentHeading = image.heading;
            container.innerHTML += `<h2>${currentHeading}</h2>`
        }
        container.innerHTML += IMAGE_TEMPLATE
            .replaceAll("{0}", image.link)
            .replaceAll("{1}", new URL(decodeURIComponent(image.link)).pathname.split("/").pop()) + "<br/>";
    }

    lightGallery(document.getElementById("gallery_container"),{
        plugins: [lgVideo]
    })
});