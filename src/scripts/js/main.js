(function($) {

    // open menu panel
    $('.mNavPanel').click(function() {
        $('.mobile-nav--pane').addClass('reveal-pane');
    });

    // hide menu panel
    $('#closeNavPanel').click(function() {
        $('.mobile-nav--pane').removeClass('reveal-pane');
    });

    // open sub menu hold 
    $('.main-nav > ul li a').click(function(e) {

        var mainParentLink = $(this);

        if (mainParentLink.next().hasClass('reveal-hold')) {
            mainParentLink.next().removeClass('reveal-hold');
        } else {
            mainParentLink.parent().parent().find('li > ul.main-nav--sub').removeClass('reveal-hold');
            mainParentLink.next().addClass('reveal-hold');
        }

        e.stopPropagation();

    });

    // close sub menu hold
    $('.closeSubMenuHold').click(function(e) {
        $('.main-nav--sub').removeClass('reveal-hold');

        e.stopPropagation();
    });

    // open sub sub menu children
    $('ul.sub-nav li a').click(function(e) {

        var pLink = $(this);

        if (pLink.next().hasClass('reveal-child')) {
            pLink.next().removeClass('reveal-child');
        } else {
            pLink.parent().parent().find('li > ul.sub-nav--child').removeClass('reveal-child');
            pLink.next().addClass('reveal-child');
        }

        e.stopPropagation();

    });

    // dropdown menu
    $('.nav-hold > ul.nav li a').click(function(e) {

        var parentLink = $(this);

        if (parentLink.next().hasClass('show')) {
            parentLink.next().removeClass('show');
            parentLink.next().slideUp(350);
        } else {
            parentLink.parent().parent().find('li > ul.sub-nav').removeClass('show');
            parentLink.parent().parent().find('li > ul.sub-nav').slideUp(350);
            parentLink.next().slideToggle(350).toggleClass('show');
        }

        e.stopPropagation();

    });

    // main tabs
    $('ul.tabs').each(function() {
        var $active, $content, $links = $(this).find('a');

        $active = $($links.filter('[href="' + location.hash + '"]')[0] || $links[0]);
        $active.addClass('active');

        $content = $($active[0].hash);

        $links.not($active).each(function() {
            $(this.hash).hide();
        });

        $(this).on('click', 'a', function(e) {
            e.preventDefault();

            $active.removeClass('active');
            $content.hide();

            $active = $(this);
            $content = $(this.hash);

            $active.addClass('active');
            $content.show();
            $('.responsive3').slick('setPosition');
            $('.responsive4').slick('setPosition');
            $('.card:visible').matchHeight();
        });

    });

    // story slider
    // var owl = $('.owl-carousel');

    // owl.owlCarousel({
    //     items: 1,
    //     dots: false,
    //     onInitialized: counter,
    //     onTranslated: counter
    // });

    // function counter(e) {
    //     var element = e.target;
    //     var items = e.item.count;
    //     var item = e.item.index + 1;

    //     $('#counter').html(item + '/' + items);
    // }

    // $('.prev-nav').click(function() {
    //     owl.trigger('prev.owl.carousel', [300]);
    // });

    // $('.next-nav').click(function() {
    //     owl.trigger('next.owl.carousel');
    // });

    // dark mode
    var bodyLightMode = $('body');

    if (localStorage.getItem("mode") == "dark") {
        bodyLightMode.attr('data-theme', 'dark');
    } else if (localStorage.getItem("mode") == "light") {
        bodyLightMode.removeAttr('data-theme');
    }

    $('.cl-mode--btn').click(function() {

        if (bodyLightMode.attr('data-theme')) {
            bodyLightMode.removeAttr('data-theme');
            localStorage.setItem("mode", "light");
        } else {
            bodyLightMode.attr('data-theme', 'dark');
            localStorage.setItem("mode", "dark");
        }

    });

    // font increase
    $('.fsize-increase--btn').click(function() {

        var fontSize = parseInt($(this).css("font-size"));
        fontSize = fontSize + 2 + "px";
        $('.tab-content--wrap .tab-content--hold .tab-content .inner-tab-content .tab-rgt .tab-rgt--content > *').css({
            'font-size': fontSize
        });

    });

    // font deccrease
    $('.fsize-decrease--btn').click(function() {

        var fontSize = parseInt($(this).css("font-size"));
        fontSize = fontSize - 1 + "px";
        $('.tab-content--wrap .tab-content--hold .tab-content .inner-tab-content .tab-rgt .tab-rgt--content > *').css({
            'font-size': fontSize
        });

    });

    // help button
    $('.help-btn').click(function(e) {
        $('.help-cta--hold').toggleClass('display-cta');
    });

    // content scroll
    var $contentScroll = $('.img-hold');
    var $scrollCounter = $('.scroll-counter');

    $contentScroll.slick({
        infinite: true,
        dots: true,
        arrows: false,
        appendDots: $('.scroll-dots'),
        adaptiveHeight: true
    });

    $contentScroll.on('init reInit afterChange', function (event, slick, currentSlide, nextSlide) {

        var item = (currentSlide ? currentSlide : 0) + 1;
        $scrollCounter.text(item + '/' + slick.slideCount);
    });


})(jQuery);