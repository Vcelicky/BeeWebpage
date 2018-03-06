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

	// getDevices();
});

$("#log_out_button").click(function() {
    // deleteCookie("token");
    // deleteCookie("user_name");
    // deleteCookie("user_id");
    // deleteCookie("PHPSESSID");
    logout();
    window.location.assign(window.origin + "/BeeWebpage/public");

});

function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=0';
}

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
        user_id: 45,
        token : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjMifQ.NWOjv_uDNmgUU4sYWN3-wkCCjo4d-berGfRWC3FQ-9g"

    };

	$.ajax({
		url: loc + '/BeeWebpage/public/user/devices',
        // url:  'http://team20-17.studenti.fiit.stuba.sk/BeeWebpage/public/user/devices',
		method : 'POST',
        data : data,
        contentType:'application/json; charset=utf-8',
        dataType:'json'
	}).done(function (data) {
		console.log(data);
	});
}


