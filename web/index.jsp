<%--
  Created by IntelliJ IDEA.
  User: Jim_Lu
  Date: 2/3/2020
  Time: 2:55 PM
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
  <style><%@include file="WEB-INF/static/css/index.css"%></style>

</head>

<body>

<div class="container">
  <jsp:include page="header.jsp" />
  <div class="main">
    <div class="candidate-container clearfix">
      <h2>Who's Running</h2>
      <div class="republican-container">
        <h3>Republican Candidate</h3>
        <ul class="candidate-list clearfix"></ul>
      </div>
      <div class="democratic-container">
        <h3>Democratic Candidate</h3>
        <ul class="candidate-list clearfix"></ul>
      </div>
    </div>
    <div class="map-container">
      <h2>Who's Winning in Democratic</h2>
      <div class="map"></div>
      <div class="label-container clearfix"></div>
    </div>
  </div>
  <jsp:include page="footer.jsp" />

  <!-- JS -->
  <script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
  <script type="text/javascript" src="https://d3js.org/d3.v3.min.js"></script>
  <script type="text/javascript"src="https://d3js.org/topojson.v1.min.js"></script>
  <script><%@include file="WEB-INF/static/js/common.js"%></script>
  <script><%@include file="WEB-INF/static/js/index.js"%></script>
</div>

</body>

</html>
