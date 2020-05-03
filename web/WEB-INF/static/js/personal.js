$(function () {
    if ($.cookie("username") === null || $.cookie("username") === undefined || $.cookie("id") === null || $.cookie("id") === undefined) {
        window.location = "index.jsp";
    }
    $(".user-name").text($.cookie("username"));

    $.ajax({
        dataType: "json",
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        type: "get",
        url: "PersonalServlet?method=getSitePollsForUser&userId=" + $.cookie("id"),
        success: function (data) {
            if (data[0][0].msg === 'Query completed!' && data[1][0].msg === 'Query completed!') {
                let idSet = new Set();
                data[1][0].resultSet.forEach(function (d) {idSet.add(d.poll_id);});
                data[0][0].resultSet.forEach(function (d) {
                    let pollName = d.poll_name.replace(" ", "-");
                    let labels = d.labels.split(";");
                    let html = "<li><h3>" + d.poll_name + "</h3><div class='description'>" + d.poll_description + "</div>";
                    if (!idSet.has(d.id)) {
                        html += "<form id='" + pollName + "-" + d.id + "' action='PersonalServlet?method=doCastVote' method='post'>";
                        labels.forEach(function (label) {
                            let value = label.trim().replace(" ", "-");
                            html += "<div class='choose-box'><input type='radio' name='poll' value='" + value +
                                "'> " + label + "</div>";
                        });
                        html += "<input type='submit' class='submit-button' /></form>";
                    }
                    html += "<div class='table-container site-poll' id='" + pollName + "-" + d.id + "-" + d.id + "'></div>";
                    $(".site-poll-list").append(html + "</li>");
                });
            }
        }
    }).done(function () {
        $.ajax({
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            type: "get",
            url: "PersonalServlet?method=getSitePollData",
            success: function (data) {
                if (data[0].msg === 'Query completed!') {
                    let sitePollDict = {};
                    data[0].resultSet.forEach(function (d) {
                        let key = d.poll_name.replace(" ", "-") + "-" + d.poll_id + "-" + d.poll_id;
                        let stand = d.stand;
                        if (sitePollDict.hasOwnProperty(key)) {
                            if (sitePollDict[key].hasOwnProperty(stand)) {
                                sitePollDict[key][stand] += 1
                            } else {
                                sitePollDict[key][stand] = 1;
                            }
                        } else {
                            sitePollDict[key] = {};
                            sitePollDict[key][stand] = 1;
                        }
                    });
                    for (let id in sitePollDict) {
                        let barChartDataSet = [];
                        for (let key in sitePollDict[id]) {
                            barChartDataSet.push({"name": key, "value": sitePollDict[id][key]});
                        }
                        createBarChart("#" + id, barChartDataSet);
                    }
                }
            }
        });
    });

    $(".site-poll-list").on("click", ".submit-button", function (e) {
        e.preventDefault();
        let parent = $(this).parent();
        let pollIdArr = parent.attr("id").split("-");
        let pollId = pollIdArr[pollIdArr.length - 1];
        let data = parent.serialize();
        let url = parent.attr("action");
        let method = parent.attr("method");
        data += "&id=" + pollId + "&user=" + $.cookie("id");
        $.ajax({
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            url: url,
            type: method,
            data: data,
            success: function (response) {
                if (response.status === 1) {
                    alert("Your vote was successfully cast");
                    window.location = "personal.jsp";
                } else {
                    alert("An error occur when you cast this vote");
                }
            }
        })
    });
});
