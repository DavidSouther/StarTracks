window.Scales = {
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
