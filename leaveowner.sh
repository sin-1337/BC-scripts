// ==UserScript==
// @name byebye
// @namespace https://www.bondageprojects.com/
// @version 1.0
// @description Adds byebye which should leave your owner
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

CommandCombine([{
    Tag: 'byebye',
    Description: "Frees you completely and leaves your owenr.",
    Action: args => {
      (function() {
        Player.Appearance=Player.Appearance.filter(x => !x.Asset.Group.Name.match(/Item.*/));
        ChatRoomCharacterUpdate(Player);
      })();
      ManagementReleaseFromOwner();
    }
}]);
