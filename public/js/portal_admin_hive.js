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

function ajaxGetMeasurements() {
    var loc = window.location.origin;
    var id = location.href.match(/([^\/]*)\/*$/)[1];

    console.log("Id:" +id);

    data = {
        'token' : getCookie('token'),
        'device_id' : id,
        "from": "2017-03-14",
        "to": "2050-03-14"
    };

    $.ajax({
        url: loc + '/BeeWebpage/public/admin/measurements',
        // url: 'http://team20-17.studenti.fiit.stuba.sk/BeeWebpage/public/user/measurements',
        method : 'POST',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        console.log(data);
        createDataTable(data);
        // createUsers(data);
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
                $('td', row).eq(5).addClass('red');
            }
            if(data["IT"] > document.getElementById("it-u").value){
                $('td', row).eq(1).addClass('red');
            }
            if(data["IT"] < document.getElementById("it-d").value){
                $('td', row).eq(1).addClass('red');
            }
            if(data["OT"] > document.getElementById("ot-u").value){
                $('td', row).eq(2).addClass('red');
            }
            if(data["OT"] < document.getElementById("ot-d").value){
                $('td', row).eq(2).addClass('red');
            }
            if(data["IH"] > document.getElementById("ih-u").value){
                $('td', row).eq(3).addClass('red');
            }
            if(data["IH"] < document.getElementById("ih-d").value){
                $('td', row).eq(3).addClass('red');
            }
            if(data["OH"] > document.getElementById("oh-u").value){
                $('td', row).eq(4).addClass('red');
            }
            if(data["OH"] < document.getElementById("oh-d").value){
                $('td', row).eq(4).addClass('red');
            }
            if(data["W"] > document.getElementById("w").value){
                $('td', row).eq(6).addClass('red');
            }
            if(data["B"] < document.getElementById("b").value && data["B"]!=100){
                $('td', row).eq(7).addClass('red');
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

function createHives(result){
    var data = result.data;
    var div = document.getElementById('div.hives');
    div.innerHTML = "";

    for (index = 0; index < data.length; ++index) {
        console.log(data[index]);
        div.innerHTML += createUserHtml(data[index].device_id,data[index].uf_name, data[index].location);
    }

}

function ajaxGetDeviceInfo() {
    var loc = window.location.origin;

    data = {
        'device_id' : device_id
    };

    $.ajax({
        url: loc + '/BeeWebpage/public/admin/device',
        method : 'POST',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
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


