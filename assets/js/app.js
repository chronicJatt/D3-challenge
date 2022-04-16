// makeResponsive function that houses chart function and automatically resizes it based on user's viewing window
function makeResponsive() {
    // Check to see if SVG area is empty, if not then clear it
    var svgArea = d3.select('body').select('svg');
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // Determine SVG wrapper dimensions based on current viewing window
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight * 0.925;

    var margin = {
        top: 5,
        bottom: 100,
        right: 25,
        left: 100
    };

    var height = svgHeight - margin.top - margin.bottom;
    var width = svgHeight - margin.left - margin.right;

    // Append SVG element
    var svg = d3
        .select('#scatter')
        .append('svg')
        .attr('height', svgHeight)
        .attr('width', svgWidth);

    // Append group element
    var chartGroup = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = 'poverty';
    var chosenYAxis = 'healthcare';

    // Function for updating xScale upon user interaction
    function xScale(csvData, chosenXAxis) {
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(csvData, d => d[chosenXAxis]) * 0.8,
            d3.max(csvData, d => d[chosenXAxis]) * 1.2])
            .range([0, width]);
        return xLinearScale;
    }

    // Function for updating yScale upon user interaction
    function yScale(csvData, chosenYAxis) {
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(csvData, d => d[chosenYAxis]) * 0.8,
            d3.max(csvData, d => d[chosenYAxis]) * 1.2])
            .range([height, 0]);
        return yLinearScale;
    }

    // Function for updating xAxis upon user interaction
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
        return xAxis;
    }

    // Function for updating xAxis upon user interaction
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
        return yAxis;
    }
    
    // Function used for updating circles group with a transition to new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        circlesGroup.transition()
            .duration(1000)
            .attr('cx', d => newXScale(d[chosenXAxis]))
            .attr('cy', d => newYScale(d[chosenYAxis]));
        return circlesGroup;
    }

    // Function for updating text group with a transition to new text
    function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        textGroup.transition()
            .duration(1000)
            .attr('x', d => newXScale(d[chosenXAxis]))
            .attr('y', d => newYScale(d[chosenYAxis]))
            .attr('text-anchor', 'middle');
        return textGroup;
    }

    // Function for updating circles group with new tooltip
    function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis, textGroup) {
        
        // If conditionals on x-axis
        if (chosenXAxis === 'poverty') {
            var xLabel = 'In Poverty (%)';
        }
        else if (chosenXAxis === 'age') {
            var xLabel = 'Age (Median)';
        }
        else {
            var xLabel = 'Household Income (Median)';
        }
        
        // If conditionals on y-axis
        if (chosenYAxis === 'healthcare') {
            var yLabel = 'Lacks Healthcare (%)';
        }
        else if (chosenYAxis === 'obesity') {
            var yLabel = 'Obese (%)';
        }
        else {
            var yLabel = 'Smokes (%)'
        }

        // Initialize Tooltip
        var toolTip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([80, -60])
            .html(function(d) {
                return (`<strong>${d.abbr}</strong>
                <br>${xLabel} ${d[chosenXAxis]}
                <br>${yLabel} ${d[chosenYAxis]}`);
            });
        
        // Create circles tooltip
        circlesGroup.call(toolTip);

        // Event listeners to display and hide circles tooltip
        circlesGroup.on('mouseover', function(data) {
            toolTip.show(data, this);
        }).on('mouseout', function(data) {
            toolTip.hide(data);
        });

        // Create text tooltip
        textGroup.call(toolTip);

        // Event listeners to display and hide text tooltip
        textGroup.on('mouseover', function(data) {
            toolTip.show(data, this);
        }).on('mouseout', function(data) {
            toolTip.hide(data);
        });
        return circlesGroup;
    }

    // Read in data csv
    d3.csv('assets/data/data.csv').then(function(csvData) {
        
        // Parse data - coverting string to numerical
        csvData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });

        // Create scales
        var xLinearScale = xScale(csvData, chosenXAxis);
        var yLinearScale = yScale(csvData, chosenYAxis);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append xAxis
        var xAxis = chartGroup.append('g')
            .classed('x-axis', true)
            .attr('transform', `translate(0, ${height})`)
            .call(bottomAxis);
        
        // Append yAxis
        var yAxis = chartGroup.append('g')
            .classed('y-axis', true)
            .call(leftAxis);

        // Append initial circles
        var circlesGroup = chartGroup.selectAll('circle')
            .data(csvData)
            .enter()
            .append('circle')
            .attr('cx', d => xLinearScale(d[chosenXAxis]))
            .attr('cy', d => yLinearScale(d[chosenYAxis]))
            .attr('r', 20)
            .attr('fill', 'pink');

        // Append text to circles
        var textGroup = chartGroup.selectAll('text')
            .data(csvData)
            .enter()
            .append('text')
            .attr('x', d => xLinearScale(d[chosenXAxis]))
            .attr('y', d => yLinearScale(d[chosenYAxis]))
            .text(d => (d.abbr))
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')
            .attr('fill', 'white');
        
        // Create group for three x-axis labels
        var xLabelsGroup = chartGroup.append('g')
            .attr('transform', `translate(${width / 2}, ${height + 20})`);
        
        var povertyLabel = xLabelsGroup.append('text')
            .attr('x', 0)
            .attr('y', 20)
            .attr('value', 'poverty')
            .classed('active', true)
            .text('In Poverty (%)');
        
        var ageLabel = xLabelsGroup.append('text')
            .attr('x', 0)
            .attr('y', 40)
            .attr('value', 'age')
            .classed('inactive', true)
            .text('Age (Median)');

        var incomeLabel = xLabelsGroup.append('text')
            .attr('x', 0)
            .attr('y', 60)
            .attr('value', 'income')
            .classed('inactive', true)
            .text('Household Income (Median)');

        // Create group for three y-axis labels
        var yLabelsGroup = chartGroup.append('g')
            .attr('transform', `translate(-25, ${height / 2})`)
        
        var healthcareLabel = yLabelsGroup.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -20)
            .attr('x', 0)
            .attr('value', 'healthcare')
            .attr('dy', '1em')
            .classed('axis-text', true)
            .classed('active', true)
            .text('Lacks Healthcare (%)');

        var smokesLabel = yLabelsGroup.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('x', 0)
            .attr('value', 'smokes')
            .attr('dy', '1em')
            .classed('axis-text', true)
            .classed('inactive', true)
            .text('Smokes (%)');

        var obesityLabel = yLabelsGroup.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('x', 0)
            .attr('value', 'obesity')
            .attr('dy', '1em')
            .classed('axis-text', true)
            .classed('inactive', true)
            .text('Obese (%)');

        // Call updateToolTip function
        var circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis, textGroup);

        // Event listener for xAxis labels
        xLabelsGroup.selectAll('text')
            .on('click', function() {
                // Grab and store value of user selection
                var value = d3.select(this).attr('value');
                // If selection is different from current then update values
                if (value !== chosenXAxis) {
                    chosenXAxis = value;
                    xLinearScale = xScale(csvData, chosenXAxis);
                    xAxis = renderXAxes(xLinearScale, xAxis);
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
                    // Update active selection
                    if (chosenXAxis === 'poverty') {
                        povertyLabel
                            .classed('active', true)
                            .classed('inactive', false);
                        ageLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        incomeLabel
                            .classed('active', false)
                            .classed('inactive', true);
                    }
                    else if (chosenXAxis === 'age') {
                        povertyLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        ageLabel
                            .classed('active', true)
                            .classed('inactive', false);
                        incomeLabel
                            .classed('active', false)
                            .classed('inactive', true);
                    }
                    else {
                        povertyLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        ageLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        incomeLabel
                            .classed('active', true)
                            .classed('inactive', false);
                    }
                }
            });

        // Event listener for yAxis labels
        yLabelsGroup.selectAll('text')
            .on('click', function() {
                // Grab and store value of user selection
                var value = d3.select(this).attr('value');
                // If selection is different from current then update values
                if (value !== chosenYAxis) {
                    chosenYAxis = value;
                    yLinearScale = yScale(csvData, chosenYAxis);
                    yAxis = renderYAxes(yLinearScale, yAxis);
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
                    // Update active selection
                    if (chosenYAxis === 'healthcare') {
                        healthcareLabel
                            .classed('active', true)
                            .classed('inactive', false);
                        obesityLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        smokesLabel
                            .classed('active', false)
                            .classed('inactive', true);
                    }
                    else if (chosenYAxis === 'obesity') {
                        healthcareLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        obesityLabel
                            .classed('active', true)
                            .classed('inactive', false);
                        smokesLabel
                            .classed('active', false)
                            .classed('inactive', true);
                    }
                    else {
                        healthcareLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        obesityLabel
                            .classed('active', false)
                            .classed('inactive', true);
                        smokesLabel
                            .classed('active', true)
                            .classed('inactive', false);
                    }
                }
            });
        
    }).catch(function(error) {
        console.log(error);
    });
}

makeResponsive();