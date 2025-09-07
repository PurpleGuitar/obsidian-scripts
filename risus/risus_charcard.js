/* global dv */
let page = dv.current();

/* Process input parameters, if any */
if (input) {

    /* Custom page */
    if ("page" in input) {
        page = dv.page(input.page)
    }

}


output = "";

output += "**" + page.file.link + "**: ";
if (page.cliches) {
    output += page.cliches.join("; ");
}
if (page.extras) {
    output += " *Extras*: " + page.extras.join("; ");
}

dv.paragraph(output);

