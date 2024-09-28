const FIREBASE_BASEURL = "https://europe-west4-pristine-sphere-435312-g4.cloudfunctions.net/"
const IMAGE_TEMPLATE = `<a href="{0}", title="{1}"><img src={0} alt="{1}" /></a>`;


const images = fetch(FIREBASE_BASEURL + "getImages?getLinks=true").then(res => res.json()).then(data => {
    const elements = data.map(l => IMAGE_TEMPLATE
        .replaceAll("{0}", l)
        .replaceAll("{1}", new URL(decodeURIComponent(l)).pathname.split("/").pop())).join("\n");

    const container = document.getElementById("gallery_container");
    container.innerHTML = elements;

    lightGallery(document.getElementById("gallery_container"),{
        plugins: [lgVideo]
    })
});