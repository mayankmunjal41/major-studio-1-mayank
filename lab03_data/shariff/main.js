let table;

// Define margin and other variables
let margin = 150; // Adjust this margin to fit your layout
let mediums = []; // Initialize the mediums array
let totalDisplayedMedium = []; // Initialize the totalDisplayedMedium array

// color scale for the mediums
const colorScale = d3.scaleOrdinal()
  .domain(mediums)
  .range(d3.schemeCategory10); // Basic color scheme

function preload() {
  table = loadTable('data/sculptureMedium.csv', 'csv', 'header');
}

function loadData() {
  // Initialize displayedMediums as an object
  let displayedMediums = {};

  for (let i = 0; i < table.getRowCount(); i++) {
    let sculptureMedium = table.getString(i, 'medium');
    let museumEra = table.getString(i, 'museumEra');
    let displayedInd = parseInt(table.getString(i, 'displayInd'));

     // Create a unique key for each combination of medium and museumEra
     let key = sculptureMedium + '-' + museumEra;

    if (displayedMediums.hasOwnProperty(key)) {
      displayedMediums[key] += displayedInd;
    } else {
      displayedMediums[key] = displayedInd;
    }
  }

  // Convert displayedMediums object to arrays for use in visualization
  mediums = Object.keys(displayedMediums);
  totalDisplayedMedium = Object.values(displayedMediums);
}

function setup() {
  const canvasWidth = windowWidth;
  const canvasHeight = windowHeight;
  createCanvas(canvasWidth, canvasHeight);
//   background(200);
  console.log('Does Bronze Reign Supreme? Analyzing Sculptures in the Collection');
  loadData(); // Load and process the data

  const svgMargin = { top: 100, right: 40, bottom: 40, left: 0 };
  const svgWidth = canvasWidth 
  const svgHeight = canvasHeight

  drawLabels(); // Draw labels
  drawMediums(svgWidth, svgHeight, svgMargin); // Draw the visualization using D3.js SVG
}

function drawLabels() {
  // Draw your axis labels and lines here
  // ...

  // Example x-axis label:
  
  textStyle(BOLD);
  textAlign(LEFT);
  textSize(20);
  text("Year Range", width/2 , height - 30 ); // Adjust label position and style

  // Example y-axis label:
  textStyle(BOLD);
  textAlign(RIGHT);
  textSize(10);
  text("NoOfDisplays", 20, height/2, 70); // Adjust label position and style
}

function drawMediums(svgWidth, svgHeight, svgMargin) {
  // Define dimensions and margins for the graphic

  // Define your D3 scales
  const yScale = d3
  .scaleLinear()
  .domain([0, d3.max(totalDisplayedMedium)])
  .nice()
  .range([svgHeight - svgMargin.bottom, svgMargin.top]); // Adjust the range to increase bar height

const xScale = d3
  .scaleBand()
  .domain(mediums)
  .range([svgMargin.left,svgWidth - svgMargin.right])  // Adjust the range to increase bar width
  .padding(0.5);

const sequentialScale = d3
  .scaleSequential()
  .domain([0, max(totalDisplayedMedium)])
  .interpolator(d3.interpolateRdYlBu);


  // Create an SVG container
  const svg = d3
    .select('body')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)

    const yAxis =  d3.axisLeft(yScale).ticks(5)

    svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(yAxis);



  // Attach a graphic element and append rectangles to it
  svg
    .append('g')
    .selectAll('rect')
    .data(mediums)
    .join('rect')
    .attr('x', function (d, i) {
      return xScale(d);
    })
    .attr('y', function (d, i) {
      return yScale(totalDisplayedMedium[i]);
    })
    .attr('height', function (d, i) {
      return yScale(0) - yScale(totalDisplayedMedium[i]);
    })
    .attr('width', xScale.bandwidth())
    .attr('fill', d => colorScale(d.key))
    .append('title')
    .text(function (d, i) {
        return `${mediums[i]}: ${totalDisplayedMedium[i]}`;   // Provide tooltip text based on your data
      });


     // X Axis
  const xAxis =  d3.axisBottom(xScale).tickSize(10);
  svg.append('g')
  .attr('transform', `translate(0,0)`)
  .call(xAxis)
  .selectAll('text')
  .style('text-anchor', 'middle')
//   .attr('dx', '-.6em')
//   .attr('dy', '-0.1em')
  .attr('transform', 'translate(0, 450)');

    svg
      .selectAll('.bar-label')
      .data(mediums)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', function (d) {
        return xScale(d) + xScale.bandwidth() / 2;
      })
      .attr('y', function (d, i) {
        return yScale(totalDisplayedMedium[i]); // Adjust the vertical position
      })
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .text(function (d, i) {
        return totalDisplayedMedium[i]; // Display the count on top of the bar
      });
}