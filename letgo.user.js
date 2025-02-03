// ==UserScript==
// @name letgo
// @namespace https://www.bondageprojects.com/
// @version 1.0
// @description Adds /letgo command, Requires LSCG
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

// This script will force release and bypass the escape attempt component of LSCG. This is because it is too easy for someone to grab you and too annoying to get away.
// This script currently does it in a way that is cruel to the grabber, basically to them it still looks as though you are grabbed, but you are totally free.
// They will not be able to confine, restrict, or pull you from the room regardless of what the message says. Thus to them it will look as though everything is
// fine, but despite this, they should not be able to pull you from the room and they will likely just believe it is an lscg bug or general weirdness.

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
    Tag: 'letgo',
    Description: "Force LSCG release and bypass struggle",
    Action: args => {
      LSCG.getModule("LeashingModule").RemoveAllLeashingsOfType("tongue")
      LSCG.getModule("LeashingModule").RemoveAllLeashingsOfType("ear")
      LSCG.getModule("LeashingModule").RemoveAllLeashingsOfType("arm")
      LSCG.getModule("LeashingModule").RemoveAllLeashingsOfType("tail")
      LSCG.getModule("LeashingModule").RemoveAllLeashingsOfType("neck")
      LSCG.getModule("LeashingModule").RemoveAllLeashingsOfType("horn")
      LSCG.getModule("LeashingModule").RemoveAllLeashingsOfType("mouth")
      LSCG.getModule("LeashingModule").RemoveAllLeashingsOfType("eyes")
      LSCG.getModule("LeashingModule").RemoveAllLeashingsOfType("mouth-with-foot")
      LSCG.getModule("LeashingModule").RemoveAllLeashingsOfType("chomp")

      addChatMessage("If someone had you grabbed, they don\'t now.");
    }
}]);
