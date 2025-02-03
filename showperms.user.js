// ==UserScript==
// @name         Permissions changer
// @namespace    https://www.bondageprojects.com/
// @version      BETA
// @description  Shows your permission in chat and lets you click on different perm levels to change it.
// @author       Felix, Sin for tampermonky
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @match        https://www.bondageprojects.com/*
// @match        https://bondageprojects.com/*
// @icon         https://wce.netlify.app/icon.png
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    //# //permChange.js
    function listThePerms() {
        const currentPermissionText = `${TextGetInScope('Screens/Character/InformationSheet/Text_InformationSheet.csv', 'PermissionLevel' + Player.ItemPermission.toString())} (${Player.ItemPermission})`;

        const permHtml = `
            <div style="background-color: color-mix(in srgb, transparent 90%, lightblue 10%); border-radius: 20px; padding: 2px 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); font-size: 22px; margin: 0; padding: 0;">
                <span style="display: inline; margin: 0; padding: 0; line-height: 1; color: #5BA3E0; font-weight: bold;">Current Permission: </span>
                <span style="display: inline; margin: 0; padding: 0; line-height: 1; color: ${Player.LabelColor}; font-weight: bold; text-shadow: 0 0 1px black;">${currentPermissionText}</span>
                <span style="display: inline; margin: 0; padding: 0; line-height: 1; color: #5BA3E0; font-weight: bold;">&nbsp;</span> <!-- Empty line -->
                <span style="display: inline; margin: 0; padding: 0; line-height: 1; color: #5BA3E0; font-weight: bold;">All options:</span>
                ${createPermWebFormat(0)}
                ${createPermWebFormat(1)}
                ${createPermWebFormat(2)}
                ${createPermWebFormat(3)}
                ${createPermWebFormat(4)}
                ${createPermWebFormat(5)}
            </div>
        `;

        ChatRoomSendLocal(permHtml);
    }

    function createPermWebFormat(number) {
        return `<span style="display: inline; margin: 0; padding: 0; line-height: 1; color: lightblue; font-size: 22px;" onmouseover="this.style.color='white'; this.style.textShadow='0 0 1px black, 0 0 2px black';" onmouseout="this.style.color='lightblue'; this.style.textShadow='none';" onclick="updatePermission(${number});">${number} ${TextGetInScope('Screens/Character/InformationSheet/Text_InformationSheet.csv', 'PermissionLevel' + number.toString())}</span>`;
    }

    // Expose the updatePermission function to the global scope
    window.updatePermission = function (number) {
        Player.ItemPermission = number;
        ServerAccountUpdate.QueueData({ ItemPermission: Player.ItemPermission });
        const successMessage = `<span style="color: lightblue;">Successfully changed to: ${TextGetInScope('Screens/Character/InformationSheet/Text_InformationSheet.csv', 'PermissionLevel' + number.toString())}</span>`;
        ChatRoomSendLocal(successMessage, 3636);
    };

    // Command for reusability
    CommandCombine([{
        Tag: 'showperms', // Command tag that listens for "/showperms"
        Description: "List the permission levels and the current one.",
        Action: args => {
            listThePerms();
        }
    }]);
})();
