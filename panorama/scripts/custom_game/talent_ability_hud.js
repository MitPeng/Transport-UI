var PlayerID = null
function ShowAbilitySelector(args) {
    Show();

    var parent = $("#ability_selector_image_panel");
    PlayerID = args.PlayerID
    parent.RemoveAndDeleteChildren();
    for (var i in args.Abilities) {
        var abilityName = args.Abilities[i];

        var abilityPanel = $.CreatePanel("Panel", parent, "Ability" + abilityName);
        abilityPanel.BLoadLayoutSnippet("AbilitySelectorAbility");

        abilityPanel.SetHasClass('CourierAbility', true);

        (function (panel, name) {

            panel.FindChildTraverse('ability_name').text = $.Localize("#DOTA_Tooltip_ability_" + abilityName);

            panel.FindChildTraverse("ability_image").abilityname = abilityName;
            panel.SetPanelEvent("onactivate", function () {
                GameEvents.SendCustomGameEventToServer("player_select_ability", {
                    AbilityName: name,
                    PlayerID: PlayerID
                });
                Hide();
            });
            panel.SetPanelEvent("onmouseover", function () {
                $.DispatchEvent("DOTAShowAbilityTooltip", panel, name);
            });
            panel.SetPanelEvent("onmouseout", function () {
                $.DispatchEvent("DOTAHideAbilityTooltip");
            })
        })(abilityPanel, abilityName);
    }
}

function CancelAbilitySelect() {
    Hide();
    GameEvents.SendCustomGameEventToServer("player_select_ability", {
        AbilityName: "Random",
        PlayerID: PlayerID
    });
}

function Hide() {
    $("#ability_selector").AddClass("AbilitySelectorPanelHide");
}

function Show() {
    $("#ability_selector").RemoveClass("AbilitySelectorPanelHide");
}

(function () {
    Hide();
    GameEvents.Subscribe("show_ability_selector", ShowAbilitySelector);
})();