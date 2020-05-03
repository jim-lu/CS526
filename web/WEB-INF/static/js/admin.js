$(function() {
    const param = getParams("tab");
    let parseDate = d3.time.format("%Y-%m-%d").parse;
    const userTab = $(".users-tab");

    if (param === "table") {
        $(".tables-tab").fadeIn();
        $.ajax({
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            type: "get",
            url: "AdminServlet?method=getAllTableNames",
            success: function (data) {
                if (data[0].msg === 'Query completed!') {
                    data[0].resultSet.forEach(function (d) {
                        let tableName = Object.values(d)[0];
                        let nameArr = tableName.split(" ");
                        let name = "";
                        nameArr.forEach(function (s) {name += s + "-";});
                        let html = "<li><div class='table-name'><div class='title'><b>+</b> " + tableName +
                            "</div></div><div class='table-container site-table' id='" + name.substring(0, name.length - 1) + "'></div></li>";
                        $(".table-list").append(html);
                    });
                }
            }
        });
    }
    if (param === "poll") {
        $(".polls-tab").fadeIn();
        $.ajax({
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            type: "get",
            url: "AdminServlet?method=getSitePolls",
            success: function (data) {
                if (data[0].msg === 'Query completed!') {
                    data[0].resultSet.forEach(function (d) {
                        let html = "<li><div class='table-name'><div class='title'><b>+</b> " + d.poll_name + "</div>";
                        let nameArr = d.poll_name.split(" ");
                        let name = "";
                        nameArr.forEach(function (s) {name += s + "-";});
                        if (d.show_table === 1) {
                            html += "<button id='" + name + d.id + "' name='" + d.show_table + "'>Hide From User</button>";
                        } else {
                            html += "<button id='" + name + d.id + "' name='" + d.show_table + "'>Show To User</button>";
                        }
                        html += "</div><div class='table-container site-poll' id='" + name + d.id + "-" + d.id + "'></div></li>";
                        $(".site-poll-list").append(html);
                    });
                }
            }
        });
    }
    if (param === "user") {
        userTab.fadeIn();
        $.ajax({
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            type: "get",
            url: "AdminServlet?method=getUserActivityRecord",
            success: function (data) {
                if (data[0][0].msg === 'Query completed!' && data[1][0].msg === 'Query completed!') {
                    let newUserRecord = data[0][0].resultSet, activeUserRecord = data[1][0].resultSet;
                    let newUserData = [], activeUserData = [];
                    newUserRecord.forEach(function (obj) {
                        newUserData.push({"date": parseDate(obj.register_date), "value": obj.user_number});
                    });
                    activeUserRecord.forEach(function (obj) {
                        activeUserData.push({"date": parseDate(obj.active_date), "value": obj.user_number});
                    });
                    userTab.append("<h4>Daily Register User</h4>");
                    createLineChart(".users-tab", newUserData);
                    userTab.append("<h4>Daily Active User</h4>");
                    createLineChart(".users-tab", activeUserData);
                }
            }
        })
    }

    $(".list-container").on("click", ".title", function() {
        if ($(this).children().hasClass("active")) {
            $(this).children().removeClass("active").text("+");
            $(this).parent().next().slideUp();
        } else {
            let next = $(this).parent().next();
            let id = next.attr("id");
            if (param === "table") {
                $.ajax({
                    dataType: "json",
                    contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                    type: "get",
                    url: "AdminServlet?method=getTableData&tableName=" + id + "&page=1",
                    success: function (data) {
                        if (data[0][0].msg === 'Query completed!' && data[1][0].msg === 'Query completed!') {
                            let resultSet = data[0].resultSet;
                            let html = "<table border='1' border-spacing='0'><tr>";
                            Object.keys(resultSet[0]).forEach(function (k) {
                                if (k.indexOf("id") !== 0 && k.substring(k.length - 2) !== "id") html += "<th>" + k + "</th>";
                            });
                            html += "<th>Edit</th></tr>";
                            resultSet.forEach(function (obj) {
                                html += "<tr>";
                                Object.keys(obj).forEach(function (k) {
                                    if (k.indexOf("id") !== 0 && k.substring(k.length - 2) !== "id") {
                                        html += "<td><div class='content'>" + obj[k] + "</div></td>";
                                    }
                                });
                                html += "<td><div class='content'><button class='edit-btn'>Edit</button></div></td></tr>";
                            });
                            html += "</table>";
                            next.append(html);
                        }
                    }
                });
            } else if (param === "poll") {
                let idArr = id.split("-");
                $.ajax({
                    dataType: "json",
                    contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                    type: "get",
                    url: "AdminServlet?method=getSitePollData&pollId=" + idArr[idArr.length - 1],
                    success: function (data) {
                        if (data[0].msg === 'Query completed!' && data[0].resultSet.length > 0) {
                            let resultSet = data[0].resultSet, labelMap = new Map(), barChartDataSet = [];
                            resultSet.forEach(function (obj) {
                                let key = obj.stand;
                                if (labelMap.has(key)) {
                                    labelMap.set(key, labelMap.get(key) + 1);
                                } else {
                                    labelMap.set(key, 1);
                                }
                            });
                            for (let key of labelMap.keys()) {
                                barChartDataSet.push({"name": key, "value": labelMap.get(key)});
                            }
                            console.log(next.attr("id"));
                            createBarChart("#" + next.attr("id"), barChartDataSet);
                        }
                    }
                });
            }

            $(this).children().text("-");
            next.slideDown();
        }
    });

    $("#submit").on("click", function () {
        let pollName = $("#poll-name").val(), description = $("#description").val(), label = $("#label").val();
        $.ajax({
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            type: "post",
            data: {"pollName": pollName, "description": description, "label": label},
            url: "AdminServlet?method=addSitePoll",
            success: function (data) {
                window.location = data.url;
            }
        })
    });

    $(".site-poll-list").on("click", "button", function () {
        let nameArr = $(this).attr("id").split("-");
        $.ajax({
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            type: "post",
            data: {"id": nameArr[nameArr.length - 1], "status": parseInt($(this).attr("name")) ^ 1},
            url: "AdminServlet?method=updateSitePollStatus",
            success: function (data) {
                window.location = data.url;
            }
        })
        ;
    });

    function createLineChart(container, dataObj) {
        console.log(dataObj);
        let margin = {top: 10, right: 100, bottom: 30, left: 100};
        let width = 860 - margin.left - margin.right, height = 450 - margin.top - margin.bottom;
        let x = d3.time.scale().domain(d3.extent(dataObj, function (d) {return d.date;})).range([0, width]),
            y = d3.scale.linear().domain([0, d3.max(dataObj, function (d) {return d.value;})]).range([height, 0]);
        let xAxis = d3.svg.axis().scale(x).orient("bottom").innerTickSize(-height).outerTickSize(0).tickPadding(10),
            yAxis = d3.svg.axis().scale(y).orient("left").innerTickSize(-width).outerTickSize(0).tickPadding(10);
        let line = d3.svg.line().x(function (d) {return x(d.date);}).y(function (d) {return y(d.value);});
        let svg = d3.select(container).append("svg").attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom).append("g")
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
        svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
        svg.append("g").attr("class", "y axis").call(yAxis);
        svg.append("path").attr("class", "line").attr("d", line(dataObj));
    }

});
