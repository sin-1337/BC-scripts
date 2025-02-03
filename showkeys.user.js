// ==UserScript==
// @name showkeys
// @namespace https://www.bondageprojects.com/
// @version 1.0
// @description Adds /showkeys command
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
    Tag: 'showkeys',
    Description: "Shows which keys a player has.",
    Action: args => {
        let hasgold = Player.MapData.PrivateState.HasKeyGold;
        let hassilver = Player.MapData.PrivateState.HasKeySilver;
        let hasbronze = Player.MapData.PrivateState.HasKeyBronze;
        addChatMessage("You have the following keys:  ");
        if (hasbronze || hassilver || hasgold) {
        if (hasbronze) addChatMessage("Bronze");
        if (hassilver) addChatMessage("Silver");
        if (hasgold) addChatMessage("Gold");
        }
        else {
            addChatMessage("None");
        }
    }
}]);
