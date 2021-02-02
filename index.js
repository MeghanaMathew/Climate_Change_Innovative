var lineSvg;
var radialSvg;
var temp = []

var margin = { top: 25, right: 100, bottom: 50, left: 25 };
var width = 600;
var height = 600;

console.log("check change 1")

window.addEventListener('DOMContentLoaded', (event) => {
    var chartWindow = d3.select('#lineChart');
    lineSvg = chartWindow.append('svg')
        .attr('id', 'lineChart')
        .attr('width', margin.left + margin.right + width)
        .attr('height', margin.top + margin.bottom + height)

    chartWindow = d3.select('#radialChart');
    radialSvg = chartWindow.append('svg')
        .attr('id', 'radialChart')
        .attr('width', width)
        .attr('height', height);

    d3.csv("/data/monthly_csv.csv", function (d) {
        temp.push({
            date: d['Date'],
            mean: +d['Mean'],
        });
    }).then(function (data) {
        /*
        var t = []
        temp1.forEach((d, id) => {
            t.push(d)
            if ((id+1) % 12 == 0) {
                temp2.push(t)
                t = []
            }
        })*/
        console.log(temp)

        drawLineChart()
        drawRadialChart()
    })
   })

function drawLineChart() {

    
    xScale = d3.scaleTime().range([0, width]).domain(d3.extent(temp, function (d) { return new Date(d.date); }))
    yScale = d3.scaleLinear().range([height, 0]).domain([-1, 20]);

    createAxis(xScale,yScale)
    var line = d3.line()
        .x(d => xScale(new Date(d.date)))
        .y(d => yScale(d.mean));

    var plot = lineSvg.append("path")
        .datum(temp)
        .attr('class', 'line')
        .attr('d', line)
        .attr('transform', "translate(" + margin.left + "," + margin.top + ")")
        .style('stroke', '#4099ff')
        .style('fill', 'none')
        .style('stroke-width', '1');

    var lineLength = plot.node().getTotalLength();

    plot
        .attr("stroke-dasharray",lineLength+" "+lineLength)
        .attr("stroke-dashoffset", lineLength)
        .transition()
        .duration(5000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

}

function drawRadialChart() {

    //console.log(temp)
    var innerRadius =100,
        outerRadius = Math.min(width, height) / 2 - 6;
    var xScale = d3.scaleTime()
        .range([0, 2 * Math.PI]);
    var yScale = d3.scaleRadial()
        .range([innerRadius, outerRadius]);

    xScale.domain([0,12]);
    yScale.domain(d3.extent(temp, function (d) { return d.mean; }));

    
    var rline = d3.lineRadial()
        .angle(function (d) { return xScale(new Date(d.date).getMonth()); })
        .radius(function (d) { return yScale(d.mean); });

    var rplot = radialSvg.append("path")
        .datum(temp)
        .attr("fill", "none")
        .attr("stroke", "#4099ff")
        .attr('transform', "translate(" + outerRadius + "," + outerRadius + ")")
        .attr("d", rline);


    var lineLength = rplot.node().getTotalLength();

    rplot
        .attr("stroke-dasharray", lineLength + " " + lineLength)
        .attr("stroke-dashoffset", lineLength)
        .transition()
        .duration(5000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    createRadialAxis(xScale, yScale)
}

function createRadialAxis(xScale,yScale) {

    var xAxis = radialSvg.append("g").attr('transform', "translate(" + 300 + "," + 300 + ")");
    
    var xTick = xAxis
        .selectAll("g")
        .data(xScale.ticks(12))
        .enter().append("g")
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
            return "rotate(" + ((xScale(d)) * 180 / Math.PI - 90) + ")translate(" + 100 + ",0)";
        });

    xTick.append("line")
        .attr("x2", -5)
        .attr("stroke", "#000");
    month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    xTick.append("text")
        .attr("transform", function (d) {
            var angle = xScale(d);
            return ((angle < Math.PI / 2) || (angle > (Math.PI * 3 / 2))) ? "rotate(90)translate(0,22)" : "rotate(-90)translate(0, -15)";
        })
        .text(function (d,i) {
            //console.log(d,i)
            return month[i];
        })
        .style("font-size", 16)
        .attr("opacity", 0.8)

    var start = 1960
    var end = 2016
    var title1 = radialSvg.append("g").attr('transform', "translate(" + 300 + "," + 280 + ")")
        .attr("class", "title")
        .append("text")
        .attr("dy", "-0.2em")
        .attr("text-anchor", "middle")
        .text("Year")

    var title2 = radialSvg.append("g").attr('transform', "translate(" + 300 + "," + 300 + ")")
        .attr("class", "title")
        .append("text")
        .attr("dy", "-0.2em")
        .attr("text-anchor", "middle")
        .text(start)
        .transition()
        .duration(5000)
        .ease(d3.easeLinear)
        .tween("text", function (d) {
            var i = d3.interpolate(this.textContent, end),
                prec = (d + "").split("."),
                round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

            return function (t) {
                this.textContent = Math.round(i(t) * round) / round;
            };
        });


    var yAxis = radialSvg.append("g").attr('transform', "translate(" + 300 + "," + 300 + ")")
        .attr("text-anchor", "middle");

    var yTick = yAxis
        .selectAll("g")
        .data(yScale.ticks(5))
        .enter().append("g");

    yTick.append("circle")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("opacity", 0.2)
        .attr("r", yScale);

    yAxis.append("circle")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("opacity", 0.8)
        .attr("r", function () { return yScale(yScale.domain()[0]) });

    var labels = yTick.append("text")
        .attr("y", function (d) { return -yScale(d); })
        .attr("dy", "0.35em")
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", 5)
        .attr("stroke-linejoin", "round")
        .text(function (d) { return d; });

    yTick.append("text")
        .attr("y", function (d) { return -yScale(d); })
        .attr("dy", "0.35em")
        .text(function (d) { return d; });
}



function createAxis(xScale,yScale) {
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale).ticks(10);

    lineSvg.append("g")
        .attr('transform', "translate(" + (margin.left) + "," + (height + margin.top) + ")")
        .call(xAxis)
    lineSvg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top + margin.bottom / 2)
        .style("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "14px")
        .style("font-weight", 700)
        .text("Years");

    lineSvg.append("g")
        .attr('transform', "translate(" + margin.left + "," + margin.top + ")")
        .call(yAxis)
        .append('text')
        .attr("x", height / 2)  
        .attr("y", margin.left / 2)                  
        .attr("transform", "rotate(-90)")
        .attr("fill", "#000")
        .style("font-family", "sans-serif")
        .style("font-size", "14px")
        .style("font-weight", 700)
        .text("Total values");
}