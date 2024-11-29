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
let nameMd = "<big>**" + page.file.link + "**</big>";
if (input.hideName) {
    nameMd = "";
}

/* Player */
let playerMd = "";
if (page.player) {
    playerMd = " | Player: " + page.player;
}

/* Icon */
let iconMd = "";
if (page.icon) {
    iconMd = "<span class=\"icon-left\">" + 
        "![](<file:///" + 
        this.app.vault.adapter.basePath + 
        "/" + page.icon.path + 
        ">)</span>";
}

/* Cliches: */
let clicheMd = "";
let clicheCount = 0;
if (page.cliches) {
    clicheMd += " | *Clichés:*";
    for (const cliche of page.cliches) {
        clicheCount += 1;
        if (clicheCount > 1) {
            clicheMd += ",";
        }
        totalDice += cliche.dice;
        clicheMd += " **" + cliche.title + "**";
        clicheMd += " (" + cliche.dice + "d)";
        if (cliche.note) {
            clicheMd += ": " + cliche.note;
        }
    }
}

/* Extras */
let extraMd = "";
let extraCount = 0;
if (page.extras) {
    extraMd += " | *Extras:*";
    for (const extra of page.extras) {
        extraCount += 1;
        if (extraCount > 1) {
            extraMd += ",";
        }
        totalDice += extra.dice;
        extraMd += " **" + extra.title + "**";
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
    noteMd += " | *Notes:*";
    for (const note of page.notes) {
        noteCount += 1;
        if (noteCount > 1) {
            noteMd += ";";
        }
        noteMd += " " + note;
    }
}

/* Total dice */
const totalDiceMd = " (" + totalDice + "d)"

/* Clear after */
const clearMd = '<div style="clear: both;"/>';

/* All done. */
return iconMd + nameMd + totalDiceMd + playerMd + clicheMd + extraMd + noteMd + clearMd;


