(function () {
    var _$form = $('#RegisterForm');

    $.validator.addMethod("customUsername", function (value, element) {
        if (value === _$form.find('input[name="EmailAddress"]').val()) {
            return true;
        }

        //Username can not be an email address (except the email address entered)
        return !$.validator.methods.email.apply(this, arguments);
    }, abp.localization.localize("RegisterFormUserNameInvalidMessage", "pogoshift"));

    _$form.validate({
        rules: {
            UserName: {
                required: true,
                customUsername: true
            }
        }
    });

    _$form.submit(function (e) {
        e.preventDefault();

        if (!_$form.valid()) {
            return;
        }

        abp.ui.setBusy(
            $('body'),

            abp.ajax({
                contentType: 'application/x-www-form-urlencoded',
                url: _$form.attr('action'),
                data: _$form.serialize(),
                error: (data) => {
                    
                    if (data.validationErrors) {
                        for (let error of data.validationErrors) {
                            for (let member of error.members) {
                                // Capitalize first letter
                                let name = member.charAt(0).toUpperCase() + member.slice(1);

                                let input = document.querySelector(`[name='${name}']`);

                                if (input) {
                                    _$form;
                                    input.classList.add("is-invalid");
                                    let group = input.closest(".input-group");
                                    let errorElement = $(group).next(`.validation-error`);

                                    if (errorElement.length == 0) {
                                        errorElement = $(`<p id="BirthDate-error" class="validation-error text-danger">This field is required.</p>`);
                                        $(group).after(errorElement);
                                    }
                                    errorElement[0].innerHTML = error.message;
                                    errorElement[0].style.display = null;
                                }
                            }
                        }
                    }
                }
            })
        );
    });
})();
