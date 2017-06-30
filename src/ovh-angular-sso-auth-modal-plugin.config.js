angular.module("ovh-angular-sso-auth-modal-plugin").config(function ($provide) {
    "use strict";

    $provide.decorator("ssoAuthentication", function ($delegate, ssoAuthModalPluginFct) {

        $delegate.handleSwitchSession = function () {
            return ssoAuthModalPluginFct.handleSwitchSession($delegate);
        };

        return $delegate;
    });
});
