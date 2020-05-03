$(function () {
    const plotContainer = $(".plot-container");

    let margin = {top: 10, right: 10, bottom: 100, left: 40};
    let contextMargin = {top: 510, right: 10, bottom: 30, left: 40};
    let width = plotContainer.innerWidth() * 0.9 - margin.left - margin.right,
        height = plotContainer.innerHeight() * 0.9 - margin.top - margin.bottom,
        contextHeight = plotContainer.innerHeight() * 0.9 - contextMargin.top - contextMargin.bottom;
    let x = d3.time.scale().range([0, width]), y = d3.scale.linear().range([height, 0]);
    let x2 = d3.time.scale().range([0, width]), y2 = d3.scale.linear().range([contextHeight, 0]);
    let color = d3.scale.category10();
    let xAxis = d3.svg.axis().scale(x).orient("bottom"), yAxis = d3.svg.axis().scale(y).orient("left"), xAxis2 = d3.svg.axis().scale(x2).orient("bottom");
    let brush = d3.svg.brush().x(x2).on("brush", brushed);
    let svg = d3.select(".plot-container").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
    let line = d3.svg.line().defined(function (d) {
        return d.poll !== null && !isNaN(d.poll);
    }).interpolate("basis").x(function(d) {
        return x(d.date);
    }).y(function(d) {
        return y(d.poll);
    });
    let line2 = d3.svg.line().defined(function (d) {
        return d.poll != null && !isNaN(d.poll)
    }).interpolate("basis").x(function (d) {
        return x2(d.date);
    }).y(function (d) {
        return y2(d.poll);
    });
    let focus, context;

    function labelToClass(label) {
        let labelArr = label.split(/\s|\//);
        let labelStr = "";
        labelArr.forEach(function (s) {
            labelStr += s + "-";
        });
        return labelStr + "line";
    }

    $.ajax({
        dataType: "json",
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        type: "get",
        url: "CandidateServlet?method=getCandidateInfo&id=" + getParams("id") + "&name=" + getParams("name") + "&party=" + getParams("party"),
        success: function (data) {
            if (data[0][0].msg === 'Query completed!' && data[1][0].msg === 'Query completed!') {
                let candidateInfo = data[0][0].resultSet[0], resultSet = data[1][0].resultSet;
                $(".img").html("<img src='/img/" + candidateInfo.candidate_img + "'>");
                $(".name").text(candidateInfo.candidate_name.toUpperCase());
                $(".intro").text(candidateInfo.candidate_introduction);
                $(".education").html("<b>Education: </b>" + candidateInfo.education);
                $(".born").html("<b>Born: </b>" + candidateInfo.candidate_birth);

                if (resultSet.length === 0) {
                    $(".right-container").html("<p>This candidate is out before nomination.</p>");
                    return;
                }

                let dateMap = new Map(), countMap = new Map();
                let dataObj = [];
                for (let i = 0; i < resultSet.length; i ++) {
                    if (resultSet[i].poll === "--") continue;
                    let dateArr = resultSet[i].poll_date.split("-");
                    let date = resultSet[i].poll_year + "-" + dateArr[1].trim().replace("/", "-");
                    if (dateMap.has(date)) {
                        dateMap.set(date, dateMap.get(date) + parseFloat(resultSet[i].poll));
                        countMap.set(date, countMap.get(date) + 1);
                    } else {
                        dateMap.set(date, parseFloat(resultSet[i].poll));
                        countMap.set(date, 1);
                    }
                }
                let parseDate = d3.time.format("%Y-%m-%d").parse;
                for (let key of dateMap.keys()) {
                    let poll = dateMap.get(key) / countMap.get(key);
                    dataObj.push({
                        "date": parseDate(key),
                        [candidateInfo.candidate_name]: poll
                    });
                }
                dataObj.sort(compareDate);

                svg.append("defs").append("clipPath").attr("id", "clip").append("rect").attr("width", width).attr("height", height);
                color.domain(d3.keys(dataObj[0]).filter(function(key) {return key !== "date"}));
                let polls = color.domain().map(function(name) {
                    return {
                        name: name,
                        values: dataObj.map(function(d) {return {date: d.date, poll: d[name]}})
                    };
                });
                x.domain(d3.extent(dataObj, function(d) {return d.date}));
                y.domain([
                    d3.min(polls, function (p) {
                        return d3.min(p.values, function (v) {return v.poll});
                    }), d3.max(polls, function (p) {
                        return d3.max(p.values, function (v) {return v.poll});
                    })
                ]);
                x2.domain(x.domain());
                y2.domain(y.domain());

                focus = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                context = svg.append("g").attr("transform", "translate(" + contextMargin.left + "," + contextMargin.top + ")");
                let focusLineGroups = focus.selectAll("g").data(polls).enter().append("g");
                focusLineGroups.append("path").attr("class", function (d) {
                    return "line " + labelToClass(d.name);
                }).attr("d", function (d) {
                    return line(d.values);
                }).attr("fill", "none").attr("stroke-width", 1).style("stroke", function (d) {
                    return color(d.name);
                }).attr("clip-path", "url(#clip)");
                focus.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis).append("text").attr("x", width - 10).attr("y", -5).style("text-anchor", "end").text("Date");
                focus.append("g").attr("class", "y axis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end").text("Poll (%)");

                let contextLineGroups = context.selectAll("g").data(polls).enter().append('g');
                contextLineGroups.append("path").attr("class", function (d) {
                    return "line " + labelToClass(d.name);
                }).attr("d", function (d) {
                    return line2(d.values);
                }).attr("fill", "none").attr("stroke-width", 1).style("stroke", function (d) {
                    return color(d.name);
                }).attr("clip-path", "url(#clip");
                context.append("g").attr("class", "x axis").attr("transform", "translate(0," + contextHeight + ")").call(xAxis2);
                context.append("g").attr("class", "x brush").call(brush).selectAll("rect").attr("y", -6).attr("height", contextHeight + 7);

                let mouseEffect = svg.append("g").attr("class", "mouse-over-effects").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                mouseEffect.append("path").attr("class", "mouse-line").style("stroke", "black").style("stroke-width", 1);
                const lines = $(".line");
                let mousePerLine = mouseEffect.selectAll(".mouse-per-line").data(polls).enter().append("g").attr("class", function (d) {
                    return "mouse-per-line " + labelToClass(d.name);
                });
                mousePerLine.append("circle").attr("r", 5).style("stroke", function (d) {
                    return color(d.name);
                }).style("fill", "none").style("stroke-width", 1).style("opacity", 0);
                mousePerLine.append("text").attr("transform", "translate(10, 3)");
                mouseEffect.append("svg:rect").attr("width", width).attr("height", height).attr("fill", "none").attr("pointer-events", "all").on("mouseover", function () {
                    d3.select(".mouse-line").style("opacity", "1");
                    d3.selectAll(".mouse-per-line circle").style("opacity", "1");
                    d3.selectAll(".mouse-per-line text").style("opacity", "1");
                }).on("mouseout", function () {
                    d3.select(".mouse-line").style("opacity", "0");
                    d3.selectAll(".mouse-per-line circle").style("opacity", "0");
                    d3.selectAll(".mouse-per-line text").style("opacity", "0");
                }).on('mousemove', function() {
                    let mouse = d3.mouse(this);
                    d3.select(".mouse-line").attr("d", function() {
                        let d = "M" + mouse[0] + "," + height;
                        d += " " + mouse[0] + "," + 0;
                        return d;
                    });
                    d3.selectAll(".mouse-per-line").attr("transform", function(d, i) {
                        let xDate = x.invert(mouse[0]), bisect = d3.bisector(function(d) { return d.date; }).right;
                        bisect(d.values, xDate);
                        let beginning = 0, end = lines[i].getTotalLength(), target = null, pos = null;
                        while (true){
                            target = Math.floor((beginning + end) / 2);
                            pos = lines[i].getPointAtLength(target);
                            if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                                break;
                            }
                            if (pos.x > mouse[0]) end = target;
                            else if (pos.x < mouse[0]) beginning = target;
                            else break;
                        }
                        d3.select(this).select('text').text(y.invert(pos.y).toFixed(2));
                        return "translate(" + mouse[0] + "," + pos.y +")";
                    });
                });


            }
        }
    });

    function brushed() {
        x.domain(brush.empty() ? x2.domain() : brush.extent());
        focus.selectAll("path.line").attr("d", function (d) {return line(d.values);});
        focus.select(".x.axis").call(xAxis);
        focus.select(".y.axis").call(yAxis);
    }
});
