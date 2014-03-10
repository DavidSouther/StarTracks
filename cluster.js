function Cluster(starList){
    this.stars = starList.map(function(details){
        return new Star(details);
    });
};

window.LocalCluster = function LocalCluster(){
    Cluster.call(this, localCluster);
}

function fidget(num){
    var tenthNum = num * 0.1;
    var halfTenthNum = tenthNum * 0.5;
    return num + ((Math.random() * tenthNum) - halfTenthNum);
}

function Star(details){
    this.temperature = fidget(details.temperature);
    this.magnitude = fidget(details.magnitude);
    this.name = details.name;
}

Star.prototype.size = (function(){
    var STEFAN_BOLTZMAN_CONSTANT = 5.670373e-8
    var CONSTANT = 4 * Math.PI * STEFAN_BOLTZMAN_CONSTANT
    // var CONSTANT = 1;
    return function(){
        /* The size follows this formula. */
        // http://en.wikipedia.org/wiki/Main_sequence#Parameters
        // R = sqrt(L / 4 pi sig T ^ 4)
        var radius = Math.sqrt((this.luminosity()) / (CONSTANT * Math.pow(this.temperature, 4)))
        // return ((this.magnitude + 10)/ 30) * (this.temperature / 40000);
        return radius;
    };
}());

Star.prototype.luminosity = function(){
    /* Luminosity from magnitude, assuming constant distance. */
    // http://en.wikipedia.org/wiki/Luminosity#Magnitude
    return Math.pow(Math.E, ((this.magnitude + 2.72)/-2.5));
};
