const months2 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; // Months of the year
const margin2 = { top: 30, right: 20, bottom: 20, left: 50 };                              // Margins of the graph
const startYear2 = 2008;                                                                   // Hardcoded year range for this chart
const endYear2 = 2017;
const cellHeight2 = 70;                                                                    // Size of cells, good for changing whole grid size
const cellWidth2 = cellHeight2 * 1.5;                                                      // Cells are wider than tall (hardcoded 1.5x ratio)
const fillArea2 = 0.75;                                                                    // Used for aesthetics assignment wants
const fillWidth2 = cellWidth2 * Math.sqrt(fillArea2);
const fillHeight2 = cellHeight2 * Math.sqrt(fillArea2);
const fillOffsetX2 = (cellWidth2 - fillWidth2) / 2;
const fillOffsetY2 = (cellHeight2 - fillHeight2) / 2;
const legendWidth2 = 110;

// attaches variables to each row
function prepareData2(data) {
  return data
    .map(d => {
      const { year, month } = parseYearMonth(d.date);
      d.year = year;
      d.month = month;
      d.max_temperature = +d.max_temperature;
      d.min_temperature = +d.min_temperature;
      return d;
    })
    .filter(d => d.year >= startYear2 && d.year <= endYear2);
}

// computes the overall max of max_temperature and overall min of min_temperature
function computeMonthlyExtremes2(data) {
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

// builds x and y scales
function buildScales2(years) {
  const x = d3.scaleBand().domain(years).range([0, years.length * cellWidth2]);
  const y = d3.scaleBand().domain(d3.range(12)).range([0, months2.length * cellHeight2]);
  const yMonths = d3.scaleBand().domain(months2).range([0, months2.length * cellHeight2]);
  return { x, y, yMonths };
}

// creates the correctly sized svg
function createSvg2(years) {
  const width = margin2.left + margin2.right + years.length * cellWidth2 + legendWidth2;
  const height = margin2.top + margin2.bottom + months2.length * cellHeight2;

  const svg = d3.select("#chart2")
    .attr("width", width)
    .attr("height", height);

  return svg.append("g")
    .attr("transform", `translate(${margin2.left},${margin2.top})`);
}

// draws the axes accordingly
function drawAxes2(g, x, yMonths) {
  g.append("g")
    .attr("class", "axis x-axis")
    .call(d3.axisTop(x));

  g.append("g")
    .attr("class", "axis y-axis")
    .call(d3.axisLeft(yMonths));
}

// draws the cells with their colors and sizing and also adds hover tooltip
function drawCells2(g, grid, x, y, color, field, getField) {
  const tooltip = d3.select("#tooltip2");

  g.append("g")
    .selectAll("rect")
    .data(grid)
    .join("rect")
    .attr("class", "cell")
    .attr("x", d => x(d.year) + fillOffsetX2)
    .attr("y", d => y(d.month) + fillOffsetY2)
    .attr("width", fillWidth2)
    .attr("height", fillHeight2)
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

// draws line plot for daily min_temperature and max_temperature across that month
function drawSparklines2(g, grid, x, y) {
  const sparkline = g.append("g")
    .selectAll("g")
    .data(grid)
    .join("g")
    .attr("transform", d => `translate(${x(d.year) + fillOffsetX2},${y(d.month) + fillOffsetY2})`);

  sparkline.each(function (d) {
    const cell = d3.select(this);
    const days = d.days;

    const xDay = d3.scaleLinear().domain([0, days.length - 1]).range([0, fillWidth2]);
    const yTemp = d3.scaleLinear()
      .domain(d3.extent(days.flatMap(r => [r.min_temperature, r.max_temperature])))
      .range([fillHeight2 * 0.75, fillHeight2 * 0.25]);

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

// main function
function render2(data) {
  const filtered = prepareData2(data);

  const years = Array.from(new Set(filtered.map(d => d.year))).sort((a, b) => a - b);
  const grid = computeMonthlyExtremes2(filtered);

  const { x, y, yMonths } = buildScales2(years);
  const g = createSvg2(years);

  drawAxes2(g, x, yMonths);

  let field = "maxTemp";
  drawCells2(g, grid, x, y, buildColorScale(grid, field), field, () => field);
  drawSparklines2(g, grid, x, y);
  drawLegend(g, years.length * cellWidth2 + 20);

  d3.select("#toggle-btn2").on("click", () => {
    field = field === "maxTemp" ? "minTemp" : "maxTemp";
    d3.select("#toggle-btn2").text(field === "maxTemp" ? "Show Min Temp" : "Show Max Temp");
    g.selectAll("rect.cell")
      .attr("fill", d => buildColorScale(grid, field)(d[field]));
  });
}

//run
d3.csv("data/temperature_daily.csv").then(render2);
