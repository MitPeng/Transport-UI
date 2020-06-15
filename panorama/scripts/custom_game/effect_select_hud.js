var isHide;
function Hide() {
    $("#effect_selector").AddClass("effect_select_panel_hide");
    isHide = 1;
}

function Show() {
    $("#effect_selector").RemoveClass("effect_select_panel_hide");
    isHide = 0;
}

function HideOrShow() {
    if (isHide == 1) {
        Show();
    } else if (isHide == 0) {
        Hide();
    }
}

(function () {
    Hide();
})();