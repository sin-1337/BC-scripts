// ==UserScript==
// @name playerdetails
// @namespace https://www.bondageprojects.com/
// @version 1.0
// @description Adds /players, shows info about players in the room
// @author Sin
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match http://localhost:*/*
// @icon data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant none
// @run-at document-end
// ==/UserScript==

//Formats the player data for output to chat
function playerToChar(PlayersInRoom, MemberNumber) {
    const PLAYER = ChatRoomCharacter.find(C => C.MemberNumber == MemberNumber);

    //bail out and return placeholder if player is not available.
    if (!PLAYER) {
        return "- <span style='color:#FF0000'>[Unknown Person]</span>";
    }

    //Is the player an admin?
    let PlayerIsAdmin = "";
    if (ChatRoomData.Admin.includes(PLAYER.MemberNumber)) {
        PlayerIsAdmin = "🛡️";
    }

    //return html output containing information about the player with clickable link
    return `- <span style="color:${PLAYER.LabelColor || '#FFFFFF'}; cursor:pointer;
            text-shadow: 0px 0px 3px #000000; white-space: nowrap;"
            onclick="showPlayerImage(${PLAYER.MemberNumber})"
            onmouseover="this.style.textDecoration='underline';"
            onmouseout="this.style.textDecoration='none';">${CharacterNickname(PLAYER)}[${PLAYER.MemberNumber}]${PlayerIsAdmin}</span>`;
}

//Opens the player profile
window.showPlayerImage = function (MemberNumber) {
    // Check if the person is still in the room
    const PLAYER = ChatRoomCharacter.find(C => C.MemberNumber == MemberNumber);
    if (PLAYER) {
        ChatRoomStatusUpdate("Preference");
        InformationSheetLoadCharacter(PLAYER);
    } else {
        ChatRoomSendLocal("This person is no longer in the room.");
    }
};

CommandCombine([{
    Tag: 'players',
    Description: "Show the player count, helpful in maps.",
    Action: args => {
        //output total number of players/admins
        //TODO: make only this print if the "count" switch is specified
        ChatRoomSendLocal("There are " + ChatRoomData.Admin.length + " admins for this room.")
        ChatRoomSendLocal("There are " + ChatRoomCharacter.length + "/" + ChatRoomData.Limit + " total players in the room." );

        //get a list of players
        let PlayersInRoom = [];
        for (let person in ChatRoomData.Character) {
            PlayersInRoom.push(ChatRoomData.Character[person].MemberNumber);
        }

        // Print the final list of player output in chat
        const PLAYER_HTML = PlayersInRoom.map(MemberNumber => playerToChar(PlayersInRoom, MemberNumber)).join("\n");
        ChatRoomSendLocal(`${PLAYER_HTML}`);
    }
}]);
