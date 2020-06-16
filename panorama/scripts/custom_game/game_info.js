// function ShowAllTalentAbilities(args) {
//     var parent = $("#talent_abilities_panel");
//     for (var i in args.Abilities) {
//         var abilityName = args.Abilities[i];

//         var abilityPanel = $.CreatePanel("Panel", parent, "Ability" + abilityName);
//         abilityPanel.BLoadLayoutSnippet("AllTalentAbilities");

//         abilityPanel.SetHasClass('CourierAbility', true);

//         (function (panel, name) {

//             panel.FindChildTraverse('ability_name').text = $.Localize("#DOTA_Tooltip_ability_" + abilityName);

//             panel.FindChildTraverse("ability_image").abilityname = abilityName;

//             panel.SetPanelEvent("onmouseover", function () {
//                 $.DispatchEvent("DOTAShowAbilityTooltip", panel, name);
//             });
//             panel.SetPanelEvent("onmouseout", function () {
//                 $.DispatchEvent("DOTAHideAbilityTooltip");
//             })
//         })(abilityPanel, abilityName);
//     }
// }

// (function () {
//     GameEvents.Subscribe("show_all_talent_abilities", ShowAllTalentAbilities);
// })();