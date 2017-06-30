module.exports = function (grunt) {
    "use strict";
    require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);

    /**
     * NOTE for CSS/LESS:
     * - (src/CSS -> dist/CSS) : use [concat:css, autoprefixer, cssmin]
     * - (src/LESS -> dist/CSS) : use [less, autoprefixer, cssmin]
     * - (src/LESS -> dist/LESS) : use [copy:less]
     */

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        bower: grunt.file.readJSON("bower.json"),
        distdir: "dist",
        srcdir: "src",
        builddir: ".work/.tmp",
        name: grunt.file.readJSON("package.json").name || "ovh-angular-sso-auth-modal-plugin",   // module name
        moduleName: "ssoAuthModalPlugin",

        // Clean
        clean: {
            dist: {
                src: [
                    "<%= builddir %>",
                    "<%= distdir %>"
                ]
            }
        },

        // Copy files
        copy: {
            // Copy concatened JS file from builddir to dist/
            dist: {
                files: [{
                    "<%= distdir %>/<%= name %>.js": "<%= builddir %>/<%= name %>.js"
                }, {
                    expand: true,
                    cwd: "<%= srcdir %>",
                    dest: "<%= distdir %>",
                    src: [
                        "**/translations/*.json"
                    ]
                }]
            }
        },

        // Concatenation
        concat: {
            dist: {
                files: {
                    "<%= builddir %>/<%= name %>.js": [
                        "<%= srcdir %>/<%= name %>.js",
                        "<%= srcdir %>/**/*.js",
                        "<%= builddir %>/<%= name %>.tmpl.js",
                        "!<%= srcdir %>/**/*.spec.js"
                    ]
                }
            },

            // use this only if you don't use LESS!
            css: {
                files: {
                    "<%= builddir %>/<%= name %>.css": [
                        "<%= srcdir %>/**/*.css"
                    ]
                }
            }
        },

        // Package all the html partials into a single javascript payload
        ngtemplates: {
            options: {
                // This should be the name of your apps angular module
                module: "<%= moduleName %>",
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                }
            },
            main: {
                src: ["src/**/*.html"],
                dest: "<%= builddir %>/<%= name %>.tmpl.js"
            }
        },

        // ngMin
        ngAnnotate: {
            dist: {
                files: {
                    "<%= builddir %>/<%= name %>.js": ["<%= builddir %>/<%= name %>.js"]
                }
            }
        },

        // Obfuscate
        uglify: {
            js: {
                options: {
                    banner: '/*! <%= name %> - <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                files: {
                    "<%= distdir %>/<%= name %>.min.js": ["<%= builddir %>/<%= name %>.js"]
                }
            }
        },

        // Create CSS from LESS
        less: {
            dist: {
                options: {
                    compress: false
                },
                files: {
                    "<%= builddir %>/<%= name %>.css": ["less/**/*.less"]
                }
            }
        },

        // ... and its prefixed vendor styles
        autoprefixer: {
            options: {
                browsers: ["last 3 versions", "ie >= 9", "> 5%"]
            },
            dist: {
                files: {
                    "<%= distdir %>/<%= name %>.css": ["<%= builddir %>/<%= name %>.css"]
                }
            }
        },

        // ... and now minify it
        cssmin: {
            options: {},
            dist: {
                files: {
                    "<%= distdir %>/<%= name %>.min.css": ["<%= distdir %>/<%= name %>.css"]
                }
            }
        },

        eslint: {
            options: {
                quiet: true,
                configFile: "./.eslintrc.json"
            },
            target: ["src/*.js", "Gruntfile.js"]
        },

        // Check complexity
        complexity: {
            generic: {
                src: [
                    "<%= srcdir %>/**/*.js",
                    "!<%= srcdir %>/**/*.spec.js"
                ],
                options: {
                    errorsOnly: false,
                    cyclomatic: 12,
                    halstead: 45,
                    maintainability: 82
                }
            }
        },

        // Watch
        delta: {
            dist: {
                files: ["<%= srcdir %>/**/*", "!<%= srcdir %>/**/*.spec.js"],
                tasks: ["buildProd"]
            },
            test: {
                files: ["<%= srcdir %>/**/*.spec.js"],
                tasks: ["test"]
            }
        },

        // To release
        bump: {
            options: {
                pushTo: "origin",
                files: [
                    "package.json",
                    "bower.json"
                ],
                updateConfigs: ["pkg", "bower"],
                commitFiles: ["-a"]
            }
        },

        // Testing
        karma: {
            unit: {
                configFile: "karma.conf.js",
                singleRun: true
            }
        },

        ngdocs: {
            options: {
                dest: "docs",
                html5Mode: false,
                title: "SSO Auth",
                startPage: "/api/ssoAuthModalPlugin.ssoAuthModalPluginAuthentication",
                sourceLink: "https://github.com/ovh-ux/<%= name %>/blob/master/{{file}}#L{{codeline}}"
            },
            api: {
                src: ["src/**/*.js"],
                title: "api"
            }
        },

        // OVH translations
        ovhTranslation: {
            files: {
                expand: true,
                flatten: false,
                src: ["<%= srcdir %>/**/translations/*.xml"],
                filter: "isFile",
                extendFrom: ["fr_FR", "en_GB"]
            }
        }
    });

    grunt.registerTask("default", ["build"]);
    grunt.task.renameTask("watch", "delta");
    grunt.registerTask("watch", ["build", "delta"]);

    grunt.registerTask("test", function () {
        grunt.task.run([
            "clean",
            "eslint",
            "complexity",
            "karma"
        ]);
    });

    grunt.registerTask("build", [
        "clean",
        "ngtemplates",
        "concat:dist",
        "ngAnnotate",
        "uglify",

        // "concat:css",
        "less",
        "autoprefixer",
        "cssmin",

        // "copy:less",
        "ovhTranslation",
        "copy:dist",
        "ngdocs"
    ]);


    // Increase version number. Type = minor|major|patch
    grunt.registerTask("release", "Release", function () {
        var type = grunt.option("type");

        if (type && ~["patch", "minor", "major"].indexOf(type)) {
            grunt.task.run(["bump-only:" + type]);
        } else {
            grunt.verbose.or.write("You try to release in a weird version type [" + type + "]").error();
            grunt.fail.warn("Please try with --type=patch|minor|major");
        }
    });

};
