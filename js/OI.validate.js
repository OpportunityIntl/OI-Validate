var Validate = function(form, options) {
  var _this = this;
  
  this.options = $.extend({
    onError: function() {},
    onSuccess: function() {}
  }, options);
  
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
      
      // hide field error message
      _this.hideError(field);
      
      $.each(data.validations, function(index, item) {
        if (!item.validation.call(field)) {
          // field failed this validation
          
          // display field error
          _this.displayError(field, item.fieldMessage);
          
          // add message for alert
          _this.errorMessages.push(item.formMessage);
          
          setData(field, {valid: false});
          
          // set validity to false (we'll return this value at the end)
          validity = false;
        } else {
          // field passed this validation
          
          // hide field error
          _this.hideError(field);
          
          setData(field, {valid: true});
          
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
  this.hideError = function(field) {
    var data = getData($(field));
    
    // get error message object (it's a sibling of the field)
    var errorMessage = data.element.siblings('.error-message');
    
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
  this.alert = function(message, type) {
    // create alert div, or empty it if it already exists
    var alert = _this.form.find('.alert');
    
    // if alert already exists, remove it
    if (alert.length > 0) {
      alert.remove();
    }
    
    // create alert element
    alert = $('<div>', {class: 'alert ' + (type ? type : 'error'), style: "display: none"});
    
    // prepend alert to form
    _this.form.prepend(alert);
    
    // set alert content
    alert.html(message);
    
    // show alert
    alert.slideDown(500);
  };
  
  // hide error message for whole form
  this.hideErrors = function() {
    // remove alert
    var alert = _this.form.find('.alert.error');
    alert.remove();
    
    // empty error messages array
    _this.errorMessages = [];
    
    // hide field errors
    _this.fields.each(function(index, field) {
      _this.hideError(field);
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
    // set up validations on field
    setupValidations(field);
    
    // add field
    _this.fields = _this.fields.add(field);
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
    var data = field.data('oi-validate');
    
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
    var existingData = getData(field) || {};
    
    // extend existing data with new data
    data = $.extend(existingData, newData);
    
    // save data to field via jQuery
    field.data('oi-validate', data);
  }
  
  // setup validations for a field
  function setupValidations(field) {
    
    // define default plugin data
    var data = {
      valid: true,
      validations: [],
      element: field
    };
    
    // if field is marked as required, add required validation
    if (field.is('[required]')) {
      data.validations.push({
        validation: function() {
          return $(this).val() !== '';
        },
        fieldMessage: 'Required field',
        formMessage: 'Please fill out missing fields'
      });
    }
    
    if (field.is('[type="email"]')) {
      data.validations.push({
        validation: function() {
          var re = /^[0-9a-zA-Z][-.+_a-zA-Z0-9]*@([0-9a-zA-Z][-._0-9a-zA-Z]*\.)+[a-zA-Z]{2,6}$/;
		      return re.test($(this).val());
        },
        fieldMessage: 'Invalid email address',
        formMessage: 'Please enter valid email address'
      });
    }
    
    // if field is a select input, set "element" to its parent div
    // (this is specific to how select inputs are styled in Weavr)
    if (field.is('select')) {
      data.element = field.parents('.select');
    }
    
    // set this data for the field
    setData($(field), data);
  }
  
  // add validation to a field
  function addValidation(field) {
    
  }
  
  // add fields to list of fields to be validated
  function addFields() {
    // add every input (excluding radio buttons), select, and textarea
    _this.form.find('input[type!="radio"][required], select[required], textarea[required]').each(function() {
      _this.addField($(this));
    });
  }
  
  // set up submit handler and other misc things on form
  function setupForm() {
    // add 'novalidate' attribute to form to prevent native browser error handling
    _this.form.attr('novalidate', 'novalidate');
    
    // add event handler to validate form on submit
    _this.form.submit(function() {
      // hide form error message
      _this.hideErrors();
      
      // remove field validation on blur (to prevent multiple handlers building up)
      _this.validateOnBlur(false);
      
      if (_this.validate()) {
        // form passed validation
        
        if (typeof _this.options.onSuccess === 'function') _this.options.onSuccess.call(_this);
        
      } else {
        // form failed validation
        
        // display form error message
        _this.displayErrors();
        
        // set up field validation on blur
        _this.validateOnBlur(true);
        
        if (typeof _this.options.onError === 'function') _this.options.onError.call(_this);
        
      }
      
      // return false to prevent form from submitting so we can run validations
      return false;
    });
    
    addFields();
  }
  
  setupForm();
};
