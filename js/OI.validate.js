var Validate = function(form) {
  var _this = this;
  
  this.form = $(form);
  this.hasErrors = false;
  this.fields = this.form.find('input[type="text"], input[type="radio"], input[type="checkbox"], input[type="email"], input[type="phone"], input[type="number"], select, textarea');
  
  function updateData(field, newData) {
    var data = getData(field) || {};
    
    $.extend(data, newData);
    
    field.data('oi-validate', data);
  }
  
  function setupValidations(field) {
    var data = {
      valid: true,
      validations: [],
      element: field
    };
    
    if (field.is('[required]')) {
      data.validations.push({
        validation: function() {
          return $(this).val() !== '';
        },
        message: 'Required field'
      });
    }
    
    if (field.is('select')) {
      data.element = field.parents('.select');
    }
    
    updateData($(field), data);
  }
  
  function getData(field) {
    var data = field.data('oi-validate');
    if (data) {
      return data;
    } else {
      return false;
    }
  }
  
  function displayFieldError(field, message) {
    var errorMessage = $('<div>', {class: 'error-message'});
    errorMessage.html(message);
    field.after(errorMessage);
    field.addClass('error');
  }
  
  function removeFieldError(field) {
    var errorMessage = field.siblings('.error-message');
    field.removeClass('error');
    errorMessage.remove();
  }
  
  function setupForm() {
    _this.form.attr('novalidate', 'novalidate');
    
    _this.form.submit(function() {
      if (_this.validate()) {
        // form passed validation
        console.log('Success');
      } else {
        // form failed validation
        _this.validateOnBlur(true);
        console.log('Failure');
      }
      return false;
    });
    
    _this.fields.each(function() {
      setupValidations($(this));
    });
  }
  
  this.validateOnBlur = function(boolean) {
    if (boolean) {
      _this.fields.on('blur.validate change.validate', function() {
        _this.validateField($(this));
      });
    } else {
      _this.fields.off('blur.validate change.validate');
    }
  };
  
  this.validateField = function(field) {
    var data = getData(field);
    var validity = true;
    // if field has data
    if (data) {
      $.each(data.validations, function(index, item) {
        if (!item.validation.call(field)) {
          if (data.valid) {
            displayFieldError(data.element, item.message);
            updateData(field, {valid: false});
          }
          
          validity = false;
        } else {
          removeFieldError(data.element);
          updateData(field, {valid: true});
          
          validity = true;
        }
        
        return validity;
      });
    }
    
    return validity;
  };
  
  this.validate = function() {
    var errors = 0;
    
    _this.fields.each(function() {
      if (!_this.validateField($(this))) errors++;
    });
    
    return (errors > 0) ? false : true;
  };
  
  setupForm();
};
