import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import RiTa from "https://cdn.jsdelivr.net/npm/rita@2.8.31/+esm";
import Sentiment from "https://cdn.jsdelivr.net/npm/sentiment@5.0.2/+esm";

const sentiment = new Sentiment();

// data fetching function
const fetchData = async () => {
const text = await d3.text("/text/Trump_2020.txt");

  const sentences = RiTa.sentences(text);

  return sentences.map((sentence) => {
    let score = sentiment.analyze(sentence).score;
    
    let category = undefined;

    if (score > 0) {
      category = "positive";
    } else if (score < 0) {
      category = "negative";
    } else {
      category = "neutral";
    }

    return {
      sentence,
      score,
      category,
    };
  });
};

// fetch data from API
const data = await fetchData();

const app = d3
  .select("#app")
  // replace the text of the app div with nothing
  .html("")
  // place chart in the center of the page
  .style("position", "fixed")
  .style("inset", "0")
  .style("padding", "50px")
  .style("overflow", "auto")
  // add new div for content to be placed in
  .append("div")
  .style("margin", "0 auto")
  .style("padding", "20px")
  .style("border-radius", "10px")
  .style("width", "fit-content")
  .style("background", "#fff")
  .style("box-shadow", "0px 0px 2px hsla(0, 0%, 0%, 0.1)");

// add title
const title = app
  .append("h1")
  .style("margin", "0")
  .style("padding-top", "8px")
  .style("padding-left", "2px")
  .style("padding-bottom", "12px")
  .style("font-size", "1.1rem")
  .style("font-weight", 600)
  .style("color", "#333")
  .text("Frankenstein Sentiment Analysis");

const table = app.append("table").style("border-collapse", "collapse");

const styleCell = (cell) => {
  cell
    .style("padding", "4px 8px")
    .style("border", "1px solid #ddd")
    .style("font-size", "0.9rem");
};

// add table headings
table
  .append("thead")
  .append("tr")
  .call((tr) => tr.append("td").text("Sentence"))
  .call((tr) => tr.append("td").text("Score"))
  .call((tr) => tr.append("td").text("Category"))
  .selectAll("td")
  .style("font-weight", 500)
  .style('color', '#000')
  .call(styleCell);

// add table body
table
  .append("tbody")
  .selectAll("td")
  .data(data)
  .join("tr")
  .call((tr) => tr.append("td").text((d) => d.sentence))
  .call((tr) => tr.append("td").text((d) => d.score))
  .call((tr) => tr.append("td").text((d) => d.category))
  .selectAll("td")
  .call(styleCell);
