/**
 * Javascript file for Portal main page when Admin is logged in
 */
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

    ajaxGetUsers();
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

function ajaxGetUsers() {
    var loc = window.location.origin;
    data = {};

    $.ajax({
        url: loc + '/BeeWebpage/public/admin/users',
        method : 'POST',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        createUsers(data);
    });
}

function createUsers(result){
    var data = result.data;
    console.log(data);
    var div = document.getElementById('div.users');
    div.innerHTML = "";

    console.log(data.length);
    //Foreach Hive
    for (index = 0; index < data.length; ++index) {
        div.innerHTML += createUserHtml(data[index].id,data[index].name, data[index].email, data[index].hive_count);
    }

}

function createUserHtml(id, name, email, count){

    html = '<div class="card"> \
            <div class="card-body"> \
                <div class="clearfix"> \
                    <i class="fa fa-user bg-flat-color-1 p-3 font-2xl mr-3 float-left text-light"></i> \
                    <div class="h5 text-secondary mb-0 mt-1">'+name+'</div> \
                    <div style="margin-bottom:20px" class="text-muted text-uppercase font-weight-bold font-xs small">'+email+'</div> \
                    \<div style="margin-bottom:20px" class="text-muted text-uppercase font-weight-bold font-xs small">Počet zariadení: '+count+'</div> \
                    <div id="measurement-'+id+'" class="text-muted text-uppercase font-xs small"></div> \n' +
        '       <div id="measurement2-'+id+'" class="text-muted text-uppercase font-xs small"></div> \
                </div> \
                <hr>  \
                <div id="'+id+'"class="more-info pt-2" style="margin-bottom:-10px;"> \
                <a class="font-weight-bold font-xs btn-block text-muted small fa fa-angle-double-down " onclick="showButtonClick(\'' + id + '\');" id="a.show.'+id+'" onmouseover="" style="cursor: pointer;">Zobraziť zariadenia</a> \
                <div id="div.hives.'+id+'"></div>\
                </div> \
            </div>\
        </div>'

    return html;
}

function showButtonClick(user_id){
    var a = document.getElementById('a.show.'+user_id);
    var div = document.getElementById('div.hives.'+user_id);

    if(a.innerText=="Zobraziť zariadenia"){
        ajaxGetDevices(user_id);
        div.style.display='inline';
        a.innerText="Skryť zariadenia"
        a.classList.remove("fa-angle-double-down");
        a.classList.add("fa-angle-double-up");

    }
    else{
        div.style.display='none';
        a.innerText="Zobraziť zariadenia";
        a.classList.remove("fa-angle-double-up");
        a.classList.add("fa-angle-double-down");
    }
}

function ajaxGetDevices(user_id) {
    var loc = window.location.origin;

    data = {
        'user_id' : user_id
    };

    $.ajax({
        url: loc + '/BeeWebpage/public/admin/devices',
        method : 'POST',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        console.log(data);
        createHives(data, user_id);
    });
}

function createHives(result, user_id){
    var data = result.data;
    var div = document.getElementById('div.hives.'+user_id);
    div.innerHTML = "";

    //Foreach Hive
    for (index = 0; index < data.length; ++index) {
        div.innerHTML += createHiveHtml(data[index].device_id,data[index].uf_name, data[index].location);
        ajaxGetMeasurement(data[index].device_id);
    }

}

function ajaxGetMeasurement(id) {
    var loc = window.location.origin;


    console.log("ajaxGetMeasurement Id:" +id);

    data = {
        'device_id' : id
    };

    $.ajax({
        url: loc + '/BeeWebpage/public/admin/measurements/actual',
        method : 'POST',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        console.log(data);
        createMeasurementHtml(data, id);
    });
}

function createHiveHtml(id, name, location){

    html = '<div class="card"> \
            <div class="card-body"> \
                <div class="clearfix"> \
                    <i class="fa fa-archive bg-flat-color-3 p-3 font-2xl mr-3 float-left text-light"></i> \
                    <div class="h5 text-secondary mb-0 mt-1">'+name+'</div> \
                    <div style="margin-bottom:20px" class="text-muted text-uppercase font-weight-bold font-xs small">'+location+'</div> \
                    <div id="measurement-'+id+'" class="text-muted text-uppercase font-xs small"></div> \n' +
        '       <div id="measurement2-'+id+'" class="text-muted text-uppercase font-xs small"></div> \
                </div> \
                <hr>  \
                <div id="'+id+'"class="more-info pt-2" style="margin-bottom:-10px;"> \
                <a class="font-weight-bold font-xs btn-block text-muted small " href="/BeeWebpage/public/portal/'+id+'">Zobraziť detail</a> \
                </div> \
            </div>\
        </div>'

    return html;
}

//Create measurement Html for device
function createMeasurementHtml(result, id){
    var data = result.data;

    console.log(data[0]);
    console.log(data[0][0].hodnota);

    var div = document.getElementById('measurement-'+id);
    var div2 = document.getElementById('measurement2-'+id);

    proximity = "Neprevrátený";
    if(data[0][4].hodnota =='true'){
        proximity='<span class="text-danger">Prevrátený</span>';
    }

    div.innerHTML = "Vnútorná teplota: "+data[0][0].hodnota+", Vonkajšia teplota: "+data[0][1].hodnota+", Vnútorná vlhkosť: "+data[0][2].hodnota+", Vonkajšia vlhkost: "+data[0][3].hodnota+"";
    div2.innerHTML = "Pohyb úľa: "+proximity+", Váha: "+data[0][5].hodnota+", Batéria: "+data[0][6].hodnota;
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