const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; // Months of the year
const margin = { top: 30, right: 20, bottom: 20, left: 50 };                              // Margins of the graph
const fillArea = 0.75;                                                                    // Used for aesthetics assignment wants
const legendWidth = 110;

// parses the dates
function parseYearMonth(dateString) {
  const [year, month] = dateString.split("-").map(Number);
  return { year, month: month - 1 }; // month -> 0-11
}

// computes the overall max of max_temperature and overall min of min_temperature
function computeMonthlyExtremes(data) {
  const grouped = d3.rollup(
    data,
    rows => ({
      maxTemp: d3.max(rows, d => d.max_temperature),
      minTemp: d3.min(rows, d => d.min_temperature)
    }),
    d => d.year,
    d => d.month
  );

  const grid = [];
  grouped.forEach((monthMap, year) => {
    monthMap.forEach(({ maxTemp, minTemp }, month) => {
      grid.push({ year, month, maxTemp, minTemp });
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
        .html(`Date: ${d.year}-${d.month + 1}; max: ${d.maxTemp.toFixed(1)} min: ${d.minTemp.toFixed(1)}`)
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY + 12}px`);
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });
}

// draws a small color legend
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
