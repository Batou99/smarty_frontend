/* global Framework7, Dom7, Template7, moment, rest */

(function (Framework7, $$, T7, moment, rest) {
    'use strict';

    // Helpers
    Template7.registerHelper('isChecked', function (a,b){
        if (a === b) return 'Checked';
          else return '';
    });

    var app, mainView, leftView, splitView ;

    // Init App
    app = new Framework7({
        modalTitle: 'Smarty',
        animateNavBackIcon: true,
        precompileTemplates: true,
        template7Pages: true,
        externalLinks: 'a.external, .message a',
        router: true
    });

    // Add Right/Main View
    mainView = app.addView('.view-main', {
        dynamicNavbar: true,
        animatePages: false,
        swipeBackPage: false,
        reloadPages: true,
        preloadPreviousPage: false
    });

    // Add Left View
    leftView = app.addView('.view-left', {
        dynamicNavbar: true
    });

    function checkSplitView() {
        if ($$(window).width() < 767) {
            delete leftView.params.linksView;
            if (splitView) {
            }
            splitView = false;
        } else {
            splitView = true;
            leftView.params.linksView = '.view-main';
        }
    }
    $$(window).resize(checkSplitView);
    checkSplitView();

    // Add active class for left view links and close panel
    $$(document).on('click', '.view-left .stories-list a.item-link', function (e) {
        $$('.stories-list a.item-link.active-story').removeClass('active-story');
        $$(this).addClass('active-story');
        if (splitView) {
            app.closePanel();
        }
    }, true);

    function updateDevices(devices) {
        app.template7Data.devices = devices;
        $$('.page[data-page="index"] .page-content .list-block').html(T7.templates.devicesTemplate(devices));
    }

    function updateDeviceView(page, device) {
        app.template7Data.device = device;
        $$(page.container).find('.story-comments .messages').html(T7.templates.deviceViewTemplate(device));
        var entryPoint = $$(page.container).find('.controls')
        device.device_control_values.forEach(function(dcv) {
          switch(dcv.type) {
          case 'button':
            dcv.checked = dcv.value == 1 ? "Checked" : "";
            entryPoint.append(T7.templates.buttonTemplate(dcv));
            break;
          case 'slider':
            entryPoint.append(T7.templates.sliderTemplate(dcv));
            break;
          case 'select':
            entryPoint.append(T7.templates.selectTemplate(dcv));
            break;
        }
        });
    }

    // Fetch Devices
    function getDevices(refresh) {
        rest.fetch_devices_list(function(data) {
          data = JSON.parse(data);
          updateDevices(data);
          $$('.refresh-link.refresh-home').removeClass('refreshing');
          $$('.pull-to-refresh-content').removeClass('refreshing');
        });
    }

    // Update stories on PTR
    $$('.pull-to-refresh-content').on('refresh', function () {
        $$('.refresh-link.refresh-home').addClass('refreshing');
        getDevices(true);
    });
    $$('.refresh-link.refresh-home').on('click', function () {
        var clicked = $$(this);
        if (clicked.hasClass('refreshing')) {
            return;
        }
        clicked.addClass('refreshing');
        getDevices(true);
    });

    app.onPageInit('item', function (page) {
      rest.fetch_device(page.context.id, function(data) {
        data = JSON.parse(data);
        updateDeviceView(page, data);
        $$('.refresh-link.refresh-home').removeClass('refreshing');
      });
    });
    app.onPageAfterAnimation('item', function (page) {
      rest.fetch_device(page.context.id, function(data) {
        data = JSON.parse(data);
        updateDeviceView(page, data);
        $$('.refresh-link.refresh-home').removeClass('refreshing');
      });
    });
    $$(document).on('click', '.message a', function (e) {
        e.preventDefault();
        window.open($$(this).attr('href'));
    });

    // Get and parse devices on app load
    getDevices();

    // Export app to global
    window.app = app;

}(Framework7, Dom7, Template7, moment, rest));
