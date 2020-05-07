$(window).on('load',function(){
  $('#myModalIntro').modal('show');
});

var date = document.getElementById("date").value;
var timeInterval;
var downDownValue = "electricity";
var toolTipValue = "Confirmed Cases: ";
var dateAuto = new Date("2020-03-01");
var state1 = "New York";
var state2 = "California";
var minDate = "2020-04-20";
var maxDate = "2020-05-03";
function formatDate1(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}
function trig() {
  dateAuto.setDate(dateAuto.getDate() + 1)
  document.getElementById("animationSpan").innerHTML = dateAuto.toDateString().split(' ').slice(1).join(' ');
  if (dateAuto >= new Date("2020-05-03")) {
    document.getElementById("date_label").style.display = "inline";
    document.getElementById("date").style.display = "inline";
    document.getElementById("animationSpan").style.display = "none";
    document.getElementById("buttonStop").style.display = "none";
    document.getElementById("buttonStart").style.display = "inline";
    clearInterval(timeInterval);
    dateAuto = new Date("2020-03-01");
    date = new Date("2020-03-01");
   
    d3.queue()
    .defer(d3.json, "states-10m.json")
    .defer(d3.csv, "covid19_confirmed_US.csv")
    .await(ready);
    return;
  }

  date = formatDate1(dateAuto);
  d3.queue()
    .defer(d3.json, "states-10m.json")
    .defer(d3.csv, "covid19_confirmed_US.csv")
    .await(ready);

  d3.csv("covid19_confirmed_US.csv", function(covidData){
    d3.select("#map").selectAll("path").style("fill", function(d) {
      let colorScale = d3
          .scaleThreshold()
          .domain([1, 100, 1000, 10000, 50000, 100000, 300000])
          .range(d3.schemeOranges[8]);
      let t = d.properties.name;
      let colorValue = null;
      for (let i = 0; i < covidData.length; i++) {
        //console.log(covidData[i].Date + ", " + date);
        if (covidData[i].Date == date){
          if (covidData[i]["Province_State"] == t) {
            colorValue = covidData[i]["Confirmed_Cases"];
            console.log(colorValue);
          }
        }
      }
      return colorScale(colorValue);
    });
  });
  //console.log(covidData.data);
  

}

function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function addInterval() {
  document.getElementById("date_label").style.display = "none";
  document.getElementById("date").style.display = "none";
  document.getElementById("animationSpan").style.display = "block";
  document.getElementById("buttonStop").style.display = "inline";
  document.getElementById("buttonStart").style.display = "none";
  
  timeInterval = setInterval(function() {
    trig();
  }, 1100);
}
function StopInterval() {
  document.getElementById("date_label").style.display = "inline";
  document.getElementById("date").style.display = "inline";
  document.getElementById("animationSpan").style.display = "none";
  document.getElementById("buttonStop").style.display = "none";
  document.getElementById("buttonStart").style.display = "inline";
  date=document.getElementById("date").value;;
  clearInterval(timeInterval);
}

function changeSlider() {
  // console.log("trigger");
}

function myFunction() {
  downDownValue = document.getElementById("mySelect").value;
  yearAuto = 2005;

  //  console.log(downDownValue);
  if (downDownValue == "Confirmed Cases:") {
    toolTipValue = "Confirmed Cases:";
  } 

  d3.queue()
    .defer(d3.json, "states-10m.json")
    .defer(d3.csv, "covid19_confirmed_US.csv")
    .await(ready);
}


const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip-map")
  .style("opacity", 0);

var margin = { top: 10, right: 10, bottom: 10, left: 0 },
  width = 1200 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

var svg = d3
  .select(".map")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "scale(1.2)")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var projection = d3.geoAlbersUsa()
             .translate([ width / 2, height /2 ])
             .scale(1100)

var path = d3.geoPath().projection(projection);

var f = d3
  .queue()
  .defer(d3.json, "states-10m.json")
  .defer(d3.csv, "covid19_confirmed_US.csv")
  .await(ready);

var m = svg.append("g")
        .attr("class","legendThreshold")
        .attr("transform","translate(15,500)")
        .append("text");

var lineChartUsData = {};

function ready(error, topo, covidData) {
  renderMap(topo, covidData);
  lineChartUsData = JSON.parse(JSON.stringify(covidData));
  document.getElementById("date").addEventListener("change", function() {
    date = this.value;
    console.log(date);
    d3.queue()
      .defer(d3.json, "states-10m.json")
      .defer(d3.csv, "covid19_confirmed_US.csv")
      .await(ready);
    d3.selectAll("path").style("fill", function(d) {
      let colorScale = d3
          .scaleThreshold()
          .domain([1, 100, 1000, 10000, 50000, 100000, 300000])
          .range(d3.schemeOranges[8]);
      let t = d.properties.name;
      let colorValue = null;
      for (let i = 0; i < covidData.length; i++) {
        if (covidData[i].Date == date){
          if (covidData[i]["Province_State"] == t) {
            colorValue = covidData[i]["Confirmed_Cases"];
          }
        }
      }
      return colorScale(colorValue);
    });

  });
  updateLineChart(lineChartUsData);
}

function renderMap(topo, covidData) {
  let count = 0;
  let colorScale = d3
    .scaleThreshold()
    .domain([1, 100, 1000, 10000, 50000, 100000, 300000])
    .range(d3.schemeOranges[8]);
  m.attr("class","caption")
    .attr("x",0)
    .attr("y",-6)
    .text(toolTipValue);


    var labels = ['0', '1-100', '100-1000', '1000-10000', '10000-50000', '50000-100000', '100000-300000', '>300000'];
    var legend = d3.legendColor()
        .labels(function (d) { return labels[d.i]; })
        .shapePadding(4)
        .scale(colorScale);
    svg.select(".legendThreshold")
        .call(legend);  

  var states = topojson.feature(topo, topo.objects.states).features
  svg
    .selectAll(".state")
    .data(states)
    .enter().append("path")
    .attr("class", "state")
    .attr("d", path)
    .attr("fill", function(d, i) {
      let t = d.properties.name;
      //console.log(d.properties.name);
      let colorValue = null;
      let select = document.getElementById("date").value;
      for (let i = 0; i < covidData.length; i++) {
        if (covidData[i].Date == select){
          if (covidData[i]["Province_State"] == t) {
            colorValue = covidData[i]["Confirmed_Cases"];
          }
        }
      }
      return colorScale(colorValue);
    })
    .on("mouseover", function(d) {
      let t = d.properties.name;
      let hoverData = null;
      // console.log(t);
      for (var i = 0; i < covidData.length; i++) {
        if (covidData[i]["Date"] == date){
          if (covidData[i]["Province_State"] == t) {
            hoverData = covidData[i];
                tooltip
                  .style("opacity", 0.8)
                  .html(
                    "State: " +
                      hoverData["Province_State"] +
                      "<br />" +
                      toolTipValue +
                      " " +
                      hoverData["Confirmed_Cases"]
                  )
                  .style("left", d3.event.pageX + 20 + "px")
                  .style("top", d3.event.pageY + 20 + "px");
          }
        }
      }
    })
    .on("mouseout", function(d) {
      d3.select(this).classed("selected", false);
      d3.select(this);
      tooltip.style("opacity", 0);
    });
}

function timestamp(str) {
  return new Date(str).getTime();
}

var slider = document.getElementById("lineChartSlider");

noUiSlider.create(slider, {
  start: [timestamp('2020-03-01'), timestamp('2020-05-03')],
  connect: true,
  step: 7 * 24 * 60 * 60 * 1000,
  format: wNumb({
    decimals: 0
  }),
  range: {
    min: timestamp('2020-03-01'),
    max: timestamp('2020-05-03')
  }
});

// Create a list of day and month names.
var weekdays = [
    "Sunday", "Monday", "Tuesday",
    "Wednesday", "Thursday", "Friday",
    "Saturday"
];

var months = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
];

// Append a suffix to dates.
// Example: 23 => 23rd, 1 => 1st.
function nth(d) {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
}

// Create a string representation of the date.
function formatDate(date) {
    return weekdays[date.getDay()] + ", " +
        date.getDate() + nth(date.getDate()) + " " +
        months[date.getMonth()] + " " +
        date.getFullYear();
}

var dateValues = [
    document.getElementById('event-start'),
    document.getElementById('event-end')
];

slider.noUiSlider.on('update', function (values, handle) {
    dateValues[handle].innerHTML = formatDate(new Date(+values[handle]));
    minDate = new Date(parseInt(values[0])).toISOString().split('T')[0];
    maxDate = new Date(parseInt(values[1])).toISOString().split('T')[0];
    console.log(minDate)
    console.log(maxDate)
    renderLineChart(state1, state2, minDate, maxDate);
});

function stateInput1Changed(e) {
  state1 = e.value;

  updateLineChart();
}

function stateInput2Changed(e) {
  state2 = e.value;
  updateLineChart();
}

function updateLineChart() {
  if (state1 && state2)
    renderLineChart(state1, state2, minDate, maxDate);
}

function renderLineChart(state1, state2, minDate, maxDate) {
  document.getElementById("linechart").innerHTML =
    "<svg width='1900' height='500'></svg>";

  if (!state1 || !state2) {
    state1 = "New York";
    state2 = "California";
  }

  var data = [];

  data = loadLineChartData();

  var trendsText = {
    date: "date",
    state1_confirmed_case: state1,
    state2_confirmed_case: state2
  };
  console.log(trendsText);

  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 80, bottom: 30, left: 50 },
    svg = d3.select("#linechart svg"),
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;
  var g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // set the ranges
  var x = d3
      .scaleBand()
      .rangeRound([0, width])
      .padding(1),
    y = d3.scaleLinear().rangeRound([height, 0]),
    z = d3.scaleOrdinal(["#036888", "#0D833C", "#D2392A"]);

  // define the line
  var line = d3
    .line()
    .x(function(d) {
      return x(d.timescale);
    })
    .y(function(d) {
      return y(d.total);
    });

  // scale the range of the data
  z.domain(
    d3.keys(data[0]).filter(function(key) {
      return key !== "timescale";
    })
  );

  var trends = z.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {
          timescale: d.timescale,
          total: +d[name]
        };
      })
    };
  });
  console.log(trends)

  x.domain(
    data.map(function(d) {
      return d.timescale;
    })
  );
  y.domain([
    d3.min(trends, function(c) {
      return d3.min(c.values, function(v) {
        return v.total;
      });
    }),
    d3.max(trends, function(c) {
      return d3.max(c.values, function(v) {
        return v.total;
      });
    })
  ]);

  // Draw the legend
  var legend = g
    .selectAll("g")
    .data(trends)
    .enter()
    .append("g")
    .attr("class", "legend");

  legend
    .append("rect")
    .attr("x", width - 20)
    .attr("y", function(d, i) {
      return height / 2 - (i + 1) * 20;
    })
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", function(d) {
      console.log(d)
      console.log(z(d))
      return z(d.name);
    });

  legend
    .append("text")
    .attr("x", width - 8)
    .attr("y", function(d, i) {
      return height / 2 - (i + 1) * 20 + 10;
    })
    .text(function(d) {
      console.log(d)
      return trendsText[d.name];
    });

  // Draw the line
  var trend = g
    .selectAll(".trend")
    .data(trends)
    .enter()
    .append("g")
    .attr("class", "trend");

  trend
    .append("path")
    .attr("class", "line")
    .attr("d", function(d) {
      return line(d.values);
    })
    .style("stroke", function(d) {
      return z(d.name);
    });

  // Draw the empty value for every point
  var points = g
    .selectAll(".points")
    .data(trends)
    .enter()
    .append("g")
    .attr("class", "points")
    .append("text");

  // Draw the circles
  trend
    .style("fill", "#FFF")
    .style("stroke", function(d) {
      return z(d.name);
    })
    .selectAll("circle.line")
    .data(function(d) {
      return d.values;
    })
    .enter()
    .append("circle")
    .attr("r", 5)
    .style("stroke-width", 3)
    .attr("cx", function(d) {
      return x(d.timescale);
    })
    .attr("cy", function(d) {
      return y(d.total);
    });

  // Draw the axis
  g.append("g")
    .attr("class", "axis axis-x")
    .attr("transform", "translate(0, " + height + ")")
    .call(d3.axisBottom(x).ticks(d3.timeDay.every(4)));

  g.append("g")
    .attr("class", "axis axis-y")
    .call(d3.axisLeft(y).ticks(10));

  var focus = g
    .append("g")
    .attr("class", "focus")
    .style("display", "none");

  focus
    .append("line")
    .attr("class", "x-hover-line hover-line")
    .attr("y1", 0)
    .attr("y2", height);

  svg
    .append("rect")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("mousemove", mousemove);

  var timeScales = data.map(function(name) {
    return x(name.timescale);
  });

  function mouseover() {
    focus.style("display", null);
    d3.selectAll(".points text").style("display", null);
  }
  function mouseout() {
    focus.style("display", "none");
    d3.selectAll(".points text").style("display", "none");
  }
  function mousemove() {
    var i = d3.bisect(timeScales, d3.mouse(this)[0], 1);
    var di = data[i - 1];
    focus.attr("transform", "translate(" + x(di.timescale) + ",0)");
    d3.selectAll(".points text")
      .attr("x", function(d) {
        return x(di.timescale) + 15;
      })
      .attr("y", function(d) {
        return y(d.values[i - 1].total);
      })
      .text(function(d) {
        return d.values[i - 1].total;
      })
      .style("fill", function(d) {
        return z(d.name);
      });
  }
}

function loadLineChartData() {
  realData = { values: [], StateName: state1 };
  realData2 = { values: [], StateName: state2 };

  let criteria = "Number of Confirmed Cases";

  for (let i = 0; i < lineChartUsData.length; i++) {
    //console.log(lineChartUsData[i]);
    if (lineChartUsData[i]["Date"] > minDate && lineChartUsData[i]["Date"] < maxDate) {
      //console.log(lineChartUsData[i]);
      if (lineChartUsData[i]["Province_State"] == state1) {
        realData.values.push({
          date: lineChartUsData[i]["Date"].slice(5),
          confirmedCase: lineChartUsData[i]["Confirmed_Cases"]
        });        
      }

      if (lineChartUsData[i]["Province_State"] == state2) {
        realData2.values.push({
          date: lineChartUsData[i]["Date"].slice(5),
          confirmedCase: lineChartUsData[i]["Confirmed_Cases"]
        });
      }
    }
  }

  var _lineData = [];

  realData["values"].forEach(val => {
    realData2["values"].forEach(val2 => {
      if (val.date == val2.date) {
        _lineData.push({
          timescale: val.date,
          state1_confirmed_case: val.confirmedCase,
          state2_confirmed_case: val2.confirmedCase
        });
      }
    });
  });

  sorted = _lineData.sort((a, b) =>
    d3.ascending(parseInt(a["timescale"]), parseInt(b["timescale"]))
  );
  console.log(_lineData)
  return _lineData;

  // realData.forEach(
  //   val => {

  // } );

  // dataColumn = [realData, realData2];
  //
}
