$(function () {
    const dataPickerFromDate = $("#from-date");
    const dataPickerToDate = $("#to-date");
    const maxId = $("#max");
    const plotContainer = $(".plot-container");
    let timeActive = maxId;
    let maxDomain;

    let margin = {top: 10, right: 10, bottom: 100, left: 40};
    let contextMargin = {top: 510, right: 10, bottom: 30, left: 40};
    let width = plotContainer.innerWidth() * 0.9 - margin.left - margin.right,
        height = plotContainer.innerHeight() * 0.9 - margin.top - margin.bottom,
        contextHeight = plotContainer.innerHeight() * 0.9 - contextMargin.top - contextMargin.bottom;
    let x = d3.time.scale().range([0, width]), y = d3.scale.linear().range([height, 0]);
    let x2 = d3.time.scale().range([0, width]), y2 = d3.scale.linear().range([contextHeight, 0]);
    let color = d3.scale.category20();
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

    $.ajax({
        dataType: "json",
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        type: "get",
        url: "PollServlet?method=" + getParams("poll"),
        success: function (data) {
            if (data[0].msg === 'Query completed!') {
                let resultSet = data[0].resultSet, pollsterId = resultSet[0].pollster_id, pollDate = resultSet[0].poll_date;
                let unprocessedData = [], tmpObj = {}, dateArr = pollDate.split("-");
                let candidateSet = new Set(), countMap = new Map();
                let parseDate = d3.time.format("%Y-%m-%d").parse;
                for (let i = 0; i < resultSet.length; i ++) {
                    let candidate = resultSet[i].candidate.trim();
                    if (resultSet[i].pollster_id !== pollsterId || resultSet[i].poll_date !== pollDate || candidate in tmpObj) {
                        setupCountMap(countMap, tmpObj.date.getTime());
                        unprocessedData.push(tmpObj);
                        tmpObj = {};
                        pollsterId = resultSet[i].pollster_id;
                        pollDate = resultSet[i].poll_date;
                        dateArr = pollDate.split("-");
                    }
                    if(!("date" in tmpObj)) tmpObj["date"] = parseDate(resultSet[i].poll_year + "-" + dateArr[1].trim().replace("/", "-"));
                    if (resultSet[i].poll !== "--") tmpObj[candidate] = parseFloat(resultSet[i].poll);
                    candidateSet.add(candidate);
                }
                setupCountMap(countMap, tmpObj.date.getTime());
                unprocessedData.push(tmpObj);
                unprocessedData.sort(compareDate);
                for (let i = 0; i < unprocessedData.length; ) {
                    let date = unprocessedData[i].date.getTime();
                    let lastIndex = i + countMap.get(date) - 1;
                    for (let j = countMap.get(date) - 2; j >= 0; j --) {
                        for (let key in unprocessedData[i]) {
                            if (key === "date") continue;
                            if (!(key in unprocessedData[i + j])) unprocessedData[i + j][key] = 0;
                            unprocessedData[lastIndex][key] += unprocessedData[i + j][key];
                        }
                    }
                    for (let key in unprocessedData[i]) {
                        if (key === "date") continue;
                        unprocessedData[lastIndex][key] /= countMap.get(date);
                    }
                    i += countMap.get(date);
                    dataObj.push(unprocessedData[lastIndex]);
                }
                dataObj.forEach(function (obj) {
                    candidateSet.forEach(function (candidate) {
                        if (!(candidate in obj)) obj[candidate] = null;
                    })
                });
                let html = "";
                candidateSet.forEach(function(candidate) {
                    html += "<li id='" + candidate + "-line' name='" + candidate + "' class='filter-slot line-slot active'>" + candidate + "</li>"
                });
                $("#line-filters").prepend(html);
                drawGraph(dataObj);
            }
        }
    });

    $(".date-picker").datepicker();
    $(".apply-button").on("click", function () {
        let parseDate = d3.time.format("%m/%d/%Y").parse;
        let fromDate = parseDate(dataPickerFromDate.datepicker().val()), toDate = parseDate(dataPickerToDate.datepicker().val());
        if (fromDate.getTime() > toDate.getTime()) {
            $(".time-selection span").css("display", "block");
            return;
        }
        if (fromDate.getTime() < maxDomain[0].getTime()) fromDate = maxDomain[0];
        if (toDate.getTime() > maxDomain[1].getTime()) toDate = maxDomain[1];
        timeActive.removeClass("active");
        timeActive = null;
        drawBrush([fromDate, toDate], brush);
    });

    $(document).on("click", ".filter-slot", function () {
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
            if (currObj.hasClass("active")) {
                $("." + currObj.attr("id")).fadeIn();
            } else {
                $("." + currObj.attr("id")).fadeOut();
            }
        }
        if (currObj.attr("id") === "reset-button") {
            changeTimeActive(maxId);
            const lineSlot = $(".line-slot");
            for (let i = 0; i < lineSlot.length; i ++) {
                if (!lineSlot.eq(i).hasClass("active")) {
                    lineSlot.eq(i).addClass("active");
                    $("." + lineSlot.eq(i).attr("id")).fadeIn();
                }
            }
            drawBrush(maxDomain, brush);
        }
    });

    function setupCountMap(countMap, key) {
        if (countMap.has(key)) {
            countMap.set(key, countMap.get(key) + 1);
        } else {
            countMap.set(key, 1);
        }
    }

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
            if (i > 0) return polls[i - 1].name.length * 2 + i * 85 + 70;
            return i * 85 + 70;
        }).attr("y", 10).attr("width", 10).attr("height", 10).style("fill", function (d) {
            return color(d.name);
        });
        legend.append("text").attr("x", function (d, i) {
            if (i > 0) return polls[i - 1].name.length * 2 + i * 85 + 83;
            return i * 85 + 83;
        }).attr("y", 20).text(function (d) {
            return d.name;
        });

        focus = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        context = svg.append("g").attr("transform", "translate(" + contextMargin.left + "," + contextMargin.top + ")");
        let focusLineGroups = focus.selectAll("g").data(polls).enter().append("g");
        focusLineGroups.append("path").attr("class", function (d) {
            return "line " + d.name + "-line";
        }).attr("d", function (d) {
            return line(d.values);
        }).attr("fill", "none").attr("stroke-width", 1).style("stroke", function (d) {
            return color(d.name);
        }).attr("clip-path", "url(#clip");
        focus.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis).append("text").attr("x", width - 10).attr("y", -5).style("text-anchor", "end").text("Date");
        focus.append("g").attr("class", "y axis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end").text("Poll (%)");;

        let contextLineGroups = context.selectAll("g").data(polls).enter().append('g');
        contextLineGroups.append("path").attr("class", function (d) {
            return "line " + d.name + "-line";
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
            return "mouse-per-line " + d.name + "-line";
        });
        mousePerLine.append("circle").attr("r", 5).style("stroke", function (d) {
            return color(d.name);
        }).style("fill", "none").style("stroke-width", 1).style("opacity", 0);
        mousePerLine.append("text").attr("transform", "translate(10, 3)");
        mouseG.append("svg:rect").attr("width", width).attr("height", height).attr("fill", "none").attr("pointer-events", "all").on("mouseover", function () {
            d3.select(".mouse-line").style("opacity", "1");
            d3.selectAll(".mouse-per-line circle").style("opacity", function (d) {
                let mouse = d3.mouse(this);
                return checkNullValue(mouse, d, x);
            });
            d3.selectAll(".mouse-per-line text").style("opacity", function (d) {
                let mouse = d3.mouse(this);
                return checkNullValue(mouse, d, x);
            });
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
            d3.selectAll(".mouse-per-line circle").style("opacity", function (d) {return checkNullValue(mouse, d, x)});
            d3.selectAll(".mouse-per-line text").style("opacity", function (d) {return checkNullValue(mouse, d, x)});
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

    function checkNullValue(mouse, d, x) {
        let dateTimeStamp = x.invert(mouse[0]).getTime();
        let index = 0;
        while (index < d.values.length && d.values[index].date.getTime() < dateTimeStamp) index ++;
        let prev = d.values[index - 1], next = d.values[index];
        if (prev === undefined) return next.poll === null ? "0" : "1";
        if (prev.poll === null || next.poll === null) return "0";
        return "1";
    }

    function changeTimeActive(addObj) {
        if (timeActive != null) timeActive.removeClass("active");
        addObj.addClass("active");
        timeActive = addObj;
    }

    function changeLineActive(currObj) {
        if (currObj.hasClass("active")) {
            currObj.removeClass("active");
        } else {
            currObj.addClass("active");
        }
    }
});
