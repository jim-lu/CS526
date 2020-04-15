$(function () {
    getData("2016");
    $(".selection").on("change", function () {
        let value = $(this).val();
        getData(value);
    });

    $.ajax({
        dataType: "json",
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        type: "get",
        url: "HistoryServlet?method=getYearList",
        success: function (data) {
            let year = data[0].resultSet;
            year.forEach(function (y, i) {
                let election_year = y.election_year;
                let selected = (i === year.length - 1) ? "selected" : "";
                $(".selection").prepend("<option value='" + election_year + "' selected='" + selected + "'>" + election_year + "</option>");
            });
        }
    });

    function getData(val) {
        $("h2").text(val + " PRESIDENTIAL ELECTION POLL");
        $.ajax({
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            type: "get",
            url: "HistoryServlet?method=getPastElectionPoll&year=" + val
        }).done(function (data) {
            if (data[0].msg === 'Query completed!') {
                console.log(data);
                $(".map-container").empty();
                $(".big-bar-chart-container").empty();

                let resultSet = data[0].resultSet;
                let color = {"republican": "#f00", "democrat": "#00c", "green": "#090"}, parties = new Set(Object.keys(color));
                let colorMap = {}, stateMap = {};
                let stateObj = {}, totalObj = {};
                resultSet.forEach(function (d) {
                    let stateFips = d.state_fips, candidateVote = parseInt(d.candidate_vote), party = d.party.toLowerCase();
                    let candidateName = d.candidate.split(",")[0];
                    if (candidateName.indexOf("None") > -1) return;
                    if (candidateName.indexOf("Vote") > -1) candidateName = "Void Vote";
                    if (!(candidateName in colorMap)) colorMap[candidateName] = parties.has(party) ? color[party] : generateColor();
                    if (stateFips in stateObj) {
                        if (candidateName in stateObj[stateFips]) {
                            stateObj[stateFips][candidateName].vote += candidateVote;
                        } else {
                            stateObj[stateFips][candidateName] = {vote: candidateVote, color: colorMap[candidateName]};
                        }
                    } else {
                        stateObj[stateFips] = {[candidateName]: {vote: candidateVote, color: colorMap[candidateName]}};
                    }
                    if (candidateName in totalObj) {
                        totalObj[candidateName].vote += candidateVote;
                    } else {
                        totalObj[candidateName] = {vote: candidateVote, color: colorMap[candidateName]};
                    }
                    if (stateFips in stateMap) {
                        stateMap[stateFips].total_vote += candidateVote;
                    } else {
                        stateMap[stateFips] = {state_name: d.state_name, total_vote: candidateVote}
                    }
                });
                console.log(stateObj);
                console.log(stateMap);
                drawMap(stateObj, stateMap);
                drawBarChart(totalObj);
            }
        });
    }

    function drawMap(stateObj, stateMap) {
        const url = "https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json";
        let width = 960, height = 600, centered;
        let projection = d3.geo.albersUsa().scale(1070).translate([width / 2, height / 2]);
        let path = d3.geo.path().projection(projection);
        let svg = d3.select(".map-container").append("svg").attr("width", width).attr("height", height);
        let tooltip = d3.select(".map-container").append("div").attr("class", "hidden tooltip");
        svg.append("rect").attr("class", "background").attr("width", width).attr("height", height).on("click", clicked);
        let g = svg.append("g").attr("width", width).attr("height", height);
        d3.json(url, function(err, json) {
            g.append("g").attr("id", "states").selectAll("path").data(topojson.feature(json, json.objects.states).features)
                .enter().append("path").attr("d", path).attr("stroke", "#fff").attr("stroke-width", 1.5).attr("fill", function (d) {
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
            }).on("click", clicked).on("mousemove", function(d) {
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
            g.append("path").datum(topojson.mesh(json, json.objects.states, function(a, b) { return a !== b; }))
                .attr("id", "state-borders").attr("d", path).attr("fill", "none");
        });

        function clicked(d) {
            let x, y, s;
            if (d && centered !== d) {
                let centroid = path.centroid(d);
                x = centroid[0];
                y = centroid[1];
                s = 4;
                centered = d;
            } else {
                x = width / 2;
                y = height / 2;
                s = 1;
                centered = null;
            }
            g.selectAll("path").classed("active", centered && function(d) {return d === centered;});
            g.transition().duration(1000)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + s + ")translate(-" + x + ",-" + y + ")")
                .style("stroke-width", 1.5 / s + "px");
        }
    }

    function drawBarChart(totalObj) {
        let bigBarChartData = [], svg, defs, bigXScale, smallXScale, bigYScale, smallYScale, bigYAxis, yZoom, textScale, brush, brushSetUp;
        Object.keys(totalObj).forEach(function (k, i) {bigBarChartData.push({"name": k, "value": totalObj[k].vote, "key": i});});
        bigBarChartData = bigBarChartData.sort(function (a, b) {return d3.descending(a.value, b.value);});
        console.log(bigBarChartData);
        init();
        function init() {
            let zoomer = d3.behavior.zoom().on("zoom", null);
            let bigMargin = {top: 10, right: 10, bottom: 30, left: 100}, bigWidth = 860 - bigMargin.left - bigMargin.right,
                bigHeight = 400 - bigMargin.top - bigMargin.bottom;
            let smallMargin = {top: 10, right: 10, bottom: 30, left: 10}, smallWidth = 100 - smallMargin.left - smallMargin.right,
                smallHeight = 400 - smallMargin.top - smallMargin.bottom;
            svg = d3.select(".big-bar-chart-container").append("svg").attr("class", "big-bar-chart")
                .attr("width", bigWidth + bigMargin.left + bigMargin.right + smallWidth + smallMargin.left + smallMargin.right)
                .attr("height", bigHeight + bigMargin.top + bigMargin.bottom).call(zoomer).on("wheel.zoom", scroll)
                .on("mousedown.zoom", null).on("touchstart.zoom", null).on("touchmove.zoom", null).on("touchend.zoom", null);
            let bigGroup = svg.append("g").attr("class", "big-group-wrapper")
                .attr("transform", "translate(" + bigMargin.left + "," + bigMargin.top + ")").append("g")
                .attr("clip-path", "url(#clip)").style("clip-path", "url(#clip)").attr("class", "big-group");
            svg.append("g").attr("class", "small-group")
                .attr("transform", "translate(" + (bigMargin.left + bigWidth + bigMargin.right + smallMargin.left) + "," + smallMargin.top + ")");
            svg.append("g").attr("class", "brush-group")
                .attr("transform", "translate(" + (bigMargin.left + bigWidth + bigMargin.right + smallMargin.left) + "," + smallMargin.top + ")");
            bigXScale = d3.scale.linear().range([0, bigWidth]);
            smallXScale = d3.scale.linear().range([0, smallWidth]);
            bigYScale = d3.scale.ordinal().rangeBands([0, bigHeight], 0.4, 0);
            smallYScale = d3.scale.ordinal().rangeBands([0, smallHeight], 0.4, 0);
            yZoom = d3.scale.linear().range([0, bigHeight]).domain([0, bigHeight]);
            bigYAxis = d3.svg.axis().scale(bigYScale).orient("left").tickSize(0);
            d3.select(".big-group-wrapper").append("g").attr("class", "x axis").attr("transform", "translate(0, " + (bigHeight + 5) + ")");
            bigGroup.append("g").attr("class", "y axis").attr("transform", "translate(-5, 0)");
            bigXScale.domain([0, d3.max(bigBarChartData, function (d) {return d.value;})]);
            smallXScale.domain([0, d3.max(bigBarChartData, function (d) {return d.value;})]);
            bigYScale.domain(bigBarChartData.map(function (d) {return d.name;}));
            smallYScale.domain(bigBarChartData.map(function (d) {return d.name;}));
            d3.select(".big-group").select(".y.axis").call(bigYAxis);
            textScale = d3.scale.linear().domain([15, 50]).range([12, 6]);
            let brushExtent = Math.max(1, Math.min(20, Math.round(bigBarChartData.length)));
            brush = d3.svg.brush().y(smallYScale).extent([smallYScale(bigBarChartData[0].name),
                smallYScale(bigBarChartData[brushExtent].name)]).on("brush", brushMove);
            brushSetUp = d3.select(".brush-group").append("g").attr("class", "brush").call(brush);
            brushSetUp.selectAll(".resize").append("line").attr("x2", smallWidth);
            brushSetUp.selectAll(".resize").append("path").attr("transform", function (d, i) {
                return i ? "translate(" + (smallWidth / 2) + ", 4)rotate(180)" : "translate(" + (smallWidth / 2) + ", -4)rotate(0)"
            });
            brushSetUp.selectAll("rect").attr("width", smallWidth);
            brushSetUp.select(".background").on("mousedown.brush", brushToCenter).on("touchstart.brush", brushToCenter);
            defs = svg.append("defs");
            defs.append("clipPath").attr("id", "clip").append("rect").attr("x", -bigMargin.left)
                .attr("width", bigWidth + bigMargin.left).attr("height", bigHeight);
            let smallBar = d3.select(".small-group").selectAll(".bar").data(bigBarChartData, function (d) {return d.key;});
            smallBar.attr("width", function (d) {return smallXScale(d.value);}).attr("y", function (d) {
                return smallYScale(d.name);
            }).attr("height", smallYScale.rangeBand());
            smallBar.enter().append("rect").attr("class", "bar").attr("x", 0).attr("y", function (d) {
                return smallYScale(d.name);
            }).attr("height", smallYScale.rangeBand()).attr("width", function (d) {
                return smallXScale(d.value);
            }).attr("fill", function (d) {return totalObj[d.name].color;});
            smallBar.exit().remove();
            brushSetUp.call(brush.event);
        }

        function scroll() {
            let extent = brush.extent(), size = extent[1] - extent[0], range = smallYScale.range(),
                yMin = d3.min(range), yMax = d3.max(range) + smallYScale.rangeBand(), dy = d3.event.deltaY, select;
            if (yMin > extent[0] - dy) {
                select = yMin;
            } else if (yMax < extent[1] - dy) {
                select = yMax - size;
            } else {
                select = extent[0] - dy;
            }
            d3.event.stopPropagation();
            d3.event.preventDefault();
            brushSetUp.call(brush.extent([select, select + size])).call(brush.event);
        }

        function brushToCenter() {
            let target = d3.event.target, extent = brush.extent(), size = extent[1] - extent[0], range = smallYScale.range(),
                yMin = d3.min(range) + size / 2, yMax = d3.max(range) + smallYScale.rangeBand() - size / 2,
                center = Math.max(yMin, Math.min(yMax, d3.mouse(target)[1]));
            d3.event.stopPropagation();
            brushSetUp.call(brush.extent([center - size / 2, center + size / 2])).call(brush.event);
        }

        function brushMove() {
            let extent = brush.extent();
            let selectedBars = smallYScale.domain().filter(function (d) {
                return (extent[0] - smallYScale.rangeBand() <= smallYScale(d)) && (extent[1] >= smallYScale(d));
            });
            d3.select(".small-group").selectAll(".bar").attr("fill", function (d) {
                return selectedBars.indexOf(d.name) > -1 ? totalObj[d.name].color : "#aaa";
            });
            d3.selectAll(".y.axis text").style("font-size", textScale(selectedBars.length));
            let origin = yZoom.range();
            yZoom.domain(extent);
            bigYScale.domain(bigBarChartData.map(function (d) {
                return d.name;
            })).rangeBands([yZoom(origin[0]), yZoom(origin[1])], 0.4, 0);
            d3.select(".big-group").select(".y.axis").call(bigYAxis);
            let newMaxX = d3.max(bigBarChartData, function (d) {return selectedBars.indexOf(d.name) > -1 ? d.value : 0;});
            bigXScale.domain([0, newMaxX]);
            update();
        }

        function update() {
            let bars = d3.select(".big-group").selectAll(".bar").data(bigBarChartData, function (d) {return d.key;});
            bars.attr("x", 0).attr("y", function (d) {
                return bigYScale(d.name);
            }).attr("height", bigYScale.rangeBand()).attr("width", function (d) {
                return bigXScale(d.value);
            }).transition().duration(50);
            bars.enter().append("rect").attr("class", "bar").attr("fill", function (d) {
                return totalObj[d.name].color;
            }).attr("x", 0).attr("y", function (d) {
                return bigYScale(d.name);
            }).attr("height", bigYScale.rangeBand()).attr("width", function (d) {
                return bigXScale(d.value);
            }).transition().duration(50);
            bars.exit().remove();
        }
    }

    function generateColor() {
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        return "rgba(" + r + ", " + g + ", " + b + ")";
    }
});
