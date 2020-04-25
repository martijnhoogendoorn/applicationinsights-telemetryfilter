module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            options: {
                comments: true
            },
            default: {
                tsconfig: './tsconfig.json',
                src: [
                    './src/*.ts',
                ]
            }
        }
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.registerTask("default", ["ts:default"]);
};