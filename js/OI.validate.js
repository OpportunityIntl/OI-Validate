var Validate = function(form) {
  var _this = this;
  
  this.form = $(form);
  this.hasErrors = false;
  this.errors = [];
  
  function addValidations() {
    $('[required]').each(function() {
      var validations = $(this).data('oi-validate');
      validations = $.extend({
        validations: [
          {
            validation: function() {
              return $(this).val() !== '';
            },
            message: 'Required field'
          }
        ]
      }, validations);
      $(this).data('oi-validate', validations);
    });
  }
  
  function getValidations(field) {
    var data = field.data('oi-validate');
    if (data) {
      return data.validations;
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
  
  function setupForm() {
    _this.form.attr('novalidate', 'novalidate');
    
    _this.form.submit(function() {
      _this.validate();
      return false;
    });
  }
  
  this.validateField = function(field) {
    console.log(field);
    var validations = getValidations(field);
    if (validations) {
      $.each(validations, function(index, item) {
        if (!item.validation.call(field)) {
          if (field.is('select')) {
            displayFieldError(field.parents('.select'), item.message);
          } else {
            displayFieldError(field, item.message);
          }
        }
      });
    }
  };
  
  this.validate = function() {
    _this.form.find('input, select').each(function() {
      _this.validateField($(this));
    });
  };
  
  setupForm();
  addValidations();
};
