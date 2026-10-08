const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; // Months of the year
const margin = { top: 30, right: 20, bottom: 20, left: 50 };                              // Margins of the graph
const fillArea = 0.75;                                                                    // Used for aesthetics assignment wants
const legendWidth = 110;                                                                  // Give some space for the legend

// parses the dates
function parseYearMonth(dateString) {
  const [year, month] = dateString.split("-").map(Number);
  return { year, month: month - 1 }; // month -> 0-11
}

// attaches date fields to each row, optionally restricted to a year range for the second assigment
function prepareData(data, startYear = -Infinity, endYear = Infinity) {
  return data
    .map(d => {
      const { year, month } = parseYearMonth(d.date);
      d.year = year;
      d.month = month;
      d.max_temperature = +d.max_temperature;
      d.min_temperature = +d.min_temperature;
      return d;
    })
    .filter(d => d.year >= startYear && d.year <= endYear);
}

// computes the overall max of max_temperature and overall min of min_temperature, plus each month's sorted days for second assignment
function computeMonthlyExtremes(data) {
  const grouped = d3.rollup(
    data,
    rows => ({
      maxTemp: d3.max(rows, d => d.max_temperature),
      minTemp: d3.min(rows, d => d.min_temperature),
      days: rows.slice().sort((a, b) => d3.ascending(a.date, b.date))
    }),
    d => d.year,
    d => d.month
  );

  const grid = [];
  grouped.forEach((monthMap, year) => {
    monthMap.forEach(({ maxTemp, minTemp, days }, month) => {
      grid.push({ year, month, maxTemp, minTemp, days });
    });
  });
  return grid;
}

// builds a color scale for whichever temperature field is active
function buildColorScale(grid, field) {
  return d3.scaleSequential(d3.interpolateYlOrRd).domain(d3.extent(grid, d => d[field]));
}

// draws the axes accordingly
function drawAxes(g, x, yMonths) {
  g.append("g")
    .attr("class", "axis x-axis")
    .call(d3.axisTop(x));

  g.append("g")
    .attr("class", "axis y-axis")
    .call(d3.axisLeft(yMonths));
}

// draws the cells with their colors and sizing and also adds hover tooltip
function drawCells(g, grid, x, y, color, field, fillWidth, fillHeight, fillOffsetX, fillOffsetY, tooltipSelector) {
  const tooltip = d3.select(tooltipSelector);

  g.append("g")
    .selectAll("rect")
    .data(grid)
    .join("rect")
    .attr("class", "cell")
    .attr("x", d => x(d.year) + fillOffsetX)
    .attr("y", d => y(d.month) + fillOffsetY)
    .attr("width", fillWidth)
    .attr("height", fillHeight)
    .attr("fill", d => color(d[field]))

    .on("mouseover", (event, d) => {
      tooltip.style("display", "block");
    })
    .on("mousemove", (event, d) => {
      tooltip
        .html(`Date: ${d.year}-${d.month + 1}; max: ${d.maxTemp.toFixed(1)} min: ${d.minTemp.toFixed(1)}`) //specific syntax to match assignment hover
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY + 12}px`);
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });
}

// draws line plot for daily min_temperature and max_temperature across that month
function drawSparklines(g, grid, x, y, fillWidth, fillHeight, fillOffsetX, fillOffsetY) {
  const sparkline = g.append("g")
    .selectAll("g")
    .data(grid)
    .join("g")
    .attr("transform", d => `translate(${x(d.year) + fillOffsetX},${y(d.month) + fillOffsetY})`);

  sparkline.each(function (d) {
    const cell = d3.select(this);
    const days = d.days;

    const xDay = d3.scaleLinear().domain([0, days.length - 1]).range([0, fillWidth]);
    const yTemp = d3.scaleLinear()
      .domain(d3.extent(days.flatMap(r => [r.min_temperature, r.max_temperature])))
      .range([fillHeight * 0.75, fillHeight * 0.25]);

    const minLine = d3.line().x((r, i) => xDay(i)).y(r => yTemp(r.min_temperature));
    const maxLine = d3.line().x((r, i) => xDay(i)).y(r => yTemp(r.max_temperature));

    cell.append("path")
      .datum(days)
      .attr("class", "sparkline-min")
      .attr("fill", "none")
      .attr("stroke", "lightblue")
      .attr("stroke-width", 1)
      .attr("d", minLine);

    cell.append("path")
      .datum(days)
      .attr("class", "sparkline-max")
      .attr("fill", "none")
      .attr("stroke", "darkgreen")
      .attr("stroke-width", 1)
      .attr("d", maxLine);
  });
}

// draws a small color legend - To be changed based on questions asked to Dr. Xia
function drawLegend(g, x0) {
  const legend = g.append("g")
    .attr("transform", `translate(${x0},0)`);

  legend.append("text")
    .attr("x", 0).attr("y", 0)
    .attr("font-weight", "bold")
    .text("Legend (Celsius)");

  [0, 10, 20, 30, 40].forEach((t, i) => {
    legend.append("rect")
      .attr("y", 20 + i * 20)
      .attr("width", 14).attr("height", 14)
      .attr("fill", d3.interpolateYlOrRd(t / 40));

    legend.append("text")
      .attr("x", 20).attr("y", 20 + i * 20 + 11)
      .text(t);
  });
}
