"use strict";

describe("ovh-angular-sso-auth-modal-plugin config", function () {

    beforeEach(module("ovh-angular-sso-auth-modal-plugin"));

    afterEach(inject(function ($httpBackend) {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        localStorage.clear();
        sessionStorage.clear();
    }));

    // --- Tests

    it("should decorates the ovh-angular-sso-auth handleSwitchSession", inject(function (ssoAuthentication, ssoAuthModalPluginFct) {

        spyOn(ssoAuthModalPluginFct, "handleSwitchSession");

        ssoAuthentication.handleSwitchSession();

        expect(ssoAuthModalPluginFct.handleSwitchSession).toHaveBeenCalled();
    }));

});
