/* global dv */

const current = dv.current();

if (current.cliches) {
    dv.el("h1", "Clichés");
    dv.list(current.cliches);
}

if (current.extras) {
    dv.el("h1", "Extras");
    dv.list(current.extras);
}
