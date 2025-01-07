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

// Opens the player profile
// This functions is setup up to be exposed to the global DOM
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

        let output_html = "";
        let player;
        let admin_count = 0;
        let player_is_admin ="";
        //get a list of players
        for (let person in ChatRoomData.Character) {
          // Reset player_is_admin
          player_is_admin = "";

          // find membernumber for current player in list
          MemberNumber = ChatRoomData.Character[person].MemberNumber;

          // Find player
          player = ChatRoomCharacter.find(C => C.MemberNumber == MemberNumber);

          //bail out and return placeholder if player is not available.
          if (!player) {
                output_html += "- <span style='color:#FF0000'>[Unknown Person]</span>\n";
          }

          // check if the player is an admin and update the count, also flad the player as admin in the output list.
          let PlayerIsAdmin = "";
          if (ChatRoomData.Admin.includes(player.MemberNumber)) {
              admin_count++;
              player_is_admin = "🛡️";
          }

          output_html += `- <span style="color:${player.LabelColor || '#FFFFFF'}; cursor:pointer;
          text-shadow: 0px 0px 3px #000000; white-space: nowrap;"
          onclick="showPlayerImage(${player.MemberNumber})"
          onmouseover="this.style.textDecoration='underline';"
          onmouseout="this.style.textDecoration='none';">${CharacterNickname(player)}[${player.MemberNumber}]${player_is_admin}</span>\n`;
        }


        //output total number of players/admins
        //TODO: make only this print if the "count" switch is specified
        ChatRoomSendLocal("There are " + admin_count + "/" + ChatRoomData.Admin.length + " admins in the room.")
        ChatRoomSendLocal("There are " + ChatRoomCharacter.length + "/" + ChatRoomData.Limit + " total players in the room." );
        ChatRoomSendLocal(`${output_html}`);
    }
}]);
