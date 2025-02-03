// ==UserScript==
// @name         MapUpdateSpam toggle
// @namespace    https://www.bondageprojects.com/
// @version      BETA
// @description  Felix's code snippets
// @author       Felix
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @icon         https://wce.netlify.app/icon.png
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Function to add a chat message to the chat log
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

// Make the addChatMessage function globally available
window.addChatMessage = addChatMessage;

CommandCombine([{
    Tag: 'mapupdatemsgremove',
    Description: "Toggles the RemoveJoinMessagesMessageHandler.",
    Action: args => {
        let RemoveJoinMessagesMessageHandler = {
            Description: "Highlight player name",
            Priority: 499,
            Callback: (data, sender, msg, metadata) => {
                // Content: 'ServerUpdateRoom', Type: 'Action'
                if (data.Type === "Action" && data.Content === "ServerUpdateRoom") {
                    return true;
                }
            }
        };

        // Function to toggle the handler
        function toggleRemoveJoinMessagesHandler() {
            let handlerExists = ChatRoomMessageHandlers.some(handler => handler.Priority === 499);

            if (handlerExists) {
                ChatRoomMessageHandlers = ChatRoomMessageHandlers.filter(handler => handler.Priority !== 499);
                addChatMessage("RemoveJoinMessagesMessageHandler removed.");
            } else {
                ChatRoomRegisterMessageHandler(RemoveJoinMessagesMessageHandler);
                addChatMessage("RemoveJoinMessagesMessageHandler added.");
            }
        }

        // Execute the toggle function
        toggleRemoveJoinMessagesHandler();
    }
}]);
})();
