import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import RiTa from "https://cdn.jsdelivr.net/npm/rita@2.8.31/+esm";
import Sentiment from "https://cdn.jsdelivr.net/npm/sentiment@5.0.2/+esm";

const sentiment = new Sentiment();

// Data fetching function
const fetchData = async () => {
  const text = await d3.text("/text/Trump_2020.txt");

  const sentences = RiTa.sentences(text);

  return sentences.map((sentence) => {
    let score = sentiment.analyze(sentence).score;

    return {
      sentence,
      score,
    };
  });
};

// Fetch data from the API
const data = await fetchData();

// Create an SVG element for the line chart
const chartWidth = 1000; // Set the width of the container
const chartHeight = 200;
const chartSvg = d3
  .select("#app")
  .append("svg")
  .attr("width", chartWidth)
  .attr("height", chartHeight);

// Set the width of each stripe
const stripeWidth = chartWidth / data.length;

// Create a group for lines
const linesGroup = chartSvg.append("g");

// Create vertical lines based on the data with equal length
linesGroup
  .selectAll(".line")
  .data(data)
  .enter()
  .append("line")
  .attr("x1", (d, i) => i * stripeWidth)
  .attr("y1", chartHeight)
  .attr("x2", (d, i) => i * stripeWidth)
  .attr("y2", 0)
  .style("stroke", (d) => {
    if (d.score > 0) return "#A9FDAC"; // Positive
    else if (d.score < 0) return "#6C464E"; // Negative
    else return "#f1ffe7"; // Neutral
  })
  .style("stroke-width", stripeWidth) // Set the stroke width to the stripe width
  .style("stroke-linecap", "round") // Add round line caps for better visualization
  .on("mouseover", (event, d) => {
    // Show tooltip on hover
    const tooltip = document.getElementById("chart-tooltip");
    const sentimentScore = document.getElementById("sentiment-score");
    const sentenceText = document.getElementById("sentence-text");

    sentimentScore.innerText = d.score;
    sentenceText.innerText = d.sentence;

    // Adjust the tooltip position slightly to avoid flickering
    tooltip.style.display = "block";
    tooltip.style.left = `${event.pageX + 10}px`; // Adjust the position
    tooltip.style.top = `${event.pageY + 10}px`; // Adjust the position
  })
  .on("mouseout", () => {
    // Hide tooltip on mouseout
    const tooltip = document.getElementById("chart-tooltip");
    tooltip.style.display = "none";
  });
