$(function () {
    const candidateList = $('.candidate-list')

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
                    candidateList.eq(0).html(publicanHtml);
                    candidateList.eq(1).html(democraticHtml);
                }
            }
        });
        return res;
    })();


    $('#map').usmap({
        stateStyles: {fill: 'grey'},
        stateHoverStyles: {fill: 'white'}
    });
});
