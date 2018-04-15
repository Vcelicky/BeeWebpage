//Javascript file for main portal page only

// loaded data for choose devices
var devicesMeasurements = {};

// number of elements to show in graph
var graphStep = 20;

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

    $(window).resize(checkSize);
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

function showGraph(e, deviceElement, deviceId) {
    //console.log(deviceElement.childNodes[1].className);
    if (deviceElement.childNodes[1].className === "fa fa-caret-right") {
        deviceElement.childNodes[1].className = "fa fa-caret-down";
        console.log(document.getElementById("chart-section-" + deviceId).getElementsByTagName("canvas"));
        document.getElementById("chart-section-" + deviceId).className = "d-block";
        if (document.getElementById("chart-" + deviceId.toString()).className.length === 0) {
            getDeviceData(deviceId, 0, 100);
            while (typeof devicesMeasurements[ deviceId ] === "undefined");
            addNewDoubleChart(e, deviceId, 1, "Teplota");
        }
    }
    else {
        deviceElement.childNodes[1].className = "fa fa-caret-right";
        document.getElementById("chart-section-" + deviceId).className = "d-none";
    }
    e.preventDefault();
}

function addNewChart(e, device, type, title) {
    var ctx = document.getElementById("chart-" + device);
    amountOfData = devicesMeasurements[ device ].data.length;
    if (amountOfData > 0) {
        devicesMeasurements[ device ].actualType = type;
        devicesMeasurements[ device ].actualTitle = title;
        graphData = [];
        step = graphStep;
        for (i = devicesMeasurements[ device ].actual_index; i < (devicesMeasurements[ device ].actual_index + step); i++) {
            graphData.push({
                x : new moment(new Date(devicesMeasurements[ device ].data[i][0].cas.toString())),
                y : devicesMeasurements[ device ].data[i][type].hodnota
            });
        }
        if (graphData.length > 0) {
            if (typeof devicesMeasurements[ device ].chart != 'undefined') {
                devicesMeasurements[ device ].chart.destroy();
            }
            devicesMeasurements[ device ].chart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label : title,
                        data: graphData,
                        borderColor: "#8bc34a",
                        fill: false
                    }]
                },
                options: {
                    elements: {
                        line: {
                            tension: 0
                        }
                    },
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                displayFormats: {
                                    minute: 'h:mm a'
                                }
                            }
                        }]
                    }
                }
            });
        }
    }
    else {
        /*!!! alert when no data available for device */
    }
    e.preventDefault();
    checkSize();
}

function addNewDoubleChart(e, device, type, title) {
    var ctx = document.getElementById("chart-" + device);
    amountOfData = devicesMeasurements[ device ].data.length;
    if (amountOfData > 0) {
        devicesMeasurements[ device ].actualType = type;
        devicesMeasurements[ device ].actualTitle = title;
        graphData1 = [];
        graphData2 = [];
        labels = [];
        step = graphStep;

        for (i = devicesMeasurements[ device ].actual_index; i < (devicesMeasurements[ device ].actual_index + step); i++) {
            graphData1.push({
                x : new moment(new Date(devicesMeasurements[ device ].data[i][0].cas.toString())),
                y : devicesMeasurements[ device ].data[i][type - 1].hodnota
            });

            graphData2.push({
                x : new moment(new Date(devicesMeasurements[ device ].data[i][0].cas.toString())),
                y : devicesMeasurements[ device ].data[i][type].hodnota
            });
        }
        if (graphData1.length > 0) {
            if (typeof devicesMeasurements[ device ].chart !== 'undefined') {
                devicesMeasurements[ device ].chart.destroy();
            }
            devicesMeasurements[ device ].chart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                            label : title + " vnútri",
                            data: graphData1,
                            borderColor: "#8bc34a",
                            fill: false
                        },
                        {
                            label : title + " vonku",
                            data: graphData2,
                            borderColor: "#f6360b",
                            fill: false
                        }]
                },
                options: {
                    elements: {
                        line: {
                            tension: 0
                        }
                    },
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                displayFormats: {
                                    minute: 'h:mm a'
                                }
                            }
                        }]
                    }
                }
            });
        }
    }
    else {
        /*!!! alert when no data available for device */
    }
    e.preventDefault();
    checkSize();
}

function updateChartData(e, device, way) {
    var get = true;
    localStep = graphStep;
    var graphData1 = [];
    var graphData2 = [];

        var amountOfData = devicesMeasurements[ device ].data.length;

            step = amountOfData;
            dif = devicesMeasurements[ device ].actual_index + (localStep * way);
            // check way of change data
            // older data
            if (way > 0) {
                if (amountOfData === 0) {
                    getDeviceData(device, devicesMeasurements[ device ].from_date + 100, 100 );
                    if (devicesMeasurements[ device ].data.length == 0) {
                        get = false;
                    }
                }
                else {
                    if (dif < amountOfData) {
                        let end  = ((dif + localStep) <amountOfData) ? dif + localStep : amountOfData;
                        devicesMeasurements[ device ].actual_index = dif;
                        for (i = devicesMeasurements[ device ].actual_index; i < (devicesMeasurements[ device ].actual_index + localStep); i++) {
                            graphData1.push({
                                x: new moment(new Date(devicesMeasurements[device].data[i][0].cas.toString())),
                                y: devicesMeasurements[device].data[i][devicesMeasurements[device].actualType - 1].hodnota
                            });

                            graphData2.push({
                                x: new moment(new Date(devicesMeasurements[device].data[i][0].cas.toString())),
                                y: devicesMeasurements[device].data[i][devicesMeasurements[device].actualType].hodnota
                            });
                        }
                    }
                    // out of data
                    else {
                        if (devicesMeasurements[ device ].data.length != 0) {
                            devicesMeasurements[ device ].data.length = 0;

                            getDeviceData(device, devicesMeasurements[ device ].from_date + 100, 100 );
                            if (devicesMeasurements[ device ].data.length == 0) {
                                get = false;
                            }
                        }
                        else {
                            get = false;
                        }
                    }
                }

            }
            else {
                if (amountOfData === 0) {
                    getDeviceData(device, devicesMeasurements[ device ].from_date - 100, 100 );
                    if (devicesMeasurements[ device ].data.length == 0) {
                        get = false;
                    }
                }
                else {
                    if (dif >= 0) {
                        let start  = ((dif - localStep) >= 0) ? (dif - localStep) : 0;
                        devicesMeasurements[ device ].actual_index = start;
                        for (i = start; i < localStep; i++) {
                            graphData1.push({
                                x: new moment(new Date(devicesMeasurements[device].data[i][0].cas.toString())),
                                y: devicesMeasurements[device].data[i][devicesMeasurements[device].actualType - 1].hodnota
                            });

                            graphData2.push({
                                x: new moment(new Date(devicesMeasurements[device].data[i][0].cas.toString())),
                                y: devicesMeasurements[device].data[i][devicesMeasurements[device].actualType].hodnota
                            });
                        }
                    }
                    else {

                        if ((devicesMeasurements[ device ].from_date - 100) >=0) {
                            devicesMeasurements[ device ].data.length = 0;
                            getDeviceData(device, devicesMeasurements[ device ].from_date - 100, 100 );

                        }
                        else {
                            get = false;
                        }
                    }
                }

            }


    if (get) {
        if (devicesMeasurements[ device ].actualType < 4) {
            addNewDoubleChart(e, device, devicesMeasurements[ device ].actualType, devicesMeasurements[ device ]. actualTitle);
            /*devicesMeasurements[ device ].chart.data.datasets = [{
                label : devicesMeasurements[ device ].actualTitle + " vnútri",
                data: graphData1,
                borderColor: "#3e95cd",
                fill: false
            },
                {
                    label : devicesMeasurements[ device ].actualTitle + " vonku",
                    data: graphData2,
                    borderColor: "#3e95cd",
                    fill: false
                }];*/
        }
        else {
            addNewChart(e, device, devicesMeasurements[ device ].actualType, devicesMeasurements[ device ]. actualTitle);
           /* devicesMeasurements[ device ].chart.data.datasets = [{
                label : devicesMeasurements[ device ].actualTitle,
                data: graphData2,
                borderColor: "#3e95cd",
                fill: false
            }];*/
        }
        devicesMeasurements[ device ].chart.update({
            duration : 1200
        });
    }
    devicesMeasurements[ device ].chart.update({
        duration : 1200
    });
    e.preventDefault();
}

function getDeviceData(device, fromTime, toTime) {
    if (typeof devicesMeasurements[ device ] === "undefined") {
        devicesMeasurements[ device ] = {};
    }
    var from = "";
    devicesMeasurements[ device ].from_date = fromTime;
    /*if (fromTime.length === 0) {
        from = new moment(new Date(toTime)).add(-3 , "days").format("YYYY-MM-DD");
        devicesMeasurements[ device ].from_date = from;
    }*/
    devicesMeasurements[ device ].to_date = toTime;

    var data = {
        'token' : getCookie('token'),
        'user_id' : getCookie('user_id'),
        'device_id' : device,
        'from' : fromTime,
        'to' : toTime
    };

    $.ajax({
        url: window.location.origin + '/BeeWebpage/public/user/measurements2',
        method : 'POST',
        data : JSON.stringify(data),
        dataType:'json',
        async: false,
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        devicesMeasurements[ device ]["data"] = data.data;
        devicesMeasurements[ device ].actual_index = 0;
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
        if (data.data.length > 0) {
            if (typeof devicesMeasurements[ id ] === "undefined") {
                devicesMeasurements[ id ] = {};
            }
            devicesMeasurements[ id ].actual_time = data.data[0][0].cas;
        }
        createMeasurementHtml(data, id);
    });
}

function ajaxGetDeviceNotifications(device) {
    var loc = window.location.origin;

    data = {
        'token' : getCookie('token'),
        'user_id' : getCookie('user_id'),
        'device_id' : device
    };

    $.ajax({
        url: loc + '/BeeWebpage/public/user/device/notifications',
        method : 'POST',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        let hive_item = document.getElementById('measurement-' + device);
        hive_item.parentElement.parentElement.childNodes[3].childNodes[1].childNodes[1].checked = data.data.sms_not == "f" ? false : true;
        hive_item.parentElement.parentElement.childNodes[5].childNodes[1].childNodes[1].checked = data.data.email_not == "f" ? false : true;
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

    //Set notifications for each device
    for (index = 0; index < data.length; ++index) {
        ajaxGetDeviceNotifications(data[index].device_id);
    }
}

function createHiveHtml(id, name, location){

    html = '<div class="col-12 col-lg-12">\
                <div class="card"> \
                    <div class="card-body"> \
                        <div class="clearfix margin-bottom-sm"> \
                            <div class="col-lg-12">\
                                <i class="fa fa-archive bg-flat-color-3 p-3 font-2xl mr-3 float-left text-light"></i> \
                                <div class="h6 text-secondary mb-0 mt-1">'+name+'</div> \
                                <div style="margin-bottom:20px" class="text-muted text-uppercase font-weight-bold font-xs small">'+location+'</div> \
                            </div> \
                            <div class="col-lg-12" > \
                                <label class="notifications-label">Notifikácie</label> \
                                <div class="form-check checkbox-slider--b"> \
                                    <label> \
                                        <input type="checkbox"><span>sms</span> \
                                    </label> \
                                </div> \
                                <div class="form-check checkbox-slider--b"> \
                                    <label> \
                                        <input type="checkbox"><span>e-mail</span> \
                                    </label> \
                                </div> \
                                <div class="col-lg-10"> \
                                    <div id="measurement-'+id+'" class="text-muted text-uppercase font-xs small"></div> \
                                    <div id="measurement2-'+id+'" class="text-muted text-uppercase font-xs small"></div> \
                                </div>\
                        </div> \
                        <hr>  \
                        <div id="'+id+'"class="more-info pt-2" style="margin-bottom:-10px;"> \
                            <a class="font-weight-bold font-xs btn-block text-muted small" href="/BeeWebpage/public/portal/'+id+'">Zobraziť namerané údaje</a> \
                            <a \
                                class="font-weight-bold font-xs btn-block text-muted small"\
                                href="#"\
                                onclick=\'showGraph(event, this, \"'+id.toString()+'\")\'>\
                                <i class="fa fa-caret-right"></i>\
                                Zobraziť grafy meraní\
                            </a>\
                        </div> \
                    </div> \
                </div>\
            </div>\
            <div id="chart-section-' + id + '" class="d-none">\
                <div class="col-md-8 offset-md-2">\
                    <ul class="nav nav-tabs"> \
                        <li class="nav-item">\
                            <a \
                                class="nav-link active" \
                                href="#" \
                                onclick=\' var tabs = $(this)[0].parentElement.parentElement.childNodes; \
                                           for(i=1; i< tabs.length; i+=2) {tabs[i].children[0].className = "nav-link";}\
                                           this.className = \"nav-link active\";\
                                           document.getElementById(\"graph-title-' + id +'\").textContent = \"Teplota\";\
                                           addNewDoubleChart(event, \"'+id.toString()+'\", 1, \"Teplota\", 2)\'\
                            >Teplota</a>\
                        </li> \
                        <li class="nav-item">\
                            <a\
                                class="nav-link" \
                                href="#" \
                                onclick=\' var tabs = $(this)[0].parentElement.parentElement.childNodes;\
                                           for(i=1; i< tabs.length; i+=2) {tabs[i].children[0].className = "nav-link";}\
                                           this.className = \"nav-link active\";\
                                           document.getElementById(\"graph-title-' + id +'\").textContent = \"Vlhkosť\";\
                                           addNewDoubleChart(event, \"'+id.toString()+'\", 3, \"Vlhkosť\")\'\
                            >Vlhkosť</a>\
                        </li> \
                        <li class="nav-item">\
                            <a\
                                class="nav-link" \
                                href="#" \
                                onclick=\' var tabs = $(this)[0].parentElement.parentElement.childNodes;\
                                           for(i=1; i< tabs.length; i+=2) {tabs[i].children[0].className = "nav-link";}\
                                           this.className = \"nav-link active\";\
                                           document.getElementById(\"graph-title-' + id +'\", 1).textContent = \"Hmotnosť\";\
                                           addNewChart(event, \"'+id.toString()+'\", 5, \"Hmotnosť\")\'\
                            >Hmotnosť</a>\
                        </li> \
                        <li class="nav-item">\
                            <a\
                                class="nav-link" \
                                href="#" \
                                onclick=\' var tabs = $(this)[0].parentElement.parentElement.childNodes;\
                                           for(i=1; i< tabs.length; i+=2) {tabs[i].children[0].className = "nav-link";}\
                                           this.className = \"nav-link active\";\
                                           document.getElementById(\"graph-title-' + id +'\").textContent = \"Batéria\";\
                                           addNewChart(event, \"'+id.toString()+'\", 6, \"Batéria\")\'\
                            >Batéria</a>\
                        </li> \
                    </ul> \
                    <div class="chart-space"> \
                        <a class="carousel-control-prev chart-space-arrow-left" onclick=\'updateChartData(event, \"'+id+'\", 1)\' href="#" role="button" data-slide="prev"> \
                            <span class="ti-arrow-left arrow" aria-hidden="true"></span> \
                        </a> \
                        <a class="carousel-control-prev chart-space-arrow-right" onclick=\'updateChartData(event, \"'+id+'\", -1)\' href="#" role="button" data-slide="prev"> \
                            <span class="ti-arrow-right arrow" aria-hidden="true"></span> \
                        </a> \
                        <h4 id="graph-title-' + id + '" class="mb-3">Teplota</h4> \
                        <canvas id="chart-' + id + '"></canvas> \
                    </div> \
                </div>\
            </div>';
    return html;
}

function checkSize(){

    if (window.innerWidth < 576) {
        $(".chart-space").width("auto");
        $(".chart-space-arrow-left")
            .css("left", "0px")
            .css("top", "40px")
            .css("bottom", "unset");
        $(".chart-space-arrow-right")
            .css("right", "0px")
            .css("left", "unset")
            .css("top", "40px")
            .css("bottom", "unset");
    }
    else {
        $(".chart-space").width("50vw");
        var width = Math.round($(".chart-space-arrow-left").width());
        $(".chart-space-arrow-left").width("unset");
        $(".chart-space-arrow-right").width("unset");
        $(".chart-space-arrow-left").css("left", "-" + width + "px");
        $(".chart-space-arrow-right")
            .css("right", "-" + width + "px")
            .css("left", "unset");
    }
}


function arrowsPosition(element) {
    console.log(element);
    var a = 1;
}

//Create measurement Html for device
function createMeasurementHtml(result, id){
    var data = result.data;
    if (data.length > 0) {
        var div = document.getElementById('measurement-'+id);
        var div2 = document.getElementById('measurement2-'+id);

        proximity = "Neprevrátený";

        if(data[0][4].hodnota =='true'){
            proximity='<span class="text-danger">Prevrátený</span>';
        }

        div.innerHTML = "Vnútorná teplota: "+data[0][0].hodnota+", Vonkajšia teplota: "+data[0][1].hodnota+", Vnútorná vlhkosť: "+data[0][2].hodnota+", Vonkajšia vlhkosť: "+data[0][3].hodnota+"";
        div2.innerHTML = "Pohyb úľa: "+proximity+", Váha: "+data[0][5].hodnota+", Batéria: "+data[0][6].hodnota;
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