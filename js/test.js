d3.csv("data/covid.csv").then(data => {
  // Parse the date values to a Date object
  let parseDate = d3.timeParse("%Y-%m-%d");
  data.forEach(function(d) {
      d.date = parseDate(d.date);
      for (let country in d) {
          if (country !== "date") d[country] = +d[country];
      }
  });

  // Define the margins and dimensions of the graph
  let margin = {top: 20, right: 20, bottom: 30, left: 50};
  let width = 600 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;

  // Create the x and y scales
  let x = d3.scaleTime().range([0, width]);
  let y = d3.scaleLinear().range([height, 0]);

  // Define the line
  let valueline = d3.line()
      .x(function(d) { return x(d.date); });

  // Create the SVG 'g' element (a group element)
  let svg = d3.select("svg").append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add the X Axis
  let xAxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")");

  // Add the Y Axis
  let yAxis = svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".0s")));

  // Add the dropdown menu
  let countries = data.columns.filter(c => c !== "date");
  let dropdown = d3.select("#countrySelect");
  dropdown.selectAll("option")
      .data(countries)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d);

  function updateChart(country) {
    // your existing updateChart function code here...
    valueline.y(function(d) { return y(d[country]); });

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d[country]; })]);

    xAxis.call(d3.axisBottom(x));
    yAxis.call(d3.axisLeft(y).tickFormat(d3.format(".0s")));

    let path = svg.selectAll(".line").data([data]);

    path.enter().append("path")
        .attr("class", "line")
        .merge(path)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", valueline);

    path.exit().remove();

    // Annotation
    svg.selectAll("g.annotation").remove();
    
    if (country === "World") {
        const annotations = [{
            note: {
                label: "The cases have been going up steadily for the entire world till the end of 2021",
                title: "Note for " + country
            },
            x: x(data[0].date),
            y: y(data[0][country]),
            dy: -30,
            dx: 0
        }];

        const makeAnnotations = d3.annotation()
            .annotations(annotations);

        svg.append("g")
            .attr("class", "annotation")
            .call(makeAnnotations);
    }
    // append dots on the line chart
    let dots = svg.selectAll(".dot")
        .data(data);

    dots.enter().append("circle")
        .attr("class", "dot")
        .attr("cx", function(d) { return x(d.date) })
        .attr("cy", function(d) { return y(d[country]) })
        .attr("r", 5)
        .style("fill", "steelblue")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    dots.exit().remove();
  }
    

  // Initialize with the first country
  updateChart(countries[0]);

  // Update the chart when a new country is selected
  dropdown.on("change", function() {
      updateChart(this.value);
  });
});


let tooltip = d3.select("#tooltip");

function mouseover(event, d) {
    let country = dropdown.node().value;
    tooltip
        .style("opacity", 1)
        .html("Date: " + d3.timeFormat("%Y-%m-%d")(d.date) + "<br>" + "Cases: " + d3.format(",")(d[country]));
}

function mousemove(event, d) {
    tooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 28) + "px");
}

function mouseout() {
    tooltip.style("opacity", 0);
}