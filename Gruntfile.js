/*jshint -W106 */
/*jshint node:true, maxstatements: false, maxlen: false */

module.exports = function(grunt) {

  "use strict";

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON("package.json"),

    banner: "/*!\n" +
      "* <%= pkg.title || pkg.name %>\n" +
      "* <%= pkg.description %>\n" +
      "* Copyright (c) 2014<%= (function(thisYear) { return thisYear !== '2014' ? '-' + thisYear : ''; })(grunt.template.today('yyyy')) %> <%= pkg.author.name %>\n" +
      "* Licensed <%= pkg.license %>\n" +
      "* <%= pkg.homepage %>\n" +
      "* v<%= pkg.version %>\n" +
      "*/\n\n",

    srcFile: "index.js",


    // Task configuration.
    jshint: {
      options: {
        jshintrc: true
      },
      gruntfile: ["Gruntfile.js"],
      src: ["<%= srcFile %>"]
    },

    uglify: {
      options: {
        banner: "<%= banner %>",
        report: "min"
      },
      js: {
        options: {
          preserveComments: "all",
          beautify: {
            beautify: true,
            // `indent_level` requires jshint -W106
            indent_level: 2
          },
          mangle: false,
          compress: false
        },
        files: [{
          src: "<%= srcFile %>",
          dest: "dist/<%= pkg.name %>.js"
        }]
      },
      min: {
        options: {
          preserveComments: function(node, comment) {
            return comment &&
              comment.type === "comment2" &&
              /^(!|\*!)\r?\n/.test(comment.value);
          },
          sourceMap: true,
          sourceMapName: function(dest) {
            return dest.replace(".min.js", ".min.map");
          },
          // Bundles the contents of "`src`" into the "`dest`.map" source map file. This way,
          // consumers only need to host the "*.min.js" and "*.min.map" files rather than
          // needing to host all three files: "*.js", "*.min.js", and "*.min.map".
          sourceMapIncludeSources: true
        },
        files: [{
          src: "<%= srcFile %>",
          dest: "dist/<%= pkg.name %>.min.js"
        }]
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  // Default task.
  grunt.registerTask("default", ["jshint", "uglify"]);

  // Travis CI task.
  grunt.registerTask("travis", ["jshint"]);

};
