// ==UserScript==
// @name playerdetails
// @namespace https://www.bondageprojects.com/
// @version 2.0
// @description Adds /players, shows info about players in the room
// @author Sin
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match https://www.bondageprojects.com/*
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
  /player help sheet</br>
    This command lists the number of admins and players in a room</br>
    and gives you some informatoin abou them
    <hr>

    Arguments: </br>
    help - show this menu </br>
    count - show only the player count </br>
    admins - show only a list of admins and the counts </br>
    vips - show only room whitelisted and the counts </br>

    </br>
    Badges:
    <hr>
    🛡️ = Person is Admin</br>
    📜 = Person is whitelisted in the room </br>
    🟢 = Person is a normal user </br>
    </br>
    Icons:
    <hr>
    ⭐ = Person is you </br>
    👑 = Person is your owner </br>
    🔒 = Person is your submissive </br>
    🔓 = Person is on trial with you </br>
    ❤️ = Person is your lover </br>
    🫱 = Person is a friend </br>
    ⚪ = You have this person whitelisted </br>
    ⚫ = You have this person blacklisted </br>
    👻 = You have ghosted this person
    </span>`;
  ChatRoomSendLocal(helpout);
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

// formats the data for outputting
function formatoutput(player, player_is_admin, player_icons) {
  return `${player_is_admin} <span style="color:${player.LabelColor || '#FFFFFF'}; cursor:pointer;
      text-shadow: 0px 0px 3px #000000; white-space: nowrap;"
      onclick="showPlayerImage(${player.MemberNumber})"
      onmouseover="this.style.textDecoration='underline';"
      onmouseout="this.style.textDecoration='none';">${CharacterNickname(player)}[${player.MemberNumber}]${player_icons}</span>\n`;
}

// determine if player is admin or whitelisted in the room and set their badge icon
function setbadge(player) {
  let badge = "🟢";
  badge = ChatRoomData.Whitelist.includes(player.MemberNumber) ? "📜" : badge;
  badge = ChatRoomData.Admin.includes(player.MemberNumber) ? "🛡️" : badge
  return badge;
}

function setIcons(player) {
  let player_icons = "";
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
  return player_icons;
}

function checkIfMe(player) {
  return player.MemberNumber == Player.MemberNumber ? true : false;
}

CommandCombine([{

  Tag: 'players',
  Description: "Show the player count, helpful in maps.",
  Action: args => {
    const splitArgs = args.split(" ");
    if (splitArgs[0].toLowerCase() == "help") {
      showhelp();
      return;
    }

    let me_output_html = "";  // holds data about user who ran script
    let admin_output_html = ""; // holds admins
    let vip_output_html = ""; // holds whitelisted users
    let player_output_html = ""; // holds normal players
    let player; // the person we found in the room
    let admin_count = 0; // number of admins in the room
    let badge =""; // holds the admin icon if the player is an admin
    let player_icons = ""; // holds the list of player/status icons (string)

    // filter variables, show or not show certain output
    let showme = true;  // person who ran the script (you)
    let showadmins = true;  // room admins
    let showvip = true;  // room whitelists
    let showplayers = true;  // normal players

    //get a list of players
    for (let person in ChatRoomData.Character) {

      // find membernumber for current player in list
      MemberNumber = ChatRoomData.Character[person].MemberNumber;

      // Find player
      player = ChatRoomCharacter.find(C => C.MemberNumber == MemberNumber);

      //bail out and return placeholder if player is not available.
      if (!player) {
        player_output_html += "❓ <span style='color:#FF0000'>[Unknown Person]</span>\n";
        continue;
      }

      // check if the player is also an admin or vip and add icon with admin given priority
      badge = setbadge(player);
      player_icons = setIcons(player);

      // if the player is me (person who ran the script)
      if (checkIfMe(player)) {

        // mark me with a star icon
        player_icons = "⭐ " + player_icons;

        // format my outpupt and store
        me_output_html = formatoutput(player, badge, player_icons);

      }

      // check if the player is an admin and update the count, also flad the player as admin in the output list.
      if (ChatRoomData.Admin.includes(player.MemberNumber)) {
        admin_count++;
        if (!checkIfMe(player, Player)) {
          // if the player is not me, output admin and skip rest of loop
          admin_output_html += formatoutput(player, badge, player_icons);
          continue;
        }
      }
      else if (ChatRoomData.Whitelist.includes(player.MemberNumber) && !checkIfMe(player, Player)) {
        // if the player isn't an admin, is the player is whitelested?
        vip_output_html += formatoutput(player, badge, player_icons);
        continue;
      }
      else if (!checkIfMe(player)){
        // player is normal, nonadmin, not whitelist, and not me.
        player_output_html += formatoutput(player, badge, player_icons);
      }

    }

    // if argument is "count", set filter vars and skip loop
    if (splitArgs.some(item => item.toLowerCase() === "count")) {
      console.log("count only");
      showme = false;
      showadmins = false;
      showvip = false;
      showplayers = false;
    }

    // if argument is admins, set filter vars to only show admins and continue
    if (splitArgs.some(item => item.toLowerCase() === "admins")) {
      console.log("admins only");
      showme = false;
      showvip = false;
      showplayers = false;
    }

    // if argument is vips, set filter vars to only show vips (whitelisted) and continue
    if (splitArgs.some(item => item.toLowerCase() === "vips")) {
      console.log("vips only");
      showme = false;
      showadmins = false;
      showplayers=false;
    }

    //output total number of players/admins
    //TODO: make only this print if the "count" switch is specified
    ChatRoomSendLocal("There are " + admin_count + "/" + ChatRoomData.Admin.length + " admins in the room.")
    ChatRoomSendLocal("There are " + ChatRoomCharacter.length + "/" + ChatRoomData.Limit + " total players in the room." );

    // if the filter var resolves to true, print the respective output.
    showme && ChatRoomSendLocal(me_output_html);
    showadmins && ChatRoomSendLocal(admin_output_html);
    showvip && ChatRoomSendLocal(vip_output_html);
    showplayers && ChatRoomSendLocal(player_output_html);

  }
}]);
