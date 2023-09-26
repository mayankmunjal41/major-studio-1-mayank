// Load the main data
d3.csv('yearly_counts_processed.csv').then(function(data) {

    var parseYear = d3.timeParse("%Y");

    // Convert string values to numbers and Date objects
    data.forEach(function(d) {
        d.Year = parseYear(d.Year); // Convert to Date object
        d.Drawing = +d.Drawing || 0;
        d.Painting = +d.Painting || 0;
        d.Sculpture = +d.Sculpture || 0;
        d.Photograph = +d.Photograph || 0;
        d.Print = +d.Print || 0;
    });

    data.sort(function(a, b) {
        return a.Year - b.Year;
    });

    var margin = { left: 150, right: 50, top: 40, bottom: 30 };
    var width = 600 - margin.left - margin.right;
    var height = 100 - margin.top - margin.bottom;

    // Define categories you want to plot
    var categories = ['Drawing', 'Painting', 'Sculpture', 'Photograph', 'Print'];

    // Load the image data
    d3.csv('updated_data.csv').then(function(imageData) {
        // Convert string values to numbers
        imageData.forEach(function(d) {
            d.Year = +d.beginyear;
        });

        // Create an SVG for each category
        categories.forEach(function(category, index) {
            // Filter the data for the current category
            var categoryData = data.map(function(d) {
                return {
                    Year: d.Year,
                    [category]: d[category]
                };
            });

            // Calculate the total number of this category across all years
            var totalCategoryCount = d3.sum(categoryData, function(d) {
                return d[category];
            });

            var svg = d3.select('#area-charts')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var xScale = d3.scaleTime()
                .domain([d3.min(data, function(d) { return d.Year; }), d3.max(data, function(d) { return d.Year; })])
                .range([0, width]);

            var yScale = d3.scalePow()
                .exponent(0.4)
                .domain([0, d3.max(data, function(d) { return d[category]; })])
                .range([height, 0]);

            var area = d3.area()
                .x(function(d) { return xScale(d.Year); })
                .y0(height)
                .y1(function(d) { return yScale(d[category]); });

            // Assuming you have a div with the class 'selected-period' to display the selected period
            var selectedPeriodDiv = d3.select('.selected-period');

            // Bind click event to x-axis
            svg.on('click', function(event, d) {
                var [x, y] = d3.pointer(event);

                // Convert the x-coordinate to a year
                var clickedYear = xScale.invert(x);

                // Calculate the 10-year range
                var endDate = new Date(clickedYear);
                endDate.setFullYear(endDate.getFullYear() + 10);

                // Display the selected time period above the images
                selectedPeriodDiv.html('');
                selectedPeriodDiv.append('div')
                    .text('Selected Period: ' + clickedYear.getFullYear() + ' - ' + endDate.getFullYear())
                    .style('font-weight', 'bold');

                // ... (rest of the code for highlighting and displaying images)
            });

            // Bind and draw the area chart for the current category's data
            svg.selectAll('.area-path')
                .data([categoryData])
                .enter()
                .append('path')
                .attr('class', 'area-path')
                .attr('d', area);

            // Add labels on the left
            svg.append('text')
                .attr('x', -margin.left / 2)
                .attr('y', height / 2)
                .attr('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text(category);

            // Display the total number of this category across all years
            svg.append('text')
                .attr('x', -margin.left / 2)
                .attr('y', height +10)
                .attr('text-anchor', 'middle')
                .style('font-weight', 'light')
                .style('font-size', '14')
                .text(totalCategoryCount);

            // Add the x-axis to all charts outside the loop
            var xAxis = svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', 'translate(0,' + height + ')')
                .call(d3.axisBottom(xScale).ticks(10));

            // Add click event to x-axis
            svg.on('click', function(event, d) {
                var [x, y] = d3.pointer(event);

                // Convert the x-coordinate to a year
                var clickedYear = xScale.invert(x);

                // Calculate the 10-year range
                var endDate = new Date(clickedYear);
                endDate.setFullYear(endDate.getFullYear() + 10);

                // Highlight the selected period on the chart
                svg.selectAll('.selected-range').remove(); // Remove existing highlights
                svg.append('rect')
                    .attr('class', 'selected-range')
                    .attr('x', xScale(clickedYear))
                    .attr('y', 0)
                    .attr('width', xScale(endDate) - xScale(clickedYear))
                    .attr('height', height);

                // Log the image URLs associated with the category for the clicked year range
                var imageURLs = imageData
                    .filter(function(entry) {
                        return entry.Year >= clickedYear.getFullYear() && entry.Year <= endDate.getFullYear() && entry.classification === category;
                    })
                    .map(function(entry) {
                        return entry.iiifthumburl;
                    });

                // Display the total number of loaded images associated with the selected period and category
                var totalImages = imageURLs.length;

               // Display the total number of loaded images associated with the selected period and category
                var totalImages = imageURLs.length;

                // Calculate the start and end years for the selected period
                var startYear = clickedYear.getFullYear();
                var endYear = endDate.getFullYear();

                // Assuming you have a div with the class 'totals' to display the totals
                var totalsDiv = d3.select('.totals');
                totalsDiv.html('');
                totalsDiv.append('div')
                    .html('<span style="font-weight: bold;">Year Range:</span> ' + startYear + ' - ' + endYear)
                totalsDiv.append('div')
                    .html('<span style="font-weight: bold;">Number of </span>' + `<span style="font-weight: bold;">${category}</span>` + '<span style="font-weight: bold;">s: </span>'+ totalImages)
                

                // Assuming you have a div with the ID 'image-display' to display the images
                var imageDisplay = d3.select('#image-display');

                // Remove existing images
                imageDisplay.selectAll('img').remove();

                // Define max width and height based on the number of images
                var maxWidth = 100;
                var maxHeight = 100;

                if (totalImages > 10 && totalImages <= 20) {
                    maxWidth = 100;
                    maxHeight = 100;
                } else if (totalImages > 20) {
                    maxWidth = 25;
                    maxHeight = 25;
                }

                // Calculate available space for images
                var availableWidth = imageDisplay.node().offsetWidth - maxWidth;
                var availableHeight = imageDisplay.node().offsetHeight - maxHeight;

                // Add images with random positions
                imageURLs.forEach(function(imageURL) {
                    var img = imageDisplay.append('img')
                        .attr('src', imageURL)
                        .attr('alt', category + ' Image')
                        .style('max-width', maxWidth + 'px')
                        .style('max-height', maxHeight + 'px')
                        .style('position', 'absolute')
                        .style('left', Math.random() * availableWidth + 'px')
                        .style('top', Math.random() * availableHeight + 'px')
                        .on('error', function() {
                            // Handle image loading error here
                            console.error('Failed to load image:', imageURL);
                            d3.select(this).remove(); // Remove the broken image
                        });
                });
            });
        });
    });
})
.catch(function(error) {
    console.error(error);
});
