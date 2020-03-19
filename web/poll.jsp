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
                    <li id="fourteen-day" name="14">14D</li>
                    <li id="thirty-day" name="30">30D</li>
                    <li id="three-month" name="90">3M</li>
                    <li id="six-month" name="180">6M</li>
                    <li id="one-year" name="365">1Y</li>
                    <li id="max" class="active" name="Max">MAX</li>
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
                <ul class="slots clearfix" id="line-filters">
                    <li id="positive-line" name="positive"></li>
                    <li id="negative-line" name="negative"></li>
                    <li id="bias-line" name="Bias">Bias</li>
                    <li id="all-line" class="active" name="All">ALL</li>
                </ul>
            </div>
            <div class="filters">
                <button class="reset-button" id="reset-button">RESET</button>
            </div>
        </div>
        <div class="plot-container">
        </div>
    </div>
    <div class="footer"></div>

    <!-- JS -->
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script type="text/javascript" src="https://d3js.org/d3.v3.min.js"></script>
    <script type="text/javascript" src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script><%@include file="WEB-INF/static/js/common.js"%></script>
    <script><%@include file="WEB-INF/static/js/poll.js"%></script>
</div>

</body>
</html>
