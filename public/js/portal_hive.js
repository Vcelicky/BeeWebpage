//Javascript file for main portal page only
$( document ).ready(function() {

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

    getMeasurements();

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

function getMeasurements() {
    var loc = window.location.origin;
    var id = location.href.match(/([^\/]*)\/*$/)[1];

    console.log("Id:" +id);

    data = {
        'token' : getCookie('token'),
        'user_id' : getCookie('user_id'),
        'device_id' : id,
        'from': "0",
        'to': "100"
    };

    $.ajax({
        url: loc + '/BeeWebpage/public/user/measurements',
        method : 'POST',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        console.log(data);
        createDataTable(data);
       // createHives(data);
    });
}

function createDataTable(response){
    data = response.data;

    var array = [];
    var objects = {};

    for(var i in data) {

        var item = data[i];

        array.push({
            "IT" : item[0].hodnota,
            "OT" : item[1].hodnota,
            "IH"  : item[2].hodnota,
            "OH"  : item[3].hodnota,
            "P"   : item[4].hodnota,
            "W"   : item[5].hodnota,
            "B"   : item[6].hodnota,
            "Time" : item[0].cas
        });
    }

    objects.data = array;

    $('#bootstrap-data-table').DataTable( {
        "processing": true,
        "dom": '<"pull-left"f><"pull-right"l>tip',
        searching: true,
        "data": objects.data,
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Slovak.json"
        },
        "columns": [
            { "data": "Time"},
            { "data": "IT"},
            { "data": "OT"},
            { "data": "IH"},
            { "data": "OH"},
            { "data": "P"},
            { "data": "W"},
            { "data": "B"}
        ]
     });
}

function createHives(result){
    var data = result.data;
    var div = document.getElementById('div.hives');
    div.innerHTML = "";

    for (index = 0; index < data.length; ++index) {
        console.log(data[index]);
        div.innerHTML += createHiveHtml(data[index].device_id,data[index].uf_name, data[index].location);
    }

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


