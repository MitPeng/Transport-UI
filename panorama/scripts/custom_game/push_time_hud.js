"use strict";
function ShowPushTime(event) {
    $("#push_time_min").text = event.push_time_min;
    $("#push_time_sec").text = event.push_time_sec;
}

(function () {
    GameEvents.Subscribe("show_push_time", ShowPushTime);
})();