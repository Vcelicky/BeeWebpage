window.onload = function() {
  var footer = $('#footer-bottom');
  if ((screen.height - $("body").height() - footer.height()) < 10) {
  	footer.css("position", "relative");
  }
};

$("#login_button").click(function () {
    var loginForm = document.getElementById("login");
    var email = loginForm["0"].value;
    var pass = loginForm["1"].value;

    data = {
        email: email,
        password : pass

    };
    $.ajax({
        url: '../src/login.php',
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
}