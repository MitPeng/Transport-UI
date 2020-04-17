var PlayerID = null
function ShowAbilitySelector(args) {
    Show();

    //判断是否为第一次选择天赋
    if (args.is_first) {
        var random_one = $("#random_one")
        random_one.visible = true;
        random_one.hittest = true;
        var cancel_change = $("#cancel_change")
        cancel_change.visible = false;
        cancel_change.hittest = false;
    } else {
        var cancel_change = $("#cancel_change")
        cancel_change.visible = true;
        cancel_change.hittest = true;
        var random_one = $("#random_one")
        random_one.visible = false;
        random_one.hittest = false;
    }

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

function RandomAbilitySelect() {
    Hide();
    GameEvents.SendCustomGameEventToServer("player_select_ability", {
        AbilityName: "Random",
        PlayerID: PlayerID
    });
}

function CancelAbilitySelect() {
    Hide();
    GameEvents.SendCustomGameEventToServer("player_select_ability", {
        AbilityName: "Cancel",
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