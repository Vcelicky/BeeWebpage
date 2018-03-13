window.onload = function() {
  var footer = $('#footer-bottom');
  if ((screen.height - $("body").height() - footer.height()) < 10) {
  	footer.css("position", "relative");
  }

  // set user name to menu

  var user_element = document.getElementById('logged-in-user');
  var user_name = getCookie('user_name');

  if ((user_element != null) && (user_name != null)) {
      user_element.innerText = user_name;
  }
  

};

$("#log_out_button").click(function() {
    deleteCookie("token");
    deleteCookie("user_name");
    deleteCookie("user_id");
    window.location.assign(window.origin + "/BeeWebpage/public");

})

$("#login_button").click(function () {
    var loginForm = document.getElementById("login");
    var email = loginForm["0"].value;
    var pass = loginForm["1"].value;
    var actualURL = window.location.host;

    data = {
        email: email,
        password : pass

    };
    $.ajax({
        url: 'https://team20-17.studenti.fiit.stuba.sk/BeeWebpage/public/login/user',
        // url: 'login/user',
        method : 'POST',
        dataType : 'json',
        data : data
    })
        .done(function (data) {
            alterLogin(data);
        });

});

// alert response after user tried to login to the site
function alterLogin(data) {
    if (data.error) {
        $("#ModalLoginForm .modal-header").append("<div class=\"alert alert-danger\">\n" +
            "  <strong>Chyba!</strong> " + data.error_msg + "\n" +
            "</div>");

        setTimeout(function(){
            var alert = $("#ModalLoginForm .modal-header .alert");
            alert.fadeOut();
            alert.remove();
        }, 5000);
    }
    else {
        setCookie('token', data.token, 1);
        setCookie('user_name', data.user.name, 1);
        setCookie('user_id', data.id, 1);
         window.location.assign(window.origin + "/BeeWebpage/public/portal");
    }
}

function getDevices() {
    var actualURL = window.location.href;
    $.ajax({
        url: actualURL + 'db/devices ',
        method : 'POST',
        dataType : 'json',
        data : {
            'token' : getCookie('token'),
            'user_id' : getCookie('user_id')
        },
        headers : {
            'Content-Type' : 'application/json'
        }
    }).done(function (data) {
        generateDevicesContent(data);
    });
}

function generateDevicesContent(devices) {

}

// delete cookie

function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// set cookie
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// get cookie
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