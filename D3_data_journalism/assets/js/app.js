// makeResponsive function that houses chart function and automatically resizes it based on user's viewing window
function makeResponsive() {
    // Check to see if SVG area is empty, if not then clear it
    var svgArea = d3.select('body').select('svg');
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // Determine SVG wrapper dimensions based on current viewing window
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
        top: 50,
        bottom: 50,
        right: 50,
        left
    };

    var height = svgHeight - margin.top - margin.bottom;
    var width = svgHeight - margin.left - margin.right;

    // Append SVG element
    var svg = d3
        .select('.chart')
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
    function yScale(csv, chosenYAxis) {
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(csvData, d => d[chosenYAxis]) * 08,
            d3.max(csvData, d => d[chosenYAxis]) * 1.2])
            .range([heigh, 0]);
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

    // Function for updating circles group with new tooltip
    function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {
        
    }

    // Read in data csv
    d3.csv('assets/data/data.csv').then(function(csvData) {
        
        // Parse data - coverting string to numerical
        csvData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.povertyMoe = +data.povertyMoe;
            data.age = +data.age;
            data.ageMoe = +data.ageMoe;
            data.income = +data.income;
            data.incomeMoe = +data.incomeMoe;
            data.healthcare = +data.healthcare;
            data.healthcareLow = +data.healthcareLow;
            data.healthcareHigh = +data.healthcareHigh;
            data.obesity = +data.obesity;
            data.obesityLow = +data.obesityLow;
            data.obesityHigh = +data.obesityHigh;
            data.smokes = +data.smokes;
            data.smokesLow = +data.smokesLow;
            data.smokesHigh = +data.smokesHigh;
        });

        // Create scales
        
    }).catch(function(error) {
        console.log(error);
    });
}
