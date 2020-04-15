$(function () {
    const candidateList = $('.candidate-list');

    const candidates = (function() {
        let res = {publican: [], democratic: []};
        $.ajax({
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            type: "get",
            url: "IndexServlet?method=getCandidates",
            success: function (data) {
                if (data[0].msg === 'Query completed!') {
                    let resultSet = data[0].resultSet;
                    let publicanHtml = "";
                    let democraticHtml = "";
                    for (let i = 0; i < resultSet.length; i ++) {
                        let resObj = resultSet[i];
                        if (resObj.candidate_party === 0) {
                            publicanHtml += "<li class='candidate' id=" + resObj.candidate_id + ">" +
                                "<a href='candidate-info.jsp?id=" + resObj.candidate_id + "&name=" + resObj.candidate_name + "&party=" + resObj.candidate_party + "'><img src='/img/" + resObj.candidate_img + "' alt='" + resObj.candidate_name + "' class='status-" + resObj.candidate_status + "'></a>" +
                                "<h4>" + resObj.candidate_name + "</h4>" +
                                "</li>";
                        } else {
                            democraticHtml += "<li class='candidate' id=" + resObj.candidate_id + ">" +
                                "<a href='candidate-info.jsp?id=" + resObj.candidate_id + "&name=" + resObj.candidate_name + "&party=" + resObj.candidate_party + "'><img src='/img/" + resObj.candidate_img + "' alt='" + resObj.candidate_name + "' class='status-" + resObj.candidate_status + "'></a>" +
                                "<h4>" + resObj.candidate_name + "</h4>" +
                                "</li>";
                        }
                    }
                    candidateList.eq(0).html(publicanHtml);
                    candidateList.eq(1).html(democraticHtml);
                }
            }
        });
        return res;
    })();

    $.ajax({
        dataType: "json",
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        type: "get",
        url: "IndexServlet?method=getAllStatePoll"
    }).done(function (data) {
        let statePoll = data[0][0].resultSet, stateInfo = data[1][0].resultSet, candidateInfo = data[2][0].resultSet;
        let stateMap = {}, middleMap = {}, pollMap = {};
        let color = ["#0000cc", "#3333cc", "#6600ff", "#9933ff", "#cc00ff"];
        let candidateColor = {};
        stateInfo.forEach(function (d) {
            stateMap[d.state_fips] = {};
            stateMap[d.state_fips]["state_name"] = d.state_name;
            stateMap[d.state_fips]["start_date"] = d.start_date;
            stateMap[d.state_fips]["final"] = d.final;
            stateMap[d.state_fips]["dataSet"] = [];
            middleMap[d.state_fips] = d.state_po;
            pollMap[d.state_po] = [];
        });
        candidateInfo.forEach(function (d, i) {
            if (d.candidate_status === 1) candidateColor[d.candidate_name.split(" ")[1]] = color[i];
        });
        let index = statePoll.length - 1;
        let pollDate = statePoll[index].poll_date, state = statePoll[index].state,
            pollsterId = statePoll[index].pollster_id;
        for (let i = index; i >= 0; i --) {
            if ((statePoll[i].poll_date !== pollDate && statePoll[i].state === state) || (statePoll[i].pollster_id !== pollsterId && statePoll[i].state === state)) {
                continue;
            } else if (statePoll[i].state !== state) {
                state = statePoll[i].state;
                pollDate = statePoll[i].poll_date;
                pollsterId = statePoll[i].pollster_id
            }
            let candidate = statePoll[i].candidate.trim(), poll = parseFloat(statePoll[i].poll);
            pollMap[state].push({"name": candidate, "value": poll});
        }
        for (let prop in pollMap) pollMap[prop].sort(comparePoll);

        // candidate represent
        const labelContainer = $(".label-container");
        let labelWidth = parseFloat(labelContainer.innerWidth()) / Object.keys(candidateColor).length;
        let labelHTML = "";
        for (let key in candidateColor) {
            labelHTML += "<div class='label-outside-box' style='width: " + labelWidth + "px;'><div class='label-inside-box clearfix'><img src='/img/"
                + key.toLowerCase() + ".png'><div class='label-color' style='background-color: " + candidateColor[key] + "'></div></div></div>";
        }
        labelContainer.html(labelHTML);

        let width = 960, height = 500, centered;
        let projection = d3.geo.albersUsa().scale(1070).translate([width / 2, height / 2]);
        let path = d3.geo.path().projection(projection);
        let svg = d3.select(".map").append("svg").attr("width", width).attr("height", height);
        let tooltip = d3.select(".map").append("div").attr("class", "hidden tooltip");
        svg.append("rect").attr("class", "background").attr("fill", "#003366").attr("width", width).attr("height", height).on("click", clicked);
        let g = svg.append("g");
        const url = "https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json";
        d3.json(url, function(err, json) {
            g.append("g").attr("id", "states").selectAll("path").data(topojson.feature(json, json.objects.states).features)
                .enter().append("path").attr("d", path).attr("stroke", "#fff").attr("stroke-width", 1.5).attr("fill", function (d) {
                if (d.id in stateMap && stateMap[d.id].final) {
                    let statePO = middleMap[d.id];
                    let barChartDataSet = pollMap[statePO];
                    if (barChartDataSet.length === 0) return "#ccc";
                    return candidateColor[barChartDataSet[0].name];
                }
                return "#ccc";
            }).on("click", clicked).on("mousemove", function(d) {
                let mouse = d3.mouse(svg.node()).map(function(d) {return parseInt(d);});
                let html = "<h4>" + stateMap[d.id].state_name + "</h4><h5>" + stateMap[d.id].start_date + "</h5>";
                let left, top;
                if (stateMap[d.id].final) {
                    let statePO = middleMap[d.id];
                    let barChartDataSet = pollMap[statePO];
                    html += "<div class='data-container'><div class='row clearfix'><div class='name' style='font-weight: bold'>Name</div>" +
                        "<div class='value' style='font-weight: bold'>Proportion</div></div>";
                    barChartDataSet.forEach(function (d) {
                        html += "<div class='row clearfix'><div class='name'><img src='/img/" + d.name.replace("'", "").toLowerCase() + ".png'>" + d.name + "</div><div class='value'>" +
                            d.value + "%</div></div>";
                    });
                    html += "</div>";
                    left = mouse[0] > width / 2 ? mouse[0] - 260 : mouse[0] + 15;
                    top = mouse[1] > height / 2 ? mouse[1] - 200 : mouse[1] - 35;
                } else {
                    left = mouse[0] > width / 2 ? mouse[0] - 100 : mouse[0] + 15;
                    top = mouse[1] - 35;
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
    });

    // $('#map').usmap({
    //     stateStyles: {fill: 'grey'},
    //     stateHoverStyles: {fill: 'white'}
    // });
});
