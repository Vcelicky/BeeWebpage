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
            }

});

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