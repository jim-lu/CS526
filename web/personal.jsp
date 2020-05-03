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
  <title>Personal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="">
  <meta name="author" content="">

  <!-- The styles -->
  <style><%@include file="WEB-INF/static/css/common.css"%></style>
  <style><%@include file="WEB-INF/static/css/personal.css"%></style>

</head>

<body>

<div class="container">
  <jsp:include page="header.jsp" />
  <div class="main clearfix">
    <div class="left-container">
      <div class="user-head-img">
        <div class="head-img-container">
          <img src="/img/head.png" />
        </div>
      </div>
      <div class="row clearfix">
        <div class="left">User:&nbsp;</div>
        <div class="right user-name"></div>
      </div>
    </div>
    <div class="right-container">
      <h2>Cast Your Vote</h2>
      <div class="poll-container">
        <ul class="site-poll-list"></ul>
      </div>
      <h2>Download State Poll</h2>
      <p>Download our state poll data by clicking this link: <a id="download" href="PersonalServlet?method=download">Download</a></p>
    </div>
  </div>
  <jsp:include page="footer.jsp" />

  <!-- JS -->
  <script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>
  <script type="text/javascript" src="https://d3js.org/d3.v3.min.js"></script>
  <script><%@include file="WEB-INF/static/js/common.js"%></script>
  <script><%@include file="WEB-INF/static/js/personal.js"%></script>
</div>

</body>

</html>
