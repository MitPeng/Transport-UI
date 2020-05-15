"use strict";

var isEndScreen = false

var newStatsInEndScreen = [
    {
        name: "new_stat_gpm",
        func: function (pId, cont) {
            CreateStandartValue(cont, Math.ceil(Players.GetGoldPerMin(pId)), null)
        },
        styles: {
            "width": "70px"
        }
    },
    {
        name: "new_stat_total_damage",
        func: function (pId, cont) {
            var table = CustomNetTables.GetTableValue("custom_stats", pId.toString())
            var value = 0

            if (table) {
                value = table.total_damage
            }

            CreateStandartValue(cont, value, null)
        },
        styles: {
            "width": "70px"
        }
    },
    {
        name: "new_stat_total_healing",
        func: function (pId, cont) {
            var table = CustomNetTables.GetTableValue("custom_stats", pId.toString())
            var value = 0

            if (table) {
                value = table.total_healing
            }

            CreateStandartValue(cont, value, null)
        },
        styles: {
            "width": "70px"
        }
    },
    {
        name: "new_stat_networth",
        func: function (pId, cont) {
            var table = CustomNetTables.GetTableValue("custom_stats", pId.toString())
            var value = 0

            if (table) {
                value = table.networth
            }

            CreateStandartValue(cont, value, null)
        },
        styles: {
            "width": "100px"
        }
    },
    {
        name: "new_stat_wards",
        func: function (pId, cont) {
            var table = CustomNetTables.GetTableValue("custom_stats", pId.toString())
            var string = "/"

            if (table) {
                if (table.sentries_count) {
                    string = table.sentries_count + string
                } else {
                    string = 0 + string
                }

                if (table.observers_count) {
                    string = string + table.observers_count
                } else {
                    string = string + 0
                }
            } else {
                string = "0/0"
            }

            CreateStandartValue(cont, string, null)
        },
        styles: {
            "width": "80px"
        }
    },
    {
        name: "new_stat_killed_heroes",
        func: function (pId, cont) {
            var table = CustomNetTables.GetTableValue("custom_stats", pId.toString())

            var container = $.CreatePanel("Panel", cont, "")
            container.AddClass("KilledHeroes")

            var teamsList = []

            for (var teamId of Game.GetAllTeamIDs()) {
                for (var playerId of Game.GetPlayerIDsOnTeam(teamId)) {
                    var playerInfo = Game.GetPlayerInfo(playerId)

                    if (playerInfo) {
                        var hero = playerInfo.player_selected_hero

                        if (hero != -1 && hero != "" && typeof (hero) == "string") {
                            if (teamId != Players.GetTeam(pId)) {
                                var icon = $.CreatePanel("Image", container, "")
                                icon.SetImage("file://{images}/heroes/icons/" + hero + ".png")
                                icon.AddClass("HeroIcon")

                                if (table && table.killed_hero && table.killed_hero[hero]) {
                                    var count = $.CreatePanel("Label", icon, "KilledCount")
                                    count.text = "x" + table.killed_hero[hero]
                                } else {
                                    icon.AddClass("KilledHeroNone")
                                }
                            }
                        }
                    }
                }
            }
        },
        styles: {
            "width": "310px"
        }
    },
]

function CreateStandartValue(parent, value, style) {
    var label = $.CreatePanel("Label", parent, "")
    label.text = value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
    label.AddClass("NewStatLabel")
    label.AddClass(style || "")
}


//=============================================================================
//=============================================================================
function _ScoreboardUpdater_SetTextSafe(panel, childName, textValue) {
    if (panel === null)
        return;
    var childPanel = panel.FindChildInLayoutFile(childName)
    if (childPanel === null)
        return;

    childPanel.text = textValue;
}


//=============================================================================
//=============================================================================
function _ScoreboardUpdater_UpdatePlayerPanel(scoreboardConfig, playersContainer, playerId, localPlayerTeamId) {
    var playerPanelName = "_dynamic_player_" + playerId;
    var playerPanel = playersContainer.FindChild(playerPanelName);
    if (playerPanel === null) {
        playerPanel = $.CreatePanel("Panel", playersContainer, playerPanelName);
        playerPanel.SetAttributeInt("player_id", playerId);
        playerPanel.BLoadLayout(scoreboardConfig.playerXmlName, false, false);

        if (isEndScreen) {
            var row_container = playerPanel.FindChildInLayoutFile("PlayerRowContainer")

            for (var i = 0; i < newStatsInEndScreen.length; i++) {
                var new_stat = $.CreatePanel("Panel", row_container, "NewStatContainer" + i)
                new_stat.AddClass("NewStatContainer")
                new_stat.AddClass(newStatsInEndScreen[i].containerClass || "")

                if (newStatsInEndScreen[i].styles) {
                    for (var s in newStatsInEndScreen[i].styles) {
                        new_stat.style[s] = newStatsInEndScreen[i].styles[s]
                    }
                }

                newStatsInEndScreen[i].func(playerId, new_stat)
            }
        }
    }

    playerPanel.SetHasClass("is_local_player", (playerId == Game.GetLocalPlayerID()));

    var ultStateOrTime = PlayerUltimateStateOrTime_t.PLAYER_ULTIMATE_STATE_HIDDEN; // values > 0 mean on cooldown for that many seconds
    var goldValue = -1;
    var isTeammate = false;

    var playerInfo = Game.GetPlayerInfo(playerId);
    if (playerInfo) {
        isTeammate = (playerInfo.player_team_id == localPlayerTeamId);
        if (isTeammate) {
            ultStateOrTime = Game.GetPlayerUltimateStateOrTime(playerId);
        }
        goldValue = playerInfo.player_gold;

        playerPanel.SetHasClass("player_dead", (playerInfo.player_respawn_seconds >= 0));
        playerPanel.SetHasClass("local_player_teammate", playerId != Game.GetLocalPlayerID());

        _ScoreboardUpdater_SetTextSafe(playerPanel, "RespawnTimer", (playerInfo.player_respawn_seconds + 1)); // value is rounded down so just add one for rounded-up
        _ScoreboardUpdater_SetTextSafe(playerPanel, "PlayerName", playerInfo.player_name);
        _ScoreboardUpdater_SetTextSafe(playerPanel, "Level", playerInfo.player_level);
        _ScoreboardUpdater_SetTextSafe(playerPanel, "Kills", playerInfo.player_kills);
        _ScoreboardUpdater_SetTextSafe(playerPanel, "Deaths", playerInfo.player_deaths);
        _ScoreboardUpdater_SetTextSafe(playerPanel, "Assists", playerInfo.player_assists);

        var playerPortrait = playerPanel.FindChildInLayoutFile("HeroIcon");
        if (playerPortrait) {
            if (playerInfo.player_selected_hero !== "") {
                playerPortrait.SetImage("file://{images}/heroes/" + playerInfo.player_selected_hero + ".png");
            }
            else {
                playerPortrait.SetImage("file://{images}/custom_game/unassigned.png");
            }
        }

        if (playerInfo.player_selected_hero_id == -1) {
            _ScoreboardUpdater_SetTextSafe(playerPanel, "HeroName", $.Localize("#DOTA_Scoreboard_Picking_Hero"))
        }
        else {
            _ScoreboardUpdater_SetTextSafe(playerPanel, "HeroName", $.Localize("#" + playerInfo.player_selected_hero))
        }

        var heroNameAndDescription = playerPanel.FindChildInLayoutFile("HeroNameAndDescription");
        if (heroNameAndDescription) {
            if (playerInfo.player_selected_hero_id == -1) {
                heroNameAndDescription.SetDialogVariable("hero_name", $.Localize("#DOTA_Scoreboard_Picking_Hero"));
            }
            else {
                heroNameAndDescription.SetDialogVariable("hero_name", $.Localize("#" + playerInfo.player_selected_hero));
            }
            heroNameAndDescription.SetDialogVariableInt("hero_level", playerInfo.player_level);
        }

        playerPanel.SetHasClass("player_connection_abandoned", playerInfo.player_connection_state == DOTAConnectionState_t.DOTA_CONNECTION_STATE_ABANDONED);
        playerPanel.SetHasClass("player_connection_failed", playerInfo.player_connection_state == DOTAConnectionState_t.DOTA_CONNECTION_STATE_FAILED);
        playerPanel.SetHasClass("player_connection_disconnected", playerInfo.player_connection_state == DOTAConnectionState_t.DOTA_CONNECTION_STATE_DISCONNECTED);

        var playerAvatar = playerPanel.FindChildInLayoutFile("AvatarImage");
        if (playerAvatar) {
            playerAvatar.steamid = playerInfo.player_steamid;
        }

        var playerColorBar = playerPanel.FindChildInLayoutFile("PlayerColorBar");
        if (playerColorBar !== null) {
            if (GameUI.CustomUIConfig().team_colors) {
                var teamColor = GameUI.CustomUIConfig().team_colors[playerInfo.player_team_id];
                if (teamColor) {
                    playerColorBar.style.backgroundColor = teamColor;
                }
            }
            else {
                var playerColor = "#000000";
                playerColorBar.style.backgroundColor = playerColor;
            }
        }
    }

    var playerItemsContainer = playerPanel.FindChildInLayoutFile("PlayerItemsContainer");
    if (playerItemsContainer) {
        var playerItems = Game.GetPlayerItems(playerId);
        if (playerItems) {
            //		$.Msg( "playerItems = ", playerItems );
            for (var i = playerItems.inventory_slot_min; i < playerItems.inventory_slot_max; ++i) {
                var itemPanelName = "_dynamic_item_" + i;
                var itemPanel = playerItemsContainer.FindChild(itemPanelName);
                if (itemPanel === null) {
                    itemPanel = $.CreatePanel("Image", playerItemsContainer, itemPanelName);
                    itemPanel.AddClass("PlayerItem");
                }

                var itemInfo = playerItems.inventory[i];
                if (itemInfo) {
                    var item_image_name = "file://{images}/items/" + itemInfo.item_name.replace("item_", "") + ".png"
                    if (itemInfo.item_name.indexOf("recipe") >= 0) {
                        item_image_name = "file://{images}/items/recipe.png"
                    }
                    itemPanel.SetImage(item_image_name);
                }
                else {
                    itemPanel.SetImage("");
                }
            }
        }
    }

    if (isTeammate) {
        _ScoreboardUpdater_SetTextSafe(playerPanel, "TeammateGoldAmount", goldValue);
    }

    _ScoreboardUpdater_SetTextSafe(playerPanel, "PlayerGoldAmount", goldValue);

    playerPanel.SetHasClass("player_ultimate_ready", (ultStateOrTime == PlayerUltimateStateOrTime_t.PLAYER_ULTIMATE_STATE_READY));
    playerPanel.SetHasClass("player_ultimate_no_mana", (ultStateOrTime == PlayerUltimateStateOrTime_t.PLAYER_ULTIMATE_STATE_NO_MANA));
    playerPanel.SetHasClass("player_ultimate_not_leveled", (ultStateOrTime == PlayerUltimateStateOrTime_t.PLAYER_ULTIMATE_STATE_NOT_LEVELED));
    playerPanel.SetHasClass("player_ultimate_hidden", (ultStateOrTime == PlayerUltimateStateOrTime_t.PLAYER_ULTIMATE_STATE_HIDDEN));
    playerPanel.SetHasClass("player_ultimate_cooldown", (ultStateOrTime > 0));
    _ScoreboardUpdater_SetTextSafe(playerPanel, "PlayerUltimateCooldown", ultStateOrTime);
}


//=============================================================================
//=============================================================================
function _ScoreboardUpdater_UpdateTeamPanel(scoreboardConfig, containerPanel, teamDetails, teamsInfo) {
    if (!containerPanel)
        return;

    var teamId = teamDetails.team_id;
    //	$.Msg( "_ScoreboardUpdater_UpdateTeamPanel: ", teamId );

    var teamPanelName = "_dynamic_team_" + teamId;
    var teamPanel = containerPanel.FindChild(teamPanelName);
    if (teamPanel === null) {
        //		$.Msg( "UpdateTeamPanel.Create: ", teamPanelName, " = ", scoreboardConfig.teamXmlName );
        teamPanel = $.CreatePanel("Panel", containerPanel, teamPanelName);
        teamPanel.SetAttributeInt("team_id", teamId);
        teamPanel.BLoadLayout(scoreboardConfig.teamXmlName, false, false);

        var logo_xml = GameUI.CustomUIConfig().team_logo_xml;
        if (logo_xml) {
            var teamLogoPanel = teamPanel.FindChildInLayoutFile("TeamLogo");
            if (teamLogoPanel) {
                teamLogoPanel.SetAttributeInt("team_id", teamId);
                teamLogoPanel.BLoadLayout(logo_xml, false, false);
            }
        }
    }

    var localPlayerTeamId = -1;
    var localPlayer = Game.GetLocalPlayerInfo();
    if (localPlayer) {
        localPlayerTeamId = localPlayer.player_team_id;
    }
    teamPanel.SetHasClass("local_player_team", localPlayerTeamId == teamId);
    teamPanel.SetHasClass("not_local_player_team", localPlayerTeamId != teamId);

    var teamPlayers = Game.GetPlayerIDsOnTeam(teamId)
    var playersContainer = teamPanel.FindChildInLayoutFile("PlayersContainer");
    if (playersContainer) {
        for (var playerId of teamPlayers) {
            _ScoreboardUpdater_UpdatePlayerPanel(scoreboardConfig, playersContainer, playerId, localPlayerTeamId)
        }
    }

    teamPanel.SetHasClass("no_players", (teamPlayers.length == 0))
    teamPanel.SetHasClass("one_player", (teamPlayers.length == 1))

    if (teamsInfo.max_team_players < teamPlayers.length) {
        teamsInfo.max_team_players = teamPlayers.length;
    }

    _ScoreboardUpdater_SetTextSafe(teamPanel, "TeamScore", teamDetails.team_score)
    _ScoreboardUpdater_SetTextSafe(teamPanel, "TeamName", $.Localize(teamDetails.team_name))

    if (GameUI.CustomUIConfig().team_colors) {
        var teamColor = GameUI.CustomUIConfig().team_colors[teamId];
        var teamColorPanel = teamPanel.FindChildInLayoutFile("TeamColor");

        teamColor = teamColor.replace(";", "");

        if (teamColorPanel) {
            teamNamePanel.style.backgroundColor = teamColor + ";";
        }

        var teamColor_GradentFromTransparentLeft = teamPanel.FindChildInLayoutFile("TeamColor_GradentFromTransparentLeft");
        if (teamColor_GradentFromTransparentLeft) {
            var gradientText = 'gradient( linear, 0% 0%, 800% 0%, from( #00000000 ), to( ' + teamColor + ' ) );';
            //			$.Msg( gradientText );
            teamColor_GradentFromTransparentLeft.style.backgroundColor = gradientText;
        }
    }

    return teamPanel;
}

//=============================================================================
//=============================================================================
function _ScoreboardUpdater_ReorderTeam(scoreboardConfig, teamsParent, teamPanel, teamId, newPlace, prevPanel) {
    //	$.Msg( "UPDATE: ", GameUI.CustomUIConfig().teamsPrevPlace );
    var oldPlace = null;
    if (GameUI.CustomUIConfig().teamsPrevPlace.length > teamId) {
        oldPlace = GameUI.CustomUIConfig().teamsPrevPlace[teamId];
    }
    GameUI.CustomUIConfig().teamsPrevPlace[teamId] = newPlace;

    if (newPlace != oldPlace) {
        //		$.Msg( "Team ", teamId, " : ", oldPlace, " --> ", newPlace );
        teamPanel.RemoveClass("team_getting_worse");
        teamPanel.RemoveClass("team_getting_better");
        if (newPlace > oldPlace) {
            teamPanel.AddClass("team_getting_worse");
        }
        else if (newPlace < oldPlace) {
            teamPanel.AddClass("team_getting_better");
        }
    }

    teamsParent.MoveChildAfter(teamPanel, prevPanel);
}

// sort / reorder as necessary
function compareFunc(a, b) // GameUI.CustomUIConfig().sort_teams_compare_func;
{
    if (a.team_score < b.team_score) {
        return 1; // [ B, A ]
    }
    else if (a.team_score > b.team_score) {
        return -1; // [ A, B ]
    }
    else {
        return 0;
    }
};

function stableCompareFunc(a, b) {
    var unstableCompare = compareFunc(a, b);
    if (unstableCompare != 0) {
        return unstableCompare;
    }

    if (GameUI.CustomUIConfig().teamsPrevPlace.length <= a.team_id) {
        return 0;
    }

    if (GameUI.CustomUIConfig().teamsPrevPlace.length <= b.team_id) {
        return 0;
    }

    //			$.Msg( GameUI.CustomUIConfig().teamsPrevPlace );

    var a_prev = GameUI.CustomUIConfig().teamsPrevPlace[a.team_id];
    var b_prev = GameUI.CustomUIConfig().teamsPrevPlace[b.team_id];
    if (a_prev < b_prev) // [ A, B ]
    {
        return -1; // [ A, B ]
    }
    else if (a_prev > b_prev) // [ B, A ]
    {
        return 1; // [ B, A ]
    }
    else {
        return 0;
    }
};

//=============================================================================
//=============================================================================
function _ScoreboardUpdater_UpdateAllTeamsAndPlayers(scoreboardConfig, teamsContainer) {
    //	$.Msg( "_ScoreboardUpdater_UpdateAllTeamsAndPlayers: ", scoreboardConfig );

    var teamsList = [];
    for (var teamId of Game.GetAllTeamIDs()) {
        teamsList.push(Game.GetTeamDetails(teamId));
    }

    // update/create team panels
    var teamsInfo = { max_team_players: 0 };
    var panelsByTeam = [];
    for (var i = 0; i < teamsList.length; ++i) {
        var teamPanel = _ScoreboardUpdater_UpdateTeamPanel(scoreboardConfig, teamsContainer, teamsList[i], teamsInfo);
        if (teamPanel) {
            panelsByTeam[teamsList[i].team_id] = teamPanel;
        }
    }

    if (teamsList.length > 1) {
        //		$.Msg( "panelsByTeam: ", panelsByTeam );

        // sort
        if (scoreboardConfig.shouldSort) {
            teamsList.sort(stableCompareFunc);
        }

        //		$.Msg( "POST: ", teamsAndPanels );

        // reorder the panels based on the sort
        var prevPanel = panelsByTeam[teamsList[0].team_id];
        for (var i = 0; i < teamsList.length; ++i) {
            var teamId = teamsList[i].team_id;
            var teamPanel = panelsByTeam[teamId];
            _ScoreboardUpdater_ReorderTeam(scoreboardConfig, teamsContainer, teamPanel, teamId, i, prevPanel);
            prevPanel = teamPanel;
        }
        //		$.Msg( GameUI.CustomUIConfig().teamsPrevPlace );
    }

    //	$.Msg( "END _ScoreboardUpdater_UpdateAllTeamsAndPlayers: ", scoreboardConfig );
}


//=============================================================================
//=============================================================================
function ScoreboardUpdater_InitializeScoreboard(scoreboardConfig, scoreboardPanel) {
    GameUI.CustomUIConfig().teamsPrevPlace = [];
    if (typeof (scoreboardConfig.shouldSort) === 'undefined') {
        // default to true
        scoreboardConfig.shouldSort = true;
    }
    _ScoreboardUpdater_UpdateAllTeamsAndPlayers(scoreboardConfig, scoreboardPanel);
    return { "scoreboardConfig": scoreboardConfig, "scoreboardPanel": scoreboardPanel }
}


//=============================================================================
//=============================================================================
function ScoreboardUpdater_SetScoreboardActive(scoreboardHandle, isActive) {
    if (scoreboardHandle.scoreboardConfig === null || scoreboardHandle.scoreboardPanel === null) {
        return;
    }

    if (isActive) {
        _ScoreboardUpdater_UpdateAllTeamsAndPlayers(scoreboardHandle.scoreboardConfig, scoreboardHandle.scoreboardPanel);
    }
}

//=============================================================================
//=============================================================================
function ScoreboardUpdater_GetTeamPanel(scoreboardHandle, teamId) {
    if (scoreboardHandle.scoreboardPanel === null) {
        return;
    }

    var teamPanelName = "_dynamic_team_" + teamId;
    return scoreboardHandle.scoreboardPanel.FindChild(teamPanelName);
}

//=============================================================================
//=============================================================================
function ScoreboardUpdater_GetSortedTeamInfoList(scoreboardHandle) {
    var teamsList = [];
    for (var teamId of Game.GetAllTeamIDs()) {
        teamsList.push(Game.GetTeamDetails(teamId));
    }

    if (teamsList.length > 1) {
        teamsList.sort(stableCompareFunc);
    }

    return teamsList;
}

function AddNewStatsInHeader(header) {
    for (var i = 0; i < newStatsInEndScreen.length; i++) {
        var label = $.CreatePanel("Label", header, "NewStatHeader" + i)
        label.text = $.Localize(newStatsInEndScreen[i].name)
        label.AddClass("NewStatHeader")
        label.AddClass("LegendPanel")

        if (newStatsInEndScreen[i].styles) {
            for (var s in newStatsInEndScreen[i].styles) {
                label.style[s] = newStatsInEndScreen[i].styles[s]
            }
        }
    }
}

if ($.GetContextPanel().GetParent().id == "CustomUIContainer_EndScreen") {
    isEndScreen = true
    AddNewStatsInHeader($("#Header"))
}