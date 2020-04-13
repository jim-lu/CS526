<%--
  Created by IntelliJ IDEA.
  User: Jim_Lu
  Date: 4/5/2020
  Time: 11:11 PM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Index</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- The styles -->
    <style><%@include file="WEB-INF/static/css/common.css"%></style>
    <style><%@include file="WEB-INF/static/css/lastElection.css"%></style>

</head>

<body>

<div class="container">
    <jsp:include page="header.jsp" />
    <div class="main">
        <div class="middle-container clearfix">
            <h2>2016 PRESIDENTIAL ELECTION</h2>
            <div class="left-container">
                <div class="map-container"></div>
            </div>
            <div class="right-container">
                <div class="big-bar-chart-container">
                    <h3>Final Result</h3>
                    <ul class="title clearfix">
                        <li class="candidate">Candidate</li>
                        <li class="vote">Votes</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="middle-container">
            <ul class="bar-chart-container clearfix"></ul>
        </div>
    </div>
    <jsp:include page="footer.jsp" />

    <!-- JS -->
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script type="text/javascript" src="https://d3js.org/d3.v3.min.js"></script>
    <script type="text/javascript" src="https://d3js.org/topojson.v1.min.js"></script>
    <script><%@include file="WEB-INF/static/js/common.js"%></script>
    <script><%@include file="WEB-INF/static/js/lastElection.js"%></script>
</div>

</body>

</html>
