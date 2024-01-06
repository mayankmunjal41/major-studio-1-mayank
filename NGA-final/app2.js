let height = window.innerHeight - 10;
let width = window.innerWidth;
let margin = {
    top: 0,
    right: 50,
    bottom: 50,
    left: 50
};

let chartState = {};

let svg = d3.select("#svganchor").append("svg").attr("width", width).attr("height", height);

let xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height - 50) + ")");


let imageElements = [];


// Load and process data
d3.csv("data/closest_color_rgb.csv")
    .then(function(data) {
        let dataSet = data;
        // Set chart domain max value to the highest total value in the data set
        xScale.domain(d3.extent(data, function(d) {
            return +d.beginyear;
        }));

        function preloadImages() {
            // Create a promise for each image load
            const promises = dataSet.map((d) => {
                return new Promise((resolve, reject) => {
                    let img = new Image();
                    img.src = d.imageurl;
        
                    // Use the onload event to ensure the image is fully loaded
                    img.onload = () => {
                        imageElements.push(img);
                        resolve();
                    };
        
                    // Handle errors during image loading
                    img.onerror = (error) => {
                        reject(error);
                    };
                });
            });
        
            // Wait for all promises to be resolved before redrawing
            Promise.all(promises)
                .then(() => {
                    // All images are loaded, now redraw the chart
                    redraw();
                })
                .catch((error) => {
                    console.error("Error loading images:", error);
                });
        }
        

        preloadImages();

        redraw();

        function redraw() {
            xScale = d3.scaleLinear().range([margin.left, width - margin.right]);

            xScale.domain(d3.extent(dataSet, function(d) {
                return +d.beginyear;
            }));

            let xAxis;

            xAxis = d3.axisBottom(xScale)
                .tickValues([1400, 1600, 1750, 1800, 1850]);

            d3.transition(svg)
                .select(".x.axis")
                .transition()
                .duration(1000)
                .call(xAxis);

            // Create simulation with the specified dataset
            let simulation = d3.forceSimulation(dataSet)
                .force("x", d3.forceX(function(d) {
                    return xScale(+d.beginyear);
                }).strength(10))
                .force("y", d3.forceY((height / 2 + 10)))
                .force("collide", d3.forceCollide(6))
                .stop();

            // Manually run simulation
            for (let i = 0; i < dataSet.length; ++i) {
                simulation.tick();
            }

            // Create country circles
            let countriesCircles = svg.selectAll(".countries").data(dataSet, function(d) {
                console.log(d)
                return d.country;

            });

            countriesCircles.exit().remove();

            // Your array to store swatches
            let selectedSwatches = [];

            // Declare a count variable outside of the event listener
            let count = 0;

            countriesCircles
                .enter()
                .append("circle")
                .attr("class", "countries")
                .attr("cx", function(d) {
                    return xScale(d.beginyear) + margin.left;
                })
                .attr("cy", (height / 2 + 10) - margin.bottom / 2)
                .attr("r", 5.5)
                .attr("fill", function(d) {
                    return `rgb${d.hex_color}`;
                })
                .merge(countriesCircles)
                .on("click", function(event, d) {
                    d3.select('body').style('overflow', 'auto');
                    let firstSwatch = d3.select("#color-1");
                    d3.select("#svganchor").style('display', 'none');
                    d3.select("#palette-container").style("display", "block");
                    d3.select(".images").style('display', 'flex');
                    d3.select('.saved-colors').style('display', 'none')
                    d3.select('body').style('height', '100%')
                    d3.selectAll('.color').style('display', 'block');
                    d3.selectAll('.close').style('opacity', 1);
                    d3.select('.close').style('top', '90px');
                    d3.select('#buttonContainer').style('display', 'none')
                    d3.selectAll('.close-2').style('display', 'none')
                    d3.selectAll('.close-1').style('display', 'block')
                    // select color and change color for first swatch
                    let selectedColor = this.getAttribute('fill');
                    let swatchColor = firstSwatch.style('background-color', selectedColor);

                    // guided tour

                    d3.select('.close-2').on('click', function() {
                        d3.select(".images").style('display', 'flex');
                        d3.select('.saved-colors').style('display', 'none')
                        d3.select("#palette-container").style("display", "flex");
                        d3.selectAll('.close-2').style('display', 'none')
                        d3.selectAll('.close-1').style('display', 'block')
                    })

                    d3.select('.close-1').on('click', function() {
                        d3.select("#buttonContainer").style('display', 'flex');
                        d3.select('.images').html(null);
                        d3.select("#svganchor").style('display', 'block');
                        d3.select(".images").style('display', 'none');
                        d3.select("#palette-container").style("display", "none");
                        d3.select('body').style('height', 'auto')
                        d3.select('.saved-colors').style('display', 'none')
                        d3.selectAll('.close-1').style('display', 'none')

                    })


                    d3.selectAll(".countries")
                        .each(function(d) {
                            if (`rgb${d.hex_color}` === selectedColor) {
                                let imgContainer = d3.select('.images').append('div').attr('class', 'img');

                                imgContainer.append('img').attr('src', d.imageurl).attr('loading', 'lazy');;
                                let swatchContainer = imgContainer.append('div').attr('class', 'swatch');
                                swatchContainer.append('div').attr('class', 'vibrant').style('background-color', d.Vibrant);
                                swatchContainer.append('div').attr('class', 'lightVibrant').style('background-color', d.LightVibrant);
                                swatchContainer.append('div').attr('class', 'darkVibrant').style('background-color', d.DarkVibrant);
                                swatchContainer.append('div').attr('class', 'muted').style('background-color', d.Muted);
                                swatchContainer.append('div').attr('class', 'lightMuted').style('background-color', d.LightMuted);
                                swatchContainer.append('img').attr('src', 'assets/arrow.svg').attr('class', 'arrow')

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
                                        fills: [] 
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
                                    d3.selectAll('#palette-container').style('display', 'none');
                                    d3.select('.images').style('display', 'none');
                                    d3.select('.select').style('display', 'none');
                                    d3.select('.saved-colors').style('display', 'flex')
                                    d3.selectAll('.close-1').style('display', 'none')
                                    d3.selectAll('.close-2').style('display', 'block')
                                    console.log(selectedSwatches);

                                    // Create divs for each saved color palette
                                    const paletteDivs = d3.select('.saved-palettes')
                                        .selectAll('div.palette') 
                                        .data(selectedSwatches)
                                        .enter()
                                        .append('div')
                                        .classed('palette', true) 
                                        .each(function(d) {
                                            // Create divs for each color in the palette
                                            d3.select(this)
                                                .selectAll('div.color')
                                                .data(d.fills)
                                                .enter()
                                                .append('div')
                                                .classed('color', true) 
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
                                            allColorsFilled = false;
                                        }
                                    });

                                    if (allColorsFilled) {
                                        d3.select('.select').style('opacity', 1);
                                        d3.select('.images').style('transform', 'translate(0,30px)')
                                        d3.select('.color-icon').style('transform', 'translate(0, 25px)')
                                        
                                        d3.select('.save').on('click', function() {
                                            let masterSelection = d3.selectAll('.color');
                                            count++;
                                            d3.select('.count-number').text(count);
                                            // Show the count and count number
                                            d3.select('.count').style('opacity', 1);
                                            d3.select('.count-number').style('opacity', 1);

                                            // Create an array for the master palette
                                            let masterPalette = [];

                                            // Your selection logic for master palette
                                            masterSelection.each(function() {
                                                let fillValue = d3.select(this).style('background-color');
                                                masterPalette.push(fillValue);
                                            });

                                            // Add the master palette to selectedSwatches
                                            selectedSwatches.push({
                                                fills: masterPalette
                                            });

                                            // Remove existing master palette div
                                            d3.select('.saved-palettes').select('.master-palette').remove();

                                            // Create a div for the master palette with the class "master-palette"
                                            const masterPaletteDiv = d3.select('.saved-palettes')
                                                .append('div')
                                                .classed('master-palette', true);

                                            // Append colors to the master palette div
                                            masterPaletteDiv.selectAll('div.color')
                                                .data(masterPalette)
                                                .enter()
                                                .append('div')
                                                .classed('color', true)
                                                .style('background-color', color => color)
                                                .style('width', '30px')
                                                .style('height', '30px')
                                                .style('margin', '5px');

                                            // Log the count
                                            console.log(`Count: ${count}`);
                                            // Log the master palette
                                            console.log("Master Palette:", masterPalette);
                                            // Log the selected swatches
                                            console.log("Selected Swatches:", selectedSwatches);
                                        });

                                    }


                                });
                            }
                        });
                        //click tour 
                        console.log(d3.select('.img:nth-child(2)'))
                        d3.select('.img').append('div').attr('class', 'click-tour').html('Click to save palette');
                        d3.select('.img:nth-child(2)').append('div').attr('class', 'click-tour-2').html('Add to master palette');
                        d3.select('.click-tour').append('img').attr('src', "assets/line1.svg").attr('class', 'click-tour-line');            
                        d3.select('.click-tour-2').style('opacity', 0)

                        setTimeout(() => {
                            d3.select('.click-tour-2').style('opacity', 1)
                        
                            d3.select('.click-tour-2').append('img').attr('src', "assets/line1.svg").attr('class', 'click-tour-line');
                            d3.select('.click-tour').style('opacity', 0)
                        }, 3000)
                                      

                        setTimeout(() => {
                            d3.select('.click-tour-2').style('opacity', 0)
                        }, 6000)

                   
                })
                .on("mouseover", function(event, d, i) {
                    d3.select(this).style("cursor", "pointer");
                    let hoveredFillColor = `rgb${d.hex_color}`;
                    console.log(d)
                    d3.selectAll(".countries")
                        .each(function(datum) {
                            if (`rgb${datum.hex_color}` !== hoveredFillColor) {
                                d3.select(this)
                                    .transition()
                                    .duration(200)
                                    .attr("fill", "#3D3D3D");
                            }
                        });

                    svg.select('.hover').style('opacity', 0).transition(3000)
                    svg.select('.navigate-1').style('opacity', 0).transition(3000)


                })
                .on("mouseout", function(event, d) {
                    d3.selectAll(".countries")
                        .transition()
                        .duration(200)
                        .attr("fill", function(datum) {
                            return `rgb${datum.hex_color}`;
                        });
                })
                .transition()
                .duration(2000)
                .attr("cx", function(d) {
                    return d.x;
                })
                .attr("cy", function(d) {
                    return d.y;
                })
                .attr("fill", function(d) {
                    return `rgb${d.hex_color}`;
                });

            // Append horizontal line
            svg.append("line")
                .attr("x1", margin.left - 40)
                .attr("y1", (height) / 2 + 10)
                .attr("x2", width + 1000)
                .attr("y2", (height) / 2 + 10)
                .attr("stroke", "white")
                .attr("stroke-width", 0.5);

            // Append vertical lines
            svg.selectAll(".vertical-line")
                //margin.left, (width - margin.right) / 2, width - margin.right)
                .data([])
                .enter()
                .append("line")
                .attr("class", "vertical-line")
                .attr("x1", function(d) {
                    return d;
                })
                .attr("y1", 200)
                .attr("x2", function(d) {
                    return d;
                })
                .attr("y2", height - 50)
                .attr("stroke", "white")
                .attr("stroke-width", 0.5);

            //       svg.append("text")
            // .attr("class", "hover")
            // .attr("x", xScale(dataSet[44].beginyear) + margin.left + 10) // Adjust x position as needed
            // .attr("y", (height / 2) - margin.bottom / 2 - 85) // Adjust y position as needed
            // .attr("dy", "0.5em") // Adjust vertical alignment as needed
            // .style("fill", "white")
            // .style("font-size", "16px")
            // .text("Hover to view distribution");

            // svg.append("image")
            // .attr("class", "navigate-1")
            // .attr("x", xScale(dataSet[42].beginyear) + margin.left + 45) // Adjust x position as needed
            // .attr("y", (height / 2) - margin.bottom / 2 - 70) // Adjust y position as needed
            // .attr("width", 40) // Adjust width as needed
            // .attr("height", 40) // Adjust height as needed
            // .attr("xlink:href", "line1.svg") // Provide the path to your image file


    
        }

                // Delayed appearance of text and image with smooth transition
                setTimeout(() => {

                    svg.append("text")
                        .attr("class", "click")
                        .attr("x", xScale(dataSet[44].beginyear) + margin.left + 10)
                        .attr("y", (height / 2) - margin.bottom / 2 - 115)
                        .style("fill", "white")
                        .style("font-size", "14px")
                        .text("Click on different colors")
                        .append("tspan")
                        .attr("x", xScale(dataSet[44].beginyear) + margin.left + 10)
                        .attr("y", (height / 2) - margin.bottom / 2 - 95)
                        .text("to view collections.")
    
    
                    d3.select('.click')
                        .style('opacity', 0)
                        .transition().duration(1000)
                        .style('opacity', 1)
    
    
                    svg.append("image")
                        .attr("class", "navigate-2")
                        .attr("x", xScale(dataSet[40].beginyear) + margin.left + 45)
                        .attr("y", (height / 2) - margin.bottom / 2 - 85)
                        .attr("width", 40)
                        .attr("height", 40)
                        .attr("xlink:href", "assets/line1.svg")
                        .style('opacity', 0)
                        .transition().duration(1000)
                        .style('opacity', 1);
    
                }, 2000);
    
                // Hide text and image after 3 seconds with smooth transition
                setTimeout(() => {
                    svg.select('.hover').transition().duration(1000).style('opacity', 1);
                    svg.select('.navigate-1').transition().duration(1000).style('opacity', 1);
                    svg.select('.click').transition().duration(1000).style('opacity', 0);
                    svg.select('.navigate-2').transition().duration(1000).style('opacity', 0);
                }, 9000); 

            // Create buttons
            const buttons = [{
                id: "renaissanceButton",
                label: "Renaissance (1400-1600)",
                filterRange: [1400, 1600]
            },
            {
                id: "baroqueButton",
                label: "Baroque (1600-1750)",
                filterRange: [1600, 1750]
            },
            {
                id: "romanticButton",
                label: "Romantic (1800-1850)",
                filterRange: [1800, 1850]
            },
            {
                id: "modernismButton",
                label: "Early Modernism (1850-1900)",
                filterRange: [1850, 1900]
            },
            {
                id: "allButton",
                label: "All Periods",
                filterRange: null
            }
        ];

        // Append buttons to the page
        const buttonContainer = d3.select("body").append("div").attr("id", "buttonContainer");

        buttons.forEach(button => {
            buttonContainer
                .append("button")
                .attr("id", button.id)
                .text(button.label)
               
        });

        buttonContainer.selectAll('button').on("click", function() {
            const buttonId = d3.select(this).attr("id");
            const selectedButton = buttons.find(button => button.id === buttonId);
            filterData(selectedButton.filterRange);
            console.log('hi');

        });
        
        function filterData(range) {
            let filteredData;
            if (range) {
                filteredData = data.filter(function(d) {
                    return +d.beginyear >= range[0] && +d.beginyear <= range[1];
                });
            } else {
                // Show all data when the "All" button is clicked
                filteredData = data;

                
            }

            // Update the dataSet variable and redraw
            dataSet = filteredData;
            redraw();
        }
    })
    .catch(function(error) {
        if (error) throw error;
    });