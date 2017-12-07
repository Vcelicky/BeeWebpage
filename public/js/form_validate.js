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
            highlight: function(element) {
                $(element).closest('.form-group').removeClass('success').addClass('error');
            },
            success: function(element) {
                element
                    .text('OK!').addClass('valid')
                    .closest('.form-group').removeClass('error').addClass('success');
            },
            submitHandler:function(){
                var registerForm = document.getElementById("register");
                var name = registerForm["0"].value;
                var email = registerForm["1"].value;
                var password = registerForm["3"].value;

                data = {
                    email : email,
                    password : password,
                    name : name

                };
                $.ajax({
                    url: '../src/register.php',
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
            $("<div class= \"alert alert-danger\">\n" +
                "<strong>Chyba!</strong>" + data.error_msg + "\n" +
                "</div>").insertBefore(".register-panel .panel-body");

            $('html, body').animate({
                scrollTop: $(".register-panel").offset().top
            }, 1000);

            setTimeout(function(){
            var alert = $(".register-panel .alert");
            alert.fadeOut();
            alert.remove();
            }, 5000);
        }
        else {
            // home utl
            location.href='/public';
        }
    }

    $.validator.addMethod("emailvalidation",
        function(value, element) {
            var pattern = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

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
        minlength: jQuery.validator.format("Prosím zadajte minimálne {0} znakov.")
    });

});
