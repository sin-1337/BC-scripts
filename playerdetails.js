// ==UserScript==
// @name playerdetails
// @namespace https://www.bondageprojects.com/
// @version 3.15
// @description Adds /players, shows info about players in the room, also adds whisper+
// @author Sin
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match https://www.bondageprojects.com/*
// @icon data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant none
// @run-at document-end
// ==/UserScript==

// show help
function showhelp() {
  return `<table style="width: 100%"><tr><td>
  <span style=" text-shadow: 0px 0px 3px #000000; white-space: normal;">
  </br>
  <hr>
  /player help sheet</br>
    This command lists the number of admins and players </br>
    in a room and gives you some informatoin about them </br>

    </br>
    Arguments:
    <hr>
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
    👻 = You have ghosted this person </br>

    </br>
    Actions:
    <hr>
    Click Badge - If you click the badge for a player it will open their profile. </br>
    Click name - If you click the name/number of a player it will whisper them without range constraints. </br>
    </span>
    </td>
    </tr>
    </table>`;
}


// Opens the player profile
// This functions is setup up to be exposed to the global DOM
window.showPlayerProfile = function (MemberNumber) {
  // Check if the person is still in the room
  const PLAYER = ChatRoomCharacter.find(C => C.MemberNumber == MemberNumber);
  if (PLAYER) {
    ChatRoomStatusUpdate("Preference");
    InformationSheetLoadCharacter(PLAYER);
  } else {
    ChatRoomSendLocal("This person is no longer in the room.");
  }
};

// This functions is setup up to be exposed to the global DOM
window.showPlayerFocus = function (MemberNumber) {
  // Check if the person is still in the room
  const PLAYER = ChatRoomCharacter.find(C => C.MemberNumber == MemberNumber);
  if (PLAYER) {
    ChatRoomStatusUpdate("Preference");
    ChatRoomFocusCharacter(PLAYER);
  } else {
    ChatRoomSendLocal("This person is no longer in the room.");
  }
};

function ChatRoomSendWhisperRanged(target, msg) {
  if (msg == "") {
    return;
  }

  //console.log("Original Message:", msg); // Log the initial message

  // First ensure we have a valid target object
  const targetMember = typeof target === 'object' ? target : ChatRoomCharacter.find(C => C.MemberNumber === parseInt(target));
  if (!targetMember) {
    ChatRoomSendLocal(`${TextGet("CommandNoWhisperTarget")} ${target}.`, 30_000);
    return;
  }

  // Handle self whispers with gray text and memo emoji
  if (targetMember.MemberNumber === Player.MemberNumber) {
    const selfMessage = `<span style="color:#989898">💭 Log to </span><span style="color:${Player.LabelColor}">self</span><span style="color:#989898">: ${msg.replace(/\)/g, "）")}</span>`;
    ChatRoomSendLocal(selfMessage);
    return;
  }

  // Replace normal brackets with fake ones in the message
  msg = msg.replace(/\)/g, "）");
  //console.log("Message After Bracket Replacement:", msg); // Log after bracket replacement

  // Prepare the message - now with ⤵ instead of :
  let formattedMsg = `(Whisper+❩⤵\n${msg}`;
  if (Player.ChatSettings.OOCAutoClose && !msg.endsWith('）')) {
    formattedMsg += '）';
  }

  //console.log("Formatted Message Before Sending:", formattedMsg); // Log the final formatted message

  // build data payload with Whisper+
  const data = ChatRoomGenerateChatRoomChatMessage("Whisper+", formattedMsg);
  if (!data) {
    data = ChatRoomGenerateChatRoomChatMessage("Whisper", formattedMsg);
  }
  data.Target = targetMember.MemberNumber;

  // Create a copy for the server with type "Whisper"
  const serverData = { ...data, Type: "Whisper" };
  ServerSend("ChatRoomChat", serverData);

  // Use original data (with Whisper+) for local display
  data.Sender = Player.MemberNumber;
  ChatRoomMessage(data);

  return true;
}


window.sendWhisper = function (memberNumber) {
  for (index in Commands) {
    index = parseInt(index);
    if (Commands[index].Tag == "whisper+") {
      window.CommandSet(Commands[index].Tag + " " + memberNumber)
    }
  }
};

window.ChatRoomMessageWhisperPlusClick = function () {
  // Similar to ChatRoomMessageNameClick, but for whisper+
  const sender = Number.parseInt(this.parentElement?.dataset.sender, 10);
  const target = Number.parseInt(this.parentElement?.dataset.target, 10);
  const memberNumber = sender === Player.MemberNumber && !Number.isNaN(target) ? target : sender;
  const chatInput = /** @type {null | HTMLTextAreaElement} */(document.getElementById("InputChat"));

  if (!chatInput || !ChatRoomCharacter.some(C => C.MemberNumber === memberNumber)) {
    ChatRoomSendLocal(`${TextGet("CommandNoWhisperTarget")} ${memberNumber}.`, 30_000);
    return;
  }

  // Handle the input text similar to the original whisper
  const currentText = chatInput.value;
  const whisperPlusCmd = `/whisper+ ${memberNumber} `;

  // Check if the current input starts with a whisper command
  const whisperMatch = currentText.match(/^\/whisper\+?\s*\d+\s*/);

  if (whisperMatch) {
    // Replace just the member number if there's already a whisper command
    chatInput.value = whisperPlusCmd + currentText.substring(whisperMatch[0].length);
  } else {
    // Add the command to the start if there isn't one
    chatInput.value = whisperPlusCmd + currentText;
  }

  chatInput.focus();
};

// formats the data for outputting
function formatoutput(player, badge, player_icons, isMe) {
  let playername = CharacterNickname(player);
  let output = `<tr>
            <td style="padding-left: 5px; padding-right-5px; padding-bottom: 1px; padding-top: 0;"><span style="cursor:pointer;" onclick="showPlayerFocus(${player.MemberNumber})">${badge}</span></td>`;

  if (isMe) {
    // if the player is me, don't let me whisper myself
    output += `<td style="padding-left: 5px; padding-right-5px; padding-bottom: 1px; padding-top: 0;"><span style="color:${player.LabelColor || '#000000'};
                font-family: Arial, sans-serif;
                text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.7); white-space: nowrap;">
                  ${CharacterNickname(player).normalize("NFKC")}[${player.MemberNumber}]
              </span>${player_icons}</td>
          </tr>`;
  }
  else {
    // set up whispering
    output += `<td style="padding-left: 5px; padding-right-5px; padding-bottom: 1px; padding-top: 0;"><span style="color:${player.LabelColor || '#000000'}; cursor:pointer;
                font-family: Arial, sans-serif;
                text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.7); white-space: nowrap;"
                onclick="sendWhisper(${player.MemberNumber})"
                onmouseover="this.style.textDecoration='underline';"
                onmouseout="this.style.textDecoration='none';">
                  ${CharacterNickname(player).normalize("NFKC")}[${player.MemberNumber}]
              </span>${player_icons}</td>
          </tr>`;
  }

  return output;
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
  // implements the whisper+ command
  Tag: 'whisper+',
  Description: "Enables the /whisper+ command that is global to a map room",
  Action: (args, command) => {
    // parse arguments into membernumber and messsage
    const MEMBERNUMBER = parseInt(args.slice(0, args.indexOf(" ")));
    // Use the original command string to preserve case
    let message = command.substring(command.indexOf(' ') + MEMBERNUMBER.toString().length + 2);

    // if membernumber is not a valid number, bail
    if (Number.isNaN(MEMBERNUMBER)) {
      ChatRoomSendLocal("Member number is invalid.", 30_000);
      return 1;
    }
    if (message == "") {
      ChatRoomSendLocal("Message was blank.", 30_000);
      return 1;
    }
    // find player based no membernumber
    const TARGET = ChatRoomCharacter.find(C => C.MemberNumber == MEMBERNUMBER);
    ChatRoomSendWhisperRanged(TARGET || MEMBERNUMBER, message);
  }
}]);


CommandCombine([{
  // implements the /players command
  Tag: 'players',
  Description: "Show the player count, helpful in maps.",
  Action: args => {
    const SPLITARGS = args.split(" ");
    if (SPLITARGS[0].toLowerCase() == "help") {
      ChatRoomSendLocal(showhelp());
      return;
    }

    let me_output_html = "";  // holds data about user who ran script
    let admin_output_html = ""; // holds admins
    let vip_output_html = ""; // holds whitelisted users
    let player_output_html = ""; // holds normal players
    let player; // the person we found in the room
    let admin_count = 0; // number of admins in the room
    let badge = ""; // holds the admin icon if the player is an admin
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
        me_output_html = formatoutput(player, badge, player_icons, true);

      }

      // check if the player is an admin and update the count, also flad the player as admin in the output list.
      if (ChatRoomData.Admin.includes(player.MemberNumber)) {
        admin_count++;
        if (!checkIfMe(player, Player)) {
          // if the player is not me, output admin and skip rest of loop
          admin_output_html += formatoutput(player, badge, player_icons, false);
          continue;
        }
      }
      else if (ChatRoomData.Whitelist.includes(player.MemberNumber) && !checkIfMe(player, Player)) {
        // if the player isn't an admin, is the player is whitelested?
        vip_output_html += formatoutput(player, badge, player_icons, false);
        continue;
      }
      else if (!checkIfMe(player)) {
        // player is normal, nonadmin, not whitelist, and not me.
        player_output_html += formatoutput(player, badge, player_icons, false);
      }

    }

    // if argument is "count", set filter vars and skip loop
    if (SPLITARGS.some(item => item.toLowerCase() === "count")) {
      //console.log("count only");
      showme = false;
      showadmins = false;
      showvip = false;
      showplayers = false;
    }

    // if argument is admins, set filter vars to only show admins and continue
    if (SPLITARGS.some(item => item.toLowerCase() === "admins")) {
      //console.log("admins only");
      showme = false;
      showvip = false;
      showplayers = false;
    }

    // if argument is vips, set filter vars to only show vips (whitelisted) and continue
    if (SPLITARGS.some(item => item.toLowerCase() === "vips")) {
      //console.log("vips only");
      showme = false;
      showadmins = false;
      showplayers = false;
    }

    //output total number of players/admins
    //TODO: include this in the table space and add a header
    ChatRoomSendLocal("There are " + admin_count + "/" + ChatRoomData.Admin.length + " admins in the room.")
    ChatRoomSendLocal("There are " + ChatRoomCharacter.length + "/" + ChatRoomData.Limit + " total players in the room.");
    let output_html = "";

    // start the tabble and remove the boarders
    output_html += `<table style="border: 0px;">`

    // if the filter var resolves to true, add the respective output.
    output_html = showme ? output_html + me_output_html : output_html;
    output_html = showme ? output_html + admin_output_html : output_html;
    output_html = showme ? output_html + vip_output_html : output_html;
    output_html = showme ? output_html + player_output_html : output_html;

    // finish the table
    output_html += `</table>`

    // show the final output
    ChatRoomSendLocal(output_html);

  }
}]);

function initWPlus() {
  if (!window.bcModSdk) {
    setTimeout(initWPlus, 500);
    return;
  }

  var WPlus = bcModSdk.registerMod({
    name: "WPlus",
    fullName: "Whisper Plus",
    version: "1.0.0",
    repository: ""
  });

  function init() {
    // Our main hook
    WPlus.hookFunction("ChatRoomMessageDisplay", 0, (args, next) => {
      const [data, msg, SenderCharacter, metadata] = args;

      // If it's not our special Whisper+ type, let it process normally
      if (data.Type !== "Whisper+") {
        return next(args);
      }

      // For Whisper+, we handle it ourselves but use most of the original function's structure
      const displayMessage = CommonCensor(ChatRoomActiveView.DisplayMessage(data, msg, SenderCharacter, metadata) ?? "¶¶¶");
      if (displayMessage == "¶¶¶") return;

      const divChildren = [];
      const whisperTarget = SenderCharacter.IsPlayer() ? ChatRoomCharacter.find(c => c.MemberNumber == data.Target) : SenderCharacter;

      divChildren.push(
        ElementButton.Create(
          null,
          window.ChatRoomMessageWhisperPlusClick,
          { noStyling: true },
          {
            button: {
              classList: ["ReplyButton"],
              children: ["\u21a9\ufe0f"]
            }
          },
        ),
        SenderCharacter.IsPlayer() ? TextGet("WhisperTo") : TextGetInScope("Screens/Online/ChatRoom/Text_ChatRoom.csv", "WhisperFrom"),
        " ",
        ElementButton.Create(
          null,
          window.ChatRoomMessageWhisperPlusClick,
          { noStyling: true },
          {
            button: {
              classList: ["ChatMessageName"],
              attributes: {
                "tabindex": -1
              },
              style: { "--label-color": whisperTarget.LabelColor },
              children: [CharacterNickname(whisperTarget)],
            },
          },
        ),
        ": ",
        displayMessage,
      );

      if (!whisperTarget.IsPlayer()) {
        document.querySelector(`
                  #TextAreaChatLog .ChatMessageWhisper[data-sender="${whisperTarget.MemberNumber}"] > .ReplyButton:not([tabindex='-1']),
                  #TextAreaChatLog .ChatMessageWhisper[data-target="${whisperTarget.MemberNumber}"] > .ReplyButton:not([tabindex='-1'])
              `)?.setAttribute("tabindex", "-1");
      }

      const classList = ["ChatMessage"];
      classList.push("ChatMessageWhisper");  // Use Whisper styling

      const div = ElementCreate({
        tag: "div",
        classList,
        dataAttributes: {
          time: ChatRoomCurrentTime(),
          sender: data.Sender,
          target: data.Target,
        },
        children: divChildren,
      });

      ChatRoomAppendChat(div);
      return div;
    });
  }

  function initWait() {
    if (CurrentScreen == null || CurrentScreen === "Login") {
      WPlus.hookFunction("LoginResponse", 0, (args, next) => {
        next(args);
        const response = args[0];
        if (response && typeof response.Name === "string" && typeof response.AccountName === "string") {
          init();
        }
      });
    } else {
      init();
    }
  }

  initWait();
}

// Start the initialization process
initWPlus();