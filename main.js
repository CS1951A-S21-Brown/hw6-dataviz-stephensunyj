// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = { top: 40, right: 100, bottom: 40, left: 175 };
const NUM_EXAMPLES = 10;

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 500;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

// load csv
let filenames = ["data/video_games.csv", "data/top_genre_by_region.csv", "data/top_publisher_per_genre.csv"];

let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate( ${margin.left + 50}, ${margin.top})`);    // HINT: transform

// linear scale for x axis - sales
let x = d3.scaleLinear()
    .range([9, graph_1_width - margin.left - margin.right]);

// scale band for y axis
let y = d3.scaleBand()
    .range([0, graph_1_height - margin.top - margin.bottom])
    .padding(0.1);

let countRef = svg.append("g");
let y_axis_label = svg.append("g");
let x_axis_label = svg.append("g")



function topSalesYear(attr, year) {
    d3.csv(filenames[0]).then(function (all_data) {
        // TODO: Clean and strip desired amount of data for barplot
        if (year != 2021) {
            data = all_data.filter(d => d.Year == year);
        }
        else {
            data = all_data;
        }
        for (var i = 0; i < Math.min(NUM_EXAMPLES, data.length); i++) {
            data[i].Global_Sales = parseInt(data[i].Global_Sales)
        }
        data = cleanData(data, function (a, b) { return b.Global_Sales - a.Global_Sales }, NUM_EXAMPLES)
        console.log(data)
        svg.selectAll("text").remove();
        if (data.length == 0) {
            svg.append("text")
                .attr("transform", `translate( ${(graph_1_width - margin.left - margin.right) / 2}, ${margin.bottom + 10})`)        // HINT: Place this at the bottom middle edge of the graph
                .style("text-anchor", "middle")
                .text("No data available");
        }
        svg.append("text")
            .attr("transform", `translate( ${(graph_1_width - margin.left - margin.right) / 2}, ${graph_1_height - margin.top - margin.bottom + 15})`)        // HINT: Place this at the bottom middle edge of the graph
            .style("text-anchor", "middle")
            .text("Number of units sold (millions)");
        // Since this text will not update, we can declare it outside of the topSalesYear function

        //We declare global references to the y-axis label and the chart title to update the text when
        //the data source is changed.
        let y_axis_text = svg.append("text")
            .attr("transform", `translate( ${-170}, ${margin.top - 50})`)       // HINT: Place this at the center left edge of the graph
            .style("text-anchor", "middle");

        let title = svg.append("text")
            .attr("transform", `translate( ${(graph_1_width - margin.left - margin.right) / 2}, ${-25})`)         // HINT: Place this at the top middle edge of the graph
            .style("text-anchor", "middle")
            .style("font-size", 15);
        // Set x domain to global sales 
        x.domain([0, d3.max(data, d => d.Global_Sales)]);
        // Update y axis domains with desired attribute
        y.domain(data.map(d => d[attr]));

        // Render y-axis label
        y_axis_label.call((d3.axisLeft(y).tickSize(0).tickPadding(10)));

        //render x axis label
        x_axis_label.call((d3.axisTop(x).tickSize(10).tickPadding(0)));

        let bars = svg.selectAll("rect").data(data);

        let color = d3.scaleOrdinal()
            .domain(data.map(function (d) { return d[attr] }))
            .range(d3.quantize(d3.interpolateHcl("#AB3428", " #F4C74C"), NUM_EXAMPLES));

        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("fill", function (d) { return color(d[attr]) }) // Here, we are using functin(d) { ... } to return fill colors based on the data point d
            .attr("x", x(0))
            .attr("y", function (d) { return y(d[attr]) })               // HINT: Use function(d) { return ...; } to apply styles based on the data point
            .attr("width", function (d) { 
                if(d['Global_Sales']== 0){return 0}
                return x(parseInt(d['Global_Sales'])) })
            .attr("height", y.bandwidth());

        let counts = countRef.selectAll("text").data(data);
        // TODO: Render the text elements on the DOM
        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", function (d) { return x(d.Global_Sales) + 15 })       // HINT: Add a small offset to the right edge of the bar, found by x(d.count)
            .attr("y", function (d) { return y(d[attr]) + 15 })       // HINT: Add a small offset to the top edge of the bar, found by y(d.artist)
            .style("text-anchor", "start")
            .text(function (d) { return d3.format(".1f")(d.Global_Sales) });           // HINT: Get the count of the artist

        y_axis_text.text("Name");
        if (year == 2021) {
            title.text("Top global video game sales of all time")
        }
        else {
            title.text("Top global video game sales of " + year)
        }


        // Remove elements not in use if fewer groups in new dataset
        bars.exit().remove();
        counts.exit().remove();
    });
}

/**
 * Cleans the provided data using the given comparator then strips to first numExamples
 * instances
 */
function cleanData(data, comparator, numExamples) {
    // TODO: sort and return the given data with the comparator (extracting the desired number of examples)
    data.sort(comparator)
    data = data.slice(0, numExamples) // if data < numExamples, all data returned
    return data
}

// -----------------------------------------------------------------------------
// Graph 2 - map
function extractColumn(arr, column) {
    return arr.map(x => x[column])
}

d3.csv(filenames[1], function (d) {
    return {
        region: d.region,
        top_genre: d.top_genre,
    };
}).then(function (data) {
    console.log(data);

    var svg2 = d3.select("#graph2")
        .append("svg")
        .attr("width", graph_2_width)
        .attr("height", graph_2_height)
        .append("g")
        .attr("transform", `translate( ${margin.right - 100}, ${margin.top})`);

    var projection = d3.geoNaturalEarth()
        .scale(graph_2_width / 1.8 / Math.PI)
        .translate([graph_2_width / 2, graph_2_height / 2]);


    var topGenre = extractColumn(data, "top_genre");
    console.log(topGenre)
    var markers = [
        { long: -98.841, lat: 40.881, name: "North America", topGenre: topGenre[0] }, // north america
        { long: 12.744, lat: 48.679, name: "Europe", topGenre: topGenre[1] }, // europe
        { long: 139.153, lat: 36.513, name: "Japan", topGenre: topGenre[2] }, //Japan
        { long: 90.253, lat: 26.557, name: "Other Regions", topGenre: topGenre[3] }, // other
        { long: 0.0, lat: 0.0, name: "Global", topGenre: topGenre[4] }, // global
    ];

    // Load external data and boot
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function (data) {
        // Draw the map
        svg2
            .selectAll("path")
            .data(data.features)
            .enter().append("path")
            .attr("fill", "#6c6e6c")
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .style("stroke", "#fff")
            .style("opacity", .3)

        var Tooltip = d3.select("#graph2")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function (d) {
            Tooltip.style("opacity", 1)
        }
        var mousemove = function (d) {
            Tooltip
                .html(d.name + "<br>" + "Most popular genre: " + d.topGenre)
                .style("left", (d3.mouse(this)[0] - 60) + "px")
                .style("top", (d3.mouse(this)[1] + 450) + "px")
        }
        var mouseleave = function (d) {
            Tooltip.style("opacity", 0)
        }

        svg2.selectAll("myCircles")
            .data(markers)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return projection([d.long, d.lat])[0] })
            .attr("cy", function (d) { return projection([d.long, d.lat])[1] })
            .attr("r", 25)
            .style("fill", "#69b3a2")
            .attr("stroke", "#0A5DA0")
            .attr("stroke-width", 3)
            .attr("fill-opacity", .4)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
    });
    let title2 = svg2.append("text")
        .attr("transform", `translate( ${margin.left}, ${margin.top - 50})`)         // HINT: Place this at the top middle edge of the graph
        .style("text-anchor", "middle")
        .style("font-size", 25)
        .text("(Hover over the circles!)");
});

var width = graph_3_width / 2,
    height = graph_3_height / 2,

    radius = Math.min(width, height) / 2;
var svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate( ${margin.left + 300}, ${margin.top + 200})`)
//.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// svg3.append("g")
//     .attr("class", "slices");
// svg3.append("g")
//     .attr("class", "labels");
// svg3.append("g")
//     .attr("class", "lines");

// var width = 960,
//     height = 450,
// 	radius = Math.min(width, height) / 2;
console.log("width" + width + "height" + height + "radius" + radius)


var key = function (d) { return d.data.Publisher; };
// set the color scale


function updatePie(menuVal) {
    console.log("update" + menuVal)
    svg3.selectAll('path').remove()
    svg3.selectAll('text').remove()
    svg3.selectAll('polyline').remove()
    d3.csv(filenames[2]).then(function (all_data) {
        // TODO: Clean and strip desired amount of data for barplot
        data = all_data.filter(d => d.Genre == menuVal);

        var color = d3.scaleOrdinal()
            .domain(data.map(function (d) { return d["Publisher"] }))
            .range(d3.schemeDark2);

        // Compute the position of each group on the pie:
        var pie = d3.pie()
            .value(function (d) {
                console.log(d)
                return d.Publisher_Global_Sales;
            })

        var data_ready = pie(data, key)
        console.log('eeh')
        console.log(d3.entries(data))
        console.log(data_ready)
        // Now I know that group A goes from 0 degrees to x degrees and so on.

        // shape helper to build arcs:
        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
        // Another arc that won't be drawn. Just for labels positioning
        var outerArc = d3.arc()
            .innerRadius(radius * 1.3)
            .outerRadius(radius * 1.3)

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.

        var slices = svg3
            .selectAll('path')
        slices
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function (d) { return (color(d.data.Publisher)) })
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.7)


        // Now add the annotation. Use the centroid method to get the best coordinates
        // var text = svg3
        //     .selectAll('text')
        // text
        //     .data(data_ready)
        //     .enter()
        //     .append('text')
        //     .text(function (d) { return d.data.Publisher + ", " + d3.format(".1f")(d.data.Market_Share * 100) + "%" })
        //     .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
        //     .style("text-anchor", "middle")
        //     .style("font-size", 17)

        // Add the polylines between chart and labels:
        svg3
            .selectAll('allPolylines')
            .data(data_ready)
            .enter()
            .append('polyline')
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .attr('points', function (d) {
                var posA = arc.centroid(d) // line insertion in the slice
                var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
                var posC = outerArc.centroid(d); // Label position = almost the same as posB
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                return [posA, posB, posC]
            })

        // Add the polylines between chart and labels:
        svg3
            .selectAll('allLabels')
            .data(data_ready)
            .enter()
            .append('text')
            .text(function (d) { return d.data.Publisher + ", " + d3.format(".1f")(d.data.Market_Share * 100) + "%" })
            .attr('transform', function (d) {
                var pos = outerArc.centroid(d);
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
                return 'translate(' + pos + ')';
            })
            .style('text-anchor', function (d) {
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                return (midangle < Math.PI ? 'start' : 'end')
            })

    });
}
let title3 = svg3.append("text")
    .attr("transform", `translate( ${(graph_3_width - margin.left - margin.right) / 2}, ${100})`)         // HINT: Place this at the top middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .text("TEst3");

d3.select("input[type=range]#yearSlider").on("input", function () {
    var year;
    year = this.value;
    d3.select("output#year").text(d3.format(".0f")(year));
    topSalesYear("")
    //return d3.selectAll("circle.points").attr("opacity", opacity);
    topSalesYear("Name", year);
});


topSalesYear("Name", 2021)
updatePie("Action")
