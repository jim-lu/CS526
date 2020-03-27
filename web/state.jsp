<%--
  Created by IntelliJ IDEA.
  User: Jim_Lu
  Date: 3/3/2020
  Time: 5:46 PM
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
    <style><%@include file="WEB-INF/static/css/state.css"%></style>

</head>

<body>

<div class="container">
    <jsp:include page="header.jsp" />
    <div class="main">
        <!-- Shows when the final result comes out -->
        <div class="final-container">
            <div class="final-result-container clearfix">
                <div class="left-container">
                    There should be a map showing the winner's image
                </div>
                <div class="middle-container">
                    There should a bar chart showing the final proportion. Something that look like this.
                    <img src="/img/plot-example2.png" style="width: 80%" alt="">
                </div>
                <div class="right-container">
                    There should a pie chart showing the final proportion
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
