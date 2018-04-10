/**
 * Javascript file for Portal main page when Admin is logged in
 */

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

function checkSize(){

    if (window.innerWidth < 576) {
        $(".chart-space").width("auto");
        $(".chart-space-arrow-left")
            .css("left", "0px")
            .css("bottom", "unset");
        $(".chart-space-arrow-right")
            .css("right", "0px")
            .css("left", "unset")
            .css("bottom", "unset");
    }
    else {
        $(".chart-space").width("width: 50vw");
        var width = Math.round($(".chart-space-arrow-left").width());
        $(".chart-space-arrow-left").css("left", "-" + width + "px");
        $(".chart-space-arrow-right")
            .css("right", "-" + width + "px")
            .css("left", "unset");
    }
}

function showGraph(deviceElement, deviceId) {
    var user_id = deviceElement.parentNode.parentNode.parentNode.parentNode.parentNode.id;
    devicesMeasurements[ deviceId ].user_id = user_id.split(/\./)[2];
    if (deviceElement.childNodes[1].className === "fa fa-caret-right") {
        deviceElement.childNodes[1].className = "fa fa-caret-down";
        console.log(document.getElementById("chart-section-" + deviceId).getElementsByTagName("canvas"));
        document.getElementById("chart-section-" + deviceId).className = "d-block";
        if (document.getElementById("chart-" + deviceId.toString()).className.length === 0) {
            getDeviceData(deviceId, '', devicesMeasurements[ deviceId ].actual_time);
            while (typeof devicesMeasurements[ deviceId ] === "undefined");
            addNewDoubleChart(deviceId, 1, "Teplota");
        }
    }
    else {
        deviceElement.childNodes[1].className = "fa fa-caret-right";
        document.getElementById("chart-section-" + deviceId).className = "d-none";
    }
}

function addNewChart(device, type, title) {
    var ctx = document.getElementById("chart-" + device);
    amountOfData = devicesMeasurements[ device ].data.length;
    if (amountOfData > 0) {
        graphData = [];
        step = amountOfData;
        if (graphStep <= amountOfData) {
            step = graphStep;
        }
        for (i =0; i < step; i++) {
            graphData.push({
                x : new moment(new Date(devicesMeasurements[ device ].data[i][0].cas.toString())),
                y : devicesMeasurements[ device ].data[i][type].hodnota
            });
        }
        if (graphData.length > 0) {
            devicesMeasurements[ device ].chart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label : title,
                        data: graphData,
                        borderColor: "#3e95cd",
                        fill: false
                    }]
                },
                options: {
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
    checkSize();
}

function addNewDoubleChart(device, type, title) {
    var ctx = document.getElementById("chart-" + device);
    amountOfData = devicesMeasurements[ device ].data.length;
    if (amountOfData > 0) {
        graphData1 = [];
        graphData2 = [];
        labels = [];
        step = amountOfData;
        if (graphStep <= amountOfData) {
            step = graphStep;
        }
        for (i =0; i < step; i++) {
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
            devicesMeasurements[ device ].chart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label : title + " vonku",
                        data: graphData1,
                        borderColor: "#3e95cd",
                        fill: false
                    },
                        {
                            label : title + " vnútri",
                            data: graphData2,
                            borderColor: "#3e95cd",
                            fill: false
                        }]
                },
                options: {
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
    checkSize();
}

function updateChartData(device, way) {
    var get = true;
    localStep = graphStep;
    var graphData1 = [];
    var graphData2 = [];
    while (get) {
        var amountOfData = devicesMeasurements[ device ].data.length;
        if (amountOfData > 0) {
            step = amountOfData;
            dif = devicesMeasurements[ device ].actual_index + (localStep * way);
            if (dif > amountOfData){

                dif -=amountOfData;
                for (i = devicesMeasurements[ device ].actual_index; i < dif; i++) {
                    graphData1.push({
                        x: new moment(new Date(devicesMeasurements[device].data[i][0].cas.toString())),
                        y: devicesMeasurements[device].data[i][type - 1].hodnota
                    });

                    graphData2.push({
                        x: new moment(new Date(devicesMeasurements[device].data[i][0].cas.toString())),
                        y: devicesMeasurements[device].data[i][type].hodnota
                    });
                }
                localStep -= dif;
            }

            if (dif < 0) {
                dif+= localStep;
                for (i = devicesMeasurements[ device ].actual_index; i < dif; i++) {
                    graphData1.push({
                        x: new moment(new Date(devicesMeasurements[device].data[i][0].cas.toString())),
                        y: devicesMeasurements[device].data[i][type - 1].hodnota
                    });

                    graphData2.push({
                        x: new moment(new Date(devicesMeasurements[device].data[i][0].cas.toString())),
                        y: devicesMeasurements[device].data[i][type].hodnota
                    });
                }

                localStep -= dif;
            }

            if (dif != 0) {
                if (way > 0) {
                    getDeviceData(device, devicesMeasurements[ device ].to_date, new moment(new Date(devicesMeasurements[ device ].to_date)).add(1, "days").format("YYYY-MM-DD"));
                    devicesMeasurements[ device ].actual_index = dif;
                }
                else {
                    getDeviceData(device, '',devicesMeasurements[ device ].from_date);
                    devicesMeasurements[ device ].actual_index = devicesMeasurements.data.length - dif;
                }

            }
            else {
                get = false;
            }
        }
    }

    devicesMeasurements[ device ].chart.data.datasets = [{
        label : title + " vonku",
        data: graphData1,
        borderColor: "#3e95cd",
        fill: false
    },
        {
            label : title + " vnútri",
            data: graphData2,
            borderColor: "#3e95cd",
            fill: false
        }];

    devicesMeasurements[ device ].chart.update({
        duration : 1200
    })
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
			<form action=\"\" method=\'POST\'><input type=\'hidden\' name=\'n\' value='+id+'><div class="pull-right" id="clear_button"><input value="Zmazať" id="clear" style="color: black;background-color: white;" type="submit"></div></form> \
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

function getDeviceData(device, fromTime, toTime) {
    if (typeof devicesMeasurements[ device ] === "undefined") {
        devicesMeasurements[ device ] = {};
    }
    var from = "";
    if (fromTime.length === 0) {
        from = new moment(new Date(toTime)).add(-3 , "days").format("YYYY-MM-DD");
        devicesMeasurements.from_date = from;
    }
    devicesMeasurements.to_date = toTime;

    var data = {
        'token' : getCookie('token'),
        'user_id' : parseInt(devicesMeasurements[device].user_id),
        'device_id' : device,
        'from' : from,
        'to' : toTime
    };

    $.ajax({
        url: window.location.origin + '/BeeWebpage/public/user/measurements',
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
        if (data.data.length > 0) {
            if (typeof devicesMeasurements[ id ] === "undefined") {
                devicesMeasurements[ id ] = {};
            }
            devicesMeasurements[ id ].actual_time = data.data[0][0].cas;
        }
        createMeasurementHtml(data, id);
    });
}

function createHiveHtml(id, name, location){

    html = '<div class="col-12 col-lg-12">\
                <div class="card"> \
                    <div class="card-body"> \
                        <div class="clearfix margin-bottom-sm"> \
                            <div class="col-lg-2">\
                                <i class="fa fa-archive bg-flat-color-3 p-3 font-2xl mr-3 float-left text-light"></i> \
                                <div class="h5 text-secondary mb-0 mt-1">'+name+'</div> \
                                <div style="margin-bottom:20px" class="text-muted text-uppercase font-weight-bold font-xs small">'+location+'</div> \
                            </div>\
                            <div class="col-lg-10">\
                                <div id="measurement-'+id+'" class="text-muted text-uppercase font-xs small"></div> \n' +
        '       <div id="measurement2-'+id+'" class="text-muted text-uppercase font-xs small"></div> \
                            </div>\
                        </div> \
                        <hr>  \
                        <div id="'+id+'"class="more-info pt-2" style="margin-bottom:-10px;"> \
                            <a class="font-weight-bold font-xs btn-block text-muted small" href="/BeeWebpage/public/portal/'+id+'">Zobraziť namerané údaje</a> \
                            <a \
                                class="font-weight-bold font-xs btn-block text-muted small"\
                                href="#"\
                                onclick=\'showGraph(this, \"'+id.toString()+'\")\'>\
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
                                           addNewDoubleChart(\"'+id.toString()+'\", 1, \"Teplota\", 2)\'\
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
                                           addNewDoubleChart(\"'+id.toString()+'\", 2, \"Vlhkosť\")\'\
                            >Vlhkosť</a>\
                        </li> \
                        <li class="nav-item">\
                            <a\
                                class="nav-link" \
                                href="#" \
                                onclick=\' var tabs = $(this)[0].parentElement.parentElement.childNodes;\
                                           for(i=1; i< tabs.length; i+=2) {tabs[i].children[0].className = "nav-link";}\
                                           this.className = \"nav-link active\";\
                                           document.getElementById(\"graph-title-' + id +'\", 1).textContent = \"Hmotnost\";\
                                           addNewChart(\"'+id.toString()+'\", 5, \"Hmotnosť\")\'\
                            >Hmotnost</a>\
                        </li> \
                        <li class="nav-item">\
                            <a\
                                class="nav-link" \
                                href="#" \
                                onclick=\' var tabs = $(this)[0].parentElement.parentElement.childNodes;\
                                           for(i=1; i< tabs.length; i+=2) {tabs[i].children[0].className = "nav-link";}\
                                           this.className = \"nav-link active\";\
                                           document.getElementById(\"graph-title-' + id +'\").textContent = \"Batéria\";\
                                           addNewChart(\"'+id.toString()+'\", 6, \"Batéria\")\'\
                            >Batéria</a>\
                        </li> \
                    </ul> \
                    <div class="chart-space"> \
                        <a class="carousel-control-prev chart-space-arrow-left" onclick=\'updateChartData(\"'+id+'\", -1)\' href="#" role="button" data-slide="prev"> \
                            <span class="ti-arrow-left arrow" aria-hidden="true"></span> \
                        </a> \
                        <a class="carousel-control-prev chart-space-arrow-right" onclick=\'updateChartData(\"'+id+'\", 1)\' href="#" role="button" data-slide="prev"> \
                            <span class="ti-arrow-right arrow" aria-hidden="true"></span> \
                        </a> \
                        <h4 id="graph-title-' + id + '" class="mb-3">Teplota</h4> \
                        <canvas id="chart-' + id + '"></canvas> \
                    </div> \
                </div>\
            </div>';
    return html;
}

//Create measurement Html for device
function createMeasurementHtml(result, id){
    var data = result.data;

    console.log(data[0]);

    var div = document.getElementById('measurement-'+id);
    var div2 = document.getElementById('measurement2-'+id);

    proximity = "Neprevrátený";
    if(data[0][4].hodnota =='true'){
        proximity='<span class="text-danger">Prevrátený</span>';
    }

    div.innerHTML = "Vnútorná teplota: "+data[0][0].hodnota+", Vonkajšia teplota: "+data[0][1].hodnota+", Vnútorná vlhkosť: "+data[0][2].hodnota+", Vonkajšia vlhkosť: "+data[0][3].hodnota+"";
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