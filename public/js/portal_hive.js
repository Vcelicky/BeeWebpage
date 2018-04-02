//Javascript file for main portal page only
var device_id;
var loc;

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

    ajaxGetMeasurements();
    ajaxGetDeviceInfo();

});

$('.hive').editable(function(value, settings) {
    data = {
        'token' : getCookie('token'),
        'user_id' : getCookie('user_id'),
        'id' : device_id,
        "value": value
    };

    // console.log(data);

    $.ajax({
        url: loc+'/BeeWebpage/public/user/device/name',
        method : 'PUT',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        alert("Názov úľa bol úspešne zmenený");
    });

    return(value);
}, {
    style   : 'display: inline',
    id : this.id,
    tooltip   : 'Kliknutím upraviť'
});

$('.location').editable(function(value, settings) {
    data = {
        'token' : getCookie('token'),
        'user_id' : getCookie('user_id'),
        'id' : device_id,
        "value": value
    };

    // console.log(data);

    $.ajax({
        url: loc+'/BeeWebpage/public/user/device/location',
        method : 'PUT',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        alert("Lokácia úľa bola úspešne zmenená");
    });

    return(value);
}, {
    style   : 'display: inline',
    id : this.id,
    tooltip   : 'Kliknutím upraviť'
});


$( "#save" ).click(function() {
    var it = document.getElementById("it-u").value;
    var ot = document.getElementById("ot-u").value;
    var oh = document.getElementById("oh-u").value;
    var ih = document.getElementById("ih-u").value;
    var itD = document.getElementById("it-d").value;
    var otD = document.getElementById("ot-d").value;
    var ohD = document.getElementById("oh-d").value;
    var ihD = document.getElementById("ih-d").value;
    var b = document.getElementById("b").value;
    var w = document.getElementById("w").value;



    var loc = window.location.origin;

    data = {
        'token' : getCookie('token'),
        'user_id' : getCookie('user_id'),
        'device_id' : device_id,
        "it_u": it,
        "ot_u": ot,
        "oh_u": oh,
        "ih_u": ih,
        "it_d": itD,
        "ot_d": otD,
        "oh_d": ohD,
        "ih_d": ihD,
        "b": b,
        "w": w
    };

    // console.log(data);

    $.ajax({
        url: loc + '/BeeWebpage/public/user/device/limits',
        method : 'PUT',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        alert("Hraničné hodnoty boli úspešne zmenené");
    });

});

$( "#reset" ).click(function() {
    var loc = window.location.origin;

    data = {
        'token' : getCookie('token'),
        'user_id' : getCookie('user_id'),
        'device_id' : device_id
    };

    $.ajax({
        url: loc + '/BeeWebpage/public/user/device/limits/reset',
        method : 'PUT',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        alert("Hraničné hodnoty boli úspešne zresetované");
        location.reload();

    });
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

function ajaxGetMeasurements() {
    var loc = window.location.origin;
    var id = location.href.match(/([^\/]*)\/*$/)[1];

    // console.log("Id:" +id);

    data = {
        'token' : getCookie('token'),
        'user_id' : getCookie('user_id'),
        'device_id' : id,
        "from": "2017-03-14",
        "to": "2050-03-14"
    };

    $.ajax({
        url: loc + '/BeeWebpage/public/user/measurements',
        // url: 'http://team20-17.studenti.fiit.stuba.sk/BeeWebpage/public/user/measurements',
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

    var table = $('#bootstrap-data-table').DataTable( {
        "processing": true,
        "bAutoWidth": false,
        "dom": '<"pull-left"f><"pull-left"l>tip',
        searching: false,
        "data": objects.data,
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Slovak.json"
        },
        "createdRow": function(row, data ) {
            if (data["P"] == "true" ) {
                // $(row).addClass('red');
                // $('td', row).eq(5).css('background-color', 'pink');
                $('td', row).eq(5).addClass('red');
            }
        },
        "columns": [
            { "data": "Time"},
            {"data":"IT",
                "render":function(data) {
                    if(data==null)
                        return "";
                    else
                        return (data+"°C");
                }
            },
            {"data":"OT",
                "render":function(data) {
                    if(data==null)
                        return "";
                    else
                        return (data+"°C");
                }
            },
            {"data":"IH",
                "render":function(data) {
                    if(data==null)
                        return "";
                    else
                        return (data+"%");
                }
            },
            {"data":"OH",
                "render":function(data) {
                    if(data==null)
                        return "";
                    else
                        return (data+"%");
                }
            },
            {"data":"P",
                "render":function(data) {
                    if(data=="true"){
                        return "Prevrátený";
                    }
                    else if (data=="false")
                        return ("Neprevrátený");
                    else
                        return "";
                }
            },
            {"data":"W",
                "render":function(data) {
                    if(data==null)
                        return "";
                    else
                        return (data+" kg");
                }
            },
            {"data":"B",
                "render":function(data) {
                    if(data==null)
                        return "";
                    else
                        return (data+"%");
                }
            }
        ]
     });

    table.order([ 0, 'desc' ]);
}

function ajaxGetDeviceInfo() {
    var loc = window.location.origin;

    data = {
        'token' : getCookie('token'),
        'user_id' : getCookie('user_id'),
        'device_id' : device_id
    };

    $.ajax({
        url: loc + '/BeeWebpage/public/user/device',
        method : 'POST',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        // console.log(data);
        createHiveInfo(data);
    });
}

function createHiveInfo(result){
    var data = result.data;

    document.getElementById("loc").innerHTML=data.location;
    document.getElementById("name").innerHTML=data.uf_name;
    document.getElementById("it-u").value=data.temperature_in_up_limit;
    document.getElementById("ot-u").value=data.temperature_out_up_limit;
    document.getElementById("oh-u").value=data.humidity_out_up_limit;
    document.getElementById("ih-u").value=data.humidity_in_up_limit;
    document.getElementById("it-d").value=data.temperature_in_down_limit;;
    document.getElementById("ot-d").value=data.temperature_out_down_limit;;
    document.getElementById("oh-d").value=data.humidity_out_down_limit;
    document.getElementById("ih-d").value=data.humidity_in_down_limit;;
    document.getElementById("b").value=data.batery_limit;
    document.getElementById("w").value=data.weight_limit;

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


