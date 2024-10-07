// ==UserScript==
// @name highlighter
// @namespace https://www.bondageprojects.com/
// @version 1.0
// @description highlights your name when someone says it.
// @author Sin and Felix
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match http://localhost:*/*
// @icon data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant none
// ==/UserScript==

//** there is currently a major flaw with this code where it makes all chat, actions and rp, look like normal text. Do not use this right now.

(function() {
    'use strict';

    // Wait for the page to load completely
    window.addEventListener('load', function() {
        // Check if the original function exists
        if (typeof ChatRoomMessageRunHandlers !== 'function') {
            console.error('ChatRoomMessageRunHandlers does not exist.');
            return;
        }

        // Store the original function if needed
        const originalHandler = ChatRoomMessageRunHandlers;

        // Overwrite the function
        window.ChatRoomMessageRunHandlers = function(type, data, sender, msg, metadata) {
            if (!['pre', 'post'].includes(type) || !data || !sender) return;

            // Gather the handlers for the requested processing and sort by priority
            let handlers = ChatRoomMessageHandlers.filter(proc =>
                (type === "pre" && proc.Priority < 0) ||
                (type === "post" && proc.Priority >= 0)
            );
            handlers.sort((a, b) => a.Priority - b.Priority);

            // Original message for reference
            let originalMsg = msg;
            let skips = [];
            let keyword = CharacterNickname(Player); // Get the player's nickname

            // Check if the message contains the player's nickname (case insensitive)
            let keywordRegex = new RegExp(`(\\b${keyword}\\b)`, 'gi'); // Prepare regex for keyword

            // Get the sender's character information
            let senderCharacter = ChatRoomCharacter.find(c => c.MemberNumber === data.Sender);

            // Check if the message sender is not the player
            if (senderCharacter && data.Sender !== Player.MemberNumber && msg.toLowerCase().includes(keyword.toLowerCase())) {
                // Get the sender's nickname and label color
                let start = CharacterNickname(senderCharacter) + ": ";
                let labelColor = senderCharacter.LabelColor; // Sender's label color
                let mentionColor = Player.LabelColor; // Player's label color for mention

                // Highlight the keyword with a span for bold and background color styling
                let highlightedMsg = msg.replace(
                    keywordRegex,
                    `<span style='color: ${mentionColor}; font-weight:bold;'>$1</span>`
                );
                highlightedMsg = highlightedMsg.replace(
                    keywordRegex,
                    (match) => match.charAt(0).toUpperCase() + match.slice(1)
                );

                console.log("Highlighting message:", highlightedMsg); // Log the highlighted message

                // Construct the final message with sender's nickname in color and black shadow
                let finalMsg = `<span style='color:${labelColor}; text-shadow: 0px 0px 2px black;'>${start}</span>${highlightedMsg}`;

                // Send the highlighted message
                ChatRoomSendLocal(finalMsg);
                console.log("Sent highlighted message to chat."); // Confirm sending

                return true; // Indicate that we've handled the message
            }

            for (let handler of handlers) {
                // Check if one of the handlers wanted us to skip an oncoming handler
                if (skips.some(s => s(handler))) continue;

                let ret = handler.Callback(data, sender, msg, metadata);

                if (typeof ret === "boolean") {
                    // Handler wishes to filter, and true means we should stop
                    if (ret) return true;
                } else if (typeof ret === "object") {
                    // Handler wishes to transform, collect their result and continue
                    let { msg: newMsg, skip } = ret;
                    if (newMsg) msg = newMsg;
                    if (skip) skips.push(skip);
                }
            }

            // If the message was transformed, return it, otherwise just say we're fine
            return msg === originalMsg ? false : msg;
        };
    });
})();
