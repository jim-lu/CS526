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
    <title>State</title>
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
                <div class="middle-container">
                    <h2></h2>
                    <h4></h4>
                    <div class="map-container"></div>
                </div>
                <div class="left-container">
                    <h3>Who's Winning</h3>
                    <div class="title clearfix">
                        <div class="candidate">CANDIDATE</div>
                        <div class="proportion">PROPORTION(%)</div>
                    </div>
                    <div class="bar-container"></div>
                </div>
                <div class="right-container">
                    <div class="pie-container"></div>
                </div>
            </div>
        </div>
    </div>
    <jsp:include page="footer.jsp" />

    <!-- JS -->
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>
    <script type="text/javascript" src="https://d3js.org/d3.v3.min.js"></script>
    <script type="text/javascript"src="https://d3js.org/topojson.v1.min.js"></script>
    <script><%@include file="WEB-INF/static/js/common.js" %></script>
    <script><%@include file="WEB-INF/static/js/state.js"%></script>
</div>

</body>
</html>
