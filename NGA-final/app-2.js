// Set up dimensions and margins
let height = window.innerHeight;
let width = window.innerWidth;
let margin = { top: 50, right: 50, bottom: 50, left: 50 };

let chartState = {};

let svg = d3.select("#svganchor").append("svg").attr("width", width).attr("height", height);

let xScale = d3.scaleLinear().range([margin.left, width - margin.right]);

svg
  .append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + (height - margin.bottom) + ")");

// Create a brush
let brush = d3.brushX()
  .extent([[margin.left, 0], [width - margin.right, height]])
  .on("brush end", brushed);

// Append a g element to hold the brush
let brushG = svg.append("g")
  .attr("class", "brush")
  .call(brush);

// Handle click events for setting a 50-year range centered around the clicked point
function click(event) {
    redraw();
}

// Listen for click events on the brush overlay
brushG.on("click", click);

// Load and process data
d3.csv("weighted_sample_with_colors.csv")
  .then(function (data) {
    let dataSet = data;

    // Set chart domain max value to the highest total value in the data set
    xScale.domain(d3.extent(data, function (d) {
      return +d.beginyear;
    }));

    // Create color scale based on the "color" column
    let colorScale = d3.scaleOrdinal().domain(data.map((d) => d.hex_color)).range(d3.schemeCategory10);

    redraw();

    function redraw() {
      xScale = d3.scaleLinear().range([margin.left, width - margin.right]);

      xScale.domain(d3.extent(dataSet, function (d) {
        return +d.beginyear;
      }));

      let xAxis;

      xAxis = d3.axisBottom(xScale);

      d3.transition(svg)
        .select(".x.axis")
        .transition()
        .duration(1000)
        .call(xAxis);

      // Create simulation with the specified dataset
      let simulation = d3.forceSimulation(dataSet)
        .force("x", d3.forceX(function (d) {
          return xScale(+d.beginyear);
        }).strength(1))
        .force("y", d3.forceY((height / 2) - margin.bottom / 2))
        .force("collide", d3.forceCollide(6))
        .stop();

      // Manually run simulation
      for (let i = 0; i < dataSet.length; ++i) {
        simulation.tick();
      }

      // Create country circles
      let countriesCircles = svg.selectAll(".countries").data(dataSet, function (d) {
        return d.country;
      });

      countriesCircles
        .enter()
        .append("circle")
        .attr("class", "countries")
        .attr("cx", function (d) {
          return xScale(d.beginyear);
        })
        .attr("cy", (height / 2) - margin.bottom / 2)
        .attr("r", 5)
        .attr("fill", function (d) {
          return colorScale(d.hex_color);
        })
        .merge(countriesCircles)
        .on("mouseover", function (event, d) {
          // Log the color of the hovered circle
          console.log("Hovered Circle Color:", d.hex_color);

          // Keep the color of the hovered circle unchanged
          d3.select(this)
            .transition()
            .duration(200)
            .attr("fill", colorScale(d.hex_color));

          // Identify and change the color of circles that don't match the hovered circle's color
          d3.selectAll(".countries")
            .each(function (datum) {
              if (datum.hex_color !== d.hex_color) {
                d3.select(this)
                  .transition()
                  .duration(200)
                  .attr("fill", "white");
              }
            });
        })
        .on("mouseout", function (event, d) {
          // Revert the color for all circles on mouseout
          d3.selectAll(".countries")
            .transition()
            .duration(200)
            .attr("fill", function (datum) {
              return colorScale(datum.hex_color);
            });
        })
        .transition()
        .duration(2000)
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        })
        .attr("fill", function (d) {
          return colorScale(d.hex_color);
        });
    }
  })
  .catch(function (error) {
    if (error) throw error;
  });

// Function to handle brush events
function brushed(event) {
    if (event.selection) {
      // Get the selected range
      let selectedRange = event.selection.map(xScale.invert);
  
      // Update xScale domain based on the selected range
      xScale.domain(selectedRange);
  
      // Update x-axis
      svg.select(".x.axis").call(d3.axisBottom(xScale));
  
      // Update the x-coordinates of circles with a transition
      svg.selectAll(".countries")
        .transition()
        .duration(1000)
        .attr("cx", function (d) {
          return xScale(d.beginyear);
        });
  
      // Create simulation with the specified dataset
      let simulation = d3.forceSimulation(dataSet)
        .force("x", d3.forceX(function (d) {
          return xScale(+d.beginyear);
        }).strength(1))
        .force("y", d3.forceY((height / 2) - margin.bottom / 2))
        .force("collide", d3.forceCollide(6))
        .stop();
  
      // Manually run simulation
      for (let i = 0; i < dataSet.length; ++i) {
        simulation.tick();
      }
  
      // Update the y-coordinates of circles with a transition
      svg.selectAll(".countries")
        .transition()
        .duration(1000)
        .attr("cy", function (d) {
          return d.y;
        });
    }
  }
