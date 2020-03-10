<%--
  Created by IntelliJ IDEA.
  User: Jim_Lu
  Date: 3/3/2020
  Time: 5:29 PM
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
    <style><%@include file="WEB-INF/static/css/poll.css"%></style>

</head>

<body>

<div class="container">
    <jsp:include page="header.jsp" />
    <div class="main">
        <div class="filter-container">
            <h2>Filter</h2>
            <div class="filters">
                <h3>Time</h3>
                <ul class="slots clearfix">
                    <li>7D</li>
                    <li>14D</li>
                    <li>30D</li>
                    <li>3M</li>
                    <li>6M</li>
                    <li>1Y</li>
                    <li class="active">MAX</li>
                </ul>
            </div>
            <div class="filters">
                <h3>Line</h3>
                <ul class="slots clearfix">
                    <li>Approve</li>
                    <li>Disapprove</li>
                    <li>Bias</li>
                    <li class="active">ALL</li>
                </ul>
            </div>
            <div class="filters">
                <button class="reset-button">RESET</button>
            </div>
        </div>
        <div class="plot-container">
            <div>There should be a plot look like this.</div>
            <img src="/img/plot-example1.png" style="width: 80%;" alt="">
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
