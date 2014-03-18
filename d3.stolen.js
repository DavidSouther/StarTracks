var EPSILON = 1e-6;

// Hermite spline construction; generates "C" commands.
function d3_svg_lineHermite(points, tangents) {
    var quad = points.length != tangents.length,
        path = "",
        p0 = points[0],
        p = points[1],
        t0 = tangents[0],
        t = t0,
        pi = 1;

    if (quad) {
        path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3) + "," + p[0] + "," + p[1];
        p0 = points[1];
        pi = 2;
    }
    if (tangents.length > 1) {
        t = tangents[1];
        p = points[pi];
        pi++;
        path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1]) + "," + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
        for (var i = 2; i < tangents.length; i++, pi++) {
            p = points[pi];
            t = tangents[i];
            path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
        }
    }
    if (quad) {
        var lp = points[pi];
        path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3) + "," + lp[0] + "," + lp[1];
    }

    return path;
}
// Generates tangents for a cardinal spline.
function d3_svg_lineCardinalTangents(points, tension) {
    var tangents = [],
        a = (1 - tension) / 2,
        p0,
        p1 = points[0],
        p2 = points[1],
        i = 1,
        n = points.length;
    while (++i < n) {
        p0 = p1;
        p1 = p2;
        p2 = points[i];
        tangents.push([a * (p2[0] - p0[0]), a * (p2[1] - p0[1])]);
    }
    return tangents;
}

// Interpolates the given points using Fritsch-Carlson Monotone cubic Hermite
// interpolation. Returns an array of tangent vectors. For details, see
// http://en.wikipedia.org/wiki/Monotone_cubic_interpolation
function d3_svg_lineMonotoneTangents(points) {
    var tangents = [],
        d,
        a,
        b,
        s,
        m = d3_svg_lineFiniteDifferences(points),
        i = -1,
        j = points.length - 1;
    // The first two steps are done by computing finite-differences:
    // 1. Compute the slopes of the secant lines between successive points.
    // 2. Initialize the tangents at every point as the average of the secants.
    // Then, for each segment…
    while (++i < j) {
        d = d3_svg_lineSlope(points[i], points[i + 1]);
        // 3. If two successive yk = y{k + 1} are equal (i.e., d is zero), then set
        // mk = m{k + 1} = 0 as the spline connecting these points must be flat to
        // preserve monotonicity. Ignore step 4 and 5 for those k.
        if (Math.abs(d) < EPSILON) {
            m[i] = m[i + 1] = 0;
        } else {
            // 4. Let ak = mk / dk and bk = m{k + 1} / dk.
            a = m[i] / d;
            b = m[i + 1] / d;
            // 5. Prevent overshoot and ensure monotonicity by restricting the
            // magnitude of vector <ak, bk> to a circle of radius 3.
            s = a * a + b * b;
            if (s > 9) {
                s = d * 3 / Math.sqrt(s);
                m[i] = s * a;
                m[i + 1] = s * b;
            }
        }
    }
    // Compute the normalized tangent vector from the slopes. Note that if x is
    // not monotonic, it's possible that the slope will be infinite, so we protect
    // against NaN by setting the coordinate to zero.
    i = -1;
    while (++i <= j) {
        s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0]) / (6 * (1 + m[i] * m[i]));
        tangents.push([s || 0, m[i] * s || 0]);
    }
    return tangents;
}

// Computes the slope from points p0 to p1.
function d3_svg_lineSlope(p0, p1) {
    return (p1[1] - p0[1]) / (p1[0] - p0[0]);
}

// Compute three-point differences for the given points.
// http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Finite_difference
function d3_svg_lineFiniteDifferences(points) {
    var i = 0,
        j = points.length - 1,
        m = [],
        p0 = points[0],
        p1 = points[1],
        d = m[0] = d3_svg_lineSlope(p0, p1);
    while (++i < j) {
        m[i] = (d + (d = d3_svg_lineSlope(p0 = p1, p1 = points[i + 1]))) / 2;
    }
    m[i] = d;
    return m;
}