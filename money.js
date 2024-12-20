// ==UserScript==
// @name Money
// @namespace https://www.bondageprojects.com/
// @version 1.0
// @description Restores the /money command
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

function addChatMessage(msg) {
    var div = document.createElement("div");
    div.setAttribute('class', 'ChatMessage ChatMessageWhisper');
    div.setAttribute('data-time', ChatRoomCurrentTime());
    div.setAttribute('data-sender', Player.MemberNumber.toString());
    div.innerHTML = msg;

    var Refocus = document.activeElement.id == "InputChat";
    var ShouldScrollDown = ElementIsScrolledToEnd("TextAreaChatLog");
    if (document.getElementById("TextAreaChatLog") != null) {
        document.getElementById("TextAreaChatLog").appendChild(div);
        if (ShouldScrollDown) ElementScrollToEnd("TextAreaChatLog");
        if (Refocus) ElementFocus("InputChat");
    }
}

CommandCombine([{
    Tag: 'money',
    Description: "Gives the player some amount of money.",
    Action: args => {
        const splitArgs = args.split(" ");
        if(splitArgs.length < 1) {
            return;
        }
        const AMMOUNT = parseInt(splitArgs[0], 10);
        Player.Money=AMMOUNT;
        ServerPlayerSync();
        addChatMessage("Set player's money to  $" + AMMOUNT);
    }
}]);
