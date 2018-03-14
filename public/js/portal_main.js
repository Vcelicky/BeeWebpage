//Javascript file for main portal page only

var devicesMeasurements = {};

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

	ajaxGetDevices();
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

function ajaxGetDevices() {
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

function getDeviceData(device, fromTime, toTime) {
    // remember actual date from actual data !!!
    var currentTime = getTime(new Date());
    var currentDate = new Date();
    var lastDayTime = getTime(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 3));

    var data = {
        'token' : getCookie('token'),
        'user_id' : getCookie('user_id'),
        'device_id' : device,
        'from' : lastDayTime,
        'to' : currentTime
    };

    $.ajax({
        url: window.location.origin + '/BeeWebpage/public/user/measurements',
        method : 'POST',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        devicesMeasurements[ device ] = data.data;
        graphData = [];
        var max = 30;
        if (data.data.length < 30) {
            max = 0;
        }
        for (i =0; i < max; i++) {
            date = data.data[i][0].cas.toString();
            graphData.push({
                x : new moment(new Date(data.data[i][0].cas.toString())),
                y : data.data[i][0].hodnota
            });
        }
        if (graphData.length > 0) {

            var ctx = document.getElementById("chart-" + device);
            var myLineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        data: graphData,
                        borderColor: "#3e95cd",
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        xAxes: [{
                            type : 'time',
                            time: {
                                displayFormats: {
                                    minute: 'h:mm a'
                                }
                            }
                        }]
                    }
                },
                legend: false
            });

            console.log(myLineChart.data);
        }
        //console.log(data);
        //createHives(data);
    });

}

function getTime(date) {
    formatDate = date.getFullYear() + '-';
    var month = date.getMonth() + 1;
    if (month.toString().length == 1) {
        month = '0' + month;
    }
    var day = date.getDate();
    if (day.toString().length == 1) {
        day = '0' + day;
    }
    var hours = date.getHours();
    if (hours.toString().length == 1) {
        hours = '0' + hours;
    }
    var minutes = date.getMinutes();
    if (minutes.toString().length == 1) {
        minutes = '0' + minutes;
    }
    formatDate = formatDate + month + '-' + day +
        ' ' + hours + ':' + minutes + ':00';

    return formatDate;
}

function ajaxGetMeasurement(id) {
    var loc = window.location.origin;


    console.log("Id:" +id);

    data = {
        'token' : getCookie('token'),
        'user_id' : getCookie('user_id'),
        'device_id' : id
    };

    $.ajax({
        url: loc + '/BeeWebpage/public/user/measurements/actual',
        method : 'POST',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        console.log(data);
        devicesMeasurements[ id ].actual_time = data.data[0][0].cas;
        createMeasurementHtml(data, id);
    });
}

function createHives(result){
    var data = result.data;
    var div = document.getElementById('div.hives');
    div.innerHTML = "";

    //Foreach Hive
    for (index = 0; index < data.length; ++index) {
        div.innerHTML += createHiveHtml(data[index].device_id,data[index].uf_name, data[index].location);
        ajaxGetMeasurement(data[index].device_id);
    }

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
                <a class="font-weight-bold font-xs btn-block text-muted small" href="/BeeWebpage/public/portal/'+id+'">Zobraziť detail</a> \
                </div> \
            </div>\
            <div class="chart-container"> \
                <canvas id="chart-' + id + '"></canvas> \
                <a class="carousel-control-prev" href="#" role="button" data-slide="prev"> \
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span> \
                    <span class="sr-only">Previous</span> \
                </a> \
                <a class="carousel-control-next" href="#" role="button" data-slide="next"> \
                    <span class="carousel-control-next-icon" aria-hidden="true"></span> \
                    <span class="sr-only">Next</span> \
                </a> \
            </div> \
        </div>';

    getDeviceData(id, '11', '12');
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