# OI-Validate

A lightweight client-side form validation library. Dependent on jQuery (for Javascript sugar) and Weavr (for error message styling). [View a demo here](http://opportunityintl.github.io/OI-Validate).

## Usage

You can initialize the library as a jQuery plugin or with plain Javascript:
```javascript
// jQuery
$([form selector]).validate(options);

// plain Javascript
var form = new Validator($([form selector]), options);
```

Out of the box, OI-Validate will validate required fields and email inputs. If the form fails validation, it will prevent the default form submit behavior and display error messages. If the form passes validation, the form will submit as usual. So, for example, to initialize the plugin on a form with no configuration:

```javascript
$('form').validate();
```

With some custom configurations:

```javascript
$('form').validate({
  onSuccess: function(form) {
    // we're going to submit this via AJAX
    $.ajax({
      // ajax stuff here
    });
    return false;
  }
})
```

## Options

Option | Type | Description
-------|------|------------
onInit | function(form) | Callback function called when form is initialized. Value of `this` is the Validator object, and the form element (as a jQuery object) is passed as the only parameter.
onSubmit | function(form) | Callback function called on submit before validations run. Value of `this` is the Validator object, and the form element (as a jQuery object) is passed as the only parameter. Return false from this callback to prevent validations from running (also prevents default form submit behavior).
onSuccess | function(form) | Callback function called on submit if form passes validations. Value of `this` is the Validator object, and the form element (as a jQuery object) is passed as the only parameter.
onError | function(form) | Callback function called on submit if form fails validations. Value of `this` is the Validator object, and the form element (as a jQuery object) is passed as the only parameter.
formValidations | array | Array of custom form validation objects (more on that later)
fieldValidations | array | Array of custom field validation objects (more on that later)
showProcessing | function(form) | Override the default function used to display the form processing indicator.
hideProcessing | function(form) | Override the default function used to hide the form processing indicator.
showAlert | function(message, classes) | Override the default function used to display the form alert message(s). The value of `this` is the form jQuery object.
hideAlert | function() | Override the default function used to hide the form alert message(s). The value of `this` is the form jQuery object.
formMessage | function(messages) | Override the default function used to generate the error message string for the form alert. Receives an array of the individual message strings. Must return a string.

## Custom validations

### Form validations
Custom validations can be defined on the field level or the form level. The structure for custom form validations is:

Key | Type | Description
----|------|------------
validation | function(form) | Function to execute to determine whether form validation passes or fails. Must return `true` or `false`. Value of `this` is the Validator object.
formMessage | string | Message to be displayed with error messages at the top of form (or wherever the form's alert is configured to display).

For a contrived example, let's pretend the form should only pass validation if the user's first and last name together contain 11 letters:

```javascript
{
  validation: function(form) {
    var name = form.find('#first_name').val() + form.find('#last_name').val();
    return name.length === 11;
  },
  formMessage: 'Your full name must contain 11 letters.'
}
```

### Field validations

For custom field validations, the structure is:

Key | Type | Description
----|------|------------
field | string | CSS-style (or jQuery) selector used to find the field (must be a child of the form element).
validation | function(field) | Function to execute to determine whether field validation passes or not. Must return `true` or `false`. Value of `this` is the form (as a jQuery object), and the field (as a jQuery object) is passed as the only parameter.
formMessage | string| Message to be displayed with error messages at the top of form (or wherever the form's alert is configured to display).
fieldMessage | string | Message to be displayed as error message below the field.

Let's say we want to validate the phone number to make sure it contains either 10 or 11 digits:

```javascript
{
  field: '#phone-number',
  validation: function(field) {
    var digits = field.val().replace(/[^0-9]/g,'');
    return digits.length >= 10 && digits.length <= 11;
  },
  formMessage: 'Enter a valid phone number.',
  fieldMessage: 'Must contain 10 or 11 digits'
}
```

Or, for something more complicated, let's say the zip code can only contain 4 digits if the users has selected Australia as their country, but for any other country we don't care how many digits it contains:

```javascript
{
  field: '#zip',
  validation: function(field) {
    var country = this.find('#country').val();
    var digits = field.val().replace(/[^0-9]/g,'');
    if (country === 'Australia') {
      return digits.length === 4;
    } else {
      return true;
    }
  },
  formMessage: 'Australia postal codes can only contain 4 digits.',
  fieldMessage: 'Can only contain 4 digits'
}
```

## Public methods

Method | Description
-------|------------
`validate()` | Validates entire form. Automatically called on form submit event. Returns `true` or `false`
`validateField(field)` | Validate a single field. Returns `true` or `false`.
`displayError(field, message)` | Display error message for a single field.
`hideError(field, message)` | Hide error message for a single field.
`displayErrors()` | Display error messages for whole form (including field errors).
`hideErrors()` | Hide error messages for whole form.
`alert(message, classes)` | Display alert message (used to display form errors). A string of classes can be specified that will be added to the alert. Within Weavr framework, this allows you to display it as an error, warning, notice, or success alert.
`hideAlert()` | Hide the alert.
`validateOnBlur(boolean)` | Set whether or not fields are validated on blur (or change) event.
`processing(boolean)` | Display or hide processing indicator.

## Public properties

Property | Description
---------|------------
form | The form element, as a jQuery object.
fields | A jQuery collection of all the fields that are designated to be validated.
errorMessages | Array of form error messages.
validations | Array of validation objects.
options | Object containing the options specified for this instance of the Validator.
