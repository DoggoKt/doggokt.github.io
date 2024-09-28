const navbar = document.getElementsByClassName("wp-block-navigation__responsive-container")[0]
const open = document.querySelector("button.wp-block-navigation__responsive-container-open ");
const close = document.querySelector("button.wp-block-navigation__responsive-container-close");

if (!navbar || !open || !close) throw Error("Could not locate navbar and button.")

open.addEventListener("click", () => {
    navbar.classList.add("has-modal-open");
    navbar.classList.add("is-menu-open");
})

close.addEventListener("click", () => {
    navbar.classList.remove("has-modal-open");
    navbar.classList.remove("is-menu-open")
})