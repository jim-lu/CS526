$(function() {
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


