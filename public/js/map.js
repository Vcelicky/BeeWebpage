/**
 * Javascript file for Hive Detail when Admin is logged in
 */
$( document ).ready(function() {

    device_id = location.href.match(/([^\/]*)\/*$/)[1];
    loc = window.location.origin;
    "use strict";

    [].slice.call( document.querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
        new SelectFx(el);
    } );

    jQuery('.selectpicker').selectpicker;

    document.getElementById("toggler").click();

    $('#menuToggle').on('click', function(event) {
        $('body').toggleClass('open');
    });

    $('.search-trigger').on('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $('.search-trigger').parent('.header-left').addClass('open');
    });

    $('.search-close').on('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $('.search-trigger').parent('.header-left').removeClass('open');
    });

    ajaxGetDeviceInfo();
    ajaxGetMeasurements();

});

$("#log_out_button").click(function() {
    logout();
    window.location.assign(window.origin + "/BeeWebpage/public");

});

function logout() {
    var loc = window.location.origin;
    $.ajax({
        url: loc + '/BeeWebpage/public/logout',
        method : 'POST',
        dataType : 'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function () {
        window.location.assign(window.origin + "/BeeWebpage/public");
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


