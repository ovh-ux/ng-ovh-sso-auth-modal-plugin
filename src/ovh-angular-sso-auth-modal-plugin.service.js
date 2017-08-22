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

    this.$get = function ($injector) {

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
                        templateUrl: "src/modal/ovh-angular-sso-auth-modal-plugin.html",
                        controller: "SsoAuthModalController",
                        controllerAs: "ssoAuthModalCtrl",
                        resolve: {
                            params: function () {
                                return angular.copy(modalDatas);
                            }
                        },
                        size: modalDatas.mode === "DISCONNECTED_TO_CONNECTED" || modalDatas.mode === "CONNECTED_TO_OTHER" ? "lg" : undefined,
                        keyboard: false,
                        backdrop: "static",
                        windowClass: "sso-modal"
                    });
                }
                return deferredObj.promise;
            }
        };
    };

});
