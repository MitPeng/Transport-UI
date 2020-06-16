var isHide;
function Hide() {
    $("#all_talent_abilities_panel").AddClass("all_talent_abilities_panel_hide");
    isHide = 1;
}

function Show() {
    $("#all_talent_abilities_panel").RemoveClass("all_talent_abilities_panel_hide");
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