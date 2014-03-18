
    var Scales = {
        linear: function(a, b, x, y){
            var brange = b - a;
            var yrange = y - x;
            return function Scale(z){
                var bottom = z - a;
                var scaling = bottom / brange;
                var expansion = scaling * yrange;
                var position = x + expansion;
                return position;
            };
        },
        log: function(a, b, x, y){
            function log10(z){
                return Math.log(z) / Math.LN10;
            }
            var linA = a == 0 ? 0 : log10(a);
            var linB = b == 0 ? 0 : log10(b);
            linear = Scales.linear(linA, linB, x, y);
            return function Scale(z){
                return linear(log10(z));
            }
        },
        threshold: function(domain, range){
            var buckets = domain.length;
            return function FindThreshold(z){
                var i = -1, x = null;
                do {
                    x = domain[++i];
                } while(i < domain.length && x < z);
                return range[i];
            }
        }
    };

    angular.module("Scale", [])
    .run(function($window, $rootScope){
        /* Do angular things when the window resizes. */
        $window.onresize = function(){
            $rootScope.$broadcast('Window Resized');
            $rootScope.$digest();
        }
    })
    .run(function($window, $rootScope){
        $rootScope.TWO_PI = 2 * Math.PI;
    })
    .filter('scale', function(){
        return function Scale(value, scale){
            return scale(value);
        }
    })
    .filter('path', function(){
        return function Path(valfunc, tmin, tmax, tstep, tscale, xscale, yscale){
            function getVal(t){
                t = tscale(t);
                var val = valfunc(t), x, y;
                if(val.length){
                    y = val[1];
                    x = val[0];
                } else {
                    y = val;
                    x = t;
                }
                return [xscale(x), yscale(y)];
            }
            var points = [];

            while(tmin <= tmax) {
                points.push(getVal(tmin));
                tmin += tstep;
            }

            var p0 = points[0];
            var m = '' + p0[0] + ',' + p0[1];

            var path = "M" + m + d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
            return path;
        }
    })
    .directive('trackScales', function($parse){
        return {
          priority: -1000,
            link: function($scope, $element, attrs){
                var setScales = (function setScales(){
                    // Get the bounds of the parent element
                    var height = $element[0].parentNode.offsetHeight;
                    var width = $element[0].parentNode.offsetWidth;

                    // Reset the scales
                    $scope.$scales = {};

                    // Evaluate the expression to get the scale params
                    var scales = $parse(attrs['trackScales'])();
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
