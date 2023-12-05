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

// Load and process data
d3.csv("output_with_web_colors_hex.csv")
  .then(function (data) {
    let dataSet = data;
    console.log(dataSet)
    // Set chart domain max value to the highest total value in the data set
    xScale.domain(d3.extent(data, function (d) {
      return +d.beginyear;
    }));

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
        .force("collide", d3.forceCollide(5))
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
        .attr("r", 4)
        .attr("fill", function (d) {
          return `${d.hex_color}`; // Use the hex_color value directly from the dataset
        })
        .merge(countriesCircles)
        .on("mouseover", function (event, d) {
          // Log the color of the hovered circle
          let hoveredFillColor = d.hex_color;
          console.log("Hovered Circle Fill Color:", hoveredFillColor);

          // Identify and change the color of circles that don't match the hovered circle's fill color
          d3.selectAll(".countries")
            .each(function (datum) {
              if (datum.hex_color !== hoveredFillColor) {
                d3.select(this)
                  .transition()
                  .duration(200)
                  .attr("fill", "#3D3D3D");
              }
            });
        })
        .on("mouseout", function (event, d) {
          // Revert the color for all circles on mouseout
          d3.selectAll(".countries")
            .transition()
            .duration(200)
            .attr("fill", function (datum) {
              return datum.hex_color;
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
         return `${d.hex_color}`;
        });
    }
  })
  .catch(function (error) {
    if (error) throw error;
  });
