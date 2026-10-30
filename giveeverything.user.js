// ==UserScript==
// @name GiveEverything
// @namespace https://www.bondageprojects.com/
// @version 1.1
// @description Grants all items in the game with safe async delay and server sync
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
    div.setAttribute("class", "ChatMessage ChatMessageWhisper");
    div.setAttribute("data-time", ChatRoomCurrentTime());
    div.setAttribute("data-sender", Player.MemberNumber.toString());
    div.innerHTML = msg;

    var Refocus = document.activeElement && document.activeElement.id == "InputChat";
    var ShouldScrollDown = ElementIsScrolledToEnd("TextAreaChatLog");
    var chatLog = document.getElementById("TextAreaChatLog");
    if (chatLog != null) {
        chatLog.appendChild(div);
        if (ShouldScrollDown) ElementScrollToEnd("TextAreaChatLog");
        if (Refocus) ElementFocus("InputChat");
    }
}

CommandCombine([{
    Tag: "giveeverything",
    Description: "Gives the player all items in the game with safe rate-limited sync.",
    Action: async args => {
        addChatMessage("Starting inventory unlock, please wait a few seconds...");

        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

        // Flatten all available assets in Female3DCG
        const allItems = [];
        for (const group of AssetFemale3DCG) {
            if (group && group.Asset) {
                for (const item of group.Asset) {
                    allItems.push({ name: item.Name, group: group.Group });
                }
            }
        }

        // Add items in-memory with a short pause every few items to avoid thread/event lockup
        for (let i = 0; i < allItems.length; i++) {
            const { name, group } = allItems[i];
            InventoryAdd(Player, name, group);

            if (i % 5 === 0) {
                await sleep(5);
            }
        }

        // Refresh character so newly added clothes and hair render immediately
        CharacterRefresh(Player);
        addChatMessage("All items added to in-memory inventory. Syncing to server...");

        // Pause 1 second to let the event loop and WebSocket queue settle
        await sleep(1000);

        // Sync full inventory to server once
        ServerPlayerInventorySync();
        addChatMessage("Your greed is rewarded. Inventory synced!");
    }
}]);
