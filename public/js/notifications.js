/*
*   Control user notifications
*/

var actualURL = window.location.origin + "/BeeWebpage/public";
var notifications = [];
var unreadNotifications = 0;

function eventFire(el, etype){
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        el.dispatchEvent(
            document.createEvent('MouseEvent')
                .initEvent(etype, true, false)
        );
    }
}

$('.dropdown').on({
    "shown.bs.dropdown": function() { this.closable = false; },
    "click":             function() { this.closable = true; },
    "hide.bs.dropdown":  function() { return this.closable; }
});

$('#notification').on('DOMSubtreeModified',function(event){
    var count_el = event.delegateTarget.childNodes[3];
    if (count_el.innerHTML.length > 0) {
        if (parseInt(count_el.innerHTML) > 0) {
            count_el.className = "count bg-danger";
        }
        else {
            count_el.className = "";
        }
    }
});

$( document ).ready(function() {

    //$("#notification").on('click', this.dropdown());

    moment.locale("sk");
    window.onload = function () {
        getNotifications(5,0);
    };

    function changeSeenStatus(item) {
        let not = document.getElementById("nav-a-" + item);
        not.className = "dropdown-item media bg-info";
        not.childNodes["0"].childNodes["0"].childNodes["0"].childNodes["0"].className = "fa fa-check";
        $.ajax({
            url: actualURL + '/user/notification/seen',
            method: 'POST',
            dataType: 'json',
            data : JSON.stringify({
                token : getCookie('token'),
                user_id: getCookie('user_id'),
                id : notifications[item].id
            }),
            headers : {
                'Content-Type' : 'application/json'
            }
        }).done(function (data) {
            unreadNotifications--;
            let notification_element = document.getElementsByClassName("for-notification");
            notification_element [0].childNodes[1].childNodes[3].innerHTML = unreadNotifications;
            notification_element [0].childNodes[3].childNodes[1].innerHTML = unreadNotifications + " neprečítaných upozornení";
            return data;
        });
    }
    function getNotifications(limit, offset) {
        $.ajax({
            url: actualURL + '/user/notifications',
            method: 'POST',
            dataType: 'json',
            data : JSON.stringify({
                token : getCookie('token'),
                user_id: getCookie('user_id'),
                limit: limit,
                offset: offset
            }),
            headers : {
                'Content-Type' : 'application/json'
            }
        }).done(function (data) {
            unreadNotifications = data[0].count;
            renderNotifications(data);
        });
    }

    /* show detail of selected notification */
    function showNotification(not_number) {
        var modal = document.getElementById("notificationModal");
        modal.childNodes[1].childNodes[1].childNodes[1].childNodes[1].innerHTML = notifications[not_number].title_text;
        modal.childNodes[1].childNodes[1].childNodes[3].innerText = "včelín: " + notifications[not_number].hive_name + "\n" +
            notifications[not_number].body_text;
        modal.childNodes[1].childNodes[1].childNodes[5].childNodes[3].onclick = function() {deleteNotification(not_number);};
        $('#notificationModal').modal('show');

        var notification_status = document.getElementById("nav-a-" + not_number).classList;
        if (notification_status.contains("bg-danger")) {
            changeSeenStatus(not_number);
        }
    }

    $(".for-notification").click(function() {$('#header').popover('show');});

    function renderNotifications(data) {
        var not_element = document.getElementsByClassName("for-notification");
        if (unreadNotifications > 0) {
            not_element[0].childNodes[1].childNodes[3].innerHTML = unreadNotifications;
        }
        not_element[0].childNodes[3].childNodes[1].innerHTML = unreadNotifications + " neprečítaných upozornení";
        var not_seen_class = "";
        var not_seen_item_class = "";
        for(let notification = 0; notification < data.length; notification++) {
            notifications[notification] = data[notification];
            let time_format = (moment().add(-7, "days").unix() <= moment((data[notification].time)).unix()) ? "ddd kk:mm" : "D MMM kk:mm"
            if (data[notification].seen === "t") {
                not_seen_class = "dropdown-item media bg-info";
                not_seen_item_class = "fa fa-check";
            }
            else {
                not_seen_class = "dropdown-item media bg-danger";
                not_seen_item_class = "fa fa-warning";
            }
            let new_not_el = document.createElement("a");
            new_not_el.className = not_seen_class;
            new_not_el.href = "#";
            new_not_el.id = "nav-a-" + notification;
            new_not_el.onclick = function (e) { e.stopPropagation(); showNotification(notification); };

            let ul_el = document.createElement("ul");
            let li_first_el = document.createElement("li");
            let li_second_el = document.createElement("li");
            let first_not_item = document.createElement("div");
            first_not_item.className = "not-item";

            // add i element
            let i_el = document.createElement("i");
            i_el.className = not_seen_item_class;
            first_not_item.appendChild(i_el);

            // add p element with notification text
            let not_message_time = document.createElement("p");
            let not_message_text = document.createElement("p");
            not_message_text.className = "not-item";

            let p_text_time = document.createTextNode(moment(data[notification].time).format(time_format));
            let p_text_msg = document.createTextNode(data[notification].title_text);
            not_message_time.appendChild(p_text_time);
            not_message_text.appendChild(p_text_msg);
            first_not_item.appendChild(not_message_time);

            li_first_el.appendChild(first_not_item);
            li_second_el.appendChild(not_message_text);
            ul_el.appendChild(li_first_el);
            ul_el.appendChild(li_second_el);
            //new_not_el.appendChild(first_not_item);
            //new_not_el.appendChild(first_not_item);
            new_not_el.appendChild(ul_el);

            not_element[0].childNodes[3].appendChild(new_not_el);
        }
    }

    function deleteNotification(item) {
        $.ajax({
            url: actualURL + '/user/notification/delete',
            method: 'DELETE',
            dataType: 'json',
            data : JSON.stringify({
                token : getCookie('token'),
                user_id: getCookie('user_id'),
                id : notifications[item].id
            }),
            headers : {
                'Content-Type' : 'application/json'
            }
        }).done(function (data) {
            let dropdown = $("#dropdown-notification");
            let reload = false;
            if (dropdown.find(".dropdown-item").length === 1) {
                reload = true;
            }
            notification_status =  document.getElementById("nav-a-" + item).classList;
            if (notification_status.contains("bg-danger")) {
                unreadNotifications--;
            }
            dropdown.find("#nav-a-" + item.toString()).fadeOut(1000, function() { $(this).remove(); });
            let notification_element = document.getElementsByClassName("for-notification");
            if (unreadNotifications >= 0) {
                notification_element [0].childNodes[1].childNodes[3].innerHTML = unreadNotifications;
            }
            notification_element [0].childNodes[3].childNodes[1].innerHTML = unreadNotifications + " neprečítaných upozornení";
            if (reload) {
                getNotifications(10,0);
            }
        });

    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
});