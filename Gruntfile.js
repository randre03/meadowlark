/**
 * Created by randre03 on 8/25/14.
 */
module.exports = function(grunt) {
    //load plugins
    [
        'grunt-cafe-mocha',
        'grunt-contrib-jshint',
        'grunt-exec',
    ].forEach(function(task) {
            grunt.loadNpmTasks(task);
        });

    //configure plugins
    grunt.initConfig({
        cafemocha: {
            all:    { src: 'qa/tests-*.js', options: { ui: 'tdd' }, }
        },
        exec: {
            linkchecker:
            { cmd: '~/WebStormProjects/meadowlark/linkchecker-master/linkchecker http://localhost:3000' }
        },
    });

    //register tasks
    grunt.registerTask('default', ['cafemocha', 'jshint', 'exec']);
};