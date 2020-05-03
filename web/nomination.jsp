<%--
  Created by IntelliJ IDEA.
  User: Jim_Lu
  Date: 3/19/2020
  Time: 5:51 PM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <meta charset="utf-8">
    <title>Nomination</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- The styles -->
    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
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
                    <li id="fourteen-day" name="14" class="filter-slot time-slot">14D</li>
                    <li id="thirty-day" name="30" class="filter-slot time-slot">30D</li>
                    <li id="three-month" name="90" class="filter-slot time-slot">3M</li>
                    <li id="six-month" name="180" class="filter-slot time-slot">6M</li>
                    <li id="one-year" name="365" class="filter-slot time-slot">1Y</li>
                    <li id="max" class="filter-slot time-slot active" name="Max">MAX</li>
                </ul>
                <div class="time-selection clearfix">
                    <p class="clearfix"><input type="text" class="date-picker" id="from-date"><b>From: </b></p>
                    <p class="clearfix"><input type="text" class="date-picker" id="to-date"><b>To: </b></p>
                    <p><span style="color: red; display: none; text-align: right">Date error!</span></p>
                    <button class="apply-button">APPLY</button>
                </div>
            </div>
            <div class="filters">
                <h3>Line</h3>
                <ul class="slots clearfix" id="line-filters"></ul>
            </div>
            <div class="filters">
                <button class="filter-slot reset-button" id="reset-button">RESET</button>
            </div>
        </div>
        <div class="plot-container">
            <h2 class="plot-name"></h2>
        </div>
    </div>
    <jsp:include page="footer.jsp" />

    <!-- JS -->
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>
    <script type="text/javascript" src="https://d3js.org/d3.v3.min.js"></script>
    <script type="text/javascript" src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script><%@include file="WEB-INF/static/js/common.js"%></script>
    <script><%@include file="WEB-INF/static/js/nomination.js"%></script>
</div>
</body>
</html>
