//Javascript file for main portal page only

// loaded data for choose devices
var devicesMeasurements = {};
var hives = {};

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


$("#nazov").click(function() {
    document.getElementById("select-measurement").style.display = "none";

   sortName();
});

$("#lokacia").click(function() {
    document.getElementById("select-measurement").style.display = "none";

    sortLocation();
});

$("#meranie").click(function() {
    document.getElementById("select-measurement").style.display = "block";

    sortMeranie();
});

function orderClick(){
    var button = document.getElementById("nazov");
    if(button.classList.contains('active'))
       sortName();
    else{
        button = document.getElementById("lokacia");
        if(button.classList.contains('active')) {
            sortLocation();
        }
        else{
            var button = document.getElementById("meranie");
            if(button.classList.contains('active'))
            {
                sortMeranie();
            }
        }
    }
}

function measurementClick(){
    sortMeranie();
}

/**
 * Function called when Measurement Type combobox value is changed
 */
function sortMeranie(){

    var reverse = false;
    var order = document.getElementById("select-order");
    if(order.selectedIndex==0)
        reverse = false;
    else
        reverse = true;

    var order = document.getElementById("select-measurement");


    if(order.selectedIndex==0)
        hives.sort(compare(reverse, 'IT'));
    else if(order.selectedIndex==1)
        hives.sort(compare(reverse, 'OT'));
    else if(order.selectedIndex==2)
        hives.sort(compare(reverse, 'IH'));
    else if(order.selectedIndex==3)
        hives.sort(compare(reverse, 'OH'));
    else if(order.selectedIndex==4)
        hives.sort(compare(reverse, 'W'))
    else if(order.selectedIndex==5)
        hives.sort(compare(reverse, 'B'));
    else if(order.selectedIndex==6)
        hives.sort(compare(reverse, 'P'));

    createHives(hives);
}

/**
 * Sorts devices by location
 */
function sortLocation(){
    var reverse = false;
    var order = document.getElementById("select-order");

    if(order.selectedIndex==0)
        reverse = false;
    else
        reverse = true;

    hives.sort(compare(reverse, 'location'));

    createHives(hives);
}

/**
 * Sorts devices by name
 */
function sortName(){
    var reverse = false;
    var order = document.getElementById("select-order");
    if(order.selectedIndex==0)
        reverse = false;
    else
        reverse = true;

    hives.sort(compare(reverse, 'uf_name'));
    createHives(hives);
}

/**
 * Function used for ordering array
 * @param reverse
 * @param parameter - Array parameter to order by
 * @returns {Function}
 */
function compare(reverse, parameter) {
    return function (a, b) {
        if (removeAccents(a[parameter]) < removeAccents(b[parameter]))
            if(!reverse)
                return -1;
            else
                return 1;
        if (removeAccents(a[parameter]) > removeAccents(b[parameter]))
            if(!reverse)
                return 1;
            else
                return -1;
        return 0;
    }
}

/**
 * Removes Slovak Accents from Strings to allow correct order
 * @param str
 * @returns {string}
 */
function removeAccents(str) {
    var accents    = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇČçčÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
    var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCCccDIIIIiiiiUUUUuuuuNnSsYyyZz";
    str = str.split('');
    var strLen = str.length;
    var i, x;
    for (i = 0; i < strLen; i++) {
        if ((x = accents.indexOf(str[i])) != -1) {
            str[i] = accentsOut[x];
        }
    }
    return str.join('');
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
        hives = data.data;
        createHives(hives);
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
                        devicesMeasurements[ device ].actual_index = dif;
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

function ajaxGetMeasurement(id, index) {
    var loc = window.location.origin;

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
        createMeasurementHtml(data, id, index);
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

        hive_item.parentElement.parentElement.childNodes[3].childNodes[3].childNodes[1].childNodes[1].checked = data.data.sms_not == "f" ? false : true;
        hive_item.parentElement.parentElement.childNodes[3].childNodes[5].childNodes[1].childNodes[1].checked = data.data.email_not == "f" ? false : true;
    });
}

function setDeviceNotification(device, type, value) {
    var loc = window.location.origin;

    data = {
        'token' : getCookie('token'),
        'user_id' : getCookie('user_id'),
        'device_id' : device,
        'type' : type,
        'value' : value
    };

    $.ajax({
        url: loc + '/BeeWebpage/public/user/device/notifications/set',
        method : 'POST',
        data : JSON.stringify(data),
        dataType:'json',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
    });
}

function createHives(hives){
    var div = document.getElementById('div.hives');
    div.innerHTML = "";

    //Foreach Hive
    for (index = 0; index < hives.length; ++index) {
        div.innerHTML += createHiveHtml(hives[index].device_id,hives[index].uf_name, hives[index].location);
        ajaxGetMeasurement(hives[index].device_id, index);
    }

    //Set notifications for each device
    for (index = 0; index < hives.length; ++index) {
        ajaxGetDeviceNotifications(hives[index].device_id);
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
                            <div class="col-lg-4" > \
                                <label class="notifications-label">Notifikácie</label> \
                                <div class="form-check checkbox-slider--b"> \
                                    <label class="switch switch-3d switch-success mr-3"> \
                                        <input type="checkbox"  class="switch-input" onchange=\'setDeviceNotification(\"'+id.toString()+'\", "sms", this.checked)\'><span class="switch-label"></span> <span class="switch-handle"></span>\
                                    </label> \
                                    <span>SMS</span>\
                                </div> \
                                <div class="form-check checkbox-slider--b"> \
                                    <label class="switch switch-3d switch-success mr-3"> \
                                        <input type="checkbox" class="switch-input" onchange=\'setDeviceNotification(\"'+id.toString()+'\", "email", this.checked)\'><span class="switch-label"></span> <span class="switch-handle"></span>\
                                    </label> \
                                    <span>E-mail</span>\
                                </div> \
                        </div> \
                         <div class="col-lg-8"> \
                            <div id="measurement-'+id+'" class="text-muted text-uppercase font-xs small"></div> \
                            <div id="measurement2-'+id+'" class="text-muted text-uppercase font-xs small"></div> \
                        </div>\
                        <hr>  \
                        <div id="'+id+'"class="more-info pt-2 col-lg-12" style="margin-bottom:-10px;"> \
                            <a class="font-weight-bold font-xs btn-block text-muted small" href="/BeeWebpage/public/portal/'+id+'">Zobraziť namerané údaje</a> \
                            <a \
                                class="font-weight-bold font-xs btn-block text-muted small"\
                                href="#"\
                                onclick=\'showGraph(event, this, \"'+id.toString()+'\")\'>\
                                <i class="fa fa-caret-right"></i>\
                                Zobraziť grafy meraní\
                            </a>\
							<form id="form-id" class="font-weight-bold font-xs btn-block text-muted small" method="post" action="map_user">\
							<input type="hidden" name="device_name" value=\"'+name.toString()+'\">\
							<div onclick="document.getElementById(\'form-id\').submit();" style="cursor: pointer;"><i class="fa fa-map-marker"></i> Zobraziť mapu</div>\
							</form>\
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
function createMeasurementHtml(result, id, index){
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

        //Pre ordering:
        hives[index].IT = data[0][0].hodnota;
        hives[index].OT = data[0][1].hodnota;
        hives[index].IH = data[0][2].hodnota;
        hives[index].OH = data[0][3].hodnota;
        hives[index].P = data[0][4].hodnota;
        hives[index].W = data[0][5].hodnota;
        hives[index].B = data[0][6].hodnota;
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