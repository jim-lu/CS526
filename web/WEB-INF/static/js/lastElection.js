$(function () {
    const barChartContainer = $('.bar-chart-container');
    const barChartMargin = {top: 5, right: 25, bottom: 15, left: 120};
    const barChartWidth = 320 - barChartMargin.left - barChartMargin.right,
        barChartHeight = 200 - barChartMargin.top - barChartMargin.bottom;

    $.ajax({
        dataType: "json",
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        type: "get",
        url: "HistoryServlet?method=getLastElectionPoll"
    }).done(function (data) {
        let resultSet = data[0][0].resultSet, stateInfo = data[1][0].resultSet;
        let countyObj = {}, stateObj = {}, totalObj = {};
        let color = {"republican": "#f00", "democrat": "#00c", "green": "#090", "na": "#333"};
        let stateMap = {};
        resultSet.forEach(function (d) {
            let countyFips = d.county_fips, candidateVote = parseInt(d.candidate_vote), candidateName = d.candidate,
                candidateColor = color[d.party.toLowerCase()], stateFips = countyFips.substring(0, countyFips.length - 3),
                countyName = d.county_name, totalVote = d.total_vote;
            // County data
            if (countyFips in countyObj) {
                countyObj[countyFips].candidate.push({[candidateName]: {vote: candidateVote, color: candidateColor}});
                if (candidateVote > countyObj[countyFips].winnerVote) {
                    countyObj[countyFips].winner = candidateName;
                    countyObj[countyFips].winnerVote = candidateVote;
                    countyObj[countyFips].winnerColor = candidateColor;
                }
            } else {
                countyObj[countyFips] = {
                    winner: candidateName,
                    winnerVote: candidateVote,
                    winnerColor: candidateColor,
                    countyName: countyName,
                    totalVote: totalVote,
                    candidate: [{[candidateName]: {vote: candidateVote, color: candidateColor}}]
                }
            }
            // State data
            if (stateFips in stateObj && !isNaN(candidateVote)) {
                if (candidateName in stateObj[stateFips]) {
                    stateObj[stateFips][candidateName].vote += candidateVote
                } else {
                    stateObj[stateFips][candidateName] = {vote: candidateVote, color: candidateColor}
                }
            } else if (!isNaN(candidateVote)) {
                stateObj[stateFips] = {[candidateName]: {vote: candidateVote, color: candidateColor}}
            }
            // Total vote
            if (!isNaN(candidateVote)) {
                if (candidateName in totalObj && !isNaN(candidateVote)) {
                    totalObj[candidateName] += candidateVote;
                } else {
                    totalObj[candidateName] = candidateVote;
                }
            }
            if (stateFips in stateMap && !isNaN(candidateVote)) {
                stateMap[stateFips].counties.add(countyFips);
            } else {
                stateMap[stateFips] = {};
                stateMap[stateFips].counties = new Set([countyFips]);
            }
        });
        stateInfo.forEach(function (d) {
            stateMap[d.state_fips]["state_name"] = d.state_name;
            stateMap[d.state_fips]["total_vote"] = 0;
            for (let k in stateObj[d.state_fips]) stateMap[d.state_fips]["total_vote"] += stateObj[d.state_fips][k].vote;
        });
        for (let fip in countyObj) {countyObj[fip].candidate.sort(comparePoll);}

        const url = "https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json";
        let width = 860, height = 500, active = d3.select(null), margin = {top: 10, bottom: 10, left: 10, right: 10};
        let projection = d3.geo.albersUsa().scale(1070).translate([width / 2, height / 2]);
        let path = d3.geo.path().projection(projection);
        let svg = d3.select(".map-container").append("svg").attr("width", width).attr("height", height);
        let tooltip = d3.select(".map-container").append("div").attr("class", "hidden tooltip");
        svg.append("rect").attr("class", "background").attr("width", width).attr("height", height).on("click", clicked);
        let g = svg.append("g").attr("width", width).attr("height", height);
        d3.json(url, function(err, json) {
            g.append("g").attr("id", "counties").selectAll("path").data(topojson.feature(json, json.objects.counties).features)
                .enter().append("path").attr("d", path).attr("class", "county-boundary").attr("fill", function (d) {
                    if (countyObj[d.id] !== undefined) return countyObj[d.id].winnerColor;
            }).on("click", reset).on("mouseover", function (d) {
                let mouse = d3.mouse(svg.node()).map(function (d) {return parseInt(d);});
                let html = "<h4>" + countyObj[d.id].countyName + "</h4>";
                let left = mouse[0] > width / 2 ? mouse[0] - 350 : mouse[0] + 15;
                let top = mouse[1] > height / 2 ? mouse[1] - 150 : mouse[1];
                let id = d.id;
                html += "<div class='data-container'><div class='row clearfix'><div class='name' style='font-weight: bold'>" +
                    "Candidate</div><div class='value' style='font-weight: bold'>Vote</div>" +
                    "<div class='proportion' style='font-weight: bold'>Proportion</div></div></div>";
                countyObj[d.id].candidate.forEach(function (d) {
                    let key = Object.keys(d)[0];
                    html += "<div class='row clearfix'><div class='name'>" + key + "</div><div class='value'>" +
                        d[key].vote + "</div><div class='proportion'>" + (d[key].vote / countyObj[id].totalVote
                            * 100).toFixed(1) + "%</div></div>";
                });
                tooltip.classed("hidden", false).attr("style", "left:" + left + "px;top:" + top + "px").html(html);
            });
            g.append("g").attr("id", "states").selectAll("path").data(topojson.feature(json, json.objects.states).features)
                .enter().append("path").attr("d", path).attr("class", "state").attr("fill", function (d) {
                if (stateObj[d.id] !== undefined) {
                    let winnerVote = -1, winnerColor;
                    for (let key in stateObj[d.id]) {
                        if (stateObj[d.id][key].vote > winnerVote) {
                            winnerVote = stateObj[d.id][key].vote;
                            winnerColor = stateObj[d.id][key].color;
                        }
                    }
                    return winnerColor;
                }
            }).on("click", clicked).on("mouseover", function (d) {
                let mouse = d3.mouse(svg.node()).map(function (d) {return parseInt(d);});
                let html = "<h4>" + stateMap[d.id].state_name + "</h4>";
                let left = mouse[0] > width / 2 ? mouse[0] - 350 : mouse[0] + 15;
                let top = mouse[1] > height / 2 ? mouse[1] - 150 : mouse[1];
                html += "<div class='data-container'><div class='row clearfix'><div class='name' style='font-weight: bold'>" +
                    "Candidate</div><div class='value' style='font-weight: bold'>Vote</div>" +
                    "<div class='proportion' style='font-weight: bold'>Proportion</div></div></div>";
                for (let k in stateObj[d.id]) {
                    html += "<div class='row clearfix'><div class='name'>" + k + "</div><div class='value'>" +
                        stateObj[d.id][k].vote + "</div><div class='proportion'>" + (stateObj[d.id][k].vote / stateMap[d.id].total_vote
                            * 100).toFixed(1) + "%</div></div>";
                }
                tooltip.classed("hidden", false).attr("style", "left:" + left + "px;top:" + top + "px").html(html);
            }).on("mouseout", function() {tooltip.classed("hidden", true)});
            g.append("path").datum(topojson.mesh(json, json.objects.states, function (a, b) {
                return a !== b;
            })).attr("id", "state-borders").attr("d", path);
        });

        // bar chart
        let bigBarChartData = [];
        Object.keys(totalObj).forEach(function (k) {bigBarChartData.push({"name": k, "value": totalObj[k]});});
        bigBarChartData = bigBarChartData.sort(function (a, b) {return d3.ascending(a.value, b.value);});
        let bigBarChartSvg = d3.select('.big-bar-chart-container').append('svg').attr('class', 'big-bar-chart')
            .attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
            .attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom)
            .append("g").attr("transform", "translate(" + barChartMargin.left + ", 0)");
        let bigBarChartX = d3.scale.linear().range([0, barChartWidth]).domain([0, d3.max(bigBarChartData, function (d) {
            return d.value;
        })]);
        let bigBarChartY = d3.scale.ordinal().rangeRoundBands([barChartHeight, 0], .5).domain(bigBarChartData.map(function(d) {
            return d.name;
        }));
        let bigBarYAxis = d3.svg.axis().scale(bigBarChartY).tickSize(0).orient("left");
        bigBarChartSvg.append("g").attr("class", "y axis").call(bigBarYAxis);
        let bigBars = bigBarChartSvg.selectAll(".big-bar").data(bigBarChartData).enter().append("g");
        bigBars.append("rect").attr("class", "big-bar").attr("y", function(d) {
            return bigBarChartY(d.name);
        }).attr("height", bigBarChartY.rangeBand()).attr("x", 10).attr("width", function(d) {
            return bigBarChartX(d.value * 0.6);
        }).attr("fill", function (d) {return stateObj[1][d.name].color;});
        bigBars.append("text").attr("class", "label").style("font-weight", "bold").attr("y", function(d) {
            return bigBarChartY(d.name) + bigBarChartY.rangeBand() / 2 + 4;
        }).attr("x", function(d) {
            return bigBarChartX(d.value * 0.6) + 15;
        }).text(function(d) {
            return d.value;
        });

        // bar chart in the bottom
        showBottomBarChart(stateObj, true);

        function clicked(d) {
            if (d.id === "2") return;
            if (d3.select('.background').node() === this) return reset();
            if (active.node() === this) return reset();
            active.classed("active", false);
            active = d3.select(this).classed("active", true);
            let bounds = path.bounds(d), dx = bounds[1][0] - bounds[0][0], dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2, y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = .9 / Math.max(dx / width, dy / height),
                translate = [width / 2 - scale * x, height / 2 - scale * y];
            g.transition().duration(1000).style("stroke-width", 1.5 / scale + "px").attr("transform", "translate(" + translate + ")scale(" + scale + ")");
            showBottomBarChart(stateMap[d.id].counties, false);
        }

        function reset() {
            active.classed("active", false);
            active = d3.select(null);
            g.transition().delay(100).duration(1000).style("stroke-width", "1.5px").attr('transform', 'translate('+margin.left+','+margin.top+')');
            showBottomBarChart(stateObj, true);
        }

        function showBottomBarChart(dataObj, state) {
            barChartContainer.empty();
            console.log(dataObj);
            if (state) {
                for (let key in dataObj) {
                    if(stateMap[key].state_name === undefined) continue;
                    let html = "<li class='chart-container chart-container-" + key + "'><h3>" + stateMap[key].state_name
                        + "</h3><ul class='title'><li class='candidate'>Candidate</li><li class='vote'>Votes</li></ul></li>";
                    barChartContainer.append(html);
                    let barChartData = [];
                    Object.keys(dataObj[key]).forEach(function (candidate) {barChartData.push({"name": candidate, "value": dataObj[key][candidate].vote});});
                    barChartData = barChartData.sort(function (a, b) {return d3.ascending(a.value, b.value);});
                    drawBarChart(barChartData, dataObj, key, state);
                }
            } else {
                for (let fip of dataObj) {
                    let html = "<li class='chart-container chart-container-" + fip + "'><h3>" + countyObj[fip].countyName
                        + " County</h3><ul class='title'><li class='candidate'>Candidate</li><li class='vote'>Votes</li></ul></li>";
                    barChartContainer.append(html);
                    let barChartData = [];
                    countyObj[fip].candidate.forEach(function (d) {
                        let key = Object.keys(d)[0];
                        barChartData.push({"name": key, "value": d[key].vote});
                    });
                    barChartData = barChartData.sort(function (a, b) {return d3.ascending(a.value, b.value);});
                    drawBarChart(barChartData, countyObj, fip, state);
                }
            }
        }

        function drawBarChart(barChartData, dataObj, key, state) {
            let barChartSvg = d3.select(".chart-container-" + key + "").append('svg').attr('class', 'bar-chart')
                .attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
                .attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom)
                .append("g").attr("transform", "translate(" + barChartMargin.left + ", 0)");
            let x = d3.scale.linear().range([0, barChartWidth]).domain([0, d3.max(barChartData, function (d) {
                return d.value;
            })]);
            let y = d3.scale.ordinal().rangeRoundBands([barChartHeight, 0], .7).domain(barChartData.map(function(d) {
                return d.name;
            }));
            let yAxis = d3.svg.axis().scale(y).tickSize(0).orient("left");
            barChartSvg.append("g").attr("class", "y axis").call(yAxis);
            let bars = barChartSvg.selectAll(".bar").data(barChartData).enter().append("g");
            bars.append("rect").attr("class", "bar").attr("y", function(d) {
                return y(d.name);
            }).attr("height", y.rangeBand()).attr("x", 10).attr("width", function(d) {
                return x(d.value * 0.6);
            }).attr("fill", function (d, i) {
                if (!state) {
                    let ele = dataObj[key].candidate[2 - i];
                    // console.log(d.name);
                    // console.log(dataObj[key].candidate[2 - i]);
                    // console.log(dataObj[key].candidate[2 - i][d.name]);
                    console.log(dataObj[key].candidate[2 - i][Object.keys(ele)[0]]);
                    return dataObj[key].candidate[2 - i][Object.keys(ele)[0]].color;
                }
                return dataObj[key][d.name].color;
            });
            bars.append("text").attr("class", "label").style("font-weight", "bold").attr("y", function(d) {
                return y(d.name) + y.rangeBand() / 2 + 4;
            }).attr("x", function(d) {
                return x(d.value * 0.6) + 15;
            }).text(function(d) {
                return d.value;
            });
        }
    });

    function comparePoll(obj1, obj2) {
        let poll1 = Object.keys(obj1)[0].vote, poll2 = Object.keys(obj2)[0].vote;
        if (poll1 === poll2) return 0;
        return poll1 > poll2 ? -1 : 1;
    }
});
