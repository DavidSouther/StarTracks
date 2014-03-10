angular.module("HertzRuss", [])
.run(function($window, $rootScope){
    /* Do angular things when the window resizes. */
    $window.onresize = function(){
        $rootScope.$broadcast('Window Resized');
        $rootScope.$digest();
    }
})
.filter('scale', function(){
    return function Scale(value, scale){
        return scale(value);
    }
})
.directive('ngvgScale', function($parse){
    return {
        link: function($scope, $element, attrs){
            var setScales = (function setScales(){
                // Get the bounds of the parent element
                var height = $element[0].parentNode.offsetHeight;
                var width = $element[0].parentNode.offsetWidth;

                // Reset the scales
                $scope.$scales = {};

                // Evaluate the expression to get the scale params
                var scales = $parse(attrs['ngvgScale'])();
                for (var name in scales) { // Iterate the object
                    var scale = scales[name];
                    // The scale object is an array
                    var type = scale.shift();
                    var maxima = 0, minima = 0;
                    if (name == "x" || name == "y"){
                        var maxima = {
                            x: width,
                            y: height
                        }[name] || scale[2] || ((width + height) / 2);
                    } else {
                        minima = scale[2];
                        maxima = scale[3];
                    }
                    $scope.$scales[name] = Scales[type](scale[0], scale[1], minima, maxima);
                }
                return arguments.callee;
            }());
            $scope.$on('Window Resized', setScales);
        }
    }
})
;
