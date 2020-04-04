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
    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <style><%@include file="WEB-INF/static/css/common.css"%></style>
    <style><%@include file="WEB-INF/static/css/candidate-info.css"%></style>

</head>

<body>

<div class="container">
    <jsp:include page="header.jsp" />
    <div class="main">
        <div class="candidate-container clearfix">
            <div class="left-container">
                <div class="img"></div>
                <div class="name"></div>
                <div class="intro"></div>
                <div class="education"></div>
                <div class="born"></div>
            </div>
            <div class="right-container">
                <h2>NOMINATION POLLS</h2>
                <div class="plot-container"></div>
            </div>
        </div>

    </div>
    <div class="footer"></div>

    <!-- JS -->
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script type="text/javascript" src="https://d3js.org/d3.v3.min.js"></script>
    <script type="text/javascript" src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script><%@include file="WEB-INF/static/js/common.js"%></script>
    <script><%@include file="WEB-INF/static/js/candidate.js"%></script>
</div>

</body>
</html>
