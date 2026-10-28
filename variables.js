// Change this address to update the email links in every footer.
const contactEmail = "aryan.gupta@princeton.edu";

document.querySelectorAll("footer [data-contact-email]").forEach(link => {
    link.href = "mailto:" + contactEmail;
});
