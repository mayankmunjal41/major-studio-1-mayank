let height = window.innerHeight;
let width = 1400;
let margin = { top: 50, right: 50, bottom: 50, left: 50 };

let chartState = {};

let svg = d3.select("#svganchor").append("svg").attr("width", width).attr("height", height);

let xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
svg
  .append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + (height - margin.bottom) + ")");

// Load and process data
d3.csv("closest_color_rgb.csv")
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
        }).strength(10))
        .force("y", d3.forceY((height / 2) + 20))
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
          return xScale(d.beginyear) + margin.left;
        })
        .attr("cy", (height / 2) - margin.bottom / 2)
        .attr("r", 5.5)
        .attr("fill", function (d) {
          return `rgb${d.hex_color}`;
        })
        .merge(countriesCircles)
        .on("click", function (event, d) {
          d3.select('body').style('overflow','auto');
          let firstSwatch = d3.select("#color-1");
          d3.select("#svganchor").style('display', 'none');
          d3.select("#palette-container").style("display", "block");

          // select color and change color for first swatch
          let selectedColor = this.getAttribute('fill');
          let swatchColor = firstSwatch.style('background-color', selectedColor);

          d3.selectAll(".countries")
            .each(function (d) {
              if (`rgb${d.hex_color}` === selectedColor) {
                let imgContainer = d3.select('.images').append('div').attr('class', 'img');

                imgContainer.append('img').attr('src', d.imageurl);

                let swatchContainer = imgContainer.append('div').attr('class', 'swatch');
                swatchContainer.append('div').attr('class', 'vibrant').style('background-color', d.Vibrant);
                swatchContainer.append('div').attr('class', 'lightVibrant').style('background-color', d.LightVibrant);
                swatchContainer.append('div').attr('class', 'darkVibrant').style('background-color', d.DarkVibrant);
                swatchContainer.append('div').attr('class', 'muted').style('background-color', d.Muted);
                swatchContainer.append('div').attr('class', 'lightMuted').style('background-color', d.LightMuted);

                d3.selectAll('.swatch > div').on('click', function() {
                  let selectedSwatch = getComputedStyle(this).backgroundColor;

                  let firstEmptyColor = d3.selectAll('.color').filter(function() {
                    let backgroundColor = d3.select(this).style('background-color');
                    return backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent';
                  }).node();

                  if (firstEmptyColor) {
                    d3.select(firstEmptyColor).style('background-color', selectedSwatch);
                  }
                });
              }
            });
        })
        .on("mouseover", function (event, d) {
          let hoveredFillColor = `rgb${d.hex_color}`;

          d3.selectAll(".countries")
            .each(function (datum) {
              if (`rgb${datum.hex_color}` !== hoveredFillColor) {
                d3.select(this)
                  .transition()
                  .duration(200)
                  .attr("fill", "#3D3D3D");
              }
            });
        })
        .on("mouseout", function (event, d) {
          d3.selectAll(".countries")
            .transition()
            .duration(200)
            .attr("fill", function (datum) {
              return `rgb${datum.hex_color}`;
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
          return `rgb${d.hex_color}`;
        });

      // Append horizontal line
      svg.append("line")
        .attr("x1", margin.left - 20)
        .attr("y1", (height) / 2 + 30)
        .attr("x2", width + 1000)
        .attr("y2", (height) / 2 + 30)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);

      // Append vertical lines
      svg.selectAll(".vertical-line")
      // (width - margin.right) / 2, width - margin.right)
        .data([margin.left, ])
        .enter()
        .append("line")
        .attr("class", "vertical-line")
        .attr("x1", function(d) { return d; })
        .attr("y1", 200)
        .attr("x2", function(d) { return d; })
        .attr("y2", height - 50)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);
    }
  })
  .catch(function (error) {
    if (error) throw error;
  });
