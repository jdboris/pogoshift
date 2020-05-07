function initializeCrudForm(form) {
    console.log(form);
    let buttonContainer = form.getElementsByClassName("crud-form-buttons")[0];
    let buttons = buttonContainer.getElementsByTagName("button");
    let editButton = buttonContainer.getElementsByClassName("edit-button")[0];
    let cancelButton = buttonContainer.getElementsByClassName("close-button")[0];
    let saveButton = buttonContainer.getElementsByClassName("save-button")[0];
    let inputs = form.querySelectorAll("input,textarea");

    form.classList.add("crud-form");

    // If not in edit mode
    if (!form.classList.contains("edit-mode")) {
        for (let input of inputs) {
            input.disabled = true;
        }
    }

    editButton.onclick = () => {
        form.classList.add("edit-mode");
        for (let input of inputs) {
            input.disabled = false;
        }
    }

    cancelButton.onclick = () => {
        form.classList.remove("edit-mode");
        for (let input of inputs) {
            input.disabled = true;
        }
    }

    for (let button of buttons) {
        button.classList.remove("d-none");
    }


    let $form = $(form);

    $form.validate({
        highlight: function (input) {
            $(input).parents('.form-line').addClass('error');
        },
        unhighlight: function (input) {
            $(input).parents('.form-line').removeClass('error');
        },
        errorPlacement: function (error, element) {
            $(element).parents('.input-group').append(error);
        }
    });

    $form.submit(function (e) {
        e.preventDefault();

        if (!$form.valid()) {
            return;
        }

        abp.ui.setBusy(
            $form,

            abp.ajax({
                contentType: 'application/x-www-form-urlencoded',
                url: $form.attr('action'),
                data: $form.serialize()
            })
        );
    });

    $form.find('input[type=text]:first-child').focus();
}