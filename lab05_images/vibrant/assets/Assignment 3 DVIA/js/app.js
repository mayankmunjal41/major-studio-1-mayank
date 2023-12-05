import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import RiTa from "https://cdn.jsdelivr.net/npm/rita@2.8.31/+esm";
import Sentiment from "https://cdn.jsdelivr.net/npm/sentiment@5.0.2/+esm";

import { partsOfSpeech } from "./partsOfSpeech.js";

const sentiment = new Sentiment();

const fetchData = async () => {
  const text = await d3.text("/text/Frankenstein.txt");

  return text;
};

const data = await fetchData();

const app = d3.select('#app');

app.text(data);