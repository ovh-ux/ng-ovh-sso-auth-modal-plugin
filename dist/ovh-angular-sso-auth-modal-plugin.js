angular.module("ovh-angular-sso-auth-modal-plugin", ["pascalprecht.translate", "ui.bootstrap", "ovh-angular-sso-auth"]);

/**
 * @ngdoc controller
 * @name ovh-angular-sso-auth-modal-plugin.SsoAuthModalController
 * @module ovh-angular-sso-auth-modal-plugin
 * @description
 * Controller of the modal
 */
angular.module("ovh-angular-sso-auth-modal-plugin").controller("SsoAuthModalController", ["$q", "$window", "$translatePartialLoader", "$translate", "params", function SsoAuthModalController ($q, $window, $translatePartialLoader, $translate, params) {
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
}]);

angular.module("ovh-angular-sso-auth-modal-plugin").config(["$provide", function ($provide) {
    "use strict";

    $provide.decorator("ssoAuthentication", ["$delegate", "ssoAuthModalPluginFct", function ($delegate, ssoAuthModalPluginFct) {

        $delegate.handleSwitchSession = function () {
            return ssoAuthModalPluginFct.handleSwitchSession($delegate);
        };

        return $delegate;
    }]);
}]);

/**
 * @ngdoc service
 * @name ovh-angular-sso-auth-modal-plugin.ssoAuthModalPluginFct
 * @module ovh-angular-sso-auth-modal-plugin
 * @description
 * Handle switch session, opens the modal
 */
angular.module("ovh-angular-sso-auth-modal-plugin").provider("ssoAuthModalPluginFct", function ssoAuthModalPluginFct () {
    "use strict";

    var translationPath = "../bower_components/ovh-angular-sso-auth-modal-plugin/dist/modal";
    var deferredObj;

    /**
     * @ngdoc function
     * @name setTranslationsPath
     * @methodOf ovh-angular-sso-auth-modal-plugin.ssoAuthModalPluginFct
     * @description
     * Set translation path
     *
     * @param {string} _translationPath translation path
     */
    this.setTranslationsPath = function (_translationPath) {
        translationPath = _translationPath;
    };

    this.$get = ["$injector", function ($injector) {

        return {
            handleSwitchSession: function (ssoAuthentication) {
                if (!deferredObj) {
                    var $q = $injector.get("$q");
                    var $uibModal = $injector.has("$uibModal") ? $injector.get("$uibModal") : $injector.get("$modal");

                    deferredObj = $q.defer();

                    var currentUserId = ssoAuthentication.getUserIdCookie();

                    var modalDatas = {
                        userId: ssoAuthentication.userId,
                        user: ssoAuthentication.user,
                        userConfig: {
                            url: ssoAuthentication.getUserUrl(),
                            method: "GET",
                            headers: ssoAuthentication.getHeaders()
                        },
                        logoutUrl: ssoAuthentication.getLogoutUrl(),
                        translationPath: translationPath
                    };

                    if (ssoAuthentication.userId && !currentUserId) {
                        // from connected to disconnected
                        modalDatas.mode = "CONNECTED_TO_DISCONNECTED";
                    } else if (!ssoAuthentication.userId && currentUserId) {
                        // from disconnected to connected
                        modalDatas.mode = "DISCONNECTED_TO_CONNECTED";
                    } else if (ssoAuthentication.userId !== currentUserId) {
                        // from connected to connected with other
                        modalDatas.mode = "CONNECTED_TO_OTHER";
                    }

                    $uibModal.open({
                        templateUrl: "src/modal/sso-auth-modal-plugin.html",
                        controller: "SsoAuthModalController",
                        controllerAs: "ssoAuthModalCtrl",
                        resolve: {
                            params: function () {
                                return angular.copy(modalDatas);
                            }
                        },
                        size: modalDatas.mode === "DISCONNECTED_TO_CONNECTED" || modalDatas.mode === "CONNECTED_TO_OTHER" ? "lg" : undefined,
                        keyboard: false,
                        backdrop: "static"
                    });
                }
                return deferredObj.promise;
            }
        };
    }];

});

angular.module('ovh-angular-sso-auth-modal-plugin').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/modal/ovh-angular-sso-auth-modal-plugin.html',
    "<div id=sso-modal><div class=modal-header data-ng-if=!ssoAuthModalCtrl.loaders.trads><h3 class=modal-title><span class=\"glyphicon glyphicon-lock\" aria-hidden=true></span> <span data-translate=sso_modal_title></span></h3></div><div class=modal-body data-ng-if=ssoAuthModalCtrl.loaders.init data-translate=sso_modal_loading></div><div class=modal-body data-ng-if=!ssoAuthModalCtrl.loaders.init><div class=row><div data-ng-if=\"ssoAuthModalCtrl.data.mode === 'CONNECTED_TO_DISCONNECTED' || ssoAuthModalCtrl.data.mode === 'CONNECTED_TO_OTHER'\" data-ng-class=\"{'col-md-12 span12': ssoAuthModalCtrl.data.mode === 'CONNECTED_TO_DISCONNECTED', 'col-md-6 span6': ssoAuthModalCtrl.data.mode === 'CONNECTED_TO_OTHER' }\"><p data-translate=sso_modal_user_title></p><div class=\"panel panel-default\" data-ng-class=\"{'panel-disabled': ssoAuthModalCtrl.data.mode === 'CONNECTED_TO_OTHER'}\"><div class=panel-body><div class=sso-modal-account-badge-ctnr><div class=sso-modal-account-badge aria-hidden=true><span class=\"glyphicon glyphicon-user\"></span></div></div><div class=sso-modal-account-infos-ctnr><div class=sso-modal-account-infos><strong data-ng-bind=\"ssoAuthModalCtrl.data.user.firstname + ' ' + ssoAuthModalCtrl.data.user.name\"></strong><br><span data-ng-bind=ssoAuthModalCtrl.data.user.email></span><br><span data-ng-bind=ssoAuthModalCtrl.data.user.nichandle></span></div></div></div></div></div><div data-ng-if=\"ssoAuthModalCtrl.data.mode === 'DISCONNECTED_TO_CONNECTED' || ssoAuthModalCtrl.data.mode === 'CONNECTED_TO_OTHER'\" data-ng-class=\"{'col-md-12 span12': ssoAuthModalCtrl.data.mode === 'DISCONNECTED_TO_CONNECTED', 'col-md-6 span6': ssoAuthModalCtrl.data.mode === 'CONNECTED_TO_OTHER' }\"><p data-ng-class=\"{'bold': ssoAuthModalCtrl.data.mode === 'CONNECTED_TO_OTHER'}\" data-translate=sso_modal_currentuser_title></p><div class=\"panel panel-default\"><div class=panel-body><div class=sso-modal-account-badge-ctnr><div class=sso-modal-account-badge aria-hidden=true><span class=\"glyphicon glyphicon-user\"></span></div></div><div class=sso-modal-account-infos-ctnr><div class=sso-modal-account-infos><strong data-ng-bind=\"ssoAuthModalCtrl.data.currentUser.firstname + ' ' + ssoAuthModalCtrl.data.currentUser.name\"></strong><br><span data-ng-bind=ssoAuthModalCtrl.data.currentUser.email></span><br><span data-ng-bind=ssoAuthModalCtrl.data.currentUser.nichandle></span></div></div></div></div></div></div><p data-ng-if=\"ssoAuthModalCtrl.data.mode === 'CONNECTED_TO_DISCONNECTED'\" class=bold data-translate=sso_modal_disconnected></p><p data-ng-if=\"ssoAuthModalCtrl.data.mode === 'DISCONNECTED_TO_CONNECTED' || ssoAuthModalCtrl.data.mode === 'CONNECTED_TO_OTHER'\" class=bold data-translate=sso_modal_what></p></div><div class=\"modal-footer clearfix\" data-ng-if=!ssoAuthModalCtrl.loaders.init><div data-ng-if=\"ssoAuthModalCtrl.data.mode === 'CONNECTED_TO_DISCONNECTED'\"><button type=button class=\"btn btn-primary pull-right\" autofocus data-ng-click=ssoAuthModalCtrl.logout() data-ng-disabled=ssoAuthModalCtrl.loaders.action data-translate=sso_modal_action_logout></button></div><div data-ng-if=\"ssoAuthModalCtrl.data.mode === 'DISCONNECTED_TO_CONNECTED' || ssoAuthModalCtrl.data.mode === 'CONNECTED_TO_OTHER'\"><button type=button class=\"btn btn-primary pull-right\" autofocus data-ng-click=ssoAuthModalCtrl.reload() data-ng-disabled=ssoAuthModalCtrl.loaders.action data-translate=sso_modal_action_reload data-translate-values=\"{ name: ssoAuthModalCtrl.data.currentUser.firstname + ' ' + ssoAuthModalCtrl.data.currentUser.name }\"></button> <button type=button class=\"btn btn-default pull-left\" data-ng-click=ssoAuthModalCtrl.logout() data-ng-disabled=ssoAuthModalCtrl.loaders.action data-translate=sso_modal_action_logout></button></div></div></div>"
  );

}]);
