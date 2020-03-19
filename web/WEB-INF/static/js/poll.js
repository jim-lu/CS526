$(function () {
    const fourteenDayId = $("#fourteen-day");
    const thirtyDayId = $("#thirty-day");
    const threeMonthId = $("#three-month");
    const sixMonthId = $("#six-month");
    const oneYearId = $("#one-year");
    const maxId = $("#max");
    const positiveLineId = $("#positive-line");
    const negativeLineId = $("#negative-line");
    const biasLineId = $("#bias-line");
    const allLineId = $("#all-line");
    const resetButton = $("#reset-button");
    const lineFilterSlots = $("#line-filters").children("li");
    const dataPickerFromDate = $("#from-date");
    const dataPickerToDate = $("#to-date");
    let stand1, stand2;
    let timeActive = maxId;
    let lineActive = allLineId;

    const poll_data = (function() {
        let dataObj = [];
        $.ajax({
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            type: "get",
            url: "PollServlet?method=" + getParams("poll"),
            success: function (data) {
                if (data[0].msg === 'Query completed!') {
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
        timeActive.removeClass("active");
        timeActive = null;
        updateData(timeSlot0, timeSlot1);
    });

    positiveLineId.on("click", function () {
        if (positiveLineId.hasClass("active")) return;
        changeLineActive(positiveLineId);
        updateData(0, 0);
    });

    negativeLineId.on("click", function () {
        if (negativeLineId.hasClass("active")) return;
        changeLineActive(negativeLineId);
        updateData(0, 0);
    });

    biasLineId.on("click", function () {
        if (biasLineId.hasClass("active")) return;
        changeLineActive(biasLineId);
        updateData(0, 0);
    });

    allLineId.on("click", function () {
        if (allLineId.hasClass("active")) return;
        changeLineActive(allLineId);
        updateData(0, 0);
    });

    fourteenDayId.on("click", function () {
        if (fourteenDayId.hasClass("active")) return;
        changeTimeActive(fourteenDayId);
        updateData(0, 0);
    });

    thirtyDayId.on("click", function () {
        if (thirtyDayId.hasClass("active")) return;
        changeTimeActive(thirtyDayId);
        updateData(0, 0);
    });

    threeMonthId.on("click", function () {
        if (threeMonthId.hasClass("active")) return;
        changeTimeActive(threeMonthId);
        updateData(0, 0);
    });

    sixMonthId.on("click", function () {
        if (sixMonthId.hasClass("active")) return;
        changeTimeActive(sixMonthId);
        updateData(0, 0);
    });

    oneYearId.on("click", function () {
        if (oneYearId.hasClass("active")) return;
        changeTimeActive(oneYearId);
        updateData(0, 0);
    });

    maxId.on("click", function () {
        if (maxId.hasClass("active")) return;
        changeTimeActive(maxId);
        updateData(0, 0);
    });

    resetButton.on("click", function () {
        changeTimeActive(maxId);
        changeLineActive(allLineId);
        updateData(0, 0);
    });

    function updateData(timeSlot0, timeSlot1) {
        let line = lineActive.attr("name");
        let data = [];
        let startIndex, endIndex;
        if (timeSlot0 !== 0 && timeSlot1 !== 0) {
            startIndex = locateDate(timeSlot0);
            endIndex = locateDate(timeSlot1);
        } else {
            dataPickerFromDate.datepicker().val("");
            dataPickerToDate.datepicker().val("");
            let time = timeActive.attr("name");
            if (time === "Max") {
                startIndex = 0;
                endIndex = poll_data.length - 1;
            } else {
                timeSlot1 = poll_data[poll_data.length - 1].date.getTime();
                timeSlot0 = timeSlot1 - parseInt(time) * 24 * 60 * 60 * 1000;
                startIndex = locateDate(timeSlot0);
                endIndex = locateDate(timeSlot1);
            }
        }
        for (let i = startIndex; i <= endIndex; i ++) {
            let row = poll_data[i];
            if (line === "All") {
                data.push({
                    "date": row.date,
                    [stand1]: row[stand1],
                    [stand2]: row[stand2],
                    "Bias": row.Bias
                });
            } else {
                data.push({
                    "date": row.date,
                    [line]: row[lineActive.text()]
                })
            }
        }
        drawGraph(data);
    }

    function drawGraph(dataObj) {
        $("svg").remove();
        let margin = {top: 20, right: 20, bottom: 30, left: 50};
        let svg = d3.select(".plot-container").append("svg")
            .attr("width", "90%")
            .attr("height", "90%")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        const svgSelector = $("svg");
        let width = svgSelector.innerWidth() - margin.left - margin.right, height = svgSelector.innerHeight() - margin.top - margin.bottom;
        let x = d3.time.scale().range([0, width]), y = d3.scale.linear().range([height, 0]);
        let color = d3.scale.category10();
        let xAxis = d3.svg.axis().scale(x).orient("bottom"), yAxis = d3.svg.axis().scale(y).orient("left");
        let line = d3.svg.line().interpolate("basis").x(function(d) {return x(d.date)}).y(function(d) {return y(d.poll)});
        color.domain(d3.keys(dataObj[0]).filter(function(key) {return key !== "date"}));
        let polls = color.domain().map(function(name) {
            return {
                name: name,
                values: dataObj.map(function(d) {
                    return {date: d.date, poll: d[name]};
                })
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
        let legend = svg.selectAll("g").data(polls).enter().append("g").attr("class", "legend");
        legend.append("rect").attr("x", width - 100).attr("y", function (d, i) {
            return i * 20;
        }).attr("width", 10).attr("height", 10).style("fill", function (d) {
            return color(d.name);
        });
        legend.append("text").attr("x", width - 75).attr("y", function (d, i) {
            return i * 20 + 9;
        }).text(function (d) {
            return d.name;
        });
        svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis).append("text").attr("x", width - 40).attr("y", -20).style("text-anchor", "end").text("Date (M.Y)");
        svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end").text("Poll (%)");
        let yInner = d3.svg.axis().scale(y).tickSize(-width, 0, 0).tickFormat("").orient("left").ticks(5);
        svg.append("g").attr("class", "inner-line").attr("transform", "translate(0, -50)").call(yInner);
        let poll = svg.selectAll(".poll").data(polls).enter().append("g").attr("class", "city");
        poll.append("path").attr("class", "line").attr("d", function (d) {
            return line(d.values);
        }).attr("fill", "none").attr("stroke-width", 1).style("stroke", function (d) {
            return color(d.name);
        });
        let mouseG = svg.append("g").attr("class", "mouse-over-effects");
        mouseG.append("path").attr("class", "mouse-line").style("stroke", "black").style("stroke-width", 1);
        const lines = $(".line");
        let mousePerLine = mouseG.selectAll(".mouse-per-line").data(polls).enter().append("g").attr("class", "mouse-per-line");
        mousePerLine.append("circle").attr("r", 7).style("stroke", function (d) {
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

    function compareDate(data1, data2) {
        let time1 = data1.date.getTime(), time2 = data2.date.getTime();
        if (time1 === time2) return 0;
        return time1 < time2 ? -1 : 1;
    }

    function changeLineActive(addObj) {
        if (lineActive != null) lineActive.removeClass("active");
        addObj.addClass("active");
        lineActive = addObj;
    }

    function changeTimeActive(addObj) {
        if (timeActive != null) timeActive.removeClass("active");
        addObj.addClass("active");
        timeActive = addObj;
    }

    function locateDate(time) {
        let left = 0, right = poll_data.length - 1;
        while (left < right) {
            let middle = parseInt(left + (right - left) / 2);
            if (time > poll_data[middle].date.getTime()) {
                left = middle + 1;
            } else if (time < poll_data[middle].date.getTime()) {
                right = middle - 1;
            } else {
                return middle;
            }
        }
        return left;
    }

    function getParams(name) {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let r = window.location.search.substr(1).match(reg);
        if (r !== null) return unescape(r[2]);
        return null;
    }

});
