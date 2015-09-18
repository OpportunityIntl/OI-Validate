var Validate = function(form) {
  var _this = this;
  
  /**** Public attributes ****/
  
  this.form = $(form);
  this.fields = $();
  
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
      $.each(data.validations, function(index, item) {
        if (!item.validation.call(field)) {
          // field failed this validation
          
          // if field had already failed validation, don't do anything
          // if it failed for the first time, display error message
          if (data.valid) {
            _this.displayError(data.element, item.message);
            setData(field, {valid: false});
          }
          
          // set validity to false (we'll return this value at the end)
          validity = false;
        } else {
          // field passed this validation
          
          // if field had already failed validation, remove error message
          // otherwise, do nothing
          if (!data.valid) {
            _this.hideError(data.element);
            setData(field, {valid: true});
          }
          
          // set validity to true
          validity = true;
        }
        
        // return validity of field
        return validity;
      });
    }
    
    return validity;
  };
  
  // display error message on field
  this.displayError = function(field, message) {
    // create new element for error message
    var errorMessage = $('<div>', {class: 'error-message'});
    
    // set content for error message
    errorMessage.html(message);
    
    // insert error message after field
    field.after(errorMessage);
    
    // add error class to field
    field.addClass('error');
  };
  
  // hide error message on field
  this.hideError = function(field) {
    // get error message object (it's a sibling of the field)
    var errorMessage = field.siblings('.error-message');
    
    // remove error message
    errorMessage.remove();
    
    // remove error class from field
    field.removeClass('error');
    
  };
  
  // display error message for whole form
  this.displayErrors = function() {
    
  };
  
  // hide error message for whole form
  this.hideErrors = function() {
    
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
        message: 'Required field'
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
      if (_this.validate()) {
        // form passed validation
        
        console.log('Success');
      } else {
        // form failed validation
        
        // set up field validation on blur
        _this.validateOnBlur(true);
        
        console.log('Failure');
      }
      
      // return false to prevent form from submitting so we can run validations
      return false;
    });
    
    addFields();
  }
  
  setupForm();
};
