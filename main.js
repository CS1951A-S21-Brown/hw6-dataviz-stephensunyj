// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};
const NUM_EXAMPLES = 10;

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

// load csv
let filename = "data/video_games.csv";

let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate( ${margin.left}, ${margin.top})`);    // HINT: transform

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
        .attr("transform", `translate(${margin.left}, ${graph_1_height-margin.top-margin.bottom+10})`)        // HINT: Place this at the bottom middle edge of the graph

    svg.append("text")
        .attr("transform", `translate( ${(graph_1_width-margin.left-margin.right)/2}, ${graph_1_height-margin.top-margin.bottom+10})`)        // HINT: Place this at the bottom middle edge of the graph
        .style("text-anchor", "middle")
        .text("Number of units sold (millions)");
// Since this text will not update, we can declare it outside of the topSalesYear function

//We declare global references to the y-axis label and the chart title to update the text when
//the data source is changed.
let y_axis_text = svg.append("text")
    .attr("transform", `translate( ${-120}, ${(graph_1_height-margin.top-margin.bottom)/2})`)       // HINT: Place this at the center left edge of the graph
    .style("text-anchor", "middle");

let title = svg.append("text")
    .attr("transform", `translate( ${(graph_1_width-margin.left-margin.right)/2}, ${0})`)         // HINT: Place this at the top middle edge of the graph
    .style("text-anchor", "middle")
    .style("font-size", 15);

function topSalesYear(attr, year){
    d3.csv(filename).then(function(all_data){
        // TODO: Clean and strip desired amount of data for barplot
        if(year != 2021){
            data = all_data.filter(d => d.Year == year);
        }
        else {
            data = all_data;
        }
        for(var i = 0; i < Math.min(NUM_EXAMPLES, data.length); i++){
            data[i].Global_Sales = parseInt(data[i].Global_Sales)
        }
        data = cleanData(data, function(a,b){return b.Global_Sales-a.Global_Sales}, NUM_EXAMPLES)
        console.log(data)  
        // Set x domain to global sales 
        x.domain([0,d3.max(data, d => d.Global_Sales)]);
        // Update y axis domains with desired attribute
        y.domain(data.map(d => d[attr]));

        // Render y-axis label
        y_axis_label.call((d3.axisLeft(y).tickSize(0).tickPadding(10)));
        
        // render x axis label
        x_axis_label.call((d3.axisBottom(x).tickSize(10).tickPadding(10)));
        let bars = svg.selectAll("rect").data(data);

        let color = d3.scaleOrdinal()
            .domain(data.map(function(d) { return d[attr] }))
            .range(d3.quantize(d3.interpolateHcl(" #f92513", " #13f91e"), NUM_EXAMPLES));

        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("fill", function(d) { return color(d[attr]) }) // Here, we are using functin(d) { ... } to return fill colors based on the data point d
            .attr("x", x(0))
            .attr("y", function(d){return y(d[attr])})               // HINT: Use function(d) { return ...; } to apply styles based on the data point
            .attr("width", function(d){return x(parseInt(d['Global_Sales']))})
            .attr("height",   y.bandwidth());      
        
        y_axis_text.text("Name");
        title.text("Top global video game sales of all time")

        // Remove elements not in use if fewer groups in new dataset
        bars.exit().remove();
        //counts.exit().remove();
    });
}

/**
 * Cleans the provided data using the given comparator then strips to first numExamples
 * instances
 */
 function cleanData(data, comparator, numExamples) {
    // TODO: sort and return the given data with the comparator (extracting the desired number of examples)
    data.sort(comparator)
    data = data.slice(0,numExamples) // if data < numExamples, all data returned
    return data
}

d3.select("input[type=range]#yearSlider").on("input", function() {
    var year;
    year = this.value;
    d3.select("output#year").text(d3.format(".0f")(year));
    topSalesYear("")
    //return d3.selectAll("circle.points").attr("opacity", opacity);
    topSalesYear("Name", year);
  });


topSalesYear("Name",2021)
