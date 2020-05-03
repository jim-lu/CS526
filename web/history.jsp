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
    <title>History</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- The styles -->
    <style><%@include file="WEB-INF/static/css/common.css"%></style>
    <style><%@include file="WEB-INF/static/css/history.css"%></style>

</head>

<body>

<div class="container">
    <jsp:include page="header.jsp" />
    <div class="main">
        <div class="middle-container">
            <h2></h2>
            <p><select class="selection"></select></p>
            <div class="numbers clearfix">
                <h4>States Support</h4>
                <div class="number-1"></div>
                <div class="number-2"></div>
            </div>
            <div class="labels clearfix">
                <div class="label-1"><span class="red"></span><span>&nbsp;&nbsp;Republican</span></div>
                <div class="label-2"><span class="blue"></span><span>&nbsp;&nbsp;Democratic</span></div>
            </div>
            <div class="map-container"></div>
        </div>
        <div class="middle-container">
            <h3>Final Result</h3>
            <div class="big-bar-chart-container"></div>
        </div>
    </div>
    <jsp:include page="footer.jsp" />

    <!-- JS -->
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>
    <script type="text/javascript" src="https://d3js.org/d3.v3.min.js"></script>
    <script type="text/javascript" src="https://d3js.org/topojson.v1.min.js"></script>
    <script><%@include file="WEB-INF/static/js/common.js"%></script>
    <script><%@include file="WEB-INF/static/js/history.js"%></script>
</div>

</body>

</html>
