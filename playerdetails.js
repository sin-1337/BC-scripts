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

// show help
function showhelp() {
  let helpout = "";
  helpout += `<span style="color:#0000FF};
      text-shadow: 0px 0px 3px #000000; white-space: nowrap;">
  /player Help sheet</br>
    This command lists the number of admins and players in a room</br>
    and gives you some informatoin abou them
  </span>
  <hr>
  <span style="color:#00FF00};
      text-shadow: 0px 0px 3px #000000; white-space: nowrap;">
    Arguments: </br>
    help - show this menu </br>
  </span>
  <span style="color:#FF0000};
    text-shadow: 0px 0px 3px #000000; white-space: nowrap;">
    Icons:
    <hr>
    🛡️ = Person is Admin</br>
    📜 = Person is whitelisted in the room </br>
    🟢 = Person is a normal user </br>
    <hr>
    👑 = Person is your owner </br>
    🔒 = Person is your submissive </br>
    🔓 = Person is on trial with you </br>
    ❤️ = Person is your lover </br>
    🫱 = Person is a friend </br>
    ⚪ = You have this person whitelisted </br>
    ⚫ = You have this person blacklisted </br>
    👻 = You have ghosted this person
    </span>`;
  ChatRoomSendLocal(`${helpout}`);
}


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
    const splitArgs = args.split(" ");
    if (splitArgs[0].toLowerCase() == "help") {
      showhelp();
      return;
    }
    let output_html = "";
    let player;
    let admin_count = 0;
    let player_is_admin ="";
    let player_icons = "";
    //get a list of players
    for (let person in ChatRoomData.Character) {
      // Reset player_is_admin
      player_is_admin = "🟢";
      player_icons = "";

      // find membernumber for current player in list
      MemberNumber = ChatRoomData.Character[person].MemberNumber;

      // Find player
      player = ChatRoomCharacter.find(C => C.MemberNumber == MemberNumber);

      //bail out and return placeholder if player is not available.
      if (!player) {
        output_html += "- <span style='color:#FF0000'>[Unknown Person]</span>\n";
      }

      // check if the player is an admin and update the count, also flad the player as admin in the output list.
      if (ChatRoomData.Admin.includes(player.MemberNumber)) {
        admin_count++;
        player_is_admin = "🛡️";
      }
      else if (ChatRoomData.Whitelist.includes(player.MemberNumber)) {
        // if the player isn't an admin, is the player is whitelested?
        player_is_admin = "📜";
      }
      if (Player.OwnerNumber() == player.MemberNumber) {
        // person owns you
        player_icons += "👑 ";
      }

      else if (Player.IsInFamilyOfMemberNumber(player.MemberNumber)) {
        // if they down't own you but you are in their family, we assume you own them
        if (Player.IsOwnedByPlayer(player.membernumber)) {
          // The person is fully owned if this is true
          player_icons += "🔒 "
        }
        else {
          // person is on trial
          player_icons += "🔓 "
        }
      }
      if (Player.Lover.includes(player.MemberNumber)) {
        // person is a lover
        player_icons += "❤️ ";
      }
      if (Player.FriendList.includes(player.MemberNumber)) {
        // person is a friend
        player_icons += "🫱 ";
      }
      if (Player.WhiteList.includes(player.MemberNumber)) {
        player_icons += "⚪ ";
      }
      if (Player.BlackList.includes(Player.MemberNumber)) {
        player_icons += "⚫ "
      }
      if (Player.GhostList.includes(Player.MemberNumber)) {
        player_icons += "👻 ";
      }


      output_html += `${player_is_admin} <span style="color:${player.LabelColor || '#FFFFFF'}; cursor:pointer;
      text-shadow: 0px 0px 3px #000000; white-space: nowrap;"
      onclick="showPlayerImage(${player.MemberNumber})"
      onmouseover="this.style.textDecoration='underline';"
      onmouseout="this.style.textDecoration='none';">${CharacterNickname(player)}[${player.MemberNumber}]${player_icons}</span>\n`;
    }


    //output total number of players/admins
    //TODO: make only this print if the "count" switch is specified
    ChatRoomSendLocal("There are " + admin_count + "/" + ChatRoomData.Admin.length + " admins in the room.")
    ChatRoomSendLocal("There are " + ChatRoomCharacter.length + "/" + ChatRoomData.Limit + " total players in the room." );
    ChatRoomSendLocal(`${output_html}`);
  }
}]);
