$(function() {
    const navigationPoll = $('.navigation-poll');
    const navigationNomination = $(".navigation-nomination");
    const navigationState = $('.navigation-state');
    const pollList = $('.poll-list');
    const nominationList = $(".nomination-list");
    const stateList = $('.state-list');

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
