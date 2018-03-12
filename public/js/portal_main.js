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

	getDevices();
	console.log("Console test");
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

function getDevices() {
	var loc = window.location.origin;

    data = {
        'token' : getCookie('token'),
        'user_id' : getCookie('user_id')
    };

	$.ajax({
		url: loc + '/BeeWebpage/public/user/devices',
		method : 'POST',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
	}).done(function (data) {
	    console.log(data);
        createHives(data);
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

function createHiveHtml(id, name, location){

    html = '<div class="card"> \
            <div class="card-body"> \
                <div class="clearfix"> \
                <i class="fa fa-archive bg-flat-color-3 p-3 font-2xl mr-3 float-left text-light"></i> \
                <div class="h5 text-secondary mb-0 mt-1">'+name+'</div> \
                <div class="text-muted text-uppercase font-weight-bold font-xs small">'+location+'</div> \
                </div> \
                <div class="b-b-1 pt-3"></div> \
                <hr> \
                <div id="'+id+'"class="more-info pt-2" style="margin-bottom:-10px;"> \
                <a class="font-weight-bold font-xs btn-block text-muted small" href="/BeeWebpage/public/portal/'+id+'">Zobraziť detail</a> \
                </div> \
            </div>\
        </div>'

    return html;
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