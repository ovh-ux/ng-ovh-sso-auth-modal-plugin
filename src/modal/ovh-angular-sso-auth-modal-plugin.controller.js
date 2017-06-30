/**
 * @ngdoc controller
 * @name ovh-angular-sso-auth-modal-plugin.SsoAuthModalController
 * @module ovh-angular-sso-auth-modal-plugin
 * @description
 * Controller of the modal
 */
angular.module("ovh-angular-sso-auth-modal-plugin").controller("SsoAuthModalController", function SsoAuthModalController ($q, $window, $translatePartialLoader, $translate, params) {
    "use strict";

    var self = this;

    self.loaders = {
        trads: true,
        init: true,
        action: false
    };

    self.data = params;

    // mode === CONNECTED_TO_DISCONNECTED = from connected to disconnected
    // mode === DISCONNECTED_TO_CONNECTED = from disconnected to connected
    // mode === CONNECTED_TO_OTHER = from connected to connected with other

    self.reload = function () {
        self.loaders.action = true;
        $window.location.replace($window.location.href.replace($window.location.hash, ""));
    };

    self.logout = function () {
        self.loaders.action = true;
        $window.location.replace(self.data.logoutUrl);
    };

    function getUser () {
        var deferredObj = $q.defer();
        $.ajax(self.data.userConfig).done(function (data) {
            deferredObj.resolve(data);
        }).fail(function (err) {
            deferredObj.resolve(err);
        });
        return deferredObj.promise;
    }

    function init () {
        $translatePartialLoader.addPart(self.data.translationPath);
        return $translate.refresh().then(function () {
            self.loaders.trads = false;
            if (self.data.mode === "DISCONNECTED_TO_CONNECTED" || self.data.mode === "CONNECTED_TO_OTHER") {
                return getUser().then(function (user) {
                    self.data.currentUser = user;
                }, function () {
                    self.reload();
                });
            }
        }).finally(function () {
            self.loaders.init = false;
        });
    }

    init();
});
