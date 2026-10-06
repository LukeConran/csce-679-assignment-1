const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; // Months of the year
const margin = { top: 30, right: 20, bottom: 20, left: 50 };                              // Margins of the graph
const cellSize = 40;                                                                      // Size of cells, good for changing whole grid size
const fillArea = 0.75;                                                                    // Used for aesthetics assignment wants
const fillSize = cellSize * Math.sqrt(fillArea);
const fillOffset = (cellSize - fillSize) / 2;

// parses a "YYYY-MM-DD" string into numeric year/month without timezone shifting
function parseYearMonth(dateString) {
  const [year, month] = dateString.split("-").map(Number);
  return { year, month: month - 1 }; // month -> 0-11
}

// attaches numeric year, month, and max_temperature fields to each raw row
function prepareData(data) {
  data.forEach(d => {
    const { year, month } = parseYearMonth(d.date);
    d.year = year;
    d.month = month;
    d.max_temperature = +d.max_temperature;
    d.min_temperature = +d.min_temperature;
  });
  return data;
}

// computes mean of max_temperature (and mean of min_temperature) per (year, month)
function computeMonthlyMeans(data) {
  const grouped = d3.rollup(
    data,
    rows => ({
      maxTemp: d3.mean(rows, d => d.max_temperature),
      minTemp: d3.mean(rows, d => d.min_temperature)
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

// builds the x (year) and y (month index) scales
function buildScales(years) {
  const x = d3.scaleBand().domain(years).range([0, years.length * cellSize]);
  const y = d3.scaleBand().domain(d3.range(12)).range([0, months.length * cellSize]);
  const yMonths = d3.scaleBand().domain(months).range([0, months.length * cellSize]);
  return { x, y, yMonths };
}

// builds a color scale for whichever field ("maxTemp" or "minTemp") is active
function buildColorScale(grid, field) {
  return d3.scaleSequential(d3.interpolateYlOrRd).domain(d3.extent(grid, d => d[field]));
}

// creates the correctly sized svg
function createSvg(years) {
  const width = margin.left + margin.right + years.length * cellSize;
  const height = margin.top + margin.bottom + months.length * cellSize;

  const svg = d3.select("#chart")
    .attr("width", width)
    .attr("height", height);

  return svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
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

// draws the cells with their colors and sizing
function drawCells(g, grid, x, y, color, field) {
  g.append("g")
    .selectAll("rect")
    .data(grid)
    .join("rect")
    .attr("class", "cell")
    .attr("x", d => x(d.year) + fillOffset)
    .attr("y", d => y(d.month) + fillOffset)
    .attr("width", fillSize)
    .attr("height", fillSize)
    .attr("fill", d => color(d[field]));
}

// main function
function render(data) {
  prepareData(data);

  const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);
  const grid = computeMonthlyMeans(data);

  const { x, y, yMonths } = buildScales(years);
  const g = createSvg(years);

  drawAxes(g, x, yMonths);

  let field = "maxTemp";
  drawCells(g, grid, x, y, buildColorScale(grid, field), field);

  d3.select("#toggle-btn").on("click", () => {
    field = field === "maxTemp" ? "minTemp" : "maxTemp";
    d3.select("#toggle-btn").text(field === "maxTemp" ? "Show Min Temp" : "Show Max Temp");
    g.selectAll("rect.cell")
      .attr("fill", d => buildColorScale(grid, field)(d[field]));
  });
}

//run
d3.csv("temperature_daily.csv").then(render);
