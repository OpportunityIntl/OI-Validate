(function($) {
  $.fn.validate = function(options) {
    return this.each(function() {
      new Validator($(this), options);
    });
  };
}(jQuery));

var Validator = function(form, options) {
  var _this = this;
  
  this.options = $.extend({
    onInit: function() {},
    onSubmit: function() {},
    onError: function() {},
    onSuccess: function() {},
    showProcessing: showProcessing,
    hideProcessing: hideProcessing,
    formValidations: [],
    fieldValidations: [],
    showAlert: showAlert,
    hideAlert: hideAlert
  }, options);
  
  this.validations = [
    {
      field: 'input[type!="radio"][required], select[required], textarea[required]',
      validation: function(field) {
        return field.val() !== '';
      },
      fieldMessage: 'Required field',
      formMessage: 'Please fill out missing fields'
    },
    {
      field: 'input[type="email"]',
      validation: function(field) {
        var re = /^[0-9a-zA-Z][-.+_a-zA-Z0-9]*@([0-9a-zA-Z][-._0-9a-zA-Z]*\.)+[a-zA-Z]{2,6}$/;
        return re.test(field.val());
      },
      fieldMessage: 'Invalid email address',
      formMessage: 'Please enter valid email address'
    }
  ];
  
  /**** Public attributes ****/
  
  this.form = $(form);
  this.fields = $();
  this.errorMessages = [];
  
  /**** Public methods ****/
  
  // validate the whole form
  this.validate = function() {
    // start error counter at 0
    var errors = 0;
    
    // validate each field and increase error counter if validation fails
    _this.fields.each(function() {
      if (!_this.validateField($(this))) errors++;
    });
    
    // run custom form validations
    $.each(_this.options.formValidations, function(index, item) {
      if (!item.validation.call(_this, _this.form)) {
        if (item.formMessage) _this.errorMessages.push(item.formMessage);
        errors++;
      }
    });
    
    // return true or false
    return (errors > 0) ? false : true;
  };
  
  // validate a single field
  this.validateField = function(field) {
    // get plugin data for this field
    var data = getData(field);
    
    // start by assuming field is valid
    var validity = true;
    
    // if field has data, run through its validations
    if (data) {
      $.each(data.validations, function(index, item) {
        if (!item.validation.call(_this.form, field)) {
          // field failed this validation
          
          // display field error  
          if (item.fieldMessage) {
            
            if (data.errorMessages.indexOf(item.fieldMessage) === -1) {
              data.errorMessages.push(item.fieldMessage);
              setData(field, data);
              
              _this.displayError(field, item.fieldMessage);
            }
          }
          
          // add message for alert
          if (item.formMessage) _this.errorMessages.push(item.formMessage);
          
          // set validity to false (we'll return this value at the end)
          validity = false;
        } else {
          // field passed this validation
          
          // remove error from field data
          var errorIndex = data.errorMessages.indexOf(item.fieldMessage);
          if (errorIndex !== -1) {
            data.errorMessages.splice(data.errorMessages.indexOf(item.fieldMessage), 1);
            setData(field, data);
            
            // hide field error
            _this.hideError(field, item.fieldMessage);
          }
          
          // set validity to true
          validity = true;
        }
      });
    }
    
    return validity;
  };
  
  // display error message on field
  this.displayError = function(field, message) {
    // get plugin data for this field
    var data = getData(field);
    
    // create new element for error message
    var errorMessage = $('<div>', {class: 'error-message', style: 'display: none'});
    
    // set content for error message
    errorMessage.html(message);
    
    // insert error message after field
    data.element.after(errorMessage);
    
    // show error message
    errorMessage.slideDown(500);
    
    // add error class to field
    data.element.addClass('error');
  };
  
  // hide error message on field
  this.hideError = function(field, error) {
    var data = getData($(field));
    
    // get error message object (it's a sibling of the field)
    var errorIndex = data.errorMessages.indexOf(error);
    var errorMessage = data.element.siblings('.error-message:contains("' + error + '")');
    
    // remove error message
    errorMessage.slideUp(500, function() {
      errorMessage.remove();
    });
    
    // remove error class from field
    data.element.removeClass('error');
  };
  
  // display error message for whole form
  this.displayErrors = function() {
    // filter error messages to remove duplicates
    var uniqueMessages = _this.errorMessages.reduce(function(previousValue, currentValue){
      if (previousValue.indexOf(currentValue) < 0 ) previousValue.push(currentValue);
      return previousValue;
    },[]);
    
    // generate alert message string
    var message = "<p><strong>Looks like there are some problems with the highlighted fields. Please address the following errors:</strong></p>";
    message += "<ul>";
    $.each(uniqueMessages, function(index, errorMessage) {
      message += "<li>" + errorMessage + "</li>";
    });
    message += "</ul>";
    
    // show alert
    _this.alert(message);
  };
  
  // show alert
  this.alert = function(message, classes) {    
    // run callback function
    _this.options.showAlert.call(_this.form, message, classes);
  };
  
  this.hideAlert = function() {
    _this.options.hideAlert.call(_this.form);
  };
  
  // hide error message for whole form
  this.hideErrors = function() {
    _this.hideAlert();
    
    // empty error messages array
    _this.errorMessages = [];
    
    // hide field errors
    _this.fields.each(function(index, field) {
      var data = getData(field);
      
      $.each(data.errorMessages, function(index, error) {
        _this.hideError($(field), error);
        data.errorMessages.splice(index, 1);
        
        setData($(field), data);
      });
    });
  };
  
  // enable/disable instant field validation
  this.validateOnBlur = function(boolean) {
    if (boolean) {
      _this.fields.on('blur.validate change.validate', function() {
        _this.validateField($(this));
      });
    } else {
      _this.fields.off('blur.validate change.validate');
    }
  };
  
  // add a single field to the list of fields to be validated
  this.addField = function(field) {
    // add field
    _this.fields = _this.fields.add(field);
  };
  
  this.processing = function(boolean) {
    if (boolean) {
      _this.options.showProcessing.call(_this, _this.form);
    } else {
      _this.options.hideProcessing.call(_this, _this.form);
    }
  };
  
  /**** Private methods ****/
  
  // special validation for radio buttons
  function validateRadio(field) {
    
  }
  
  // special validation for checkboxes
  function validateCheckbox(field) {
    
  }
  
  // get plugin data for a field
  function getData(field) {
    // get data stored by jQuery in 'oi-validate'
    var data = $(field).data('oi-validate');
    
    // if there's any data, return it
    // otherwise return false
    if (data) {
      return data;
    } else {
      return false;
    }
  }
  
  // set plugin data for a field
  function setData(field, newData) {
    // get existing data for field, if any
    var existingData = getData($(field)) || {};
    
    // extend existing data with new data
    data = $.extend(existingData, newData);
    
    // save data to field via jQuery
    $(field).data('oi-validate', data);
  }
  
  function setupValidation(field, validation) {
    var data = getData(field) || {
      validations: [],
      element: $(field),
      errorMessages: []
    };
    
    data.validations.push(validation);
    
    // if field is a select input, set "element" to its parent div
    // (this is specific to how select inputs are styled in Weavr)
    if ($(field).is('select')) {
      data.element = $(field).parents('.select');
    }
    
    // set this data for the field
    setData($(field), data);
  }
  
  // setup validations for a field
  function setupValidations() {
    // extend default validations with custom field validations
    $.each(_this.options.fieldValidations, function(index, validation) {
      _this.validations.push(validation);
    });
    
    // set up fields and validation data for each validation
    $.each(_this.validations, function(index, validation) {
      $(_this.form.find(validation.field)).each(function(index, field) {
        if ($(this).length > 0) {
          _this.addField($(this));
          setupValidation($(field), validation);
        }
      });
    });
  }
  
  // add validation to a field
  function addValidation(field, validation) {
    var data = getData(field) || {};
    data.validations.push(validation);
    setData(field, data);
  }
  
  // default callback to show alert
  function showAlert(message, classes) {
    // create alert div, or empty it if it already exists
    var alert = $(this).find('.alert');
    
    // if alert already exists, remove it
    if (alert.length > 0) {
      alert.remove();
    }
    
    // create alert element
    alert = $('<div>', {class: 'alert ' + (classes ? classes : 'error'), style: "display: none"});
    
    // prepend alert to form
    $(this).prepend(alert);
    
    // set alert content
    alert.html(message);
    
    alert.slideDown(500);
  }
  
  // default callback to hide alert
  function hideAlert() {
    var alert = $(this).find('.alert');
    alert.slideUp(500, function() {
      alert.remove();
    });
  }
  
  // default callback to show processing indicator
  function showProcessing(form) {
    var submitButton = form.find('input[type="submit"]');
    var processingButton = $('<button>', {type: 'button', id: 'processing-btn', class: submitButton.attr('class'), disabled: true});
    processingButton.html('Processing...');
    submitButton.hide();
    submitButton.after(processingButton);
  }
  
  // default callback to hide processing indicator
  function hideProcessing(form) {
    var submitButton = form.find('input[type="submit"]');
    submitButton.show();
    $('#processing-btn').hide();
  }
  
  // set up submit handler and other misc things on form
  function setupForm() {
    // add 'novalidate' attribute to form to prevent native browser error handling
    _this.form.attr('novalidate', 'novalidate');
    
    _this.hideErrors();
    
    // add event handler to validate form on submit
    _this.form.submit(function() {
      // execute onSubmit callback and stop execution if callback returns false
      if (_this.options.onSubmit.call(_this, _this.form) === false) {
        return false;
      }
      
      _this.hideErrors();
      
      // remove field validation on blur (to prevent multiple handlers building up)
      _this.validateOnBlur(false);
      
      if (_this.validate()) {
        // form passed validation
        
        // execute success callback
        if (typeof _this.options.onSuccess === 'function') {
          if (_this.options.onSuccess.call(_this, _this.form) === false) {
            return false;
          }
        }
        
      } else {
        // form failed validation
        
        // display form error message
        _this.displayErrors();
        
        // set up field validation on blur
        _this.validateOnBlur(true);
        
        // execute error callback
        if (typeof _this.options.onError === 'function') _this.options.onError.call(_this, _this.form);
        
        // return false to prevent form from submitting so we can run validations
        return false;
        
      }
    });
    
    setupValidations();
    
    _this.options.onInit.call(_this, _this.form);
  }
  
  setupForm();
};
