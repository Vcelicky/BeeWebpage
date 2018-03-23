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

    ajaxGetMeasurements();

});

$('.ot').editable('/test/ot',{
    width:"20px",
    style   : 'display: inline',
    tooltip   : 'Kliknutím upraviť'
    }
);

$('.it').editable('/test/it',{
        width:"20px",
        style   : 'display: inline',
        tooltip   : 'Kliknutím upraviť'
    }
);

$('.oh').editable('/test/oh',{
        width:"20px",
        style   : 'display: inline',
        tooltip   : 'Kliknutím upraviť'
    }
);

$('.ih').editable('/test/ih',{
        width:"20px",
        style   : 'display: inline',
        tooltip   : 'Kliknutím upraviť'
    }
);

$('.bat').editable('/test/battery',{
        width:"20px",
        style   : 'display: inline',
        tooltip   : 'Kliknutím upraviť'
    }
);

$('.weight').editable('/test/weight',{
        width:"20px",
        style   : 'display: inline',
        tooltip   : 'Kliknutím upraviť'
    }
);


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
        // console.log(data);
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


