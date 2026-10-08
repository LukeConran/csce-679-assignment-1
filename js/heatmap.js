// draws one temperature heatmap into the given details
function drawHeatmap(options) {
  const {
    data,
    chartSelector,
    tooltipSelector,
    toggleBtnSelector,
    cellWidth,
    cellHeight,
    startYear = -Infinity,
    endYear = Infinity,
    sparklines = false
  } = options;

  // calculations for the sizing
  const fillWidth = cellWidth * Math.sqrt(fillArea);
  const fillHeight = cellHeight * Math.sqrt(fillArea);
  const fillOffsetX = (cellWidth - fillWidth) / 2;
  const fillOffsetY = (cellHeight - fillHeight) / 2;

  const filtered = prepareData(data, startYear, endYear);
  const years = Array.from(new Set(filtered.map(d => d.year))).sort((a, b) => a - b);
  const grid = computeMonthlyExtremes(filtered);

  const x = d3.scaleBand().domain(years).range([0, years.length * cellWidth]);
  const y = d3.scaleBand().domain(d3.range(12)).range([0, months.length * cellHeight]);
  const yMonths = d3.scaleBand().domain(months).range([0, months.length * cellHeight]);

  const width = margin.left + margin.right + years.length * cellWidth + legendWidth;
  const height = margin.top + margin.bottom + months.length * cellHeight;

  //actual drawing functions pulled from config.js
  const svg = d3.select(chartSelector)
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  drawAxes(g, x, yMonths);

  let field = "maxTemp";
  drawCells(g, grid, x, y, buildColorScale(grid, field), field, fillWidth, fillHeight, fillOffsetX, fillOffsetY, tooltipSelector);

  if (sparklines) {
    drawSparklines(g, grid, x, y, fillWidth, fillHeight, fillOffsetX, fillOffsetY);
  }

  drawLegend(g, years.length * cellWidth + 20);

  d3.select(toggleBtnSelector).on("click", () => {
    field = field === "maxTemp" ? "minTemp" : "maxTemp";
    d3.select(toggleBtnSelector).text(field === "maxTemp" ? "Show Min Temp" : "Show Max Temp");
    g.selectAll("rect.cell")
      .attr("fill", d => buildColorScale(grid, field)(d[field]));
  });
}
