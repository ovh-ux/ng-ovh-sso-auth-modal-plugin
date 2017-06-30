"use strict";

describe("sso-auth-modal-plugin controller", function () {

    var SsoAuthModalController;
    var $controller;
    var $rootScope;
    var $scope;
    var $httpBackend;

    beforeEach(module("ovh-angular-sso-auth-modal-plugin"));

    beforeEach(inject(function (_$controller_, _$rootScope_, _$httpBackend_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        $httpBackend = _$httpBackend_;
    }));

    afterEach(inject(function ($httpBackend) {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        localStorage.clear();
        sessionStorage.clear();
        $scope.$destroy();
    }));

    // --- Utils

    function getRandomString () {
        return Math.random().toString(36).substr(2, 5) || "test";
    }

    // --- Tests

    describe("", function () {

        function createController (params) {
            var userId = getRandomString();

            SsoAuthModalController = $controller("SsoAuthModalController", {
                $scope: $scope,
                params: angular.extend({
                    mode: "CONNECTED_TO_DISCONNECTED",
                    userId: userId,
                    user: {},
                    userConfig: {
                        url: "userUrl",
                        method: "GET",
                        headers: {}
                    },
                    logoutUrl: "logoutUrl",
                    translationPath: "translationPath"
                }, params || {})
            });
        }

        beforeEach(inject(function ($translate, $translatePartialLoader, $q) {
            spyOn($translatePartialLoader, "addPart");
            spyOn($translate, "refresh").and.callFake(function () {
                return $q.when(true);
            });

            spyOn($, "ajax").and.callFake(function (opts) {
                var d = $.Deferred();
                d.resolve({ name: "toto" });
                return d.promise();
            });
        }));

        it("should init with mode=CONNECTED_TO_DISCONNECTED", inject(function ($timeout) {

            createController({ mode: "CONNECTED_TO_DISCONNECTED" });

            $timeout.flush();

            expect($.ajax).not.toHaveBeenCalled();

            expect(SsoAuthModalController.data.currentUser).toBe(undefined);
        }));

        it("should init with mode=DISCONNECTED_TO_CONNECTED", inject(function ($timeout) {

            createController({ mode: "DISCONNECTED_TO_CONNECTED" });

            $timeout.flush();

            expect($.ajax).toHaveBeenCalled();

            expect(SsoAuthModalController.data.currentUser.name).toBe("toto");
        }));

        it("should init with mode=CONNECTED_TO_OTHER", inject(function ($timeout) {

            createController({ mode: "CONNECTED_TO_OTHER" });

            $timeout.flush();

            expect($.ajax).toHaveBeenCalled();

            expect(SsoAuthModalController.data.currentUser.name).toBe("toto");
        }));

        it("should reload", inject(function ($timeout, $window) {

            createController();

            spyOn($window.location, "replace");

            var hrefWithoutHash = $window.location.href;
            $window.location.href = hrefWithoutHash + "#/toto";

            SsoAuthModalController.reload();

            $timeout.flush();

            expect($window.location.replace).toHaveBeenCalledWith(hrefWithoutHash);
        }));

        it("should logout", inject(function ($timeout, $window) {

            var logoutUrl = getRandomString();

            createController({ logoutUrl: logoutUrl });

            spyOn($window.location, "replace");

            SsoAuthModalController.logout();

            $timeout.flush();

            expect($window.location.replace).toHaveBeenCalledWith(logoutUrl);
        }));

    });

});
