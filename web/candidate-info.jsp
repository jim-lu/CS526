<%--
  Created by IntelliJ IDEA.
  User: Jim_Lu
  Date: 3/3/2020
  Time: 10:35 AM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <meta charset="utf-8">
    <title>Candidate</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- The styles -->
    <style><%@include file="WEB-INF/static/css/common.css"%></style>
    <style><%@include file="WEB-INF/static/css/candidate-info.css"%></style>

</head>

<body>

<div class="container">
    <jsp:include page="header.jsp" />
    <div class="main">
        <div class="candidate-container">
            <div class="left-container">
                <div class="img">
                    <img src="/img/biden.png" alt="">
                </div>
                <div class="name">JOE BIDEN</div>
                <div class="intro">
                    Biden is running on the legacy of the eight years he served alongside President Barack Obama and has proposed advancing that legacy on key issues like health care and the climate crisis. Prior to his time as vice president, Biden represented Delaware in the US Senate for 36 years.
                </div>
                <div class="education"><b>Education:</b>University of Delaware, B.A., 1965; Syracuse University Law School, J.D., 1968</div>
                <div class="born"><b>Born:</b>November 20, 1942</div>
            </div>
            <div class="right-container">
                <div class="plot-container">
                    <h2>Trend</h2>
                    <div>Here we should show a line chart of the percentage of poll this candidate got.</div>
                </div>
            </div>
        </div>

    </div>
    <div class="footer"></div>

    <!-- JS -->
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script>
    <script><%@include file="WEB-INF/static/js/jquery.usmap.js"%></script>
    <script><%@include file="WEB-INF/static/js/index.js"%></script>
</div>

</body>
</html>
