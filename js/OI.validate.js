var Validate = function(form) {
  var _this = this;
  
  this.form = $(form);
  this.hasErrors = false;
  this.errors = [];
  this.fields = this.form.find('input[type="text"], input[type="radio"], input[type="checkbox"], input[type="email"], input[type="phone"], input[type="number"], select, textarea');
  
  function updateData(field, newData) {
    var data = getData(field) || {};
    
    $.extend(data, newData);
    
    field.data('oi-validate', data);
  }
  
  function addValidations() {
    $('[required]').each(function() {
      updateData($(this), {
        valid: true,
        validations: [
          {
            validation: function() {
              return $(this).val() !== '';
            },
            message: 'Required field'
          }
        ]
      });
    });
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
      _this.validate();
      return false;
    });
  }
  
  this.validateField = function(field) {
    var data = getData(field);
    if (data) {
      $.each(data.validations, function(index, item) {
        if (!item.validation.call(field)) {
          if (data.valid) {
            if (field.is('select')) {
              displayFieldError(field.parents('.select'), item.message);
            } else {
              displayFieldError(field, item.message);
            }
            
            updateData(field, {valid: false});
          }
        } else {
          removeFieldError(field);
          updateData(field, {valid: true});
        }
      });
    }
  };
  
  this.validate = function() {
    _this.fields.each(function() {
      _this.validateField($(this));
    });
  };
  
  this.fields.on('blur', function() {
    _this.validateField($(this));
  });
  
  setupForm();
  addValidations();
};
