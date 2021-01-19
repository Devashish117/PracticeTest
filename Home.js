'use strict';
var server = require('server');
var page = module.superModule;
var Site = require('dw/system/Site');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var homeAndDefaultControllerHelper = require('*/cartridge/scripts/helpers/homeAndDefaultControllerHelper');

server.extend(page);

server.append('Show', homeAndDefaultControllerHelper.startAndShow);

server.replace('ErrorNotFound', function (req, res, next) {
    /*
    A 404 response status code results in remote includes not working within SFCC.
    A workaround is using a 410 status code but that has SEO impacts as it implies the target is permanently gone.
    Details at: https://support-demandware.force.com/customer/articles/KB_Question/Are-remote-includes-supported-on-404-pages
    */
    res.setStatusCode(410);
    res.render('error/notFound');
    next();
});

server.get(
    'ShowEmailPopUp',
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var emailSignupForm = server.forms.getForm('emailSignup');
        var excludedPages = 'emailPopUpExcludedEndpoints' in Site.current.preferences.custom && Site.current.preferences.custom.emailPopUpExcludedEndpoints !== '' ? Site.current.preferences.custom.emailPopUpExcludedEndpoints : '';
        if (excludedPages) {
            excludedPages = Site.current.preferences.custom.emailPopUpExcludedEndpoints.split(',').map(function (item) {
                return item.trim();
            });
        }
        var originPath = req.querystring.activePage;
        res.render('/emailPopUp/emailPopUp', {
            emailSignupForm: emailSignupForm,
            source: 'Email_Popup_Signup',
            excludedPages: excludedPages,
            originPath: originPath
        });
        next();
    }
);

module.exports = server.exports();
