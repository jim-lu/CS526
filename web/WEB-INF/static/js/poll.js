$(function () {
    const maxId = $("#max");
    const plotContainer = $(".plot-container");
    const lineFilterSlots = $(".line-slot");
    const dataPickerFromDate = $("#from-date");
    const dataPickerToDate = $("#to-date");
    let stand1, stand2;
    let maxDomain;
    let timeActive = maxId;

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

    const poll_data = (function() {
        let dataObj = [];
        $.ajax({
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            type: "get",
            url: "PollServlet?method=" + getParams("poll"),
            success: function (data) {
                if (data[0].msg === 'Query completed!') {
                    let titleArr = getParams("poll").split(/(?=[A-Z])/);
                    let title = "";
                    titleArr.forEach(function (s) {
                        title += s.toUpperCase() + " ";
                    });
                    $(".plot-name").text(title);

                    let resultSet = data[0].resultSet;
                    let dateMap1 = new Map(), countMap1 = new Map(), dateMap2 = new Map(), countMap2 = new Map();
                    stand1 = resultSet[0].stand;
                    stand2 = resultSet[1].stand;
                    lineFilterSlots.eq(0).text(stand1);
                    lineFilterSlots.eq(1).text(stand2);
                    for (let i = 0; i < resultSet.length; i += 2) {
                        formalizeDate(resultSet, i, dateMap1, countMap1);
                    }
                    for (let i = 1; i < resultSet.length; i += 2) {
                        formalizeDate(resultSet, i, dateMap2, countMap2);
                    }
                    let parseDate = d3.time.format("%Y-%m-%d").parse;
                    pushData(dateMap1, dateMap2, countMap1, countMap2, dataObj, parseDate, stand1, stand2);
                    dataObj.sort(compareDate);
                    drawGraph(dataObj);
                }
            }
        });
        return dataObj;
    })();

    $(".date-picker").datepicker();
    $(".apply-button").on("click", function () {
        let parseDate = d3.time.format("%m/%d/%Y").parse;
        let fromDate = parseDate(dataPickerFromDate.datepicker().val()), toDate = parseDate(dataPickerToDate.datepicker().val());
        let timeSlot0 = fromDate.getTime(), timeSlot1 = toDate.getTime();
        if (timeSlot0 >= timeSlot1) {
            $(".time-selection span").css("display", "block");
            return;
        }
        if (fromDate.getTime() < maxDomain[0].getTime()) fromDate = maxDomain[0];
        if (toDate.getTime() > maxDomain[1].getTime()) toDate = maxDomain[1];
        timeActive.removeClass("active");
        timeActive = null;
        drawBrush([fromDate, toDate], brush);
    });

    $(".filter-slot").on("click", function () {
        let currObj = $(this);
        if (currObj.hasClass("time-slot")) {
            changeTimeActive(currObj);
            let days = currObj.attr("name");
            if (days === "Max") {
                drawBrush(maxDomain, brush);
            } else {
                let endTimestamp = x.domain()[1].getTime(), startTimestamp = endTimestamp - parseInt(days) * 24 * 60 * 60 * 1000;
                drawBrush([startTimestamp, endTimestamp], brush);
            }
        } else {
            changeLineActive(currObj);
            let labelStr = labelToClass(currObj.text());
            if (currObj.hasClass("active")) {
                $("." + labelStr).fadeIn();
            } else {
                $("." + labelStr).fadeOut();
            }
        }
    });

    $("#reset-button").on("click", function () {
        changeTimeActive(maxId);
        for (let i = 0; i < lineFilterSlots.length; i ++) {
            if (!lineFilterSlots.eq(i).hasClass("active")) {
                lineFilterSlots.eq(i).addClass("active");
                $("." + labelToClass(lineFilterSlots.eq(i).text()) + "line").fadeIn();
            }
        }
        drawBrush(maxDomain, brush);
    });

    function drawGraph(dataObj) {
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
        maxDomain = x.domain();

        let legend = svg.selectAll("g").data(polls).enter().append("g").attr("class", "legend");
        legend.append("rect").attr("x", function (d, i) {
            if (i > 0) return polls[i - 1].name.length * 2 + (i + 1) * 100;
            return (i + 1) * 100;
        }).attr("y", 10).attr("width", 10).attr("height", 10).style("fill", function (d) {
            return color(d.name);
        });
        legend.append("text").attr("x", function (d, i) {
            if (i > 0) return polls[i - 1].name.length * 2 + (i + 1) * 100 + 13;
            return (i + 1) * 100 + 13;
        }).attr("y", 20).text(function (d) {
            return d.name;
        });

        focus = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        context = svg.append("g").attr("transform", "translate(" + contextMargin.left + "," + contextMargin.top + ")");
        let focusLineGroups = focus.selectAll("g").data(polls).enter().append("g");
        focusLineGroups.append("path").attr("class", function (d) {
            return "line " + labelToClass(d.name);
        }).attr("d", function (d) {
            return line(d.values);
        }).attr("fill", "none").attr("stroke-width", 1).style("stroke", function (d) {
            return color(d.name);
        }).attr("clip-path", "url(#clip");
        focus.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis).append("text").attr("x", width - 10).attr("y", -5).style("text-anchor", "end").text("Date");
        focus.append("g").attr("class", "y axis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end").text("Poll (%)");;

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

        let mouseG = svg.append("g").attr("class", "mouse-over-effects").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        mouseG.append("path").attr("class", "mouse-line").style("stroke", "black").style("stroke-width", 1);
        const lines = $(".line");
        let mousePerLine = mouseG.selectAll(".mouse-per-line").data(polls).enter().append("g").attr("class", function (d) {
            return "mouse-per-line " + labelToClass(d.name);
        });
        mousePerLine.append("circle").attr("r", 5).style("stroke", function (d) {
            return color(d.name);
        }).style("fill", "none").style("stroke-width", 1).style("opacity", 0);
        mousePerLine.append("text").attr("transform", "translate(10, 3)");
        mouseG.append("svg:rect").attr("width", width).attr("height", height).attr("fill", "none").attr("pointer-events", "all").on("mouseover", function () {
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

    function brushed() {
        x.domain(brush.empty() ? x2.domain() : brush.extent());
        focus.selectAll("path.line").attr("d", function (d) {return line(d.values);});
        focus.select(".x.axis").call(xAxis);
        focus.select(".y.axis").call(yAxis);
    }

    function formalizeDate(resultSet, i, dateMap, countMap) {
        let dateArr = resultSet[i].poll_date.split("-");
        let date = resultSet[i].poll_year + "-" + dateArr[1].trim().replace("/", "-");
        if (dateMap.has(date)) {
            dateMap.set(date, dateMap.get(date) + parseFloat(resultSet[i].poll));
            countMap.set(date, countMap.get(date) + 1);
            return;
        }
        dateMap.set(date, parseFloat(resultSet[i].poll));
        countMap.set(date, 1);
    }

    function pushData(dateMap1, dateMap2, countMap1, countMap2, data, parseDate) {
        for (let key of dateMap1.keys()) {
            let poll1 = dateMap1.get(key) / countMap1.get(key), poll2 = dateMap2.get(key) / countMap2.get(key);
            data.push({
                "date": parseDate(key),
                [stand1]: poll1,
                [stand2]: poll2,
                "Bias": poll1 - poll2
            });
        }
    }

    function changeLineActive(currObj) {
        if (currObj.hasClass("active")) {
            currObj.removeClass("active");
        } else {
            currObj.addClass("active");
        }
    }

    function changeTimeActive(addObj) {
        if (timeActive != null) timeActive.removeClass("active");
        addObj.addClass("active");
        timeActive = addObj;
    }

    function labelToClass(label) {
        let labelArr = label.split(/\s|\//);
        let labelStr = "";
        labelArr.forEach(function (s) {
            labelStr += s + "-";
        });
        return labelStr + "line";
    }
});
