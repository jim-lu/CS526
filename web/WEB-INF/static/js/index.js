const navigationPoll = $('.navigation-poll');
const navigationState = $('.navigation-state');
const pollList = $('.poll-list');
const stateList = $('.state-list');
const candidateList = $('.candidate-list')

navigationPoll.hover(function() {
    pollList.fadeIn();
}, function() {
    pollList.fadeOut();
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
                    console.log(resObj.candidate_id);
                    if (resObj.candidate_party === 0) {
                        publicanHtml += "<li class='candidate' id=" + resObj.candidate_id + ">" +
                                "<a href='candidate-info.jsp?candidate=" + resObj.candidate_id + "'><img src='/img/" + resObj.candidate_img + "' alt='" + resObj.candidate_name + "' class='status-" + resObj.candidate_status + "'></a>" +
                                "<h4>" + resObj.candidate_name + "</h4>" +
                            "</li>";
                    } else {
                        democraticHtml += "<li class='candidate' id=" + resObj.candidate_id + ">" +
                                "<a href='candidate-info.jsp?candidate=" + resObj.candidate_id + "'><img src='/img/" + resObj.candidate_img + "' alt='" + resObj.candidate_name + "' class='status-" + resObj.candidate_status + "'></a>" +
                                "<h4>" + resObj.candidate_name + "</h4>" +
                            "</li>";
                    }
                }
            }
        }
    });
    return res;
})();


$('#map').usmap({
    stateStyles: {fill: 'grey'},
    stateHoverStyles: {fill: 'white'}
});
