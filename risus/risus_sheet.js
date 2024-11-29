/* Check input */
if (!input.page) {
    return "Error: Please provide input.page.";
}
let pageName = input.page;

/* Unwrap page name if it's in brackets. */
const regex = /^\[\[(.*?)\]\]$/;
const match = pageName.match(regex);
if (match) {
  pageName = match[1]; 
}

/* Get matching page. */
const page = dv.page(pageName);
if (!page) {
    return "Error: Can't find matching page for '" + input.page + "'";
}

/* Track total dice. */
let totalDice = 0;

/* Name */
// Name is usually already at the top of the page, so I've commented out
// this section.  We might want to make this optional in the future if it's
// needed.
// let nameMd = "<big>**" + page.file.link + "**</big>";
// if (input.hideName) {
//     nameMd = "";
// }

/* Player */
let playerMd = "";
if (page.player) {
    playerMd = "\n- Player: " + page.player;
}

/* Portrait */
let portraitMd = "";
if (page.portrait) {
    portraitMd = "> [!info|portrait-right]\n" + 
        "> ![](<file:///" + 
        this.app.vault.adapter.basePath + 
        "/" + page.portrait.path + 
        ">)\n";
}

/* Cliches: */
let clicheMd = "";
if (page.cliches) {
    clicheMd += "\n\n# Clichés\n";
    for (const cliche of page.cliches) {
        totalDice += cliche.dice;
        clicheMd += "\n- **" + cliche.title + "**";
        clicheMd += " (" + cliche.dice + "d)";
        if (cliche.note) {
            clicheMd += ": " + cliche.note;
        }
    }
}

/* Extras */
let extraMd = "";
if (page.extras) {
    extraMd += "\n\n# Extras\n";
    for (const extra of page.extras) {
        totalDice += extra.dice;
        extraMd += "\n- **" + extra.title + "**";
        extraMd += " (" + extra.dice + "d)";
        if (extra.note) {
            extraMd += ": " + extra.note;
        }
    }
}

/* Notes: */
let noteMd = "";
let noteCount = 0;
if (page.notes) {
    noteMd += "\n\n# Notes\n";
    for (const note of page.notes) {
        noteMd += "\n- " + note;
    }
}

/* Total dice */
const totalDiceMd = "\n- Total dice: " + totalDice + "d";

/* Debug if requested */
let debugMd = "";
if (input.debug) {
    debugMd = "\n```\n";
}

/* All done. */
return debugMd + portraitMd + playerMd + totalDiceMd + clicheMd + extraMd + noteMd + debugMd;
