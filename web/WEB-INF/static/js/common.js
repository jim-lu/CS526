$(function() {
    const navigationPoll = $('.navigation-poll');
    const navigationNomination = $(".navigation-nomination");
    const navigationState = $('.navigation-state');
    const navigationHistory = $('.navigation-history');
    const pollList = $('.poll-list');
    const nominationList = $(".nomination-list");
    const stateList = $('.state-list');
    const historyList = $('.history-list');
    const pswr = $("#pswr");
    const cpswr = $("#cpswr");
    const usernameCookie = $.cookie("username");

    navigationPoll.hover(function() {
        pollList.fadeIn();
    }, function() {
        pollList.fadeOut();
    });
    navigationNomination.hover(function() {
        nominationList.fadeIn();
    }, function() {
        nominationList.fadeOut();
    });
    navigationState.hover(function() {
        stateList.fadeIn();
    }, function() {
        stateList.fadeOut();
    });
    navigationHistory.hover(function () {
        historyList.fadeIn();
    }, function () {
        historyList.fadeOut();
    });

    pswr.change(validatePassword);
    cpswr.keyup(validatePassword);

    if (usernameCookie !== null && usernameCookie !== undefined) {
        $(".login-register-box").html("<a href='personal.jsp'>" + usernameCookie + "</a> | <a id='exit'>Exit</a>")
    }

    $(".login-register-box").on("click", "#exit", function () {
        $.removeCookie("username");
        window.location = "index.jsp";
    });

    $.ajax({
        dataType: "json",
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        type: "get",
        url: "HeaderServlet?method=getStates",
        success: function (data) {
            if (data[0].msg === 'Query completed!') {
                let resultSet = data[0].resultSet;
                let htmlStr = "";
                for (let i = 0; i < resultSet.length; i ++) {
                    let resObj = resultSet[i];
                    htmlStr += "<li class='state'><a href='state.jsp?state=" + resObj.state_po + "'>" + resObj.state_name + "</a></li>";
                }
                stateList.html(htmlStr);
            }
        }
    });

    // When the user clicks anywhere outside of the modal, close it
    let modal1 = document.getElementById('id01');
    let modal2 = document.getElementById('id02');
    window.onclick = function(event) {
        console.log(event);
        if (event.target == modal1) {
            modal1.style.display = "none";
        }
        if (event.target == modal2) {
            modal2.style.display = "none";
        }
    }

    $("#login-form").on("submit", function (e) {
        e.preventDefault();
        let url = $(this).attr("action");
        let method = $(this).attr("method");
        let data = $(this).serialize();
        $.ajax({
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            url: url,
            type: method,
            data: data,
            success: function (response) {
                if (response.status === 0) {
                    alert("Username or Password incorrect!");
                } else {
                    $.cookie("username", data.split(/=|&/)[1]);
                    $.cookie("id", response.id);
                    alert("Welcome back");
                    window.location = "personal.jsp";
                }
            }
        })
    });
    $("#register-form").on("submit", function (e) {
        e.preventDefault();
        let url = $(this).attr("action");
        let method = $(this).attr("method");
        let data = $(this).serialize();
        $.ajax({
            dataType: "json",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            url: url,
            type: method,
            data: data,
            success: function (response) {
                $.cookie("username", data.split(/=|&/)[1]);
                $.cookie("id", response.id);
                alert("Welcome");
                window.location = "personal.jsp";
            }
        })
    });
});

function compareDate(data1, data2) {
    let time1 = data1.date.getTime(), time2 = data2.date.getTime();
    if (time1 === time2) return 0;
    return time1 < time2 ? -1 : 1;
}

function getParams(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    let r = window.location.search.substr(1).match(reg);
    if (r !== null) return unescape(r[2]);
    return null;
}

function drawBrush(dateRange, brush) {
    brush.extent(dateRange);
    brush(d3.select(".brush").transition());
    brush.event(d3.select(".brush").transition());
}

function comparePoll(obj1, obj2) {
    let poll1 = obj1.value, poll2 = obj2.value;
    if (poll1 === poll2) return 0;
    return poll1 > poll2 ? -1 : 1;
}

function createBarChart(container, dataObj) {
    let barsNum = dataObj.length;
    let color = d3.scale.category20();
    let margin = {top: 15, right: 25, bottom: 15, left: 120};
    let width = 700 - margin.left - margin.right, height = barsNum * 100 - margin.top - margin.bottom;
    let svg = d3.select(container).append("svg").attr("class", "bar-chart")
        .attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
        .append("g").attr("transform", "translate(" + margin.left + ", 0)");
    let x = d3.scale.linear().range([0, width]).domain([0, d3.max(dataObj, function (d) {return d.value;})]);
    let y = d3.scale.ordinal().rangeRoundBands([height, 0], .5).domain(dataObj.map(function (d) {return d.name;}));
    color.domain(dataObj.map(function (d) {return d.name;}));
    let yAxis = d3.svg.axis().scale(y).tickSize(0).orient("left");
    svg.append("g").attr("class", "y axis").call(yAxis);
    let bars = svg.selectAll("bar").data(dataObj).enter().append("g");
    bars.append("rect").attr("class", "bar").attr("x", 10).attr("y", function (d) {
        return y(d.name);
    }).attr("height", y.rangeBand()).attr("width", function (d) {
        return x(d.value * 0.7);
    }).attr("fill", function (d) {return color(d.name);});
    bars.append("text").attr("class", "label").attr("x", function (d) {
        return x(d.value * 0.7) + 15;
    }).attr("y", function (d) {
        return y(d.name) + y.rangeBand() / 2 + 4;
    }).text(function (d) {return d.value;})
}

function validatePassword(){
    if(pswr.value != cpswr.value) {
        cpswr.setCustomValidity("Passwords Don't Match");
    } else {
        cpswr.setCustomValidity('');
    }
}
