$(document).ready(function () {
	//multi level dropdown-menu
	$('body').delegate('.dropdown-menu a.dropdown-toggle', 'click', function (e) {
		var $el = $(this);
		var $parent = $(this).offsetParent(".dropdown-menu");
		if (!$(this).next().hasClass('show')) {
			$(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
		}
		var $subMenu = $(this).next(".dropdown-menu");
		$subMenu.toggleClass('show');
		$(this).parent("li").toggleClass('show');
		$(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
			$('.dropdown-menu .show').removeClass("show");
		});
		if (!$parent.parent().hasClass('navbar-nav')) {
			$el.next().css({
				"top": $el[0].offsetTop,
				"left": $parent.outerWidth() - 4
			});
		}
		return false;
	});
	// menu openr
	$('html').delegate('.navbar-toggler', 'click', function (e) {
		$('body').toggleClass('nav-open');
		e.stopPropagation();
	});
	// left panel open
	var pixels = 767.98;
	 pixels = pixels.toFixed(2);
	$('html').delegate('.left-opener', 'click', function () {
		$('body').toggleClass('left-panel-open');
		if ($(window).width() < (pixels)) {
			$('body .left-panel').css('margin-left', '-385px');
			$('body.left-panel-open .left-panel').css('margin-left', '0');
		} else if ($(window).width() > (pixels)) {
			$('body .left-panel').css('margin-left', '0');
			$('body.left-panel-open .left-panel').css('margin-left', '-385px');
		}
	});
	// right panel open
	$('html').delegate('.right-opener', 'click', function () {
		$('body').toggleClass('right-panel-open');
		if ($(window).width() < (pixels)) {
			$('body .right-panel').css('margin-right', '-348px');
			$('body.right-panel-open .right-panel').css('margin-right', '16px');
		} else if ($(window).width() > (pixels)) {
			$('body .right-panel').css('margin-right', '-348px');
			$('body.right-panel-open .right-panel').css('margin-right', '16px');
		}
	});
	// Add class if screen size equals
	$(window).on('load resize', function () {
		if ($(window).width() < (pixels)) {
			$('.left-panel').css('margin-left', '-212px');
			$('.right-panel').css('margin-right', '-348px');
		} else if ($(window).width() > (pixels)) {
			$('.left-panel').css('margin-left', '0');
			$('.right-panel').css('margin-right', '-348px');
		}
	});
});
$(document).ready(function () {
	$(window).trigger('load resize');
});

// form feild animations
$(document).ready(function () {
    $('html').delegate('.form-input', 'focus', function (e) {
        $(this).parents('.form-group').addClass('focused');
    });
    $('html').delegate('.form-input', 'blur', function (e) {
        var inputValue = $(this).val();
        if (inputValue == "") {
            $(this).removeClass('filled');
            $(this).parents('.form-group').removeClass('focused');
        } else {
            $(this).addClass('filled');
        }
    })
});