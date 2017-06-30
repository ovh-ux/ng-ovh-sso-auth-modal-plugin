# ovh-angular-sso-auth-modal-plugin

![OVH component](https://user-images.githubusercontent.com/3379410/27423240-3f944bc4-5731-11e7-87bb-3ff603aff8a7.png)

[![NPM](https://nodei.co/npm/ovh-angular-sso-auth-modal-plugin.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ovh-angular-sso-auth-modal-plugin/)

[![Maintenance](https://img.shields.io/maintenance/yes/2017.svg)]() [![Chat on gitter](https://img.shields.io/gitter/room/ovh/ux.svg)](https://gitter.im/ovh/ux) [![Build Status](https://travis-ci.org/ovh/ovh-angular-sso-auth-modal-plugin.svg)](https://travis-ci.org/ovh/ovh-angular-sso-auth-modal-plugin)

Plugin for ovh-angular-sso-auth library.
It overrides the ovh-angular-sso-auth's handleSwitchSession function,
to display a modal when user switch:
  - from connected to disconnected
  - from disconnected to connected
  - from connected to connected with other

## Usage
--------

```javascript
angular.module("myApp", [... , "ssoAuth", "ssoAuthModalPlugin"])

// [OPTIONAL]
.config(function (ssoAuthModalPluginFctProvider) {
    ssoAuthModalPluginFctProvider.setTranslationsPath("../bower_components/ovh-angular-sso-auth-modal-plugin/dist");
});

```

## Contributing

You've developed a new cool feature ? Fixed an annoying bug ? We'd be happy
to hear from you !

Have a look in [CONTRIBUTING.md](https://github.com/ovh-ux/ovh-angular-sso-auth-modal-plugin/blob/master/CONTRIBUTING.md)

## Run the tests

npm test

## Related links

* Contribute: https://github.com/ovh-ux/ovh-angular-sso-auth-modal-plugin/blob/master/CONTRIBUTING.md
* Report bugs: https://github.com/ovh-ux/ovh-angular-sso-auth-modal-plugin/issues
* Get latest version: https://github.com/ovh-ux/ovh-angular-sso-auth-modal-plugin

## License

See https://github.com/ovh-ux/ovh-angular-sso-auth-modal-plugin/blob/master/LICENSE
