$(function () {
    const mapWidth =960, mapHeight = 500;
    const barChartMargin = {top: 15, right: 25, bottom: 15, left: 120};
    const barChartWidth = 600 - barChartMargin.left - barChartMargin.right,
        barChartHeight = 500 - barChartMargin.top - barChartMargin.bottom;
    const pieChartWidth = 600, pieChartHeight = 600, pieMargin = 50, radius = pieChartWidth / 2 - pieMargin;
    let color = d3.scale.category20();

    $.ajax({
        dataType: "json",
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        type: "get",
        url: "PollServlet?method=getStatePoll&state=" + getParams("state"),
        success: function (data) {
            if (data[0][0].msg === 'Query completed!' && data[1][0].msg === 'Query completed!') {
                let out = false;
                if (data[0][0].resultSet.length === null || data[0][0].resultSet.length === 0) out = true;
                let resultSet = data[0][0].resultSet, stateInfo = data[1][0].resultSet[0];
                let barChartDataSet = [], pieChartDataTmp = [], pieChartDataSet = {};
                if (!out) {
                    $(".middle-container h4").text("Starting on: " + stateInfo.start_date);
                    let pollDate = resultSet[resultSet.length - 1].poll_date;
                    for (let i = resultSet.length - 1; i >= 0; i --) {
                        if (resultSet[i].poll_date !== pollDate) break;
                        let candidate = resultSet[i].candidate.trim();
                        let poll = parseFloat(resultSet[i].poll);
                        if (poll > 0) {
                            barChartDataSet.push({"name": candidate, "value": poll});
                            pieChartDataTmp.push({"name": candidate, "value": poll});
                            // pieChartDataSet[candidate] = poll;
                        }
                    }
                    pieChartDataTmp.sort(comparePoll);
                    let start = 0, end = pieChartDataTmp.length - 1;
                    while (start <= end) {
                        pieChartDataSet[pieChartDataTmp[start].name] = pieChartDataTmp[start].value;
                        pieChartDataSet[pieChartDataTmp[end].name] = pieChartDataTmp[end].value;
                        start ++;
                        end --;
                    }
                }

                $(".final-result-container h2").text(stateInfo.state_name + " Democratic Primary");

                // map
                let projection = d3.geo.albersUsa().scale(1070).translate([mapWidth / 2, mapHeight / 2]);
                let path = d3.geo.path().projection(projection);
                const url = "https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json";
                let mapSvg = d3.select(".map-container").append("svg").attr("class", "map")
                    .attr("width", mapWidth).attr("height", mapHeight);
                let g = mapSvg.append("g");
                d3.json(url, function (err, json) {
                    g.append("g").attr("id", "states").selectAll("path")
                        .data(topojson.feature(json, json.objects.states).features).enter()
                        .append("path").attr("d", path).attr("stroke", "#666").attr("fill", function(d) {
                            if (d.id === stateInfo.state_fips) return "#ff9933";
                            return "#ccc";
                        }).call(function() {
                            zoom(topojson.feature(json, json.objects.states).features.filter(function(d) {
                                return d.id === stateInfo.state_fips;
                            }));
                        });
                });

                function zoom(json) {
                    let centroid = path.centroid(json[0]);
                    let x = centroid[0], y = centroid[1];
                    g.transition().duration(1000).attr("transform", "translate(" + mapWidth / 2 + "," + mapHeight / 2 + ")scale(4)translate(-" + x + ",-" + y + ")")
                        .style("stroke-width", 1.5 / 4 + "px");
                }

                if (out) {
                    $(".left-container").css("display", "none");
                    $(".right-container").css("display", "none");
                    return;
                }
                if (stateInfo.final) {
                    $(".proportion").append("<span style='color: red; font-size: 16px;'> (*Final)</span>");
                }

                // bar chart
                barChartDataSet = barChartDataSet.sort(function (a, b) {
                    return d3.ascending(a.value, b.value);
                });
                let barSvg = d3.select('.bar-container').append("svg").attr("class", "bar-chart")
                    .attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
                    .attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom)
                    .append("g").attr("transform", "translate(" + barChartMargin.left + ", 0)");
                let x = d3.scale.linear().range([0, barChartWidth]).domain([0, d3.max(barChartDataSet, function(d) {
                    return d.value;
                })]);
                let y = d3.scale.ordinal().rangeRoundBands([barChartHeight, 0], .7).domain(barChartDataSet.map(function(d) {
                    return d.name;
                }));
                color.domain(barChartDataSet.map(function (d) {return d.name;}));
                let yAxis = d3.svg.axis().scale(y).tickSize(0).orient("left");
                barSvg.append("g").attr("class", "y axis").call(yAxis).style("fill", "#ff9933");
                let bars = barSvg.selectAll(".bar").data(barChartDataSet).enter().append("g");
                bars.append("rect").attr("class", "bar").attr("y", function(d) {
                    return y(d.name);
                }).attr("height", y.rangeBand()).attr("x", 10).attr("width", function(d) {
                    return x(d.value * 0.8);
                }).attr("fill", function (d) {return color(d.name);});
                bars.append("text").attr("class", "label").style("fill", "#ff9933").style("font-weight", "bold").attr("y", function(d) {
                    return y(d.name) + y.rangeBand() / 2 + 4;
                }).attr("x", function(d) {
                    return x(d.value * 0.8) + 15;
                }).text(function(d) {
                    return d.value;
                });
                barSvg.selectAll(".tick").each(function(d, i) {
                    let def = d3.select(this).append("defs");
                    let avatarPattern = def.append("pattern").attr("id", "pattern-" + i)
                        .attr("width", 40).attr("height", 40).attr("x", 0).attr("y", 0);
                    avatarPattern.append("image").attr("width", 40).attr("height", 40)
                        .attr("x", 0).attr("y", 0).attr("xlink:href", "/img/" + barChartDataSet[i].name.toLowerCase() + ".png");
                    d3.select(this).append("circle").attr("r", 20).attr("cy", 0).attr("cx", -95)
                        .attr("fill", "url(#pattern-" + i + ")");
                });

                // pie chart
                let pieSvg = d3.select(".pie-container").append("svg").attr("class", "pie-chart")
                    .attr("width", pieChartWidth).attr("height", pieChartHeight)
                    .append("g").attr("transform", "translate(" + pieChartWidth / 2 + "," + pieChartHeight / 2 + ")");
                let pie = d3.layout.pie().sort(null).value(function(d) {return d.value});
                let innerArc = d3.svg.arc().innerRadius(radius * 0.2).outerRadius(radius * 0.5);
                let outerArc = d3.svg.arc().innerRadius(radius * 0.8).outerRadius(radius * 0.8);
                let dataReady = pie(d3.entries(pieChartDataSet));
                pieSvg.selectAll("slices").data(dataReady).enter().append('path').attr('d', innerArc).attr('fill', function(d){
                    return(color(d.data.key));
                }).attr("stroke", "white").style("stroke-width", "2px");

                pieSvg.selectAll('polylines').data(dataReady).enter().append('polyline').attr("stroke", "black")
                    .style("fill", "none").attr("stroke-width", 1).attr("stroke", "#ff9933").attr('points', function(d) {
                        let posA = innerArc.centroid(d);
                        let posB = outerArc.centroid(d);
                        let posC = outerArc.centroid(d);
                        console.log(posA, posB, posC);
                        let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                        // posB[1] = (Math.pow(Math.abs(posB[1]), 1.3) - Math.abs(posB[1]) * 3.4 + Math.abs(posB[1]) / 100 * 10) * (posB[1] < 0 ? -1 : 1);
                        posC[0] = radius * 0.85 * (midangle < Math.PI ? 1 : -1);
                        // posC[1] = (Math.pow(Math.abs(posC[1]), 1.3) - Math.abs(posC[1]) * 3.4 + Math.abs(posC[1]) / 100 * 10) * (posC[1] < 0 ? -1 : 1);
                        if (Math.abs(posB[1]) > 150) {
                            posB[1] = Math.pow(2, Math.abs(posB[1]) / 25) * (posB[1] < 0 ? -1 : 1);
                            posC[1] = Math.pow(2, Math.abs(posC[1]) / 25) * (posC[1] < 0 ? -1 : 1);
                        }
                        // console.log(posA, posB, posC);
                        return [posA, posB, posC]
                    });
                pieSvg.selectAll('labels').data(dataReady).enter().append('text').text( function(d) {
                    return d.data.key;
                }).attr('transform', function(d) {
                    let pos = outerArc.centroid(d);
                    let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    console.log(pos);
                    pos[0] = radius * 0.85 * (midangle < Math.PI ? 1 : -1);
                    // pos[1] = (Math.pow(Math.abs(pos[1]), 1.3) - Math.abs(pos[1]) * 3.2 + Math.abs(pos[1]) / 100 * 5) * (pos[1] < 0 ? -1 : 1);
                    if (Math.abs(pos[1]) > 150) pos[1] = Math.pow(2, Math.abs(pos[1]) / 25) * (pos[1] < 0 ? -1 : 1);
                    return 'translate(' + pos + ')';
                }).style('text-anchor', function(d) {
                    let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    return (midangle < Math.PI ? 'start' : 'end');
                }).style("fill", "#ff9933");
            }
        }
    })
});
