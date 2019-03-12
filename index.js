(function () {
  // Floating Labels
  var floatingLabelsInit = function floatingLabelsInit() {
    // floating label function
    var floatingLabel = function floatingLabel(onload) {
      // input to target
      var $input = $(this);
      //on window load
      if (onload) {
        $.each($('.form-control'), function (index, value) {
          var $current_input = $(value);
          // if input is filled already - float label up
          if ($current_input.val()) {
            $current_input.siblings('label.floating').addClass('up');
          }
        });
      }
      // timeout function to check val
      setTimeout(function () {
        // if input has a value
        if ($input.val()) {
          // float label up
          $input.siblings('label.floating').addClass('up');
          // for selects only: add class to change text to black
          if ($input.is('select')) {
            $input.addClass('text-black');
          }
        } else {
          // else hide label if input gets cleared
          $input.siblings('label.floating').removeClass('up');
          // for selects only: remove class to change text to gray
          if ($input.is('select')) {
            $input.removeClass('text-black');
          }
        }
      }, 1);
    };

    // on keydown, change and window load - fire floating label function
    $('.form-control').keydown(floatingLabel);
    $('.form-control').change(floatingLabel);
    window.addEventListener('load', floatingLabel(true), false);

    // // on parsley error
    // $('.js-floating-labels').parsley().on('form:error', function () {
    //   $.each(this.fields, function (key, field) {
    //     // if validation fails float label up and add error class to form group
    //     if (field.validationResult !== true) {
    //       field.$element.siblings('label.floating').addClass('up');
    //       field.$element.closest('.form-group').addClass('has-error');
    //     }
    //   });
    // });

    // on parsley passed validation
    $('.js-floating-labels').parsley().on('field:validated', function () {
      // if validation passes
      if (this.validationResult === true) {
        //remove error class from form group
        this.$element.siblings('label.floating');
        this.$element.closest('.form-group').removeClass('has-error');
      } else {
        // float label up and add error class to form group
        this.$element.siblings('label.floating').addClass('up');
        this.$element.closest('.form-group').addClass('has-error');
      }
    });
  };
  // Sets max length for ccv based on card type entered
  var ccvMaxLength = function ccvMaxLength(type) {
    if (type !== "amex") {
      $('#ccv').prop('maxlength', 3);
    }
  };
  // Updates elements and icon based on cc number
  var updatePaymentIcon = function updatePaymentIcon() {
    // the svg for card icon
    var iconType = $('svg.payment-method-icon').children().attr('xlink:href');
    // the card type based on the number entered
    var cardType = $.payment.cardType($('#credit-card-number').val());
    // if cardType is null clear svg and return
    if (cardType === null) {
      $('svg.payment-method-icon').children().attr('xlink:href', '#');
      return;
    }

    //if the svg id is not equal to the card type update the svg id
    if (iconType.slice(1) !== cardType) {
      $('svg.payment-method-icon').children().attr('xlink:href', '#' + cardType);
    }

    // set the max length for the ccv based on card type
    ccvMaxLength(cardType);

    return;
  };
  // init invoke, make sure form has class js-floating-labels
  floatingLabelsInit();
  // format inputs with jquery.payment
  $('#credit-card-number').payment('formatCardNumber');
  $('#expiration').payment('formatCardExpiry');
  $('#ccv').payment('formatCardCVC');
  // on entry of cc number fire updatePaymentIcon function
  $('#credit-card-number').on("keyup blur", updatePaymentIcon);
  // custom cc validators added to parsley using jquery.payment functions
  window.validateCreditCard = $.payment.validateCardNumber;
  window.cardType = $.payment.cardType;
  window.Parsley.addValidator('creditcard',
  function (value) {
    var acceptedCards = ['amex', 'visa', 'mastercard'];
    return validateCreditCard(value) && acceptedCards.includes(cardType(value));
  }).
  addMessage('en', 'creditcard', '');
  window.Parsley.addValidator('cvv',
  function (value) {
    return (/^[0-9]{3,4}$/.test(value));
  }, 32).
  addMessage('en', 'cvv', '');
  window.Parsley.addValidator('expirydate',
  function (value) {
    var currentTime, expiry, prefix, ref;

    var date = value.split('/'),
    month = date[0].trim(),
    year = date[1].trim();

    if (!/^\d+$/.test(month)) {
      return false;
    }
    if (!/^\d+$/.test(year)) {
      return false;
    }
    if (!(parseInt(month, 10) <= 12)) {
      return false;
    }
    if (year.length === 2) {
      prefix = new Date().getFullYear();
      prefix = prefix.toString().slice(0, 2);
      year = prefix + year;
    }
    expiry = new Date(year, month);
    currentTime = new Date();
    expiry.setMonth(expiry.getMonth() - 1);
    expiry.setMonth(expiry.getMonth() + 1, 1);
    return expiry > currentTime;
  }, 32).
  addMessage('en', 'expirydate', '');
})();