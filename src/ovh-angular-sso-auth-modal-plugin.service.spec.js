"use strict";

describe("sso-auth-modal-plugin service", function () {

    beforeEach(module("ovh-angular-sso-auth-modal-plugin"));

    afterEach(inject(function ($httpBackend) {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        localStorage.clear();
        sessionStorage.clear();
    }));

    // --- Tests

    describe("", function () {

        it("should open the modal", inject(function ($uibModal, ssoAuthModalPluginFct, ssoAuthentication) {

            spyOn($uibModal, "open");

            ssoAuthModalPluginFct.handleSwitchSession(ssoAuthentication);

            expect($uibModal.open).toHaveBeenCalled();

        }));

    });

});
