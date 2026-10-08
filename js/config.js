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
