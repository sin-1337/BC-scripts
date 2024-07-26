// ==UserScript==
// @name GiveEverything
// @namespace https://www.bondageprojects.com/
// @version 1.0
// @description Adds teleport command
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

// Define a function to add inventory with delay
function addInventoryWithDelay(player, itemName, group, delay) {
  setTimeout(() => {
    InventoryAdd(player, itemName, group);
  }, delay);
}

CommandCombine([{
    Tag: 'giveeverything',
    Description: "Gives the player some amount of money.",
    Action: args => {
        AssetFemale3DCG.forEach((group, index) => {
            group.Asset.forEach((item, subIndex) => {
                // Calculate delay for each iteration
                let delay = (index * group.Asset.length + subIndex) * 100; // Adjust delay as needed
                addInventoryWithDelay(Player, item.Name, group.Group, delay);
            });
        });
        ServerPlayerInventorySync();
        addChatMessage("Your greed is rewarded.");
    }
}]);
