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

function ShowAllEffects(args) {

    var parent = $("#effect_box_panel");
    for (var i in args.Effects) {
        var effectName = args.Effects[i];

        var effectPanel = $.CreatePanel("Panel", parent, "Effect" + effectName);
        effectPanel.BLoadLayoutSnippet("AllEffects");

        effectPanel.SetHasClass('CourierAbility', true);

        (function (panel, name) {

            panel.FindChildTraverse('effect_name').text = $.Localize("#effect_" + effectName);

            panel.FindChildTraverse("effect_image").SetImage("file://{resources}/images/custom_game/effects/" + effectName + ".png");
            panel.FindChildTraverse('effect_select_button').SetPanelEvent("onactivate", function () {
                GameEvents.SendCustomGameEventToServer("player_select_effect", {
                    EffectName: name,
                    PlayerID: Players.GetLocalPlayer()
                });
                Hide();
            });
        })(effectPanel, effectName);
    }

}

(function () {
    GameEvents.Subscribe("show_all_effects", ShowAllEffects);
})();
