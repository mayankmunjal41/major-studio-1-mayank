let height = window.innerHeight - 10;
let width = window.innerWidth - 50;
let margin = { top: 0, right: 50, bottom: 50, left: 50 };

let chartState = {};

let svg = d3.select("#svganchor").append("svg").attr("width", width).attr("height", height);

let xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + (height - 50) + ")");

// Function to create/update circles and apply event listeners
function updateCircles(dataSet) {
  // Create or update circles
  let countriesCircles = svg.selectAll(".countries").data(dataSet, function (d) {
    return d.country;
  });

  countriesCircles
    .enter()
    .append("circle")
    .attr("class", "countries")
    .merge(countriesCircles)
    .attr("cx", function (d) {
      return xScale(d.beginyear) + margin.left;
    })
    .attr("cy", (height / 2 + 10) - margin.bottom / 2)
    .attr("r", 5.5)
    .attr("fill", function (d) {
      return `rgb${d.hex_color}`;
    })
    .on("click", function (event, d) {
      // Your existing click event logic
      d3.select('body').style('overflow','auto');
      let firstSwatch = d3.select("#color-1");
      d3.select("#svganchor").style('display', 'none');
      d3.select("#palette-container").style("display", "block");
      d3.select(".images").style('display', 'flex');
      d3.select('.saved-colors').style('display', 'none')
      d3.select('body').style('height', '100%')
      d3.selectAll('.color').style('display', 'block');
      d3.selectAll('.close').style('opacity', 1);

      // select color and change color for first swatch
      let selectedColor = this.getAttribute('fill');
      let swatchColor = firstSwatch.style('background-color', selectedColor);

      d3.selectAll('.close').on('click', function() {

      d3.selectAll('.color').style('background', 'rgb(0,0,0)');
      d3.select('.images').html(null);
      d3.selectAll('.close').style('opacity',0)
        d3.select("#svganchor").style('display', 'block');
        d3.select(".images").style('display', 'none');
        d3.select("#palette-container").style("display", "none");
        d3.select('body').style('height', 'auto')

        
      })
   
      
      

      d3.selectAll(".countries")
        .each(function (d) {
          if (`rgb${d.hex_color}` === selectedColor) {
            let imgContainer = d3.select('.images').append('div').attr('class', 'img');

            imgContainer.append('img').attr('src', d.imageurl).attr('loading', 'lazy');; 
            let swatchContainer = imgContainer.append('div').attr('class', 'swatch');
            swatchContainer.append('div').attr('class', 'vibrant').style('background-color', d.Vibrant);
            swatchContainer.append('div').attr('class', 'lightVibrant').style('background-color', d.LightVibrant);
            swatchContainer.append('div').attr('class', 'darkVibrant').style('background-color', d.DarkVibrant);
            swatchContainer.append('div').attr('class', 'muted').style('background-color', d.Muted);
            swatchContainer.append('div').attr('class', 'lightMuted').style('background-color', d.LightMuted);
            swatchContainer.append('img').attr('src', 'arrow.svg').attr('class','arrow')



// Your event listener
d3.selectAll('.arrow').on('click', function() {
// Increase the count
count++;
d3.select('.wheel')
    .style('transform', 'translate(0,0) rotate(180deg)')
    .transition()
    .duration(1000)
    .style('transform', 'translate(0,0) rotate(180deg)')

    
// Update the count number
d3.select('.count-number').text(count);

// Show the count and count number
d3.select('.count').style('opacity', 1);
d3.select('.count-number').style('opacity', 1);

// Your selection logic
let divSelection = d3.select(this.parentNode).selectAll('div');

// Create an object to store the selection
let selection = {
fills: []  // Array to store fill values
};

// Iterate over the selection
divSelection.each(function() {
// Get the fill value
d3.select(this.parentNode.parentNode).select('.img img').style('filter', 'grayscale(1)')
var fillValue = d3.select(this).style('background-color');

// Log the fill value
console.log(fillValue);
d3.select(this).style('background-color', 'grey');
// Append the fill value to the fills array
selection.fills.push(fillValue);
});

// Log the count
console.log(`Count: ${count}`);
// Log the selection
console.log(selection);

// Add the current selection to the array
selectedSwatches.push(selection);
});



d3.select('.wheel').on('click', function() {
d3.selectAll('.color').style('display', 'none');
d3.select('.images').style('display', 'none');
d3.select('.select').style('display', 'none');
d3.select('.saved-colors').style('display', 'flex')
console.log(selectedSwatches);

// Create divs for each saved color palette
const paletteDivs = d3.select('.saved-palettes')
.selectAll('div.palette') // Use a class to select the divs
.data(selectedSwatches)
.enter()
.append('div')
.classed('palette', true) // Add a class to style the palette divs
.each(function(d) {
  // Create divs for each color in the palette
  d3.select(this)
    .selectAll('div.color')
    .data(d.fills)
    .enter()
    .append('div')
    .classed('color', true) // Add a class to style the color divs
    .style('background-color', color => color)
    .style('width', '30px')
    .style('height', '30px')
    .style('margin', '5px');
});
});
            d3.selectAll('.swatch > div').on('click', function() {
              let selectedSwatch = getComputedStyle(this).backgroundColor;

              let firstEmptyColor = d3.selectAll('.color').filter(function() {
                let backgroundColor = d3.select(this).style('background-color');
                return backgroundColor === 'rgb(0, 0, 0)' || backgroundColor === 'transparent';
              }).node();

              if (firstEmptyColor) {
                d3.select(firstEmptyColor).style('background-color', selectedSwatch);
              }
              let allColorsFilled = true;

              d3.selectAll('.color').each(function(d) {
                let backgroundColor = d3.select(this).style('background-color');
                console.log(backgroundColor);
              
                if (backgroundColor === 'rgb(0, 0, 0)' || backgroundColor === 'transparent') {
                  // This block will be executed when a color is transparent or rgba(0, 0, 0, 0)
                  allColorsFilled = false;
                }
              });
              
              if (allColorsFilled) {
                d3.select('.select').style('opacity',1);
                d3.select('.images').style('transform', 'translate(0,30px)')
                d3.select('.color-icon').style('transform', 'translate(0, 25px)')

                d3.select('.save').on('click', function() {
                  let masterSelection = d3.selectAll('.color');
                  count++
                  d3.select('.count-number').text(count);
                  // Show the count and count number
                  d3.select('.count').style('opacity', 1);
                  d3.select('.count-number').style('opacity', 1);
                  masterSelection.each(function() {
                   let masterValue =  d3.select(this).attr('style');
                   console.log(masterValue)
                  })
                });
              }

            
            });
          }
        });
    })
    .on("mouseover", function (event, d, i) {
      d3.select(this).style("cursor", "pointer");
      let hoveredFillColor = `rgb${d.hex_color}`;
      console.log(d)
      d3.selectAll(".countries")
        .each(function (datum) {
          if (`rgb${datum.hex_color}` !== hoveredFillColor) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("fill", "#3D3D3D");
          }
        });
    
          // console.log('hi')
        svg.select('.hover').style('opacity', 0).transition(3000)
        svg.select('.navigate-1').style('opacity', 0).transition(3000)

    
       
    })
    .on("mouseout", function (event, d) {
      d3.selectAll(".countries")
      .transition()
      .duration(200)
      .attr("fill", function (datum) {
        return `rgb${datum.hex_color}`;
      });
    });

  // Remove circles that are not in the updated dataset
  countriesCircles.exit().remove();
}

// Load and process data
d3.csv("closest_color_rgb.csv")
  .then(function (data) {
    let dataSet = data;

    // Set chart domain max value to the highest total value in the data set
    xScale.domain(d3.extent(data, function (d) {
      return +d.beginyear;
    }));

    // Create simulation with the specified dataset
let simulation = d3.forceSimulation(dataSet)
.force("x", d3.forceX(function (d) {
  return xScale(+d.beginyear);
}).strength(10))
.force("y", d3.forceY((height / 2 + 10)))
.force("collide", d3.forceCollide(6))
.stop();

// Manually run simulation
for (let i = 0; i < dataSet.length; ++i) {
simulation.tick();
}

    // Draw initial chart
    updateCircles(dataSet);

    // ... (your existing code)

    // Create buttons
    const buttons = [
      { id: "allButton", label: "All Periods", filterRange: null },
      { id: "renaissanceButton", label: "Renaissance", filterRange: [1400, 1600] },
      { id: "baroqueButton", label: "Baroque", filterRange: [1600, 1750] },
      { id: "romanticButton", label: "Romantic", filterRange: [1800, 1850] },
      { id: "modernismButton", label: "Early Modernism", filterRange: [1850, 1900] },
    ];

    // Append buttons to the page
    const buttonContainer = d3.select("body").append("div").attr("id", "buttonContainer");

    buttons.forEach(button => {
      buttonContainer
        .append("button")
        .attr("id", button.id)
        .text(button.label)
        .on("click", function () {
          // Filter data based on the selected range
          let filteredData = filterData(button.filterRange);
          // Update the chart with filtered data
          updateCircles(filteredData);
        });
    });

    // ... (your existing code)

    // Function to filter data based on the selected range
    function filterData(range) {
      let filteredData;
      if (range) {
        filteredData = data.filter(function (d) {
          return +d.beginyear >= range[0] && +d.beginyear <= range[1];
        });
      } else {
        // Show all data when the "All" button is clicked
        filteredData = data;
      }
      return filteredData;
    }

    // ... (your existing code)

  })
  .catch(function (error) {
    if (error) throw error;
  });
