/*
 * This script is for use with RISUS characters.  It uses Dataview to read
 * properties of a page and render them as a nice RISUS character sheet.
 * Cliches and extras should be in the following format:
 *
 * - Cliche:: Title of Cliche (3d): Description and notes
 *
 * Dice and note are optional.  Bold marks (**) are ignored.  The dice, if
 * provided, will be used to total up the characters's total cost in dice.  
 *  
 * Attribute Examples:
 *
 * - Name:: Ric Racer
 * - Player:: John Smith
 * - Cliche:: Champion Star Racer of Earth (4d)
 * - Extra:: Wounded (-2d): Ric got into an accident that left him unable
 *   to race, at least for a while.
 * - Note:: Cares about the Wei family, and wants to help them succeed.
 *
 * Example invocation:
 *
 * ```dataviewjs
 * dv.view("Scripts/rpg/risus_charsheet", {
 *   page: "Ric Racer",
 * });
 * ```
 *
 */

/* Check input */
if (!input.page) {
    throw new Error("Error: Please provide input.page.");
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
    throw new Error("Error: Can't find matching page for '" + input.page + "'");
}

/* Track total dice. */
let totalDice = 0;

/* Parse a cliche */
const clicheRegex = /^([^(]*)(\s+\((-?\d+)d\))?(:?\s+(.*))?$/
function parseCliche(cliche) {

    /* Remove bold */
    cliche = cliche.replace(/\*\*/g,"");

    /* Parse cliche */
    const match = cliche.match(clicheRegex);
    if (!match) {
        return {
            "output": "",
            "dice": 0
        };
    };
    let title = match[1];
    let dice = parseInt(match[3]);
    let note = match[5];

    /* Render cliche */
    let output = "";

    /* Title */
    output += "\n- **" + title + "**";

    /* Dice */
    if (dice) {
        output += " (" + dice + "d)";
    }

    /* Note */
    if (note) {
        output += ": " + note;
    }

    /* Done */
    return {
        "output": output,
        "dice": dice,
    };
}


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

/* Cliches */
let clicheMd = "";
if (page.cliche) {
    clicheMd += "\n\n# Clichés\n";
    for (const cliche of dv.array(page.cliche)) {
        clicheObj = parseCliche(cliche);
        clicheMd += clicheObj.output;
        totalDice += clicheObj.dice;
    }
}

/* Extras */
let extraMd = "";
if (page.extra) {
    extraMd += "\n\n# Extras\n";
    for (const extra of dv.array(page.extra)) {
        clicheObj = parseCliche(extra);
        extraMd += clicheObj.output;
        totalDice += clicheObj.dice;
    }
}

/* Notes: */
let noteMd = "";
let noteCount = 0;
if (page.note) {
    noteMd += "\n\n# Notes\n";
    for (const note of dv.array(page.note)) {
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
dv.paragraph(debugMd + portraitMd + playerMd + totalDiceMd + clicheMd + extraMd + noteMd + debugMd);

// vim: set noswapfile :
