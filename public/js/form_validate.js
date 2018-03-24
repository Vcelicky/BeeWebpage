// actual url this variable is used fo acomplished compatibility between localhosts and server
var actualURL = window.location.origin + "/BeeWebpage/public";
$(document).ready(function(){

    $('#register').validate(
        {
            rules: {
                signupName: {
                    required: true,
                    minlength: 4
                },
                signupEmail: {
                    required: true,
                    emailvalidation: true
                },
                signupEmailagain : {
                    required: true,
                    emailvalidation: true,
                    sameEmail: true
                },
                signupTelnumber: {
                    required: true,
                    phonevalidation: true
                },
                signupPassword: {
                    required: true,
                    minlength: 8
                },
                signupPasswordagain: {
                    required: true,
                    minlength: 8,
                    samePass: true
                }

            },
            //successful validation
            unhighlight: function(element) {
                const id = element.id;
                $('label[for="' + id + '"]').removeClass('text-danger').addClass("col-form-label text-success");
                $(element).removeClass('is-invalid').addClass("form-control is-valid");
            },
            // error validation
            highlight: function(element) {
                console.log("NOW");
                console.log(element.id);
                const id = element.id;
                $('label[for="' + id + '"]').removeClass('text-success').addClass("col-form-label text-danger");
                $(element).removeClass('is-valid').addClass("form-control is-invalid");
            },
            submitHandler:function(){
                var registerForm = document.getElementById("register");

                var data = {
                    email : registerForm["1"].value,
                    password : registerForm["4"].value,
                    name : registerForm["0"].value,
                    phone : registerForm["3"].value

                };
                $.ajax({
                    url: actualURL + '/register/user',
                    method : 'POST',
                    dataType : 'json',
                    data : data
                })
                    .done(function (data) {
                        alterRegister(data);
                    });
            }

});

    // take care of error message and for successful registration
    function alterRegister(data) {
        if (data.error) {
            /**
             * @param {{error_msg:string}} data
             */
            $("<div class= \"alert alert-danger\">\n" +
                "<strong>Chyba!</strong>" + data.error_msg + "\n" +
                "</div>").insertBefore("#register");

            $('html, body').animate({
                scrollTop: $("#register").offset().top
            }, 1000);

            setTimeout(function(){
            var alert = $("#register .alert");
            alert.fadeOut();
            alert.remove();
            }, 5000);
        }
        else {
            $("<div class= \"alert alert-success\">\n" +
                "Registrácia prebehla úspešne\n" +
                "</div>").insertBefore("#register");

            $('html, body').animate({
                scrollTop: $("#register").offset().top
            }, 1000);

            window.setTimeout("location=(window.origin + \"/BeeWebpage/public\");",5000);
        }
    }

    $.validator.addMethod("emailvalidation",
        function(value, element) {
            var pattern = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

            return $.trim(value).match(pattern) ? true : false;
        }
    );

    $.validator.addMethod("phonevalidation",
        function(value, element) {
            var pattern = /^\+[0-9]{3}\s*[0-9]{3}\s*[0-9]{3}\s*[0-9]{3}$/;

            return $.trim(value).match(pattern) ? true : false;
        }
    );

    $.validator.addMethod("sameEmail",
        function (value, element) {
            var first = $("#signupEmail").val();
            return value === first;
        }
    );

    $.validator.addMethod("samePass",
        function (value, element) {
            var first = $("#signupPassword").val();
            return value === first;
        }
    );

    jQuery.extend(jQuery.validator.messages, {
        required: "Toto pole je povinné",
        sameEmail: "Prosím zadajte rovnaký email",
        samePass: "Prosím zadajte rovnaké heslo",
        email: "Prosím zadajte email v korektnom stave.",
        phonevalidation: "Prosim zadajte telefonne cislo v korektnom tvare",
        minlength: jQuery.validator.format("Prosím zadajte minimálne {0} znakov.")
    });

});
