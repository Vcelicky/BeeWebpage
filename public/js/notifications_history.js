//Javascript file for main portal page only
var device_id;
var actualURL = window.location.origin + "/BeeWebpage/public";

$( document ).ready(function() {
    getNotifications();
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

});

function getNotifications() {
    data = {
        'token' : getCookie('token'),
        'user_id' : getCookie('user_id'),
        'limit' : 5000,
        'offset' : 0
    };

    $.ajax({
        url: actualURL + '/user/notifications',
        method : 'POST',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        createDataTable(data);
    });
}

function createDataTable(data){

    var array = [];
    var objects = {};

    for(var i = 0; i < data.length; i++) {

        array.push({
            "title" : data[i].title_text,
            "body" : data[i].body_text,
            "hive" : data[i].hive_name,
            "time" : data[i].time
        });
    }

    objects.data = array;

    var table = $('#bootstrap-data-table').DataTable( {
        "processing": true,
        "bAutoWidth": false,
        "dom": '<"pull-left"f><"pull-left"l>tip',
        "searching" : false,
        "data": objects.data,
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Slovak.json"
        },
        "columns": [
            { "data": "time"},
            {"data":"title"},
            {"data":"body"},
            {"data":"hive"}
        ]
    });

    table.order([ 0, 'desc' ]);
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