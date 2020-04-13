$(window).on('load',function(){
  $('#myModalIntro').modal('show');
});

var date = document.getElementById("date").value;
var timeInterval;
var downDownValue = "electricity";
var toolTipValue = "Confirmed Cases: ";
var dateAuto = new Date("2020-03-01");
function formatDate(date) {
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
  if (dateAuto >= new Date("2020-04-11")) {
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

  date = formatDate(dateAuto);
  d3.queue()
    .defer(d3.json, "states-10m.json")
    .defer(d3.csv, "covid19_confirmed_US.csv")
    .await(ready);

  d3.csv("covid19_confirmed_US.csv", function(covidData){
    d3.selectAll("path").style("fill", function(d) {
      let colorScale = d3
          .scaleThreshold()
          .domain([1, 50, 200, 1000, 5000, 10000, 15000, 30000, 200000])
          .range(d3.schemeOranges[7]);
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
  }, 700);
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
        .attr("transform","translate(15,550)")
        .append("text");

function ready(error, topo, covidData) {
  renderMap(topo, covidData);
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
          .domain([1, 50, 200, 1000, 5000, 10000, 15000, 30000, 200000])
          .range(d3.schemeOranges[7]);
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
}

function renderMap(topo, covidData) {
  let count = 0;
  let colorScale = d3
    .scaleThreshold()
    .domain([1, 50, 200, 1000, 5000, 10000, 15000, 30000, 200000])
    .range(d3.schemeOranges[7]);
  m.attr("class","caption")
    .attr("x",0)
    .attr("y",-6)
    .text(toolTipValue);


    var labels = ['0', '1-50', '50-200', '200-1000', '1000-5000', '5000-15000', '15000-30000', '>30000'];
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
