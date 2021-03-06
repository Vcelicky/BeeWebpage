/**
 * Javascript file for Portal main page when Admin is logged in
 */

// loaded data for choose devices
var devicesMeasurements = {};

var users = {};

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

function deleteHive(deviceId, deviceName){
    var r = confirm("Naozaj chcete vymazať úľ s názvom "+deviceName+"?");
    if(r){
        var loc = window.location.origin;

        data = {
            'device_id' : deviceId
        };

        $.ajax({
            url: loc + '/BeeWebpage/public/admin/device',
            method : 'DELETE',
            dataType : 'json',
            data: JSON.stringify(data),
            headers : {
                'Content-Type' : 'application/json'
            }
        }).done(function () {
            window.location.assign(window.origin + "/BeeWebpage/public/portal");
        });
    }
}

function showGraph(e, deviceElement, deviceId) {
    var user_id = deviceElement.parentNode.parentNode.parentNode.parentNode.parentNode.id;
    if (typeof devicesMeasurements[ deviceId ] === "undefined") {
        devicesMeasurements[ deviceId ] = {};
    }
    devicesMeasurements[ deviceId ].user_id = user_id.split(/\./)[2];
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
        users = data.data;
        createUsers(users);
    });
}

function createUsers(data){
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
			<form action=\"\" method=\'POST\'><input type=\'hidden\' name=\'n\' value='+id+'><div class="pull-right" id="clear_button"><input value="Zmazať" onclick=\"return confirm(\'Naozaj chcete vymazať tohto používateľa?\')\" id="clear" style="color: black;background-color: white;" class="btn btn-secondary" type="submit"></div></form> \
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
    devicesMeasurements[ device ].from_date = fromTime;
    /*if (fromTime.length === 0) {
        from = new moment(new Date(toTime)).add(-3 , "days").format("YYYY-MM-DD");
        devicesMeasurements[ device ].from_date = from;
    }*/
    devicesMeasurements[ device ].to_date = toTime;

    var data = {
        'token' : getCookie('token'),
        'user_id' : parseInt(devicesMeasurements[device].user_id),
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

function createHiveHtml(id, name, location) {

    html = '<div class="col-12 col-lg-12">\
                <div class="card"> \
                    <div class="card-body"> \
                        <div class="clearfix margin-bottom-sm"> \
                            <div class="col-lg-2">\
                                <i class="fa fa-archive bg-flat-color-3 p-3 font-2xl mr-3 float-left text-light"></i> \
                                <div class="h5 text-secondary mb-0 mt-1">'+name+'</div> \
                                <div style="margin-bottom:20px" class="text-muted text-uppercase font-weight-bold font-xs small">'+location+'</div> \
                            </div>\
                            <div class="col-lg-8">\
                                <div id="measurement-'+id+'" class="text-muted text-uppercase font-xs small"></div> \n' +
    '                           <div id="measurement2-'+id+'" class="text-muted text-uppercase font-xs small"></div> \
                            </div>\
                            <div class="col-lg-2"> \
                                <div class="pull-right" id="clear_hive-'+id+'"><button type="button" id="clear" class="btn btn-primary"  onclick=\'deleteHive(\"'+id.toString()+'\", \"'+name.toString()+'\")\'><i class="fa fa-archive"></i>&nbsp; Zmazať</button></div>\
                            </div> \
                        </div> \
                        <hr>  \
                        <div id="'+id+'"class="more-info pt-2" style="margin-bottom:-10px;margin-top:20px;"> \
                            <a class="font-weight-bold font-xs btn-block text-muted small" href="/BeeWebpage/public/portal/'+id+'">Zobraziť namerané údaje</a> \
                            <a \
                                class="font-weight-bold font-xs btn-block text-muted small"\
                                href="#"\
                                onclick=\'showGraph(event, this, \"'+id.toString()+'\")\'>\
                                <i class="fa fa-caret-right"></i>\
                                Zobraziť grafy meraní\
                            </a>\
							<form id="form-id-'+name.toString()+'" class="font-weight-bold font-xs btn-block text-muted small" method="post" action="map">\
							<input type="hidden" name="device_name" value=\"'+name.toString()+'\">\
							<div onclick="document.getElementById(\'form-id-'+name.toString()+'\').submit();" style="cursor: pointer;"><i class="fa fa-map-marker"></i> Zobraziť mapu</div>\
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
                                           addNewDoubleChart(event, \"'+id.toString()+'\", 2, \"Vlhkosť\")\'\
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

$("#pocet").click(function() {
    sortCount();
});

$("#meno").click(function() {

    sortName();
});

/**
 * Called when select combobox is changed
 */
function orderClick() {
    var button = document.getElementById("pocet");
    if(button.classList.contains('active'))
        sortCount();
    else{
        button = document.getElementById("meno");
        if(button.classList.contains('active')) {
            sortName();
        }
    }
}

/**
 * Sort users by Device Count
 */
function sortCount(){
    var reverse = false;
    var order = document.getElementById("select-order");

    if(order.selectedIndex==0)
        reverse = false;
    else
        reverse = true;

    users.sort(compare(reverse, 'hive_count'));

    createUsers(users);
}

/**
 * Sourt users by name
 */
function sortName(){
    var reverse = false;
    var order = document.getElementById("select-order");

    if(order.selectedIndex==0)
        reverse = false;
    else
        reverse = true;

    users.sort(compare(reverse, 'name'));

    createUsers(users);
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